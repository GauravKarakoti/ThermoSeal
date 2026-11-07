import { INITIAL_THERMOSEAL_PRIVATE_STATE } from "contract";
import path from "path";
import type { ThermoSealProviders } from "shared";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { WalletContext } from "../api";
import * as api from "../api";
import { currentDir } from "../config";
import { createLogger } from "../logger-utils";
import { TestEnvironment } from "./commons";

const logDir = path.resolve(
  currentDir,
  "..",
  "logs",
  "tests",
  `${new Date().toISOString()}-thermoseal.log`,
);
const logger = await createLogger(logDir);

describe("ThermoSeal Cold-Chain API", () => {
  let testEnvironment: TestEnvironment;
  let walletCtx: WalletContext;
  let shipperProviders: ThermoSealProviders;
  let carrierProviders: ThermoSealProviders;

  beforeAll(
    async () => {
      api.setLogger(logger);
      testEnvironment = new TestEnvironment(logger);
      const testConfiguration = await testEnvironment.start();
      walletCtx = await testEnvironment.getWallet();
      shipperProviders = await api.configureThermoSealProviders(
        walletCtx,
        testConfiguration.dappConfig,
        "thermoseal-shipper",
      );
      carrierProviders = await api.configureThermoSealProviders(
        walletCtx,
        testConfiguration.dappConfig,
        "thermoseal-carrier",
      );
    },
    1000 * 60 * 45,
  );

  afterAll(async () => {
    await testEnvironment.shutdown();
  });

  it("registers shipment, submits 3 stream chunks, and finalizes leg 0 [@slow]", async () => {
    const shipperContract = await api.deployThermoSeal(
      shipperProviders,
      INITIAL_THERMOSEAL_PRIVATE_STATE,
    );
    expect(shipperContract).not.toBeNull();
    const contractAddress =
      shipperContract.deployTxData.public.contractAddress;

    const carrierContract = await api.joinThermoSeal(
      carrierProviders,
      contractAddress,
    );
    expect(carrierContract).not.toBeNull();

    const shipmentId = new Uint8Array(32).fill(1);
    const devicePubkey = new Uint8Array(32).fill(7);
    const deviceKeyHash = api.hashBytes32(devicePubkey);

    const readings: [bigint, bigint, bigint] = [5n, 45n, 1n];
    const streamRoots: [Uint8Array, Uint8Array, Uint8Array] = [
      api.buildChunkMerkleMaterial(readings[0]).root,
      api.buildChunkMerkleMaterial(readings[1]).root,
      api.buildChunkMerkleMaterial(readings[2]).root,
    ];
    const streamBounds: [
      { min: number; max: number },
      { min: number; max: number },
      { min: number; max: number },
    ] = [
      { min: 2, max: 8 },
      { min: 30, max: 60 },
      { min: 0, max: 5 },
    ];

    await api.registerShipment(
      shipperContract,
      shipmentId,
      streamRoots,
      streamBounds,
      [1n, 1n, 1n],
      deviceKeyHash,
      2n,
    );

    for (let s = 0; s < 3; s++) {
      await api.submitChunk(
        carrierProviders,
        carrierContract,
        shipmentId,
        0n,
        BigInt(s),
        0n,
        readings[s],
      );
    }

    await api.finalizeLeg(
      carrierProviders,
      carrierContract,
      shipmentId,
      devicePubkey,
      0n,
    );

    // Replaying finalizeLeg on the same leg must be rejected by the nullifier set
    await expect(
      api.finalizeLeg(
        carrierProviders,
        carrierContract,
        shipmentId,
        devicePubkey,
        0n,
      ),
    ).rejects.toThrow();

    const state = await api.getThermoSealState(
      shipperProviders,
      contractAddress,
    );
    expect(state).not.toBeNull();
  });

  it("authorizes a scoped auditor grant and records disclosure once [@slow]", async () => {
    const shipperContract = await api.deployThermoSeal(
      shipperProviders,
      INITIAL_THERMOSEAL_PRIVATE_STATE,
    );
    const grantId = new Uint8Array(32).fill(9);
    const scopePreimage = new Uint8Array(64).fill(5);
    const auditorPubkeyHash = new Uint8Array(32).fill(8);

    await api.authorizeAuditor(
      shipperProviders,
      shipperContract,
      grantId,
      scopePreimage,
      auditorPubkeyHash,
      1000n,
    );

    await api.recordDisclosure(
      shipperProviders,
      shipperContract,
      grantId,
      500n,
    );

    // Exercising the same grant twice must fail
    await expect(
      api.recordDisclosure(shipperProviders, shipperContract, grantId, 600n),
    ).rejects.toThrow();
  });
});