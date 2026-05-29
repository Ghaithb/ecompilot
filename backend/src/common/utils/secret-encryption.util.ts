import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGO = 'aes-256-gcm';

function deriveKey(secret: string): Buffer {
  return scryptSync(secret, 'ecompilot-delivery', 32);
}

export function encryptSecret(plain: string, masterKey: string): { encrypted: string; iv: string } {
  const key = deriveKey(masterKey);
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    encrypted: Buffer.concat([enc, tag]).toString('base64'),
    iv: iv.toString('base64'),
  };
}

export function decryptSecret(encrypted: string, ivB64: string, masterKey: string): string {
  const key = deriveKey(masterKey);
  const iv = Buffer.from(ivB64, 'base64');
  const buf = Buffer.from(encrypted, 'base64');
  const tag = buf.subarray(buf.length - 16);
  const data = buf.subarray(0, buf.length - 16);
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}
