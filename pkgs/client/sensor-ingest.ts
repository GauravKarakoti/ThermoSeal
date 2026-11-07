// -----------------------------------------------------------------------------
// Adapter: normalizes three input sources into the shape proof.ts expects.
// Primary path = webhook payload (attested). Fallback = CSV (unattested, demo).
// -----------------------------------------------------------------------------
import { createHash, randomBytes } from 'crypto';
import { type SignedPayload } from './attestation.js';

export interface NormalizedReadings {
  shipmentId: Uint8Array;
  legIndex: number;
  attested: boolean;
  streams: {
    temp:     { reading: number; salt: Uint8Array }[];
    humidity: { reading: number; salt: Uint8Array }[];
    shock:    { reading: number; salt: Uint8Array }[];
  };
}

const saltFor = (shipmentId: Uint8Array, leg: number, stream: number, idx: number): Uint8Array => {
  const h = createHash('sha256');
  h.update(shipmentId);
  h.update(Buffer.from([leg & 0xff, stream & 0xff, (idx >> 8) & 0xff, idx & 0xff]));
  h.update(randomBytes(8));  // unique salt per invocation
  return new Uint8Array(h.digest().subarray(0, 16));
};

export const fromSignedPayload = (p: SignedPayload): NormalizedReadings => {
  const shipmentId = new Uint8Array(Buffer.from(p.shipment_id, 'hex'));
  const temp:     NormalizedReadings['streams']['temp'] = [];
  const humidity: NormalizedReadings['streams']['humidity'] = [];
  const shock:    NormalizedReadings['streams']['shock'] = [];
  p.readings.forEach((r, i) => {
    temp.push({     reading: r.temp_c, salt: saltFor(shipmentId, p.leg_index, 0, i) });
    humidity.push({ reading: r.rh,     salt: saltFor(shipmentId, p.leg_index, 1, i) });
    shock.push({    reading: r.shock_g * 100, salt: saltFor(shipmentId, p.leg_index, 2, i) });
  });
  return { shipmentId, legIndex: p.leg_index, attested: true, streams: { temp, humidity, shock } };
};

// Unattested CSV fallback — used for demos and for devices that can't sign.
// UI labels this as "Unattested import (demo only)" so verifiers see the difference.
export const fromCsv = (
  shipmentIdHex: string,
  legIndex: number,
  csv: string,
): NormalizedReadings => {
  const shipmentId = new Uint8Array(Buffer.from(shipmentIdHex, 'hex'));
  const rows = csv.trim().split('\n').slice(1);   // skip header
  const temp:     NormalizedReadings['streams']['temp'] = [];
  const humidity: NormalizedReadings['streams']['humidity'] = [];
  const shock:    NormalizedReadings['streams']['shock'] = [];
  rows.forEach((row, i) => {
    const [, t, rh, g] = row.split(',');
    temp.push(     { reading: parseFloat(t!) | 0,      salt: saltFor(shipmentId, legIndex, 0, i) });
    humidity.push( { reading: parseFloat(rh!) | 0,     salt: saltFor(shipmentId, legIndex, 1, i) });
    shock.push(    { reading: (parseFloat(g!) * 100) | 0, salt: saltFor(shipmentId, legIndex, 2, i) });
  });
  return { shipmentId, legIndex, attested: false, streams: { temp, humidity, shock } };
};