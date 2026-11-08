import cb from "crypto-browserify";

export const {
  createHash, createHmac, randomBytes, pbkdf2Sync,
  createCipheriv, createDecipheriv,
} = cb as any;

export function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export default { ...(cb as any), timingSafeEqual };