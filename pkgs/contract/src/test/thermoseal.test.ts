import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";
import { buildStreamTree, merklePath, fromCsv } from "client";
import {
  Bounds,
  Shipment,
  ThermoSealSimulator
} from "./thermoseal-simulator.js";

setNetworkId("undeployed");

// ─────────────────────────────────────────────────────────────────────────
// Deterministic keys, salts, and contract fixtures
// ─────────────────────────────────────────────────────────────────────────
const DEVICE_PUBKEY = new Uint8Array(32).fill(0x01);
const WRONG_DEVICE_PUBKEY = new Uint8Array(32).fill(0x99);
const AUDITOR_PUBKEY_HASH = new Uint8Array(32).fill(0x77);

const SALT_A = new Uint8Array(16).fill(0xaa);
const SALT_B = new Uint8Array(16).fill(0xbb);

const DEFAULT_BOUNDS: [Bounds, Bounds, Bounds] = [
  { min: 2n, max: 8n },   // Stream 0: Temp (2°C – 8°C)
  { min: 30n, max: 60n }, // Stream 1: Humidity (30% – 60% RH)
  { min: 0n, max: 5n }    // Stream 2: Shock (0g – 5g)
];

const COMPLIANT_VALUES: [bigint, bigint, bigint] = [4n, 45n, 1n];

function makeId(seed: number): Uint8Array {
  const buf = new Uint8Array(32);
  buf[0] = seed & 0xff;
  buf[1] = (seed >> 8) & 0xff;
  return buf;
}

