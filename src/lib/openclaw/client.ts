// Minimal OpenClaw Gateway client for AI RPG Game
// Handles: connect, challenge-response auth, chat.send, sessions.history

import { loadOrCreateDeviceIdentity, signDevicePayload, buildDeviceAuthPayload, publicKeyRawBase64Url } from './device-identity';

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'ws://127.0.0.1:18789';
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || '';

// Use 'ws' package on server side, native WebSocket on client side
const WS = typeof window === 'undefined' ? require('ws') : WebSocket;

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (error: Error) => void;
}

export class OpenClawGameClient {
  private ws: any = null;
  private pendingRequests = new Map<string, PendingRequest>();
  private connected = false;
  private connecting = false; // Track if connection is in progress
  private deviceIdentity: { deviceId: string; publicKeyPem: string; privateKeyPem: string } | null = null;
  private logs: string[] = [];

  constructor(private url: string = GATEWAY_URL, private token: string = GATEWAY_TOKEN) {
    try {
      this.deviceIdentity = loadOrCreateDeviceIdentity();
    } catch {
      this.log('[WARN] No device identity available');
    }
  }

  public log(message: string) {
    console.log(message);
    this.logs.push(`[${new Date().toISOString()}] ${message}`);
  }

  getLogs() {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  async connect(): Promise<void> {
    this.clearLogs();
    // Return early if already connected or connection in progress
    if (this.connected) return;
    if (this.connecting && this.ws?.readyState === 1) return;

    this.connecting = true;

    return new Promise((resolve, reject) => {
      const wsUrl = new URL(this.url);
      
      if (typeof window === 'undefined') {
        const isNgrok = wsUrl.host.includes('ngrok');
        const headers: Record<string, string> = {
          'User-Agent': 'OpenClaw-Game-Client',
          'Origin': 'http://127.0.0.1:18789', // Force local origin to bypass gateway security check
        };
        if (isNgrok) {
          headers['ngrok-skip-browser-warning'] = 'true';
          headers['Host'] = wsUrl.host;
        }
        this.log(`[INFO] Connecting to ${wsUrl.host}${isNgrok ? ' (ngrok tunnel)' : ' (local)'}...`);
        this.ws = new WS(wsUrl.toString(), {
          headers,
          handshakeTimeout: 15000,
          perMessageDeflate: !isNgrok, // Ngrok struggles with compression
        });
      } else {
        this.ws = new WS(wsUrl.toString());
      }

      const timeout = setTimeout(() => {
        if (typeof this.ws?.close === 'function') this.ws.close();
        this.connecting = false;
        this.log('[ERROR] Connection timeout (15s)');
        reject(new Error('Connection timeout (15s)'));
      }, 15000);

      const onOpen = () => {
        this.log('[INFO] Connected, waiting for challenge...');
      };

      const onError = (err: any) => {
        clearTimeout(timeout);
        const errMsg = err?.message || String(err);
        this.log(`[ERROR] WS Error: ${errMsg}`);
        
        if (errMsg.includes('404')) {
          reject(new Error('OpenClaw Gateway offline or URL invalid (404). Check if Ngrok tunnel is running.'));
        } else if (errMsg.includes('ECONNREFUSED')) {
          reject(new Error('OpenClaw Gateway connection refused. Is the server running?'));
        } else {
          reject(new Error(`WebSocket connection failed: ${errMsg}`));
        }
      };

      const onClose = () => {
        clearTimeout(timeout);
        this.connected = false;
        this.connecting = false;
        this.log('[INFO] Connection closed.');
      };

      const onMessage = (event: any) => {
        try {
          const rawData = typeof event.data === 'string' ? event.data : event;
          const data = JSON.parse(rawData);

          // Handle challenge-response
          if (data.type === 'event' && data.event === 'connect.challenge') {
            this.log('[INFO] Received connect.challenge. Authenticating...');
            const nonce = data.payload?.nonce;
            const requestId = crypto.randomUUID();
            const signedAtMs = Date.now();

            let device: Record<string, unknown> | undefined;
            if (this.deviceIdentity) {
              const payload = buildDeviceAuthPayload({
                deviceId: this.deviceIdentity.deviceId,
                clientId: 'cli', clientMode: 'ui',
                role: 'operator', scopes: ['operator.admin', 'operator.read', 'operator.write'],
                signedAtMs, token: this.token || null, nonce,
              });
              const signature = signDevicePayload(this.deviceIdentity.privateKeyPem, payload);
              device = {
                id: this.deviceIdentity.deviceId,
                publicKey: publicKeyRawBase64Url(this.deviceIdentity.publicKeyPem),
                signature, signedAt: signedAtMs, nonce,
              };
            }

            this.pendingRequests.set(requestId, {
              resolve: () => {
                clearTimeout(timeout);
                this.connected = true;
                this.connecting = false;
                this.log('[INFO] Authenticated successfully');
                resolve();
              },
              reject: (err) => {
                clearTimeout(timeout);
                this.connecting = false;
                this.log(`[ERROR] Authentication failed: ${err.message}`);
                reject(err);
              }
            });

            this.ws.send(JSON.stringify({
              type: 'req', id: requestId, method: 'connect',
              params: {
                minProtocol: 3, maxProtocol: 3,
                client: { id: 'cli', version: '1.0.0', platform: 'server', mode: 'ui' },
                auth: { token: this.token },
                role: 'operator',
                scopes: ['operator.admin', 'operator.read', 'operator.write'],
                device,
              }
            }));
            return;
          }

          // Handle RPC responses
          if (data.type === 'res' && data.id) {
            const pending = this.pendingRequests.get(data.id);
            if (pending) {
              this.pendingRequests.delete(data.id);
              if (data.ok === false && data.error) {
                pending.reject(new Error(data.error.message));
              } else {
                pending.resolve(data.payload);
              }
            }
          }
        } catch (err) {
          this.log(`[WARN] Parse error: ${err}`);
        }
      };

      if (typeof window === 'undefined') {
        this.ws.on('open', onOpen);
        this.ws.on('error', onError);
        this.ws.on('close', onClose);
        this.ws.on('message', onMessage);
      } else {
        this.ws.onopen = onOpen;
        this.ws.onerror = onError;
        this.ws.onclose = onClose;
        this.ws.onmessage = onMessage;
      }
    });
  }

  async call<T = unknown>(method: string, params?: Record<string, unknown>): Promise<T> {
    if (!this.ws || !this.connected) throw new Error('Not connected');

    const id = crypto.randomUUID();
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`Timeout: ${method}`));
        }
      }, 30000);
      this.ws!.send(JSON.stringify({ type: 'req', id, method, params }));
    });
  }

  async sendChatAndWait(agentSessionKey: string, message: string, maxWaitMs: number = 25000): Promise<{ response: string; logs: string[] }> {
    this.log(`[INFO] Sending chat message to session: ${agentSessionKey}`);
    // Send message
    await this.call('chat.send', {
      sessionKey: agentSessionKey,
      message,
      idempotencyKey: `rpg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    });

    // Poll for response
    const startTime = Date.now();
    const pollInterval = 2000;

    while (Date.now() - startTime < maxWaitMs) {
      await new Promise(r => setTimeout(r, pollInterval));

      try {
        this.log(`[INFO] Polling history for session: ${agentSessionKey}...`);
        const history = await this.call<any[]>('sessions.history', {
          sessionKey: agentSessionKey,
        });

        if (Array.isArray(history) && history.length > 0) {
          // Find the latest assistant message
          const lastAssistant = [...history].reverse().find(
            (m: any) => m.role === 'assistant' && m.content
          );
          if (lastAssistant) {
            this.log(`[INFO] Received response for ${agentSessionKey}`);
            return { response: lastAssistant.content, logs: this.getLogs() };
          }
        }
      } catch (err) {
        this.log(`[WARN] History poll failed: ${err instanceof Error ? err.message : err}`);
        // Keep polling
      }
    }

    this.log(`[ERROR] Agent response timeout`);
    throw new Error('Agent response timeout');
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    this.pendingRequests.clear();
  }

  isConnected(): boolean {
    const isReady = this.ws?.readyState === 1 || (typeof WS !== 'undefined' && WS.OPEN && this.ws?.readyState === WS.OPEN);
    return this.connected && isReady;
  }
}

// Singleton
let instance: OpenClawGameClient | null = null;

export function getGameClient(): OpenClawGameClient {
  if (!instance) {
    instance = new OpenClawGameClient();
  }
  return instance;
}
