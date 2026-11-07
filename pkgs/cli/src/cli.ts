import { stdin as input, stdout as output } from "node:process";
import { createInterface, type Interface } from "node:readline/promises";
import { fromHex, toHex } from "@midnight-ntwrk/midnight-js-utils";
import { INITIAL_THERMOSEAL_PRIVATE_STATE } from "contract";
import type { Logger } from "pino";
import type {
  DeployedThermoSealContract,
  ThermoSealProviders,
} from "shared";
import type {
  DockerComposeEnvironment,
  StartedDockerComposeEnvironment,
} from "testcontainers";
import type { WalletContext } from "./api";
import * as api from "./api";
import { type Config, StandaloneConfig } from "./config";
import { DIVIDER, GENESIS_MINT_WALLET_SEED } from "./constants";
import { mapContainerPort } from "./docker-utils";

let logger: Logger;

const BANNER = `
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║              Midnight ThermoSeal CLI                         ║
║              ───────────────────────                         ║
║              ZK Cold-Chain Compliance & Scoped Disclosure    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`;

const WALLET_MENU = `
${DIVIDER}
  Wallet Setup
${DIVIDER}
  [1] Create a new wallet
  [2] Restore wallet from seed
  [3] Exit
${"─".repeat(62)}
> `;

const buildWalletFromSeed = async (
  config: Config,
  rli: Interface,
): Promise<WalletContext> => {
  const seed = await rli.question("Enter your wallet seed: ");
  return await api.buildWalletAndWaitForFunds(config, seed);
};

const buildWallet = async (
  config: Config,
  rli: Interface,
): Promise<WalletContext | null> => {
  if (config instanceof StandaloneConfig) {
    return await api.buildWalletAndWaitForFunds(
      config,
      GENESIS_MINT_WALLET_SEED,
    );
  }

  while (true) {
    const choice = await rli.question(WALLET_MENU);
    switch (choice.trim()) {
      case "1":
        return await api.buildFreshWallet(config);
      case "2":
        return await buildWalletFromSeed(config, rli);
      case "3":
        return null;
      default:
        logger.error(`Invalid choice: ${choice}`);
    }
  }
};

const getDustLabel = async (
  wallet: api.WalletContext["wallet"],
): Promise<string> => {
  try {
    const dust = await api.getDustBalance(wallet);
    return dust.available.toLocaleString();
  } catch {
    return "";
  }
};

const startDustMonitor = async (
  wallet: api.WalletContext["wallet"],
  rli: Interface,
): Promise<void> => {
  console.log("");
  const stopPromise = rli
    .question("  Press Enter to return to menu...\n")
    .then(() => {});
  await api.monitorDustBalance(wallet, stopPromise);
  console.log("");
};

const thermosealContractMenu = (dustBalance: string) => `
${DIVIDER}
  ThermoSeal Contract Setup${dustBalance ? `         DUST: ${dustBalance}` : ""}
${DIVIDER}
  [1] Deploy a new ThermoSeal contract
  [2] Join an existing ThermoSeal contract
  [3] Monitor DUST balance
  [4] Exit
${"─".repeat(62)}
> `;

const thermosealActionsMenu = (address: string, dustBalance: string) => `
${DIVIDER}
  ThermoSeal Actions${dustBalance ? `                DUST: ${dustBalance}` : ""}
  Contract: ${address}
${DIVIDER}
  [1] Register demo shipment (temp: 2-8°C, rh: 30-60%, shock: 0-5g)
  [2] Submit sensor chunk proof (O(128) readings)
  [3] Finalize transport leg & record nullifier
  [4] Authorize scoped auditor grant
  [5] Record auditor disclosure
  [6] Show ledger state summary
  [7] Exit
${"─".repeat(62)}
> `;

const padOrHashHex32 = (hexStr: string, fallbackFill = 1): Uint8Array => {
  const clean = hexStr.trim().replace(/^0x/, "");
  if (clean.length === 64) {
    return new Uint8Array(fromHex(clean));
  }
  const bytes = new Uint8Array(32).fill(fallbackFill);
  for (let i = 0; i < Math.min(clean.length, 32); i++) {
    bytes[i] = clean.charCodeAt(i);
  }
  return bytes;
};

