import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import os from 'os';

interface DeviceIdentity {
  deviceId: string;
  publicKeyPem: string;
  privateKeyPem: string;
}

const IDENTITY_DIR = path.join(os.homedir(), '.mission-control', 'identity');
const IDENTITY_FILE = path.join(IDENTITY_DIR, 'device.json');
const ED25519_SPKI_PREFIX = Buffer.from('302a300506032b6570032100', 'hex');

function base64UrlEncode(buf: Buffer): string {
  return buf.toString('base64').replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/g, '');
}

function derivePublicKeyRaw(publicKeyPem: string): Buffer {
  const spki = crypto.createPublicKey(publicKeyPem).export({ type: 'spki', format: 'der' });
  if (spki.length === ED25519_SPKI_PREFIX.length + 32 &&
      spki.subarray(0, ED25519_SPKI_PREFIX.length).equals(ED25519_SPKI_PREFIX)) {
    return spki.subarray(ED25519_SPKI_PREFIX.length);
  }
  return spki;
}

function fingerprintPublicKey(publicKeyPem: string): string {
  const raw = derivePublicKeyRaw(publicKeyPem);
  return crypto.createHash('sha256').update(raw).digest('hex');
}

export function publicKeyRawBase64Url(publicKeyPem: string): string {
  return base64UrlEncode(derivePublicKeyRaw(publicKeyPem));
}

function generateIdentity(): DeviceIdentity {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
  const publicKeyPem = publicKey.export({ type: 'spki', format: 'pem' }).toString();
  const privateKeyPem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
  return { deviceId: fingerprintPublicKey(publicKeyPem), publicKeyPem, privateKeyPem };
}

export function loadOrCreateDeviceIdentity(filePath: string = IDENTITY_FILE): DeviceIdentity {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed?.version === 1 && parsed.deviceId && parsed.publicKeyPem && parsed.privateKeyPem) {
        return {
          deviceId: fingerprintPublicKey(parsed.publicKeyPem),
          publicKeyPem: parsed.publicKeyPem,
          privateKeyPem: parsed.privateKeyPem,
        };
      }
    }
  } catch (e) {
    console.warn('[Device Identity] Failed to load existing identity, generating new:', e);
  }

  const identity = generateIdentity();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify({
    version: 1, ...identity, createdAtMs: Date.now()
  }, null, 2) + '\n', { mode: 0o600 });
  return identity;
}

export function signDevicePayload(privateKeyPem: string, payload: string): string {
  const key = crypto.createPrivateKey(privateKeyPem);
  return base64UrlEncode(crypto.sign(null, Buffer.from(payload, 'utf8'), key));
}

export function buildDeviceAuthPayload(params: {
  deviceId: string; clientId: string; clientMode: string;
  role: string; scopes: string[]; signedAtMs: number;
  token: string | null; nonce?: string;
}): string {
  const version = params.nonce ? 'v2' : 'v1';
  const base = [version, params.deviceId, params.clientId, params.clientMode,
    params.role, params.scopes.join(','), String(params.signedAtMs), params.token ?? ''];
  if (version === 'v2') base.push(params.nonce ?? '');
  return base.join('|');
}
