import {
  type CoinPublicKey,
  type EncPublicKey,
  type FinalizedTransaction,
  Transaction as LedgerTransaction,
  type ProvingProvider,
  type TransactionId,
} from "@midnight-ntwrk/ledger-v8";
import { FetchZkConfigProvider } from "@midnight-ntwrk/midnight-js-fetch-zk-config-provider";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";
import {
  createProofProvider,
  type KeyMaterialProvider,
  type MidnightProvider,
  type ProofProvider,
  type UnboundTransaction,
  type WalletProvider,
} from "@midnight-ntwrk/midnight-js-types";
import { fromHex, toHex } from "@midnight-ntwrk/midnight-js-utils";
import type { NetworkId } from "@/utils/networks";
import type { WalletConnectionResult } from "@/utils/types";
import type {
  ThermoSealCircuits,
  ThermoSealProviders,
} from "./thermoseal-types";
import { ThermoSealPrivateStateId } from "./thermoseal-types";

function parsePublicKeyToString(key: unknown): string {
  if (typeof key === "string") return key;
  if (key && typeof key === "object") {
    const obj = key as Record<string, unknown>;
    if (typeof obj.value === "string") return obj.value;
  }
  return String(key ?? "");
}

export function createThermoSealProviders(
  connection: WalletConnectionResult,
  networkId: NetworkId,
): ThermoSealProviders {
  const { wallet, uris, state } = connection;
  const walletRaw = wallet as unknown as Record<string, unknown>;

  const coinPublicKeyStr = parsePublicKeyToString(state.coinPublicKey);
  const encryptionPublicKeyStr = parsePublicKeyToString(
    state.encryptionPublicKey,
  );

  const walletProvider: WalletProvider = {
    getCoinPublicKey(): CoinPublicKey {
      return coinPublicKeyStr;
    },
    getEncryptionPublicKey(): EncPublicKey {
      return encryptionPublicKeyStr;
    },
    async balanceTx(
      tx: UnboundTransaction,
      _ttl?: Date | undefined,
    ): Promise<FinalizedTransaction> {
      if (typeof walletRaw.balanceUnsealedTransaction === "function") {
        const hexTx = toHex(tx.serialize());
        const result = await (
          walletRaw.balanceUnsealedTransaction as (
            tx: string,
          ) => Promise<{ tx: string } | string>
        )(hexTx);
        const serializedHex = typeof result === "string" ? result : result.tx;
        return LedgerTransaction.deserialize(
          "signature",
          "proof",
          "binding",
          new Uint8Array(fromHex(serializedHex)),
        ) as FinalizedTransaction;
      }

      if (typeof walletRaw.balanceAndProveTransaction === "function") {
        return await (
          walletRaw.balanceAndProveTransaction as (
            tx: UnboundTransaction,
          ) => Promise<FinalizedTransaction>
        )(tx);
      }

      throw new Error(
        "1AM Wallet does not support balanceUnsealedTransaction. Please update your 1AM Wallet extension.",
      );
    },
  };

  const midnightProvider: MidnightProvider = {
    async submitTx(tx: FinalizedTransaction): Promise<TransactionId> {
      const serialized = toHex(tx.serialize());
      await (
        walletRaw.submitTransaction as (
          tx: string | FinalizedTransaction,
        ) => Promise<void>
      )(serialized);
      return tx.identifiers()[0];
    },
  };

  const zkConfigProvider = new FetchZkConfigProvider<ThermoSealCircuits>(
    `${window.location.origin}/managed/thermoseal`,
    fetch.bind(window),
  );

  const isLocalProver =
    !uris.proverServerUri ||
    uris.proverServerUri.includes("127.0.0.1") ||
    uris.proverServerUri.includes("localhost");

  const proverServerUri = isLocalProver
    ? `${window.location.origin}/proof-server`
    : uris.proverServerUri;

  const fallbackHttpProver = httpClientProofProvider(
    proverServerUri,
    zkConfigProvider,
  );

  const proofProvider: ProofProvider = {
    async proveTx(unprovenTx, proveTxConfig) {
      if (typeof walletRaw.getProvingProvider === "function") {
        try {
          const keyMaterial = zkConfigProvider.asKeyMaterialProvider();
          const provingProvider = await (
            walletRaw.getProvingProvider as (
              km: KeyMaterialProvider,
            ) => Promise<ProvingProvider>
          )(keyMaterial);
          return await createProofProvider(provingProvider).proveTx(
            unprovenTx,
            proveTxConfig,
          );
        } catch (e) {
          console.warn(
            "[1AM Wallet] getProvingProvider failed, falling back to HTTP prover:",
            e,
          );
        }
      }
      return fallbackHttpProver.proveTx(unprovenTx, proveTxConfig);
    },
  };

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStoragePasswordProvider: () =>
        "midnight-thermoseal-demo-app-2026",
      accountId: coinPublicKeyStr,
      privateStateStoreName: `${ThermoSealPrivateStateId}-${networkId}`,
    }),
    publicDataProvider: indexerPublicDataProvider(
      uris.indexerUri,
      uris.indexerWsUri,
    ),
    zkConfigProvider,
    proofProvider,
    walletProvider,
    midnightProvider,
  };
}