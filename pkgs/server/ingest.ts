import express, { type Request, type Response } from 'express';
import { verifyDeviceSignature, type DeviceRegistry, type SignedPayload, deviceKeyHash } from '../client/attestation.js';

// -----------------------------------------------------------------------------
// Signed ingestion endpoint. Rejects bad signatures, out-of-order timestamps,
// and duplicates. The device pubkey is looked up in a registry that the shipper
// populates at shipment registration time.
// -----------------------------------------------------------------------------

const app = express();
app.use(express.json({ limit: '2mb' }));

// ⚠️ Replace with your persistence layer. In-memory is fine for the local devnet.
const deviceRegistry: Map<string, Buffer> = new Map();
const seenTimestamps: Map<string, Set<number>> = new Map();

export const registerDevice = (deviceId: string, pubkey: Buffer) => {
  deviceRegistry.set(deviceId, pubkey);
};

const registry: DeviceRegistry = {
  getPublicKey: (id) => deviceRegistry.get(id) ?? null,
};

app.post('/ingest', (req: Request, res: Response) => {
  const payload = req.body as SignedPayload;

  if (!payload?.shipment_id || !payload.readings?.length || !payload.device_signature) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  // 1. Signature check
  const sig = verifyDeviceSignature(payload, registry);
  if (!sig.ok) {
    return res.status(401).json({ error: sig.reason });
  }

  // 2. Timestamp monotonicity per (shipment, device, leg)
  const key = `${payload.shipment_id}|${payload.device_id}|${payload.leg_index}`;
  const seen = seenTimestamps.get(key) ?? new Set<number>();
  let lastT = -Infinity;
  for (const r of payload.readings) {
    if (seen.has(r.t)) return res.status(409).json({ error: 'duplicate_timestamp', t: r.t });
    if (r.t <= lastT)  return res.status(400).json({ error: 'out_of_order_timestamp', t: r.t });
    lastT = r.t;
  }
  payload.readings.forEach(r => seen.add(r.t));
  seenTimestamps.set(key, seen);

  // 3. Hand off to proof pipeline. In Wave 2 this is just an ack; the client
  // pulls from a queue and generates chunk proofs.
  const pubKeyBuf = deviceRegistry.get(payload.device_id);
  const keyHashHex = pubKeyBuf ? Buffer.from(deviceKeyHash(pubKeyBuf)).toString('hex') : '';

  return res.status(202).json({
    accepted: true,
    reading_count: payload.readings.length,
    device_key_hash: keyHashHex,
  });
});

export default app;