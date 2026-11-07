import fs from "node:fs";
import path from "node:path";
import { CompiledContract } from "@midnight-ntwrk/compact-js";
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  CompactTypeBytes,
  CompactTypeVector,
  persistentHash,
} from "@midnight-ntwrk/compact-runtime";
import * as ledger from "@midnight-ntwrk/ledger-v8";
import { unshieldedToken } from "@midnight-ntwrk/ledger-v8";
import {
  deployContract,
  findDeployedContract,
} from "@midnight-ntwrk/midnight-js-contracts";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";
import { getNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { NodeZkConfigProvider } from "@midnight-ntwrk/midnight-js-node-zk-config-provider";
import type {
  FinalizedTxData,
  MidnightProvider,
  WalletProvider,
} from "@midnight-ntwrk/midnight-js-types";
import {
  assertIsContractAddress,
  toHex,
} from "@midnight-ntwrk/midnight-js-utils";
import {
  MidnightBech32m,
  ShieldedAddress,
  ShieldedCoinPublicKey,
  ShieldedEncryptionPublicKey,
} from "@midnight-ntwrk/wallet-sdk-address-format";
import { DustWallet } from "@midnight-ntwrk/wallet-sdk-dust-wallet";
import { WalletFacade } from "@midnight-ntwrk/wallet-sdk-facade";
import {
  generateRandomSeed,
  HDWallet,
  Roles,
} from "@midnight-ntwrk/wallet-sdk-hd";
import { ShieldedWallet } from "@midnight-ntwrk/wallet-sdk-shielded";
import {
  createKeystore,
  InMemoryTransactionHistoryStorage,
  PublicKey,
  type UnshieldedKeystore,
  UnshieldedWallet,
} from "@midnight-ntwrk/wallet-sdk-unshielded-wallet";
import { Buffer } from "buffer";
import {
  INITIAL_THERMOSEAL_PRIVATE_STATE,
  ThermoSeal,
  type ThermoSealPrivateState,
  thermosealWitnesses,
} from "contract";
import type { Logger } from "pino";
import * as Rx from "rxjs";
import {
  type Bounds,
  type DeployedThermoSealContract,
  faucetUrlFor,
  type ThermoSealCircuits,
  type ThermoSealLedgerState,
  ThermoSealPrivateStateId,
  type ThermoSealProviders,
} from "shared";
import { WebSocket } from "ws";
import { type Config, currentDir } from "./config";
import { DIVIDER } from "./constants";

let logger: Logger;

// Required for GraphQL subscriptions (wallet sync) to work in Node.js
// @ts-expect-error: Needed to enable WebSocket usage through apollo
globalThis.WebSocket = WebSocket;

export interface WalletContext {
  wallet: WalletFacade;
  shieldedSecretKeys: ledger.ZswapSecretKeys;
  dustSecretKey: ledger.DustSecretKey;
  unshieldedKeystore: UnshieldedKeystore;
}

const signTransactionIntents = (
  tx: { intents?: Map<number, any> },
  signFn: (payload: Uint8Array) => ledger.Signature,
  proofMarker: "proof" | "pre-proof",
): void => {
  if (!tx.intents || tx.intents.size === 0) return;

  for (const segment of tx.intents.keys()) {
    const intent = tx.intents.get(segment);
    if (!intent) continue;

    const cloned = ledger.Intent.deserialize<
      ledger.SignatureEnabled,
      ledger.Proofish,
      ledger.PreBinding
    >("signature", proofMarker, "pre-binding", intent.serialize());

    const sigData = cloned.signatureData(segment);
    const signature = signFn(sigData);

    if (cloned.fallibleUnshieldedOffer) {
      const sigs = cloned.fallibleUnshieldedOffer.inputs.map(
        (_: ledger.UtxoSpend, i: number) =>
          cloned.fallibleUnshieldedOffer!.signatures.at(i) ?? signature,
      );
      cloned.fallibleUnshieldedOffer =
        cloned.fallibleUnshieldedOffer.addSignatures(sigs);
    }

    if (cloned.guaranteedUnshieldedOffer) {
      const sigs = cloned.guaranteedUnshieldedOffer.inputs.map(
        (_: ledger.UtxoSpend, i: number) =>
          cloned.guaranteedUnshieldedOffer!.signatures.at(i) ?? signature,
      );
      cloned.guaranteedUnshieldedOffer =
        cloned.guaranteedUnshieldedOffer.addSignatures(sigs);
    }

    tx.intents.set(segment, cloned);
  }
};

export const createWalletAndMidnightProvider = async (
  ctx: WalletContext,
): Promise<WalletProvider & MidnightProvider> => {
  const state = await Rx.firstValueFrom(
    ctx.wallet.state().pipe(Rx.filter((s) => s.isSynced)),
  );
  return {
    getCoinPublicKey() {
      return state.shielded.coinPublicKey.toHexString();
    },
    getEncryptionPublicKey() {
      return state.shielded.encryptionPublicKey.toHexString();
    },
    async balanceTx(tx, ttl?) {
      const recipe = await ctx.wallet.balanceUnboundTransaction(
        tx,
        {
          shieldedSecretKeys: ctx.shieldedSecretKeys,
          dustSecretKey: ctx.dustSecretKey,
        },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );

      const signFn = (payload: Uint8Array) =>
        ctx.unshieldedKeystore.signData(payload);
      signTransactionIntents(recipe.baseTransaction, signFn, "proof");
      if (recipe.balancingTransaction) {
        signTransactionIntents(
          recipe.balancingTransaction,
          signFn,
          "pre-proof",
        );
      }

      return ctx.wallet.finalizeRecipe(recipe);
    },
    submitTx(tx) {
      return ctx.wallet.submitTransaction(tx) as any;
    },
  };
};

export const waitForSync = (wallet: WalletFacade) =>
  Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.throttleTime(5_000),
      Rx.filter((state) => state.isSynced),
    ),
  );

