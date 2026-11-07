import type { WalletContextValue } from "@/utils/types";
import { useContext } from "react";
import { WalletContext } from "./walletContextDef";

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}