const deployOrJoinThermoSeal = async (
  providers: ThermoSealProviders,
  walletCtx: api.WalletContext,
  rli: Interface,
): Promise<DeployedThermoSealContract | null> => {
  while (true) {
    const dustLabel = await getDustLabel(walletCtx.wallet);
    const choice = await rli.question(thermosealContractMenu(dustLabel));
    switch (choice.trim()) {
      case "1":
        try {
          const contract = await api.withStatus(
            "Deploying ThermoSeal contract",
            () =>
              api.deployThermoSeal(
                providers,
                INITIAL_THERMOSEAL_PRIVATE_STATE,
              ),
          );
          console.log(
            `  Contract deployed at: ${(contract as any).deployTxData.public.contractAddress}\n`,
          );
          return contract;
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.log(`\n  ✗ Deploy failed: ${msg}\n`);
        }
        break;
      case "2":
        try {
          const contractAddress = await rli.question(
            "Enter the ThermoSeal contract address (hex): ",
          );
          const contract = await api.withStatus(
            "Joining ThermoSeal contract",
            () => api.joinThermoSeal(providers, contractAddress.trim()),
          );
          console.log(
            `  Joined contract at: ${(contract as any).deployTxData.public.contractAddress}\n`,
          );
          return contract;
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.log(`  ✗ Failed to join contract: ${msg}\n`);
        }
        break;
      case "3":
        await startDustMonitor(walletCtx.wallet, rli);
        break;
      case "4":
        return null;
      default:
        console.log(`  Invalid choice: ${choice}`);
    }
  }
};

