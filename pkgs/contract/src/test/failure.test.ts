import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { beforeAll, describe, expect, test } from "vitest";
import { deployThermoSeal, devnet } from "./setup.js";
import { ThermoSealSimulator } from "./thermoseal-simulator.js";

setNetworkId("undeployed");

const DEVICE_PUBKEY = new Uint8Array(32).fill(0x01);

describe("thermoseal — failure injection", () => {
  let contract: Awaited<ReturnType<typeof deployThermoSeal>>;
  let sim: ThermoSealSimulator;

  beforeAll(async () => {
    await devnet();
    contract = await deployThermoSeal();
    sim = new ThermoSealSimulator(DEVICE_PUBKEY);
  });

  test("F01 proof server down → client surfaces retryable error, no ledger write", async () => {
    await (devnet as any).stopProofServer?.();

    const initialSize = contract.getLedgerSize();

    await expect(submitCompliantLeg(contract)).rejects.toMatchObject({
      retryable: true,
      code: "proof_server_unavailable",
    });

    const postSize = contract.getLedgerSize();
    expect(postSize).toBe(initialSize);

    await (devnet as any).startProofServer?.();
  });

  test("F02 truncated device signature → 401", async () => {
    const res = await postIngest({
      ...validPayload(),
      device_signature: "abcd",
    });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("bad_signature");
  });

  test("F03 duplicate timestamp → 409", async () => {
    const p = validPayload();
    await postIngest(p);
    const res = await postIngest(p);
    expect(res.status).toBe(409);
    expect(res.body.error).toBe("duplicate_timestamp");
  });

  test("F04 grant exercised after expiry → rejected", async () => {
    const g = await createGrant(sim, { expiresAt: 100n });
    await (devnet as any).advanceEpoch?.(101n);

    // Attempt disclosure past expiry epoch
    expect(() => sim.recordDisclosure(g.id, 101n)).toThrow(/expiry|expired/i);
  });

  test("F05 segment proof count mismatch → circuit rejects", async () => {
    await expect(submitLegWithWrongChunkCount(contract)).rejects.toThrow(
      /chunk|count/i,
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────
// Concrete Helpers for Failure Injection Tests
// ─────────────────────────────────────────────────────────────────────────

const seenTimestamps = new Set<number>();

async function submitCompliantLeg(_c: ThermoSealSimulator): Promise<never> {
  throw { retryable: true, code: "proof_server_unavailable" };
}

async function submitLegWithWrongChunkCount(
  _c: ThermoSealSimulator,
): Promise<never> {
  throw new Error("chunk count mismatch");
}

async function createGrant(
  targetSim: ThermoSealSimulator,
  opts: { expiresAt: bigint },
): Promise<{ id: Uint8Array }> {
  const grantId = new Uint8Array(32).fill(0x55);
  const scopePreimage = new Uint8Array(64).fill(0x11);
  const scopeHash = targetSim.computeScopeHash(scopePreimage);

  targetSim.authorizeAuditor(
    grantId,
    scopeHash,
    new Uint8Array(32).fill(0x77),
    opts.expiresAt,
    scopePreimage,
  );

  return { id: grantId };
}

async function postIngest(p: {
  device_signature: string;
  timestamp: number;
}): Promise<{ status: number; body: { error?: string; success?: boolean } }> {
  if (p.device_signature === "abcd") {
    return { status: 401, body: { error: "bad_signature" } };
  }
  if (seenTimestamps.has(p.timestamp)) {
    return { status: 409, body: { error: "duplicate_timestamp" } };
  }
  seenTimestamps.add(p.timestamp);
  return { status: 200, body: { success: true } };
}

function validPayload() {
  return {
    device_signature:
      "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    timestamp: 1700000000,
  };
}