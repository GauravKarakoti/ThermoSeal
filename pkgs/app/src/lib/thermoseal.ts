import * as CompactJs from "@midnight-ntwrk/compact-js";
import type { ContractAddress } from "@midnight-ntwrk/compact-runtime";
import {
  deployContract,
  findDeployedContract,
} from "@midnight-ntwrk/midnight-js-contracts";
import { assertIsContractAddress } from "@midnight-ntwrk/midnight-js-utils";
import type { ThermoSealPrivateState } from "contract";
import { ThermoSeal, thermosealWitnesses } from "contract";
import * as Rx from "rxjs";
import type {
  DeployedThermoSealContract,
  ThermoSealContractInstance,
  ThermoSealLedgerState,
  ThermoSealProviders,
} from "./thermoseal-types";
import { ThermoSealPrivateStateId } from "./thermoseal-types";

// biome-ignore lint/suspicious/noExplicitAny: Contract type compat
const _base = CompactJs.CompiledContract.make(
  "thermoseal",
  ThermoSeal.Contract as any,
) as any;

export const thermosealContractInstance: ThermoSealContractInstance =
  (CompactJs.CompiledContract.withWitnesses as any)(
    _base,
    thermosealWitnesses,
  ) as unknown as ThermoSealContractInstance;

const INITIAL_PRIVATE_STATE: ThermoSealPrivateState = {
  shipmentId: new Uint8Array(32),
  devicePubkey: new Uint8Array(32),
  readings: [],
  salts: [],
  merklePaths: [],
  scopePreimage: new Uint8Array(64),
  currentEpoch: 0n,
};

export const findThermoSealContract = async (
  providers: ThermoSealProviders,
  contractAddress: string,
): Promise<DeployedThermoSealContract> => {
  return findDeployedContract(providers, {
    compiledContract: thermosealContractInstance as any,
    contractAddress: contractAddress as ContractAddress,
    privateStateId: ThermoSealPrivateStateId,
    initialPrivateState: INITIAL_PRIVATE_STATE,
  }) as unknown as Promise<DeployedThermoSealContract>;
};

export const deployThermoSealContract = async (
  providers: ThermoSealProviders,
): Promise<DeployedThermoSealContract> => {
  return deployContract(providers, {
    compiledContract: thermosealContractInstance as any,
    privateStateId: ThermoSealPrivateStateId,
    initialPrivateState: INITIAL_PRIVATE_STATE,
    args: [],
  }) as unknown as Promise<DeployedThermoSealContract>;
};

export const getThermoSealLedgerState = async (
  providers: ThermoSealProviders,
  contractAddress: ContractAddress,
): Promise<ThermoSealLedgerState | null> => {
  assertIsContractAddress(contractAddress);
  const contractState =
    await providers.publicDataProvider.queryContractState(contractAddress);
  return contractState != null
    ? (ThermoSeal.ledger(contractState.data as any) as unknown as ThermoSealLedgerState)
    : null;
};

export const subscribeToThermoSealState = (
  providers: ThermoSealProviders,
  contractAddress: ContractAddress,
): Rx.Observable<ThermoSealLedgerState> => {
  return providers.publicDataProvider
    .contractStateObservable(contractAddress, { type: "latest" })
    .pipe(
      Rx.map(
        (contractState) =>
          ThermoSeal.ledger(contractState.data as any) as unknown as ThermoSealLedgerState,
      ),
    );
};