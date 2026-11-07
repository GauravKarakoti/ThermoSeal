import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import i18next from "i18next";
import type React from "react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  connectToWallet,
  NetworkMismatchError,
  UserRejectedError,
  VersionMismatchError,
  WalletNotFoundError,
  WalletSyncingError,
  WalletTimeoutError,
} from "@/lib/wallet";
import { useNetwork } from "./useNetwork";
import { WalletContext, type WalletState } from "./walletContextDef";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>({ status: "disconnected" });
  const { networkId } = useNetwork();

  const connect = useCallback(async () => {
    setState({ status: "connecting" });
    try {
      setNetworkId(networkId);
      const connection = await connectToWallet(networkId);
      setState({ status: "connected", connection });
    } catch (e: unknown) {
      console.error("[wallet] connect() failed:", e);
      setState({ status: "error" });
      if (e instanceof WalletNotFoundError) {
        toast.error(e.message);
      } else if (e instanceof VersionMismatchError) {
        toast.error(e.message);
      } else if (e instanceof NetworkMismatchError) {
        toast.error(e.message);
      } else if (e instanceof UserRejectedError) {
        toast.warning(e.message);
        setState({ status: "disconnected" });
      } else if (e instanceof WalletTimeoutError) {
        toast.error(e.message);
      } else if (e instanceof WalletSyncingError) {
        toast.error(e.message);
      } else {
        toast.error(i18next.t("error.connectGeneric"));
      }
    }
  }, [networkId]);

  const disconnect = useCallback(() => {
    setState({ status: "disconnected" });
  }, []);

  return (
    <WalletContext.Provider value={{ state, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}