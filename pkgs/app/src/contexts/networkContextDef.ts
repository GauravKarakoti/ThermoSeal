import { createContext } from "react";
import type { NetworkId } from "@/utils/networks";

export interface NetworkContextValue {
  networkId: NetworkId;
  setNetworkId: (id: NetworkId) => void;
}

export const NetworkContext = createContext<NetworkContextValue | null>(null);