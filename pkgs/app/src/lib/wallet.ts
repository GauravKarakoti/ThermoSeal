import type {
  DAppConnectorAPI,
  DAppConnectorWalletAPI,
  ServiceUriConfig,
} from "@midnight-ntwrk/dapp-connector-api";
import i18next from "i18next";
import { filter, firstValueFrom, interval, map, take, timeout } from "rxjs";
import semver from "semver";
import {
  COMPATIBLE_CONNECTOR_VERSION,
  DETECT_TIMEOUT_MS,
  POLL_INTERVAL_MS,
} from "@/utils/constants";
import { NETWORKS, type NetworkId } from "@/utils/networks";
import type {
  LaceV4Connector,
  OneAmConnector,
  WalletConnectionResult,
} from "@/utils/types";

export class WalletNotFoundError extends Error {
  constructor() {
    super(i18next.t("error.walletNotFound"));
    this.name = "WalletNotFoundError";
  }
}

export class VersionMismatchError extends Error {
  constructor(version: string) {
    super(i18next.t("error.versionMismatch", { version }));
    this.name = "VersionMismatchError";
  }
}

export class NetworkMismatchError extends Error {
  constructor(networkLabel: string) {
    super(i18next.t("error.networkMismatch", { network: networkLabel }));
    this.name = "NetworkMismatchError";
  }
}

export class UserRejectedError extends Error {
  constructor() {
    super(i18next.t("error.userRejected"));
    this.name = "UserRejectedError";
  }
}

export class WalletTimeoutError extends Error {
  constructor() {
    super(i18next.t("error.walletTimeout"));
    this.name = "WalletTimeoutError";
  }
}

export class WalletSyncingError extends Error {
  constructor() {
    super(i18next.t("error.walletSyncing"));
    this.name = "WalletSyncingError";
  }
}

function detectConnectorAPI(): Promise<DAppConnectorAPI> {
  return firstValueFrom(
    interval(POLL_INTERVAL_MS).pipe(
      map(() => {
        const midnight = (
          globalThis.window as unknown as Record<string, unknown>
        )?.midnight as Record<string, unknown> | undefined;
        if (!midnight) return null;

        // Prioritize 1AM Wallet
        if (midnight["1AM"]) return midnight["1AM"] as DAppConnectorAPI;
        if (midnight.oneAM) return midnight.oneAM as DAppConnectorAPI;

        // Fallback to any compatible Midnight DApp connector
        if (midnight.mnLace) return midnight.mnLace as DAppConnectorAPI;
        return (
          (Object.values(midnight).find(
            (v) =>
              typeof (v as Record<string, unknown>)?.enable === "function" ||
              typeof (v as Record<string, unknown>)?.connect === "function" ||
              typeof (v as Record<string, unknown>)?.apiVersion === "string",
          ) as DAppConnectorAPI | undefined) ?? null
        );
      }),
      filter((api): api is DAppConnectorAPI => api !== null),
      take(1),
      timeout({ first: DETECT_TIMEOUT_MS }),
    ),
  ).catch(() => {
    throw new WalletNotFoundError();
  });
}

