import { createHash } from 'crypto';

// -----------------------------------------------------------------------------
// Salted Merkle tree with per-stream roots and segment (chunk) aggregation.
// Matches the on-chain verify_merkle circuit: leaf → 8 levels → root.
// Depth 7 → 128 leaves. Every stream must be padded to a power of two; we pad
// with a deterministic sentinel leaf that the circuit range check will accept
// (an in-range dummy value with a unique salt per stream position).
// -----------------------------------------------------------------------------

export type Bytes32 = Uint8Array;
const DEPTH = 7;
const LEAVES = 1 << DEPTH; // 128

const sha = (parts: (Uint8Array | number)[]): Bytes32 => {
  const h = createHash('sha256');
  for (const p of parts) {
    h.update(p instanceof Uint8Array ? p : Buffer.from([p & 0xff, (p >> 8) & 0xff]));
  }
  return new Uint8Array(h.digest());
};

export interface SaltedLeaf {
  reading: number;
  salt: Uint8Array;
  commitment: Bytes32;
}

export interface StreamTree {
  leaves: SaltedLeaf[];
  levels: Bytes32[][];        // levels[0] = leaves, levels[DEPTH] = [root]
  root: Bytes32;
}

const leafCommit = (reading: number, salt: Uint8Array): Bytes32 =>
  sha([reading, salt]);

const hashPair = (a: Bytes32, b: Bytes32): Bytes32 => sha([a, b]);

const padLeaf = (streamIndex: number, pos: number): SaltedLeaf => {
  const salt = sha([new Uint8Array([0x70, streamIndex]), pos]);
  return { reading: 0, salt, commitment: leafCommit(0, salt) };
};

export const buildStreamTree = (
  streamIndex: number,
  readings: { reading: number; salt: Uint8Array }[],
): StreamTree => {
  if (readings.length > LEAVES) {
    throw new Error(
      `stream ${streamIndex}: ${readings.length} readings exceeds chunk size ${LEAVES}`,
    );
  }
  const leaves: SaltedLeaf[] = readings.map(r => ({
    reading: r.reading,
    salt: r.salt,
    commitment: leafCommit(r.reading, r.salt),
  }));
  while (leaves.length < LEAVES) {
    leaves.push(padLeaf(streamIndex, leaves.length));
  }

  const levels: Bytes32[][] = [leaves.map(l => l.commitment)];
  for (let d = 1; d <= DEPTH; d++) {
    const prev = levels[d - 1];
    const next: Bytes32[] = [];
    for (let i = 0; i < prev!.length; i += 2) {
      next.push(hashPair(prev![i]!, prev![i + 1]!));
    }
    levels.push(next);
  }
  return { leaves, levels, root: levels![DEPTH]![0]! };
};

export const merklePath = (tree: StreamTree, leafIndex: number): Bytes32[] => {
  if (leafIndex < 0 || leafIndex >= LEAVES) {
    throw new Error(`leafIndex ${leafIndex} out of range`);
  }
  const path: Bytes32[] = [];
  let idx = leafIndex;
  for (let d = 0; d < DEPTH; d++) {
    path.push(tree.levels[d]![idx ^ 1]!);
    idx >>= 1;
  }
  return path;
};

export const chunkAggregate = (chunkCommitments: Bytes32[]): Bytes32 => {
  let acc: Bytes32 = new Uint8Array(32);
  for (const c of chunkCommitments) {
    acc = sha([acc, c]);
  }
  return acc;
};

export const chunkCommitment = (
  shipmentId: Bytes32,
  legIndex: number,
  streamIndex: number,
  chunkIndex: number,
  streamRoot: Bytes32,
): Bytes32 =>
  sha([shipmentId, new Uint8Array([legIndex, streamIndex, (chunkIndex >> 8) & 0xff, chunkIndex & 0xff]), streamRoot]);