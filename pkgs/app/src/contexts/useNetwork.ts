import { useContext } from "react";
import { NetworkContext, type NetworkContextValue } from "./networkContextDef";

export function useNetwork(): NetworkContextValue {
  const ctx = useContext(NetworkContext);
  if (!ctx) throw new Error("useNetwork must be used inside NetworkProvider");
  return ctx;
}