async function resolveConnectedAPI(
  walletAPI: DAppConnectorWalletAPI,
  networkId: NetworkId,
): Promise<WalletConnectionResult> {
  const fallbackUris = NETWORKS[networkId].fallbackUris;
  const walletRaw = walletAPI as unknown as Record<string, unknown>;
  let uris: ServiceUriConfig = fallbackUris;

  if (typeof walletRaw.getConfiguration === "function") {
    try {
      const cfg = (await (
        walletRaw.getConfiguration as () => Promise<Record<string, string>>
      )()) as Record<string, string>;
      uris = {
        indexerUri: cfg.indexerUri ?? cfg.indexerUrl ?? fallbackUris.indexerUri,
        indexerWsUri:
          cfg.indexerWsUri ?? cfg.indexerWsUrl ?? fallbackUris.indexerWsUri,
        proverServerUri:
          cfg.proverServerUri ??
          cfg.proofServerUri ??
          fallbackUris.proverServerUri,
        substrateNodeUri:
          cfg.substrateNodeUri ?? cfg.nodeUri ?? fallbackUris.substrateNodeUri,
      };
    } catch (e) {
      console.warn("[1AM Wallet] getConfiguration() fallback to default URIs:", e);
    }
  } else if (typeof walletRaw.serviceUriConfig === "function") {
    try {
      uris = await (
        walletRaw.serviceUriConfig as () => Promise<ServiceUriConfig>
      )();
    } catch {
      // Use fallbackUris
    }
  }

  let address = "";
  let coinPublicKey = "";
  let encryptionPublicKey = "";

  if (typeof walletRaw.getShieldedAddresses === "function") {
    try {
      const result = await (
        walletRaw.getShieldedAddresses as () => Promise<Record<string, unknown>>
      )();
      const entry = (Array.isArray(result) ? result[0] : result) as
        | Record<string, unknown>
        | undefined;
      if (entry) {
        address = String(entry.shieldedAddress ?? entry.address ?? "");
        coinPublicKey = String(
          entry.shieldedCoinPublicKey ?? entry.coinPublicKey ?? "",
        );
        encryptionPublicKey = String(
          entry.shieldedEncryptionPublicKey ?? entry.encryptionPublicKey ?? "",
        );
      }
    } catch (e: unknown) {
      console.error("[1AM Wallet] getShieldedAddresses() failed:", e);
      const lowerMsg = String(
        (e as Record<string, unknown>)?.message ?? e,
      ).toLowerCase();
      if (lowerMsg.includes("sync")) {
        throw new WalletSyncingError();
      }
      throw e;
    }
  } else if (typeof walletAPI.state === "function") {
    const legacyState = await walletAPI.state();
    return {
      wallet: walletAPI,
      uris,
      state: legacyState,
    };
  }

  const state = {
    address,
    coinPublicKey,
    encryptionPublicKey,
    addressLegacy: "",
    coinPublicKeyLegacy: "",
    encryptionPublicKeyLegacy: "",
  };

  return { wallet: walletAPI, uris, state };
}

export async function connectToWallet(
  networkId: NetworkId,
): Promise<WalletConnectionResult> {
  const connectorAPI = await detectConnectorAPI();
  const raw = connectorAPI as unknown as Record<string, unknown>;

  // Only enforce strict semver check if apiVersion is explicitly present and not 1AM beta
  const isOneAm = Boolean(
    (
      (globalThis.window as unknown as Record<string, unknown>)?.midnight as
        | Record<string, unknown>
        | undefined
    )?.["1AM"],
  );
  if (
    !isOneAm &&
    typeof connectorAPI.apiVersion === "string" &&
    !semver.satisfies(connectorAPI.apiVersion, COMPATIBLE_CONNECTOR_VERSION)
  ) {
    throw new VersionMismatchError(connectorAPI.apiVersion);
  }

  try {
    // 1. Primary 1AM Wallet flow: window.midnight['1AM'].enable()
    if (typeof raw.enable === "function") {
      const oneAm = connectorAPI as unknown as OneAmConnector;
      const connectedAPI = await oneAm.enable();
      const connectedRaw = connectedAPI as unknown as Record<string, unknown>;

      // If enable() returns a connector wrapper that still requires .connect(networkId)
      if (
        typeof connectedRaw.connect === "function" &&
        typeof connectedRaw.getShieldedAddresses !== "function"
      ) {
        const v4Connected = await (
          connectedAPI as unknown as LaceV4Connector
        ).connect(networkId);
        return await resolveConnectedAPI(v4Connected, networkId);
      }

      return await resolveConnectedAPI(connectedAPI, networkId);
    }

    // 2. Direct V4 connect(networkId) flow
    if (typeof raw.connect === "function") {
      const v4Connected = await (
        connectorAPI as unknown as LaceV4Connector
      ).connect(networkId);
      return await resolveConnectedAPI(v4Connected, networkId);
    }
  } catch (e: unknown) {
    if (
      e instanceof UserRejectedError ||
      e instanceof WalletSyncingError ||
      e instanceof NetworkMismatchError
    ) {
      throw e;
    }
    const lowerMsg = String(
      (e as Record<string, unknown>)?.message ?? e,
    ).toLowerCase();
    if (lowerMsg.includes("rejected") || lowerMsg.includes("cancel")) {
      throw new UserRejectedError();
    }
    if (lowerMsg.includes("sync")) {
      throw new WalletSyncingError();
    }
    if (lowerMsg.includes("network")) {
      throw new NetworkMismatchError(NETWORKS[networkId].label);
    }
    throw e;
  }

  throw new Error(i18next.t("error.unsupportedApi"));
}