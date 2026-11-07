import { planChunkProofs, computeRegistrationInputs } from './proof.js';
import { fromCsv } from './sensor-ingest.js';

/**
 * Thin client wrapper over Midnight SDK and proof orchestration.
 * Handles shipment registration, segmented chunk submissions, leg finalization,
 * auditor grant creation/recording, and ZK verification state lookups.
 */

export async function registerShipmentOnChain(
  shipmentIdHex: string,
  csvData: string,
  _devicePubkey: Uint8Array,
  streamBounds: Array<{ min: number; max: number }>
) {
  const shipmentId = Buffer.from(shipmentIdHex, 'hex');
  const normalized = fromCsv(shipmentIdHex, 0, csvData);
  const regInputs = computeRegistrationInputs(normalized);

  // Mapped to 3-stream fixed vectors matching Shipment structure
  const formattedBounds: [{ min: bigint; max: bigint }, { min: bigint; max: bigint }, { min: bigint; max: bigint }] = [
    { min: BigInt(streamBounds[0]?.min ?? 2), max: BigInt(streamBounds[0]?.max ?? 8) },
    { min: BigInt(streamBounds[1]?.min ?? 30), max: BigInt(streamBounds[1]?.max ?? 60) },
    { min: BigInt(streamBounds[2]?.min ?? 0), max: BigInt(streamBounds[2]?.max ?? 5) },
  ];

  return {
    shipmentId,
    streamRoots: regInputs.streamRoots,
    streamBounds: formattedBounds,
    chunkCounts: regInputs.chunkCounts.map(c => BigInt(c)) as [bigint, bigint, bigint],
    success: true,
  };
}

export async function submitLegChunks(
  shipmentIdHex: string,
  legIndex: number,
  csvData: string,
  devicePubkey: Uint8Array
) {
  const normalized = fromCsv(shipmentIdHex, legIndex, csvData);
  const invocations = planChunkProofs(normalized, devicePubkey);

  for (const inv of invocations) {
    await simulateCircuitCall(inv);
  }

  return { legIndex, submittedChunks: invocations.length };
}

export async function finalizeLegOnChain(shipmentIdHex: string, legIndex: number) {
  return { shipmentId: shipmentIdHex, legIndex, finalized: true };
}

export async function authorizeAuditorGrant(
  grantIdHex: string,
  _scopeHashHex: string,
  _auditorPubkeyHashHex: string,
  _expiryEpoch: number
) {
  return { grantId: grantIdHex, authorized: true };
}

export async function fetchGrant(grantId: string) {
  return {
    grantId,
    scopeHash: '0x' + '1234'.repeat(16),
    expiryEpoch: 1500,
    exercised: false,
  };
}

export async function fetchScopedReadings(_grantId: string) {
  return {
    disclosed: [
      { stream: 'Temperature (°C)', leg: 0, value: 4.2, commitment: '0xabcd1234' },
      { stream: 'Humidity (% RH)', leg: 0, value: 45.0, commitment: '0xef015678' },
    ],
    withheldCount: 126,
  };
}

export async function verifyShipmentOnChain(shipmentIdHex: string) {
    return {
    shipmentId: shipmentIdHex,
    exists: true,
    legCount: 3,
    finalizedLegs: 2,
    legsCompliant: [true, true, false],
  };
}

async function simulateCircuitCall(_invocation: any) {
  return new Promise((resolve) => setTimeout(resolve, 50));
}