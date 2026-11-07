import { buildStreamTree, merklePath } from './merkle.js';
import { type NormalizedReadings } from './sensor-ingest.js';

// -----------------------------------------------------------------------------
// Segmented proof orchestration.
// For each stream, we have up to N/128 chunks. Each chunk becomes its own
// contract invocation (submit_chunk), keeping every circuit O(128).
// Then one finalize_leg call aggregates.
// -----------------------------------------------------------------------------

export const CHUNK_SIZE = 128;

export interface ProofInvocation {
  circuit: 'submit_chunk';
  args: { legIndex: number; streamIndex: number; chunkIndex: number };
  witness: {
    shipmentId: Uint8Array;
    devicePubkey: Uint8Array;
    readings: bigint[];
    salts: Uint8Array[];
    merklePaths: Uint8Array[][];
  };
}

export const planChunkProofs = (
  n: NormalizedReadings,
  devicePubkey: Uint8Array,
): ProofInvocation[] => {
  const invocations: ProofInvocation[] = [];
  const streamNames: ('temp' | 'humidity' | 'shock')[] = ['temp', 'humidity', 'shock'];

  streamNames.forEach((name, streamIndex) => {
    const all = n.streams[name];
    const chunks = Math.ceil(all.length / CHUNK_SIZE);
    for (let c = 0; c < chunks; c++) {
      const chunk = all.slice(c * CHUNK_SIZE, (c + 1) * CHUNK_SIZE);
      const tree = buildStreamTree(streamIndex, all);
      const paths: Uint8Array[][] = [];
      for (let i = 0; i < chunk.length; i++) {
        paths.push(merklePath(tree, c * CHUNK_SIZE + i));
      }
      const readings = chunk.map(item => BigInt(item.reading));
      const salts    = chunk.map(item => item.salt);
      while (readings.length < CHUNK_SIZE) {
        readings.push(0n);
        salts.push(new Uint8Array(16));
        paths.push(merklePath(tree, readings.length - 1));
      }
      invocations.push({
        circuit: 'submit_chunk',
        args: { legIndex: n.legIndex, streamIndex, chunkIndex: c },
        witness: { shipmentId: n.shipmentId, devicePubkey, readings, salts, merklePaths: paths },
      });
    }
  });
  return invocations;
};

export interface StreamTreeSummary {
  streamIndex: number;
  root: Uint8Array;
  chunkCount: number;
}

export const computeRegistrationInputs = (n: NormalizedReadings) => {
  const streamNames: ('temp' | 'humidity' | 'shock')[] = ['temp', 'humidity', 'shock'];
  const summaries: StreamTreeSummary[] = streamNames.map((name, i) => {
    const tree = buildStreamTree(i, n.streams[name]);
    return { streamIndex: i, root: tree.root, chunkCount: Math.ceil(n.streams[name].length / CHUNK_SIZE) };
  });
  return {
    streamRoots:    summaries.map(s => s.root) as [Uint8Array, Uint8Array, Uint8Array],
    chunkCounts:    summaries.map(s => s.chunkCount),
  };
};