export const waitForFunds = (wallet: WalletFacade): Promise<bigint> =>
  Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.throttleTime(10_000),
      Rx.filter((state) => state.isSynced),
      Rx.map((s) => s.unshielded.balances[unshieldedToken().raw] ?? 0n),
      Rx.filter((balance) => balance > 0n),
    ),
  );

const buildShieldedConfig = ({
  indexer,
  indexerWS,
  node,
  proofServer,
}: Config) => ({
  networkId: getNetworkId(),
  indexerClientConnection: {
    indexerHttpUrl: indexer,
    indexerWsUrl: indexerWS,
    keepAlive: 0,
  },
  batchSize: 1000,
  provingServerUrl: new URL(proofServer),
  relayURL: new URL(node.replace(/^http/, "ws")),
});

const buildUnshieldedConfig = ({ indexer, indexerWS }: Config) => ({
  networkId: getNetworkId(),
  indexerClientConnection: {
    indexerHttpUrl: indexer,
    indexerWsUrl: indexerWS,
    keepAlive: 0,
  },
  txHistoryStorage: new InMemoryTransactionHistoryStorage(),
});

const buildDustConfig = ({
  indexer,
  indexerWS,
  node,
  proofServer,
}: Config) => ({
  networkId: getNetworkId(),
  costParameters: {
    additionalFeeOverhead: 300_000_000_000_000n,
    feeBlocksMargin: 5,
  },
  indexerClientConnection: {
    indexerHttpUrl: indexer,
    indexerWsUrl: indexerWS,
    keepAlive: 0,
  },
  provingServerUrl: new URL(proofServer),
  relayURL: new URL(node.replace(/^http/, "ws")),
});

// ─── Wallet State Cache ───────────────────────────────────────────────────────

const walletCacheDir = (networkId: string, seed: string) =>
  path.resolve(currentDir, "..", "wallet-cache", networkId, seed.slice(0, 16));

const loadCachedState = (dir: string, name: string): string | null => {
  const p = path.join(dir, `${name}.json`);
  try {
    return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
  } catch {
    return null;
  }
};

