import type { CompiledContract } from "@midnight-ntwrk/compact-js";
import type {
  DeployedContract,
  FoundContract,
} from "@midnight-ntwrk/midnight-js-contracts";
import type {
  AnyProvableCircuitId,
  MidnightProviders,
} from "@midnight-ntwrk/midnight-js-types";
import type { ThermoSealPrivateState } from "contract";
import { ThermoSealPrivateStateId } from "contract";

export { ThermoSealPrivateStateId };

export type ThermoSealCircuits = AnyProvableCircuitId;

export type ThermoSealProviders = MidnightProviders<
  ThermoSealCircuits,
  typeof ThermoSealPrivateStateId,
  ThermoSealPrivateState
>;

export type ThermoSealContractInstance = CompiledContract.CompiledContract<
  // biome-ignore lint/suspicious/noExplicitAny: ThermoSeal.Contract generic is not externally accessible
  any,
  ThermoSealPrivateState
>;

export type DeployedThermoSealContract =
  | DeployedContract<any>
  | FoundContract<any>;

export type Bounds = {
  min: number;
  max: number;
};

export type Shipment = {
  stream_roots: [Uint8Array, Uint8Array, Uint8Array];
  stream_bounds: [Bounds, Bounds, Bounds];
  chunk_counts: [number, number, number];
  device_key_hash: Uint8Array;
  leg_count: number;
  legs_compliant: boolean[];
  finalized_legs: number;
};

export type ChunkRecord = {
  commitment: Uint8Array;
  passed: boolean;
  submitted: boolean;
};

export type Grant = {
  scope_hash: Uint8Array;
  auditor_pubkey_hash: Uint8Array;
  expiry_epoch: bigint;
  exercised: boolean;
};

export type Disclosure = {
  grant_id: Uint8Array;
  disclosed_at: bigint;
};

export type ThermoSealLedgerState = {
  shipments: Map<string, Shipment>;
  leg_nullifiers: Set<string>;
  chunk_records: Map<string, ChunkRecord>;
  auditor_grants: Map<string, Grant>;
  disclosure_log: Map<string, Disclosure>;
};