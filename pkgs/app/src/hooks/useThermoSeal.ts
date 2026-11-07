import type { ContractAddress } from "@midnight-ntwrk/compact-runtime";
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Subscription } from "rxjs";
import { useNetwork } from "@/contexts/useNetwork";
import { useWallet } from "@/contexts/useWallet";
import { createThermoSealProviders } from "@/lib/providers";
import {
  deployThermoSealContract,
  findThermoSealContract,
  subscribeToThermoSealState,
} from "@/lib/thermoseal";
import type {
  DeployedThermoSealContract,
  ThermoSealLedgerState,
} from "@/lib/thermoseal-types";

const contractAddressStorageKey = (networkId: string) =>
  `thermoseal-contract-address:${networkId}`;

const formatError = (e: unknown): string => {
  const parts: string[] = [];
  let current: unknown = e;
  const seen = new Set<unknown>();
  while (current != null && !seen.has(current)) {
    seen.add(current);
    if (current instanceof Error) {
      parts.push(current.message);
      current = (current as { cause?: unknown }).cause;
    } else {
      parts.push(String(current));
      break;
    }
  }
  return parts.join(" -> ");
};

export type ThermoSealStatus =
  | "idle"
  | "deploying"
  | "active"
  | "submitting"
  | "finalizing"
  | "error";

export function useThermoSeal() {
  const { state } = useWallet();
  const { networkId } = useNetwork();

  const connection = state.status === "connected" ? state.connection : null;
  const providers = useMemo(
    () => (connection ? createThermoSealProviders(connection, networkId) : null),
    [connection, networkId],
  );

  const [contractAddress, setContractAddressState] = useState<string>(
    () => localStorage.getItem(contractAddressStorageKey(networkId)) ?? "",
  );
  const [ledgerState, setLedgerState] = useState<ThermoSealLedgerState | null>(null);
  const [deployedContract, setDeployedContract] = useState<DeployedThermoSealContract | null>(null);
  const [status, setStatus] = useState<ThermoSealStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const subscriptionRef = useRef<Subscription | null>(null);

  useEffect(() => {
    setContractAddressState(
      localStorage.getItem(contractAddressStorageKey(networkId)) ?? "",
    );
  }, [networkId]);

  const setContractAddress = useCallback(
    (addr: string) => {
      setContractAddressState(addr);
      localStorage.setItem(contractAddressStorageKey(networkId), addr);
    },
    [networkId],
  );

  const connect = useCallback(
    async (addr: string) => {
      if (!providers) return;
      setStatus("deploying");
      setError(null);
      try {
        const contract = await findThermoSealContract(providers, addr);
        setDeployedContract(contract);
        setContractAddress(addr);

        subscriptionRef.current?.unsubscribe();
        subscriptionRef.current = subscribeToThermoSealState(
          providers,
          addr as ContractAddress,
        ).subscribe({
          next: (ls) => setLedgerState(ls),
          error: (e) => setError(formatError(e)),
        });

        setStatus("active");
      } catch (e) {
        setStatus("error");
        setError(formatError(e));
      }
    },
    [providers, setContractAddress],
  );

  const deploy = useCallback(async () => {
    if (!providers) return;
    setStatus("deploying");
    setError(null);
    try {
      const contract = await deployThermoSealContract(providers);
      setDeployedContract(contract);
      const addr = contract.deployTxData.public.contractAddress;
      setContractAddress(addr);

      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = subscribeToThermoSealState(
        providers,
        addr as ContractAddress,
      ).subscribe({
        next: (ls) => setLedgerState(ls),
        error: (e) => setError(formatError(e)),
      });

      setStatus("active");
    } catch (e) {
      setStatus("error");
      setError(formatError(e));
    }
  }, [providers, setContractAddress]);

  useEffect(() => {
    if (state.status !== "connected") {
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = null;
      startTransition(() => {
        setDeployedContract(null);
        setLedgerState(null);
        setStatus("idle");
      });
    }
  }, [state.status]);

  return {
    contractAddress,
    ledgerState,
    deployedContract,
    status,
    error,
    setContractAddress,
    connect,
    deploy,
  };
}