const thermosealMainLoop = async (
  providers: ThermoSealProviders,
  walletCtx: api.WalletContext,
  rli: Interface,
): Promise<void> => {
  const contract = await deployOrJoinThermoSeal(providers, walletCtx, rli);
  if (contract === null) return;

  const contractAddress: string = (contract as any).deployTxData.public
    .contractAddress;

  // Default demo readings per stream (temp=5°C, rh=45%, shock=1g)
  const defaultReadings: [bigint, bigint, bigint] = [5n, 45n, 1n];
  const defaultDevicePubkey = new Uint8Array(32).fill(7);

  while (true) {
    const dustLabel = await getDustLabel(walletCtx.wallet);
    const choice = await rli.question(
      thermosealActionsMenu(contractAddress, dustLabel),
    );
    switch (choice.trim()) {
      case "1": {
        const idInput = await rli.question(
          "Shipment ID (press Enter for default 0x0101...): ",
        );
        const shipmentId = idInput.trim()
          ? padOrHashHex32(idInput, 1)
          : new Uint8Array(32).fill(1);
        const legsInput = await rli.question(
          "Number of transport legs (1-8, default 2): ",
        );
        const legCount = BigInt(legsInput.trim() || "2");

        const streamRoots: [Uint8Array, Uint8Array, Uint8Array] = [
          api.buildChunkMerkleMaterial(defaultReadings[0]).root,
          api.buildChunkMerkleMaterial(defaultReadings[1]).root,
          api.buildChunkMerkleMaterial(defaultReadings[2]).root,
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
        const deviceKeyHash = api.hashBytes32(defaultDevicePubkey);

        try {
          await api.withStatus(
            `Registering shipment 0x${toHex(shipmentId).slice(0, 12)}...`,
            () =>
              api.registerShipment(
                contract,
                shipmentId,
                streamRoots,
                streamBounds,
                [1n, 1n, 1n],
                deviceKeyHash,
                legCount,
              ),
          );
        } catch (e) {
          console.log(
            `  ✗ Registration failed: ${e instanceof Error ? e.message : String(e)}\n`,
          );
        }
        break;
      }
      case "2": {
        const idInput = await rli.question(
          "Shipment ID (press Enter for default 0x0101...): ",
        );
        const shipmentId = idInput.trim()
          ? padOrHashHex32(idInput, 1)
          : new Uint8Array(32).fill(1);
        const legStr = await rli.question("Leg index (default 0): ");
        const legIndex = BigInt(legStr.trim() || "0");

        try {
          for (let s = 0; s < 3; s++) {
            await api.withStatus(
              `Submitting chunk proof for stream ${s} (leg ${legIndex})`,
              () =>
                api.submitChunk(
                  providers,
                  contract,
                  shipmentId,
                  legIndex,
                  BigInt(s),
                  0n,
                  defaultReadings[s],
                ),
            );
          }
        } catch (e) {
          console.log(
            `  ✗ Chunk submission failed: ${e instanceof Error ? e.message : String(e)}\n`,
          );
        }
        break;
      }
      case "3": {
        const idInput = await rli.question(
          "Shipment ID (press Enter for default 0x0101...): ",
        );
        const shipmentId = idInput.trim()
          ? padOrHashHex32(idInput, 1)
          : new Uint8Array(32).fill(1);
        const legStr = await rli.question("Leg index to finalize (default 0): ");
        const legIndex = BigInt(legStr.trim() || "0");

        try {
          await api.withStatus(`Finalizing leg ${legIndex} on-chain`, () =>
            api.finalizeLeg(
              providers,
              contract,
              shipmentId,
              defaultDevicePubkey,
              legIndex,
            ),
          );
        } catch (e) {
          console.log(
            `  ✗ Finalize leg failed: ${e instanceof Error ? e.message : String(e)}\n`,
          );
        }
        break;
      }
      case "4": {
        const grantInput = await rli.question(
          "Grant ID (press Enter for default 0x0909...): ",
        );
        const grantId = grantInput.trim()
          ? padOrHashHex32(grantInput, 9)
          : new Uint8Array(32).fill(9);
        const expiryStr = await rli.question("Expiry epoch (default 1000): ");
        const expiryEpoch = BigInt(expiryStr.trim() || "1000");

        const scopePreimage = new Uint8Array(64).fill(5);
        const auditorPubkeyHash = new Uint8Array(32).fill(8);

        try {
          await api.withStatus("Authorizing scoped auditor grant", () =>
            api.authorizeAuditor(
              providers,
              contract,
              grantId,
              scopePreimage,
              auditorPubkeyHash,
              expiryEpoch,
            ),
          );
        } catch (e) {
          console.log(
            `  ✗ Authorize auditor failed: ${e instanceof Error ? e.message : String(e)}\n`,
          );
        }
        break;
      }
      case "5": {
        const grantInput = await rli.question(
          "Grant ID (press Enter for default 0x0909...): ",
        );
        const grantId = grantInput.trim()
          ? padOrHashHex32(grantInput, 9)
          : new Uint8Array(32).fill(9);
        const epochStr = await rli.question("Current epoch (default 500): ");
        const currentEpoch = BigInt(epochStr.trim() || "500");

        try {
          await api.withStatus("Recording disclosure on-chain", () =>
            api.recordDisclosure(providers, contract, grantId, currentEpoch),
          );
        } catch (e) {
          console.log(
            `  ✗ Record disclosure failed: ${e instanceof Error ? e.message : String(e)}\n`,
          );
        }
        break;
      }
      case "6":
        try {
          const state = await api.getThermoSealState(
            providers,
            contractAddress,
          );
          if (state == null) {
            console.log("  No state found at this contract address.\n");
          } else {
            const countIterable = (col: unknown): number =>
              col ? Array.from(col as Iterable<unknown>).length : 0;
            console.log(`
  Shipments Registered: ${countIterable(state.shipments)}
  Finalized Nullifiers: ${countIterable(state.leg_nullifiers)}
  Submitted Chunks:     ${countIterable(state.chunk_records)}
  Auditor Grants:       ${countIterable(state.auditor_grants)}
  Disclosures Logged:   ${countIterable(state.disclosure_log)}
`);
          }
        } catch (e) {
          console.log(
            `  ✗ Failed to get state: ${e instanceof Error ? e.message : String(e)}\n`,
          );
        }
        break;
      case "7":
        return;
      default:
        console.log(`  Invalid choice: ${choice}`);
    }
  }
};

export const run = async (
  config: Config,
  _logger: Logger,
  dockerEnv?: DockerComposeEnvironment,
): Promise<void> => {
  logger = _logger;
  api.setLogger(_logger);

  console.log(BANNER);

  const rli = createInterface({ input, output, terminal: true });
  let env: StartedDockerComposeEnvironment | undefined;

  try {
    if (dockerEnv !== undefined) {
      env = await dockerEnv.up();

      if (config instanceof StandaloneConfig) {
        config.indexer = mapContainerPort(
          env,
          config.indexer,
          "thermoseal-indexer",
        );
        config.indexerWS = mapContainerPort(
          env,
          config.indexerWS,
          "thermoseal-indexer",
        );
        config.node = mapContainerPort(env, config.node, "thermoseal-node");
        config.proofServer = mapContainerPort(
          env,
          config.proofServer,
          "thermoseal-proof-server",
        );
      }
    }

    const walletCtx = await buildWallet(config, rli);
    if (walletCtx === null) {
      return;
    }

    try {
      const providers = await api.withStatus(
        "Configuring ThermoSeal providers",
        () => api.configureThermoSealProviders(walletCtx, config),
      );
      console.log("");
      await thermosealMainLoop(providers, walletCtx, rli);
    } catch (e) {
      if (e instanceof Error) {
        logger.error(`Error: ${e.message}`);
        logger.debug(`${e.stack}`);
      } else {
        throw e;
      }
    } finally {
      try {
        await walletCtx.wallet.stop();
      } catch (e) {
        logger.error(`Error stopping wallet: ${e}`);
      }
    }
  } finally {
    rli.close();
    rli.removeAllListeners();

    if (env !== undefined) {
      try {
        await env.down();
      } catch (e) {
        logger.error(`Error shutting down docker environment: ${e}`);
      }
    }

    logger.info("Goodbye.");
  }
};