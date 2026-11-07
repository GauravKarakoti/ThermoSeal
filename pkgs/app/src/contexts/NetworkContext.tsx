import type React from "react";
import { useCallback, useState } from "react";
import {
  DEFAULT_NETWORK_ID,
  NETWORK_STORAGE_KEY,
  type NetworkId,
} from "@/utils/networks";
import { NetworkContext } from "./networkContextDef";

function loadStoredNetworkId(): NetworkId {
  const stored = localStorage.getItem(NETWORK_STORAGE_KEY);
  return stored === "preview"
    ? stored
    : DEFAULT_NETWORK_ID;
}

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [networkId, setNetworkIdState] =
    useState<NetworkId>(loadStoredNetworkId);

  const setNetworkId = useCallback((id: NetworkId) => {
    setNetworkIdState(id);
    localStorage.setItem(NETWORK_STORAGE_KEY, id);
  }, []);

  return (
    <NetworkContext.Provider value={{ networkId, setNetworkId }}>
      {children}
    </NetworkContext.Provider>
  );
}