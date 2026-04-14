import crypto from 'crypto';

const ALGORITHM  = 'aes-256-gcm';
const SECRET_HEX = process.env.CRYPTO_SECRET ?? '';

function getKey(): Buffer {
  if (SECRET_HEX.length !== 64) {
    throw new Error('CRYPTO_SECRET must be a 64-char hex string (32 bytes)');
  }
  return Buffer.from(SECRET_HEX, 'hex');
}

export function encrypt(data: object): string {
  const iv     = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);

  const jsonStr   = JSON.stringify(data);
  const encrypted = Buffer.concat([cipher.update(jsonStr, 'utf8'), cipher.final()]);
  const authTag   = cipher.getAuthTag();

  // layout: [iv(16)] [authTag(16)] [encrypted]
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

export function decrypt(payload: string): object {
  const buf       = Buffer.from(payload, 'base64');
  const iv        = buf.subarray(0, 16);
  const authTag   = buf.subarray(16, 32);
  const encrypted = buf.subarray(32);

  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return JSON.parse(decrypted.toString('utf8'));
}