function buildChunkFixture(
  streamIndex: number,
  fillValue: bigint,
  salt: Uint8Array = SALT_A,
  overrides: Record<number, bigint> = {}
) {
  const readings: bigint[] = Array.from({ length: 128 }, (_, i) =>
    overrides[i] !== undefined ? overrides[i] : fillValue
  );
  const salts: Uint8Array[] = Array.from({ length: 128 }, () => salt);
  const leaves = readings.map((r, i) => ({
    reading: Number(r),
    salt: salts[i]
  }));

  const tree = buildStreamTree(streamIndex, leaves);
  const paths = readings.map((_, i) => merklePath(tree, i));

  return {
    readings,
    salts,
    root: tree.root as Uint8Array,
    paths
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Concrete Test Helpers (replacing the elided `declare function` stubs)
// ─────────────────────────────────────────────────────────────────────────

function registerSampleShipment(
  sim: ThermoSealSimulator,
  shipmentId: Uint8Array = makeId(1),
  legCount = 1n,
  chunkCounts: [bigint, bigint, bigint] = [1n, 1n, 1n]
) {
  const fixtures = [0, 1, 2].map((s) =>
    buildChunkFixture(s, COMPLIANT_VALUES[s])
  );
  const streamRoots: [Uint8Array, Uint8Array, Uint8Array] = [
    fixtures[0].root,
    fixtures[1].root,
    fixtures[2].root
  ];

  sim.registerShipment(
    shipmentId,
    streamRoots,
    DEFAULT_BOUNDS,
    chunkCounts,
    sim.hashDeviceKey(DEVICE_PUBKEY),
    legCount
  );

  return { shipmentId, fixtures };
}

function submitCompliantLeg(
  sim: ThermoSealSimulator,
  stream: number,
  opts: { shipmentSeed?: number; legIndex?: bigint } = {}
) {
  const shipmentId = makeId(opts.shipmentSeed ?? 10);
  const legIndex = opts.legIndex ?? 0n;
  const { fixtures } = registerSampleShipment(sim, shipmentId, 1n);

  const streamsToSubmit = stream === -1 ? [0, 1, 2] : [stream];
  const commitments: Uint8Array[] = [];

  for (const s of streamsToSubmit) {
    const f = fixtures[s];
    const rec = sim.submitChunk({
      shipmentId,
      devicePubkey: DEVICE_PUBKEY,
      legIndex,
      streamIndex: BigInt(s),
      chunkIndex: 0n,
      readings: f.readings,
      salts: f.salts,
      merklePaths: f.paths
    });
    commitments.push(rec.commitment);
  }

  return {
    shipmentId,
    legIndex,
    commitments,
    legPassed: commitments.length === streamsToSubmit.length
  };
}

function submitLegWithOutOfRange(sim: ThermoSealSimulator, stream: number) {
  const shipmentId = makeId(20 + stream);
  const outOfRangeVal = DEFAULT_BOUNDS[stream].max + 10n;

  // Build tree with the out-of-range value so Merkle verification would pass,
  // isolating the `in_range` circuit assertion failure.
  const fixtures = [0, 1, 2].map((s) =>
    buildChunkFixture(
      s,
      COMPLIANT_VALUES[s],
      SALT_A,
      s === stream ? { 0: outOfRangeVal } : {}
    )
  );

  sim.registerShipment(
    shipmentId,
    [fixtures[0].root, fixtures[1].root, fixtures[2].root],
    DEFAULT_BOUNDS,
    [1n, 1n, 1n],
    sim.hashDeviceKey(DEVICE_PUBKEY),
    1n
  );

  const f = fixtures[stream];
  sim.submitChunk({
    shipmentId,
    devicePubkey: DEVICE_PUBKEY,
    legIndex: 0n,
    streamIndex: BigInt(stream),
    chunkIndex: 0n,
    readings: f.readings,
    salts: f.salts,
    merklePaths: f.paths
  });
}

function submitLegWithBoundary(sim: ThermoSealSimulator) {
  const shipmentId = makeId(30);
  const fixtures = [0, 1, 2].map((s) =>
    buildChunkFixture(s, COMPLIANT_VALUES[s], SALT_A, {
      0: DEFAULT_BOUNDS[s].min,
      127: DEFAULT_BOUNDS[s].max
    })
  );

  sim.registerShipment(
    shipmentId,
    [fixtures[0].root, fixtures[1].root, fixtures[2].root],
    DEFAULT_BOUNDS,
    [1n, 1n, 1n],
    sim.hashDeviceKey(DEVICE_PUBKEY),
    1n
  );

  for (const s of [0, 1, 2]) {
    const f = fixtures[s];
    sim.submitChunk({
      shipmentId,
      devicePubkey: DEVICE_PUBKEY,
      legIndex: 0n,
      streamIndex: BigInt(s),
      chunkIndex: 0n,
      readings: f.readings,
      salts: f.salts,
      merklePaths: f.paths
    });
  }

  sim.finalizeLeg(shipmentId, 0n, DEVICE_PUBKEY);
  const ship = sim.readShipment(shipmentId);
  return { legPassed: ship.legs_compliant[0] };
}

function submitLegWithTamperedPath(sim: ThermoSealSimulator) {
  const shipmentId = makeId(40);
  const { fixtures } = registerSampleShipment(sim, shipmentId, 1n);
  const f = fixtures[0];

  // Flip a byte in the first leaf's Merkle sibling path
  const tamperedPaths = f.paths.map((p) => p.map((node) => new Uint8Array(node)));
  tamperedPaths[0][0][0] ^= 0xff;

  sim.submitChunk({
    shipmentId,
    devicePubkey: DEVICE_PUBKEY,
    legIndex: 0n,
    streamIndex: 0n,
    chunkIndex: 0n,
    readings: f.readings,
    salts: f.salts,
    merklePaths: tamperedPaths
  });
}

function submitThreeLegShipment(
  sim: ThermoSealSimulator,
  opts: { allCompliant?: boolean; failLeg?: number }
) {
  const shipmentId = makeId(50 + (opts.failLeg ?? 0));
  const legIndices = [0n, 1n, 2n];
  const { fixtures } = registerSampleShipment(sim, shipmentId, 3n);

  for (const leg of legIndices) {
    if (opts.failLeg !== undefined && Number(leg) === opts.failLeg) {
      // Skip chunk submission on the failing leg so finalize_leg rejects
      continue;
    }
    for (const s of [0, 1, 2]) {
      const f = fixtures[s];
      sim.submitChunk({
        shipmentId,
        devicePubkey: DEVICE_PUBKEY,
        legIndex: leg,
        streamIndex: BigInt(s),
        chunkIndex: 0n,
        readings: f.readings,
        salts: f.salts,
        merklePaths: f.paths
      });
    }
  }

  return { shipmentId, legIndices };
}

function submitTwoChunkLeg(sim: ThermoSealSimulator, tamperSecondChunk = false) {
  const shipmentId = makeId(tamperSecondChunk ? 71 : 70);
  const { fixtures } = registerSampleShipment(sim, shipmentId, 1n, [2n, 1n, 1n]);

  for (const s of [0, 1, 2]) {
    const chunks = s === 0 ? [0n, 1n] : [0n];
    for (const c of chunks) {
      const f = fixtures[s];
      const rootOverride =
        tamperSecondChunk && s === 0 && c === 1n
          ? f.paths.map((p) => p.map(() => new Uint8Array(32).fill(0xff)))
          : f.paths;

      sim.submitChunk({
        shipmentId,
        devicePubkey: DEVICE_PUBKEY,
        legIndex: 0n,
        streamIndex: BigInt(s),
        chunkIndex: c,
        readings: f.readings,
        salts: f.salts,
        merklePaths: rootOverride
      });
    }
  }

  sim.finalizeLeg(shipmentId, 0n, DEVICE_PUBKEY);
  return sim.readShipment(shipmentId);
}

// ─────────────────────────────────────────────────────────────────────────
// Test Suite — Unit + Integration (T01–T21 + Auditor Flows)
// ─────────────────────────────────────────────────────────────────────────

describe("ThermoSeal smart contract — unit + integration", () => {
  // ─────────────────────────────────────────────────────────────────────────
  // Initial state & Registration (T21)
  // ─────────────────────────────────────────────────────────────────────────
  describe("initial ledger state and registration (T21)", () => {
    it("T21 shipment survives ledger serialization round-trip", () => {
      const sim = new ThermoSealSimulator(DEVICE_PUBKEY);
      const { shipmentId } = registerSampleShipment(sim);

      const read: Shipment = sim.readShipment(shipmentId);
      expect(read.stream_roots).toHaveLength(3);
      expect(read.leg_count).toBe(1n);
      expect(read.finalized_legs).toBe(0n);
      expect(read.legs_compliant.every((flag) => flag === false)).toBe(true);
    });

    it("rejects duplicate shipment registration", () => {
      const sim = new ThermoSealSimulator(DEVICE_PUBKEY);
      const { shipmentId } = registerSampleShipment(sim);

      expect(() => registerSampleShipment(sim, shipmentId)).toThrow(
        /Shipment already registered/
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // T01–T04 & T08: Happy path and boundary compliance
  // ─────────────────────────────────────────────────────────────────────────
  describe("submit_chunk() — compliant readings and boundaries (T01–T04, T08)", () => {
    it.each([0, 1, 2])("T0%i happy path stream %i", (stream) => {
      const sim = new ThermoSealSimulator(DEVICE_PUBKEY);
      const { commitments } = submitCompliantLeg(sim, stream);
      expect(commitments).toHaveLength(1);
    });

    it("T04 multi-stream combined leg compliant", () => {
      const sim = new ThermoSealSimulator(DEVICE_PUBKEY);
      const result = submitCompliantLeg(sim, -1);
      expect(result.commitments).toHaveLength(3);
      expect(result.legPassed).toBe(true);
    });

    it("T08 boundary inclusive: exactly-at-min and exactly-at-max accepted", () => {
      const sim = new ThermoSealSimulator(DEVICE_PUBKEY);
      const r = submitLegWithBoundary(sim);
      expect(r.legPassed).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // T05–T07 & T09: Out-of-range and Merkle verification failures
  // ─────────────────────────────────────────────────────────────────────────
  describe("submit_chunk() — range and Merkle rejections (T05–T07, T09)", () => {
    it.each([0, 1, 2])(
      "T05–T07 out-of-range rejected on stream %i",
      (stream) => {
        const sim = new ThermoSealSimulator(DEVICE_PUBKEY);
        expect(() => submitLegWithOutOfRange(sim, stream)).toThrow(
          /Reading out of contractual bounds|range/i
        );
      }
    );

    it("T09 tampered merkle path rejected", () => {
      const sim = new ThermoSealSimulator(DEVICE_PUBKEY);
      expect(() => submitLegWithTamperedPath(sim)).toThrow(
        /Merkle path verification failed|merkle/i
      );
    });

    it("rejects duplicate chunk submission for the same (shipment, leg, stream, chunk)", () => {
      const sim = new ThermoSealSimulator(DEVICE_PUBKEY);
      const shipmentId = makeId(45);
      const { fixtures } = registerSampleShipment(sim, shipmentId, 1n);
      const f = fixtures[0];

      const payload = {
        shipmentId,
        devicePubkey: DEVICE_PUBKEY,
        legIndex: 0n,
        streamIndex: 0n,
        chunkIndex: 0n,
        readings: f.readings,
        salts: f.salts,
        merklePaths: f.paths
      };

      sim.submitChunk(payload);
      expect(() => sim.submitChunk(payload)).toThrow(/Chunk already submitted/);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // T10–T11: leaf_commit() & buildStreamTree() — hiding and binding
  // ─────────────────────────────────────────────────────────────────────────
  describe("buildStreamTree() — commitment binding and hiding (T10–T11)", () => {
    it("T10 hiding: same reading + different salt → different root", () => {
      const a = buildStreamTree(0, [{ reading: 4, salt: SALT_A }]);
      const b = buildStreamTree(0, [{ reading: 4, salt: SALT_B }]);
      expect(Buffer.from(a.root).equals(Buffer.from(b.root))).toBe(false);
    });

    it("T11 binding: same reading + same salt → identical root", () => {
      const a = buildStreamTree(0, [{ reading: 4, salt: SALT_A }]);
      const b = buildStreamTree(0, [{ reading: 4, salt: SALT_A }]);
      expect(Buffer.from(a.root).equals(Buffer.from(b.root))).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // T12–T14 & T17: finalize_leg() and nullifier replay protection
  // ─────────────────────────────────────────────────────────────────────────
  describe("finalize_leg() — nullifier replay and isolation (T12–T14, T17)", () => {
    it("T12 first finalize_leg succeeds", () => {
      const sim = new ThermoSealSimulator(DEVICE_PUBKEY);
      const { shipmentId, legIndex } = submitCompliantLeg(sim, -1);

      sim.finalizeLeg(shipmentId, legIndex, DEVICE_PUBKEY);
      const ship = sim.readShipment(shipmentId);
      expect(ship.legs_compliant[Number(legIndex)]).toBe(true);
      expect(ship.finalized_legs).toBe(1n);
    });

    it("T13 second finalize_leg on the same leg is rejected (nullifier replay)", () => {
      const sim = new ThermoSealSimulator(DEVICE_PUBKEY);
      const { shipmentId, legIndex } = submitCompliantLeg(sim, -1);

      sim.finalizeLeg(shipmentId, legIndex, DEVICE_PUBKEY);
      expect(() =>
        sim.finalizeLeg(shipmentId, legIndex, DEVICE_PUBKEY)
      ).toThrow(/Leg already finalized|nullifier|member/i);
    });

    it("T14 same leg index across different shipments → both accepted", () => {
      const sim = new ThermoSealSimulator(DEVICE_PUBKEY);
      const s1 = submitCompliantLeg(sim, -1, { shipmentSeed: 101 });
      const s2 = submitCompliantLeg(sim, -1, { shipmentSeed: 102 });

      expect(s1.legIndex).toBe(s2.legIndex);

      sim.finalizeLeg(s1.shipmentId, s1.legIndex, DEVICE_PUBKEY);
      sim.finalizeLeg(s2.shipmentId, s2.legIndex, DEVICE_PUBKEY);

      expect(sim.readShipment(s1.shipmentId).legs_compliant[0]).toBe(true);
      expect(sim.readShipment(s2.shipmentId).legs_compliant[0]).toBe(true);
    });

    it("T17 finalize_leg with unregistered device pubkey is rejected", () => {
      const sim = new ThermoSealSimulator(DEVICE_PUBKEY);
      const { shipmentId, legIndex } = submitCompliantLeg(sim, -1);

      expect(() =>
        sim.finalizeLeg(shipmentId, legIndex, WRONG_DEVICE_PUBKEY)
      ).toThrow(/device/i);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // T15–T16 & T18–T19: Multi-leg progression & multi-chunk aggregation
  // ─────────────────────────────────────────────────────────────────────────
  describe("multi-leg progression and multi-chunk aggregation (T15–T16, T18–T19)", () => {
    it("T15 three compliant legs → all 3 shipment leg flags compliant", () => {
      const sim = new ThermoSealSimulator(DEVICE_PUBKEY);
      const ids = submitThreeLegShipment(sim, { allCompliant: true });

      for (const l of ids.legIndices) {
        sim.finalizeLeg(ids.shipmentId, l, DEVICE_PUBKEY);
      }

      const ship = sim.readShipment(ids.shipmentId);
      expect(ship.finalized_legs).toBe(3n);
      expect(ship.legs_compliant.slice(0, 3)).toEqual([true, true, true]);
    });

    it("T16 one failing leg → failing leg stays non-compliant", () => {
      const sim = new ThermoSealSimulator(DEVICE_PUBKEY);
      const ids = submitThreeLegShipment(sim, { failLeg: 1 });

      for (const l of ids.legIndices) {
        try {
          sim.finalizeLeg(ids.shipmentId, l, DEVICE_PUBKEY);
        } catch {
          // Expected rejection for leg 1 (missing chunk record)
        }
      }

      const ship = sim.readShipment(ids.shipmentId);
      expect(ship.legs_compliant[0]).toBe(true);
      expect(ship.legs_compliant[1]).toBe(false);
      expect(ship.legs_compliant[2]).toBe(true);
      expect(ship.finalized_legs).toBe(2n);
    });

    it("T18 valid multi-chunk aggregate accepted", () => {
      const sim = new ThermoSealSimulator(DEVICE_PUBKEY);
      const ship = submitTwoChunkLeg(sim, false);
      expect(ship.legs_compliant[0]).toBe(true);
    });

    it("T19 tampered multi-chunk aggregate rejected", () => {
      const sim = new ThermoSealSimulator(DEVICE_PUBKEY);
      expect(() => submitTwoChunkLeg(sim, true)).toThrow(
        /Merkle path verification failed|commitment|root/i
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // T20: CSV ingest parity
  // ─────────────────────────────────────────────────────────────────────────
  describe("sensor ingest — CSV fallback parity (T20)", () => {
    it("T20 CSV path parses identical stream readings", () => {
      const csv = "t,temp,rh,shock\n0,4,45,1.0\n60,4,45,1.0\n";
      const viaCsv = fromCsv("00".repeat(32), 0, csv);
      expect(viaCsv.streams.temp[0].reading).toBe(4);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Auditor Grants & Selective Disclosure
  // ─────────────────────────────────────────────────────────────────────────
  describe("authorize_auditor() & record_disclosure()", () => {
    it("authorizes a valid scope preimage and records disclosure before expiry", () => {
      const sim = new ThermoSealSimulator(DEVICE_PUBKEY);
      const grantId = makeId(90);
      const scopePreimage = new Uint8Array(64).fill(0x42);
      const scopeHash = sim.computeScopeHash(scopePreimage);

      sim.authorizeAuditor(
        grantId,
        scopeHash,
        AUDITOR_PUBKEY_HASH,
        1000n,
        scopePreimage
      );

      sim.recordDisclosure(grantId, 500n);
      const grant = sim.readGrant(grantId);
      expect(grant.exercised).toBe(true);
    });

    it("rejects exercising an auditor grant twice or after expiry", () => {
      const sim = new ThermoSealSimulator(DEVICE_PUBKEY);
      const grantId = makeId(91);
      const scopePreimage = new Uint8Array(64).fill(0x42);
      const scopeHash = sim.computeScopeHash(scopePreimage);

      sim.authorizeAuditor(
        grantId,
        scopeHash,
        AUDITOR_PUBKEY_HASH,
        1000n,
        scopePreimage
      );

      // Expired epoch > 1000n
      expect(() => sim.recordDisclosure(grantId, 1001n)).toThrow(
        /Grant has expired/
      );

      // Valid disclosure succeeds once, then rejects replay
      sim.recordDisclosure(grantId, 900n);
      expect(() => sim.recordDisclosure(grantId, 950n)).toThrow(
        /Grant has already been exercised/
      );
    });
  });
});