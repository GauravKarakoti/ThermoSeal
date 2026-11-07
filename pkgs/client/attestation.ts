import { createPublicKey, verify, createHash } from 'crypto';

// -----------------------------------------------------------------------------
// Device attestation. Every reading payload from a signed logger carries an
// Ed25519 signature over a canonical serialization of the readings block.
// The ingestion server verifies before forwarding to the proof pipeline.
// -----------------------------------------------------------------------------

export interface SignedPayload {
  shipment_id: string;        // hex-encoded 32 bytes
  leg_index: number;
  device_id: string;
  readings: { t: number; temp_c: number; rh: number; shock_g: number }[];
  device_signature: string;   // hex-encoded Ed25519 signature
}

// Canonical serialization — must be identical between device SDK and verifier.
export const canonicalBytes = (p: Omit<SignedPayload, 'device_signature'>): Buffer => {
  const parts: Buffer[] = [];
  parts.push(Buffer.from(p.shipment_id, 'hex'));
  parts.push(Buffer.from([p.leg_index & 0xff]));
  parts.push(Buffer.from(p.device_id, 'utf8'));
  for (const r of p.readings) {
    const b = Buffer.alloc(12);
    b.writeUInt32BE(r.t >>> 0, 0);
    b.writeUInt16BE(r.temp_c & 0xffff, 4);
    b.writeUInt16BE(r.rh & 0xffff, 6);
    b.writeUInt16BE(r.shock_g & 0xffff, 8);
    b.writeUInt16BE(0, 10);
    parts.push(b);
  }
  return Buffer.concat(parts);
};

export interface DeviceRegistry {
  getPublicKey(deviceId: string): Buffer | null;   // raw 32-byte Ed25519 pubkey
}

export const verifyDeviceSignature = (
  payload: SignedPayload,
  registry: DeviceRegistry,
): { ok: true } | { ok: false; reason: string } => {
  const pub = registry.getPublicKey(payload.device_id);
  if (!pub) return { ok: false, reason: 'device_not_registered' };

  const key = createPublicKey({
    key: Buffer.concat([
      // SPKI DER prefix for Ed25519 (RFC 8410): 302a300506032b6570032100
      Buffer.from('302a300506032b6570032100', 'hex'),
      pub,
    ]),
    format: 'der',
    type: 'spki',
  });

  const msg = canonicalBytes(payload);
  const sig = Buffer.from(payload.device_signature, 'hex');
  const ok = verify(null, msg, key, sig);
  return ok ? { ok: true } : { ok: false, reason: 'bad_signature' };
};

// Device pubkey hash bound into register_shipment.
export const deviceKeyHash = (pub: Buffer): Uint8Array =>
  new Uint8Array(createHash('sha256').update(pub).digest());