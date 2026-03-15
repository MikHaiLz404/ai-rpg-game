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
  private deviceIdentity: { deviceId: string; publicKeyPem: string; privateKeyPem: string } | null = null;

  constructor(private url: string = GATEWAY_URL, private token: string = GATEWAY_TOKEN) {
    try {
      this.deviceIdentity = loadOrCreateDeviceIdentity();
    } catch {
      console.warn('[OpenClaw-Game] No device identity available');
    }
  }

  async connect(): Promise<void> {
    if (this.connected && (this.ws?.readyState === 1 || this.ws?.readyState === WS.OPEN)) return;

    return new Promise((resolve, reject) => {
      const wsUrl = new URL(this.url);
      
      // Node.js (Vercel) supports headers in the WS constructor, browsers do not.
      if (typeof window === 'undefined') {
        this.ws = new WS(wsUrl.toString(), {
          headers: {
            'ngrok-skip-browser-warning': 'true',
            'User-Agent': 'OpenClaw-Game-Client'
          },
          handshakeTimeout: 10000
        });
      } else {
        this.ws = new WS(wsUrl.toString());
      }

      const timeout = setTimeout(() => {
        if (typeof this.ws?.close === 'function') this.ws.close();
        reject(new Error('Connection timeout (15s)'));
      }, 15000);

      const onOpen = () => {
        console.log('[OpenClaw-Game] Connected, waiting for challenge...');
      };

      const onError = (err: any) => {
        clearTimeout(timeout);
        console.error('[OpenClaw-Game] WS Error:', err);
        reject(new Error('WebSocket connection failed'));
      };

      const onClose = () => {
        clearTimeout(timeout);
        this.connected = false;
      };

      const onMessage = (event: any) => {
        try {
          const rawData = typeof event.data === 'string' ? event.data : event;
          const data = JSON.parse(rawData);

          // Handle challenge-response
          if (data.type === 'event' && data.event === 'connect.challenge') {
            const nonce = data.payload?.nonce;
            const requestId = crypto.randomUUID();
            const signedAtMs = Date.now();

            let device: Record<string, unknown> | undefined;
            if (this.deviceIdentity) {
              const payload = buildDeviceAuthPayload({
                deviceId: this.deviceIdentity.deviceId,
                clientId: 'rpg-game', clientMode: 'ui',
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
                console.log('[OpenClaw-Game] Authenticated');
                resolve();
              },
              reject: (err) => {
                clearTimeout(timeout);
                reject(err);
              }
            });

            this.ws.send(JSON.stringify({
              type: 'req', id: requestId, method: 'connect',
              params: {
                minProtocol: 3, maxProtocol: 3,
                client: { id: 'rpg-game', version: '1.0.0', platform: 'server', mode: 'ui' },
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
          console.error('[OpenClaw-Game] Parse error:', err);
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

  async sendChatAndWait(agentSessionKey: string, message: string, maxWaitMs: number = 25000): Promise<string> {
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
        const history = await this.call<any[]>('sessions.history', {
          session_id: agentSessionKey,
        });

        if (Array.isArray(history) && history.length > 0) {
          // Find the latest assistant message
          const lastAssistant = [...history].reverse().find(
            (m: any) => m.role === 'assistant' && m.content
          );
          if (lastAssistant) {
            return lastAssistant.content;
          }
        }
      } catch {
        // Keep polling
      }
    }

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
    return this.connected && this.ws?.readyState === WebSocket.OPEN;
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
