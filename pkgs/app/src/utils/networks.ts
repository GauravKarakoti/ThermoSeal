import type { ServiceUriConfig } from "@midnight-ntwrk/dapp-connector-api";
import {
  DEFAULT_PROOF_SERVER_URL,
  MIDNIGHT_NETWORK_ENDPOINTS,
} from "shared";

export type NetworkId = "preview";
export const NETWORK_IDS: readonly NetworkId[] = [
  // "preprod",
  "preview"
];
export const NETWORK_STORAGE_KEY = "network";
export const DEFAULT_NETWORK_ID: NetworkId = "preview";

export interface NetworkDefinition {
  label: string;
  faucetUrl: string;
  fallbackUris: ServiceUriConfig;
}

const NETWORK_LABELS: Record<NetworkId, string> = {
  // preprod: "PreProd Testnet",
  preview: "Preview Testnet",
};

export const NETWORKS: Record<NetworkId, NetworkDefinition> =
  Object.fromEntries(
    NETWORK_IDS.map((networkId) => {
      const endpoints = MIDNIGHT_NETWORK_ENDPOINTS[networkId];
      const definition: NetworkDefinition = {
        label: NETWORK_LABELS[networkId],
        faucetUrl: endpoints.faucetUrl,
        fallbackUris: {
          indexerUri: endpoints.indexer,
          indexerWsUri: endpoints.indexerWS,
          proverServerUri: DEFAULT_PROOF_SERVER_URL,
          substrateNodeUri: endpoints.node,
        },
      };
      return [networkId, definition];
    }),
  ) as Record<NetworkId, NetworkDefinition>;