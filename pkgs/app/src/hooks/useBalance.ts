import type { DAppConnectorWalletAPI } from "@midnight-ntwrk/dapp-connector-api";
import { useCallback, useState } from "react";
import { formatBalance } from "@/lib/utils";
import type { BalanceState } from "@/utils/types";

async function fetchBalances(wallet: DAppConnectorWalletAPI): Promise<{
  shielded: string;
  unshielded: string;
  dust: string;
}> {
  const walletRaw = wallet as unknown as Record<string, unknown>;

  let shieldedRaw: unknown = 0n;
  let unshieldedRaw: unknown = 0n;
  let dustRaw: unknown = 0n;

  if (typeof walletRaw.getShieldedBalances === "function") {
    shieldedRaw = await (
      walletRaw.getShieldedBalances as () => Promise<unknown>
    )();
  } else if (typeof wallet.state === "function") {
    const st = (await wallet.state()) as unknown as Record<string, unknown>;
    shieldedRaw = st.balances ?? 0n;
  }

  if (typeof walletRaw.getUnshieldedBalances === "function") {
    unshieldedRaw = await (
      walletRaw.getUnshieldedBalances as () => Promise<unknown>
    )();
  }

  if (typeof walletRaw.getDustBalance === "function") {
    dustRaw = await (walletRaw.getDustBalance as () => Promise<unknown>)();
  }

  return {
    shielded: formatBalance(shieldedRaw),
    unshielded: formatBalance(unshieldedRaw),
    dust: formatBalance(dustRaw),
  };
}

export function useBalance(wallet: DAppConnectorWalletAPI) {
  const [balanceState, setBalanceState] = useState<BalanceState>({
    status: "idle",
  });

  const refresh = useCallback(async () => {
    setBalanceState({ status: "loading" });
    try {
      const { shielded, unshielded, dust } = await fetchBalances(wallet);
      setBalanceState({
        status: "loaded",
        shielded,
        unshielded,
        dust,
      });
    } catch (e) {
      console.error("[useBalance] Failed to fetch balances:", e);
      setBalanceState({ status: "error" });
    }
  }, [wallet]);

  return { balanceState, refresh };
}