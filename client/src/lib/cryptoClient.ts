import { gcm } from "@noble/ciphers/aes.js";
import { hexToBytes } from "@noble/ciphers/utils.js";

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function decryptEncryptedPayload(
  encryptedBase64: string,
  secretHex: string,
): unknown {
  if (secretHex.length !== 64) {
    throw new Error("CRYPTO secret must be a 64-char hex string (32 bytes)");
  }
  const keyBytes = hexToBytes(secretHex);
  const buf = base64ToBytes(encryptedBase64);
  if (buf.length < 33) {
    throw new Error("invalid encrypted payload");
  }
  const iv = buf.subarray(0, 16);
  const authTag = buf.subarray(16, 32);
  const ciphertext = buf.subarray(32);
  const combined = new Uint8Array(ciphertext.length + authTag.length);
  combined.set(ciphertext);
  combined.set(authTag, ciphertext.length);
  const aes = gcm(keyBytes, iv);
  const plain = aes.decrypt(combined);
  return JSON.parse(new TextDecoder().decode(plain));
}

function getSecret(): string | null {
  const s = process.env.NEXT_PUBLIC_CRYPTO_SECRET?.trim() ?? "";
  return s.length === 64 ? s : null;
}

export function unwrapEncryptedResponseBody(body: unknown): unknown {
  if (
    body === null ||
    typeof body !== "object" ||
    Array.isArray(body) ||
    !("data" in body) ||
    typeof (body as { data: unknown }).data !== "string"
  ) {
    return body;
  }
  const secret = getSecret();
  if (!secret) {
    return body;
  }
  try {
    return decryptEncryptedPayload((body as { data: string }).data, secret);
  } catch {
    return body;
  }
}
