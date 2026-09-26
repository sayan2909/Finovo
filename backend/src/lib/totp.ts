import crypto from "crypto";

/**
 * Decodes an RFC 4648 Base32 string into a Buffer.
 */
function base32ToBuffer(base32: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  const cleaned = base32.toUpperCase().replace(/[\s-=]/g, "");
  for (const char of cleaned) {
    const val = alphabet.indexOf(char);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

/**
 * Computes the 6-digit TOTP code for a specific counter step.
 */
function getCodeForCounter(key: Buffer, counter: number): string {
  const buf = Buffer.alloc(8);
  buf.writeBigInt64BE(BigInt(counter));
  const hmac = crypto.createHmac("sha1", key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return (code % 1000000).toString().padStart(6, "0");
}

/**
 * Verifies a 6-digit TOTP code against an RFC 4648 Base32 secret.
 * Allows a +/- 1 step window (current step +/- 30 seconds) to account for clock drift.
 */
export function verifyTOTP(token: string, secret: string, window = 1): boolean {
  if (!token || !secret) return false;
  const cleanToken = token.trim();
  if (cleanToken.length !== 6 || !/^\d{6}$/.test(cleanToken)) return false;

  try {
    const key = base32ToBuffer(secret);
    if (key.length === 0) return false;

    const epoch = Math.floor(Date.now() / 1000);
    const timeStep = 30;
    const currentCounter = Math.floor(epoch / timeStep);

    for (let offset = -window; offset <= window; offset++) {
      const counter = currentCounter + offset;
      const expectedCode = getCodeForCounter(key, counter);
      if (expectedCode === cleanToken) {
        return true;
      }
    }
  } catch (err) {
    console.error("TOTP verification error:", err);
  }

  return false;
}

/**
 * Computes the current 6-digit TOTP code for a given secret.
 */
export function generateTOTP(secret: string, offset = 0): string {
  const key = base32ToBuffer(secret);
  const epoch = Math.floor(Date.now() / 1000);
  const timeStep = 30;
  const counter = Math.floor(epoch / timeStep) + offset;
  return getCodeForCounter(key, counter);
}
