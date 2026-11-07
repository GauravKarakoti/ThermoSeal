import type {
  WalletConnectionResult,
  WalletContextValue,
  WalletState,
} from "@/utils/types";
import { createContext } from "react";

export type { WalletConnectionResult, WalletContextValue, WalletState };

export const WalletContext = createContext<WalletContextValue | null>(null);