const saveCachedState = (dir: string, name: string, data: string): void => {
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${name}.json`), data, "utf8");
  } catch {
    // Ignore non-fatal cache write errors
  }
};

const persistWalletState = async (
  wallet: WalletFacade,
  cacheDir: string,
): Promise<void> => {
  try {
    const [shielded, unshielded, dust] = await Promise.all([
      wallet.shielded.serializeState(),
      wallet.unshielded.serializeState(),
      wallet.dust.serializeState(),
    ]);
    saveCachedState(cacheDir, "shielded", shielded);
    saveCachedState(cacheDir, "unshielded", unshielded);
    saveCachedState(cacheDir, "dust", dust);
  } catch {
    // Ignore non-fatal cache write errors
  }
};

// ─── Key Derivation ───────────────────────────────────────────────────────────

const deriveKeysFromSeed = (seed: string) => {
  const hdWallet = HDWallet.fromSeed(Buffer.from(seed, "hex"));
  if (hdWallet.type !== "seedOk") {
    throw new Error("Failed to initialize HDWallet from seed");
  }

  const derivationResult = hdWallet.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);

  if (derivationResult.type !== "keysDerived") {
    throw new Error("Failed to derive keys");
  }

  hdWallet.hdWallet.clear();
  return derivationResult.keys;
};

const formatBalance = (balance: bigint): string => balance.toLocaleString();

export const withStatus = async <T>(
  message: string,
  fn: () => Promise<T>,
): Promise<T> => {
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let i = 0;
  const interval = setInterval(() => {
    process.stdout.write(`\r  ${frames[i++ % frames.length]} ${message}`);
  }, 80);
  try {
    const result = await fn();
    clearInterval(interval);
    process.stdout.write(`\r  ✓ ${message}\n`);
    return result;
  } catch (e) {
    clearInterval(interval);
    process.stdout.write(`\r  ✗ ${message}\n`);
    throw e;
  }
};

const registerForDustGeneration = async (
  wallet: WalletFacade,
  unshieldedKeystore: UnshieldedKeystore,
): Promise<void> => {
  const state = await Rx.firstValueFrom(
    wallet.state().pipe(Rx.filter((s) => s.isSynced)),
  );

  if (state.dust.availableCoins.length > 0) {
    const dustBal = state.dust.balance(new Date());
    console.log(
      `  ✓ Dust tokens already available (${formatBalance(dustBal)} DUST)`,
    );
    return;
  }

  const nightUtxos = state.unshielded.availableCoins.filter(
    (coin: any) => coin.meta?.registeredForDustGeneration !== true,
  );
  if (nightUtxos.length === 0) {
    await withStatus("Waiting for dust tokens to generate", () =>
      Rx.firstValueFrom(
        wallet.state().pipe(
          Rx.throttleTime(5_000),
          Rx.filter((s) => s.isSynced),
          Rx.filter((s) => s.dust.balance(new Date()) > 0n),
        ),
      ),
    );
    return;
  }

  await withStatus(
    `Registering ${nightUtxos.length} NIGHT UTXO(s) for dust generation`,
    async () => {
      const recipe = await wallet.registerNightUtxosForDustGeneration(
        nightUtxos,
        unshieldedKeystore.getPublicKey(),
        (payload) => unshieldedKeystore.signData(payload),
      );
      const finalized = await wallet.finalizeRecipe(recipe);
      await wallet.submitTransaction(finalized);
    },
  );

  await withStatus("Waiting for dust tokens to generate", () =>
    Rx.firstValueFrom(
      wallet.state().pipe(
        Rx.throttleTime(5_000),
        Rx.filter((s) => s.isSynced),
        Rx.filter((s) => s.dust.balance(new Date()) > 0n),
      ),
    ),
  );
};

const printWalletSummary = (
  state: any,
  unshieldedKeystore: UnshieldedKeystore,
) => {
  const networkId = getNetworkId();
  const unshieldedBalance =
    state.unshielded.balances[unshieldedToken().raw] ?? 0n;

  const coinPubKey = ShieldedCoinPublicKey.fromHexString(
    state.shielded.coinPublicKey.toHexString(),
  );
  const encPubKey = ShieldedEncryptionPublicKey.fromHexString(
    state.shielded.encryptionPublicKey.toHexString(),
  );
  const shieldedAddress = MidnightBech32m.encode(
    networkId,
    new ShieldedAddress(coinPubKey, encPubKey),
  ).toString();

  const DIV = DIVIDER;

  console.log(`
${DIV}
  Wallet Overview                            Network: ${networkId}
${DIV}

  Shielded (ZSwap)
  └─ Address: ${shieldedAddress}

  Unshielded
  ├─ Address: ${unshieldedKeystore.getBech32Address()}
  └─ Balance: ${formatBalance(unshieldedBalance)} tNight

  Dust
  └─ Address: ${MidnightBech32m.encode(networkId, state.dust.address).toString()}

${DIV}`);
};

export const buildWalletAndWaitForFunds = async (
  config: Config,
  seed: string,
): Promise<WalletContext> => {
  console.log("");

  const networkId = getNetworkId();
  const cacheDir = walletCacheDir(networkId, seed);

  const { wallet, shieldedSecretKeys, dustSecretKey, unshieldedKeystore } =
    await withStatus("Building wallet", async () => {
      const keys = deriveKeysFromSeed(seed);
      const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(
        keys[Roles.Zswap],
      );
      const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
      const unshieldedKeystore = createKeystore(
        keys[Roles.NightExternal],
        networkId,
      );

      const walletConfig = {
        ...buildShieldedConfig(config),
        ...buildUnshieldedConfig(config),
        ...buildDustConfig(config),
      };

      const shieldedCache = loadCachedState(cacheDir, "shielded");
      const unshieldedCache = loadCachedState(cacheDir, "unshielded");
      const dustCache = loadCachedState(cacheDir, "dust");
      const fromCache = shieldedCache && unshieldedCache && dustCache;

      const wallet = await WalletFacade.init({
        configuration: walletConfig,
        shielded: (cfg) =>
          fromCache
            ? ShieldedWallet(cfg).restore(shieldedCache)
            : ShieldedWallet(cfg).startWithSecretKeys(shieldedSecretKeys),
        unshielded: (cfg) =>
          fromCache
            ? UnshieldedWallet(cfg).restore(unshieldedCache)
            : UnshieldedWallet(cfg).startWithPublicKey(
                PublicKey.fromKeyStore(unshieldedKeystore),
              ),
        dust: (cfg) =>
          fromCache
            ? DustWallet(cfg).restore(dustCache)
            : DustWallet(cfg).startWithSecretKey(
                dustSecretKey,
                ledger.LedgerParameters.initialParameters().dust,
              ),
      });
      await wallet.start(shieldedSecretKeys, dustSecretKey);

      return { wallet, shieldedSecretKeys, dustSecretKey, unshieldedKeystore };
    });

  const DIV = DIVIDER;
  const faucet = faucetUrlFor(networkId);
  console.log(`
${DIV}
  Wallet Overview                            Network: ${networkId}
${DIV}
  Unshielded Address (send tNight here):
  ${unshieldedKeystore.getBech32Address()}
${
  faucet
    ? `
  Fund your wallet with tNight from the faucet:
  ${faucet}
`
    : ""
}${DIV}
`);

  const syncedState = await withStatus("Syncing with network", () =>
    waitForSync(wallet),
  );

  await persistWalletState(wallet, cacheDir);
  printWalletSummary(syncedState, unshieldedKeystore);

  const balance = syncedState.unshielded.balances[unshieldedToken().raw] ?? 0n;
  if (balance === 0n) {
    const fundedBalance = await withStatus("Waiting for incoming tokens", () =>
      waitForFunds(wallet),
    );
    console.log(`    Balance: ${formatBalance(fundedBalance)} tNight\n`);
  }

  await registerForDustGeneration(wallet, unshieldedKeystore);

  return { wallet, shieldedSecretKeys, dustSecretKey, unshieldedKeystore };
};

export const buildFreshWallet = async (
  config: Config,
): Promise<WalletContext> => {
  const seed = toHex(Buffer.from(generateRandomSeed()));
  const DIV = DIVIDER;
  console.log(`
${DIV}
  New Wallet Seed — save this before continuing
${DIV}
  ${seed}
${DIV}
`);
  return await buildWalletAndWaitForFunds(config, seed);
};

export const getDustBalance = async (
  wallet: WalletFacade,
): Promise<{
  available: bigint;
  pending: bigint;
  availableCoins: number;
  pendingCoins: number;
}> => {
  const state = await Rx.firstValueFrom(
    wallet.state().pipe(Rx.filter((s) => s.isSynced)),
  );
  const available = state.dust.balance(new Date());
  const availableCoins = state.dust.availableCoins.length;
  const pendingCoins = state.dust.pendingCoins.length;
  const pending = state.dust.pendingCoins.reduce(
    (sum, c) => sum + c.initialValue,
    0n,
  );
  return { available, pending, availableCoins, pendingCoins };
};

export const monitorDustBalance = async (
  wallet: WalletFacade,
  stopSignal: Promise<void>,
): Promise<void> => {
  let stopped = false;
  void stopSignal.then(() => {
    stopped = true;
  });

  const sub = wallet
    .state()
    .pipe(
      Rx.throttleTime(5_000),
      Rx.filter((s) => s.isSynced),
    )
    .subscribe((state) => {
      if (stopped) return;

      const now = new Date();
      const available = state.dust.balance(now);
      const availableCoins = state.dust.availableCoins.length;
      const pendingCoins = state.dust.pendingCoins.length;

      const registeredNight = state.unshielded.availableCoins.filter(
        (coin: any) => coin.meta?.registeredForDustGeneration === true,
      ).length;
      const totalNight = state.unshielded.availableCoins.length;

      let status = "";
      if (pendingCoins > 0 && availableCoins === 0) {
        status = "⚠ locked by pending tx";
      } else if (available > 0n) {
        status = "✓ ready to deploy";
      } else if (availableCoins > 0) {
        status = "accruing...";
      } else if (registeredNight > 0) {
        status = "waiting for generation...";
      } else {
        status = "no NIGHT registered";
      }

      const time = now.toLocaleTimeString();
      console.log(
        `  [${time}] DUST: ${formatBalance(available)} (${availableCoins} coins, ${pendingCoins} pending) | NIGHT: ${totalNight} UTXOs, ${registeredNight} registered | ${status}`,
      );
    });

  await stopSignal;
  sub.unsubscribe();
};

export function setLogger(_logger: Logger) {
  logger = _logger;
}

const rtBytes32 = new CompactTypeBytes(32);
const rtBytes64 = new CompactTypeBytes(64);
const rtVec2Bytes32 = new CompactTypeVector(2, rtBytes32);

export const hashBytes32 = (data: Uint8Array): Uint8Array =>
  persistentHash(rtBytes32, data);

export const hashBytes64 = (data: Uint8Array): Uint8Array =>
  persistentHash(rtBytes64, data);

/**
 * Encodes a bigint Field value into a 32-byte little-endian Uint8Array,
 * matching Compact's `(reading as Field) as Bytes<32>` cast.
 */
const fieldToBytes32 = (val: bigint): Uint8Array => {
  const bytes = new Uint8Array(32);
  let temp = val;
  for (let i = 0; i < 32 && temp > 0n; i++) {
    bytes[i] = Number(temp & 0xffn);
    temp >>= 8n;
  }
  return bytes;
};

/**
 * Computes the leaf commitment and depth-8 Merkle root for a 128-reading chunk
 * matching `leaf_commit` and `verify_merkle` in `thermoseal.compact`.
 */
export const buildChunkMerkleMaterial = (anchorReading: bigint) => {
  const readings = Array.from({ length: 128 }, () => anchorReading);
  const salts = Array.from({ length: 128 }, () => new Uint8Array(16));
  const merklePaths = Array.from({ length: 128 }, () =>
    Array.from({ length: 8 }, () => new Uint8Array(32)),
  );

  const readingBytes = fieldToBytes32(anchorReading);
  const saltBytes = new Uint8Array(32); // zero-extended 16-byte zero salt
  let acc = persistentHash(rtVec2Bytes32, [readingBytes, saltBytes]);
  const zeroSibling = new Uint8Array(32);
  for (let d = 0; d < 8; d++) {
    acc = persistentHash(rtVec2Bytes32, [acc, zeroSibling]);
  }

  return {
    root: acc,
    readings,
    salts,
    merklePaths,
  };
};

const thermosealContractConfig = {
  privateStateStoreName: "thermoseal-private-state",
  zkConfigPath: path.resolve(
    currentDir,
    "..",
    "..",
    "contract",
    "src",
    "managed",
    "thermoseal",
  ),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CC = CompiledContract as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const thermosealCompiledContract = CC.make(
  "thermoseal",
  ThermoSeal.Contract,
).pipe(
  CC.withWitnesses(thermosealWitnesses),
  CC.withCompiledFileAssets(thermosealContractConfig.zkConfigPath),
);

export const configureThermoSealProviders = async (
  ctx: WalletContext,
  config: Config,
  accountId?: string,
): Promise<ThermoSealProviders> => {
  const walletAndMidnightProvider = await createWalletAndMidnightProvider(ctx);
  const effectiveAccountId =
    accountId ?? walletAndMidnightProvider.getCoinPublicKey();
  const storagePassword = `${Buffer.from(effectiveAccountId, "hex").toString("base64")}!`;
  const zkConfigProvider = new NodeZkConfigProvider<ThermoSealCircuits>(
    thermosealContractConfig.zkConfigPath,
  );
  return {
    privateStateProvider: levelPrivateStateProvider<
      typeof ThermoSealPrivateStateId
    >({
      privateStateStoreName: thermosealContractConfig.privateStateStoreName,
      accountId: effectiveAccountId,
      privateStoragePasswordProvider: () => storagePassword,
    }),
    publicDataProvider: indexerPublicDataProvider(
      config.indexer,
      config.indexerWS,
    ),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(
      config.proofServer,
      zkConfigProvider,
    ),
    walletProvider: walletAndMidnightProvider,
    midnightProvider: walletAndMidnightProvider,
  };
};

export const deployThermoSeal = async (
  providers: ThermoSealProviders,
  initialPrivateState: ThermoSealPrivateState = INITIAL_THERMOSEAL_PRIVATE_STATE,
): Promise<DeployedThermoSealContract> => {
  logger.info("Deploying ThermoSeal contract...");
  const contract = await deployContract(providers, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    compiledContract: thermosealCompiledContract as any,
    privateStateId: ThermoSealPrivateStateId,
    initialPrivateState,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    args: [] as any,
  });
  logger.info(
    `Deployed ThermoSeal contract at: ${contract.deployTxData.public.contractAddress}`,
  );
  return contract as unknown as DeployedThermoSealContract;
};

export const joinThermoSeal = async (
  providers: ThermoSealProviders,
  contractAddress: string,
): Promise<DeployedThermoSealContract> => {
  assertIsContractAddress(contractAddress);
  logger.info(`Joining ThermoSeal contract at: ${contractAddress}`);
  const contract = await findDeployedContract(providers, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contractAddress: contractAddress as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    compiledContract: thermosealCompiledContract as any,
    privateStateId: ThermoSealPrivateStateId,
    initialPrivateState: INITIAL_THERMOSEAL_PRIVATE_STATE,
  });
  logger.info(
    `Joined ThermoSeal contract at: ${contract.deployTxData.public.contractAddress}`,
  );
  return contract as unknown as DeployedThermoSealContract;
};

export const registerShipment = async (
  contract: DeployedThermoSealContract,
  shipmentId: Uint8Array,
  streamRoots: [Uint8Array, Uint8Array, Uint8Array],
  streamBounds: [Bounds, Bounds, Bounds],
  chunkCounts: [bigint, bigint, bigint],
  deviceKeyHash: Uint8Array,
  legCount: bigint,
): Promise<FinalizedTxData> => {
  logger.info(`Registering shipment 0x${toHex(shipmentId).slice(0, 12)}...`);
  const boundsBigInt = streamBounds.map((b) => ({
    min: BigInt(b.min),
    max: BigInt(b.max),
  }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalizedTxData = await (contract as any).callTx.register_shipment(
    shipmentId,
    streamRoots,
    boundsBigInt,
    chunkCounts,
    deviceKeyHash,
    legCount,
  );
  logger.info(
    `register_shipment TX ${finalizedTxData.public.txId} added in block ${finalizedTxData.public.blockHeight}`,
  );
  return finalizedTxData.public as FinalizedTxData;
};

export const submitChunk = async (
  providers: ThermoSealProviders,
  contract: DeployedThermoSealContract,
  shipmentId: Uint8Array,
  legIndex: bigint,
  streamIndex: bigint,
  chunkIndex: bigint,
  anchorReading: bigint,
): Promise<FinalizedTxData> => {
  logger.info(
    `Submitting chunk (leg=${legIndex}, stream=${streamIndex}, chunk=${chunkIndex})...`,
  );
  const { readings, salts, merklePaths } =
    buildChunkMerkleMaterial(anchorReading);
  const current =
    (await providers.privateStateProvider.get(ThermoSealPrivateStateId)) ??
    INITIAL_THERMOSEAL_PRIVATE_STATE;
  await providers.privateStateProvider.set(ThermoSealPrivateStateId, {
    ...current,
    shipmentId,
    readings,
    salts,
    merklePaths,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalizedTxData = await (contract as any).callTx.submit_chunk(
    legIndex,
    streamIndex,
    chunkIndex,
  );
  logger.info(
    `submit_chunk TX ${finalizedTxData.public.txId} added in block ${finalizedTxData.public.blockHeight}`,
  );
  return finalizedTxData.public as FinalizedTxData;
};

export const finalizeLeg = async (
  providers: ThermoSealProviders,
  contract: DeployedThermoSealContract,
  shipmentId: Uint8Array,
  devicePubkey: Uint8Array,
  legIndex: bigint,
): Promise<FinalizedTxData> => {
  logger.info(`Finalizing leg ${legIndex}...`);
  const current =
    (await providers.privateStateProvider.get(ThermoSealPrivateStateId)) ??
    INITIAL_THERMOSEAL_PRIVATE_STATE;
  await providers.privateStateProvider.set(ThermoSealPrivateStateId, {
    ...current,
    shipmentId,
    devicePubkey,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalizedTxData = await (contract as any).callTx.finalize_leg(legIndex);
  logger.info(
    `finalize_leg TX ${finalizedTxData.public.txId} added in block ${finalizedTxData.public.blockHeight}`,
  );
  return finalizedTxData.public as FinalizedTxData;
};

export const authorizeAuditor = async (
  providers: ThermoSealProviders,
  contract: DeployedThermoSealContract,
  grantId: Uint8Array,
  scopePreimage: Uint8Array,
  auditorPubkeyHash: Uint8Array,
  expiryEpoch: bigint,
): Promise<FinalizedTxData> => {
  logger.info(`Authorizing auditor grant 0x${toHex(grantId).slice(0, 12)}...`);
  const scopeHash = hashBytes64(scopePreimage);
  const current =
    (await providers.privateStateProvider.get(ThermoSealPrivateStateId)) ??
    INITIAL_THERMOSEAL_PRIVATE_STATE;
  await providers.privateStateProvider.set(ThermoSealPrivateStateId, {
    ...current,
    scopePreimage,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalizedTxData = await (contract as any).callTx.authorize_auditor(
    grantId,
    scopeHash,
    auditorPubkeyHash,
    expiryEpoch,
  );
  logger.info(
    `authorize_auditor TX ${finalizedTxData.public.txId} added in block ${finalizedTxData.public.blockHeight}`,
  );
  return finalizedTxData.public as FinalizedTxData;
};

export const recordDisclosure = async (
  providers: ThermoSealProviders,
  contract: DeployedThermoSealContract,
  grantId: Uint8Array,
  currentEpoch: bigint,
): Promise<FinalizedTxData> => {
  logger.info(
    `Recording disclosure for grant 0x${toHex(grantId).slice(0, 12)}...`,
  );
  const current =
    (await providers.privateStateProvider.get(ThermoSealPrivateStateId)) ??
    INITIAL_THERMOSEAL_PRIVATE_STATE;
  await providers.privateStateProvider.set(ThermoSealPrivateStateId, {
    ...current,
    currentEpoch,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalizedTxData =
    await (contract as any).callTx.record_disclosure(grantId);
  logger.info(
    `record_disclosure TX ${finalizedTxData.public.txId} added in block ${finalizedTxData.public.blockHeight}`,
  );
  return finalizedTxData.public as FinalizedTxData;
};

export const getThermoSealState = async (
  providers: ThermoSealProviders,
  contractAddress: string,
): Promise<ThermoSealLedgerState | null> => {
  assertIsContractAddress(contractAddress);
  logger.info("Querying ThermoSeal ledger state...");
  const state = await providers.publicDataProvider
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .queryContractState(contractAddress as any)
    .then((contractState) =>
      contractState != null
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (ThermoSeal.ledger(
            contractState.data as any,
          ) as unknown as ThermoSealLedgerState)
        : null,
    );
  return state;
};