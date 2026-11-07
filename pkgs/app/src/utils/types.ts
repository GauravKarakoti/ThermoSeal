import type {
  DAppConnectorWalletAPI,
  DAppConnectorWalletState,
  ServiceUriConfig,
} from "@midnight-ntwrk/dapp-connector-api";

export type OneAmConnector = {
  apiVersion?: string;
  enable: () => Promise<DAppConnectorWalletAPI>;
  connect?: (networkId: string) => Promise<DAppConnectorWalletAPI>;
  getConfiguration?: () => Promise<Record<string, string>>;
};

export type LaceV4Connector = {
  connect: (networkId: string) => Promise<DAppConnectorWalletAPI>;
  getConfiguration?: () => Promise<Record<string, string>>;
};

export type LaceLegacyConnector = {
  enable: () => Promise<DAppConnectorWalletAPI>;
};

export type WalletConnectionResult = {
  wallet: DAppConnectorWalletAPI;
  uris: ServiceUriConfig;
  state: DAppConnectorWalletState;
};

export type WalletState =
  | { status: "disconnected" }
  | { status: "connecting" }
  | { status: "connected"; connection: WalletConnectionResult }
  | { status: "error" };

export interface WalletContextValue {
  state: WalletState;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export type BalanceState =
  | { status: "idle" }
  | { status: "loading" }
  | {
      status: "loaded";
      shielded: string;
      unshielded: string;
      dust: string;
    }
  | { status: "error" };