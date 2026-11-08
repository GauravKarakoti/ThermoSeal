import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Bounds = { min: bigint; max: bigint };

export type Shipment = { stream_roots: Uint8Array[];
                         stream_bounds: Bounds[];
                         chunk_counts: bigint[];
                         device_key_hash: Uint8Array;
                         leg_count: bigint;
                         legs_compliant: boolean[];
                         finalized_legs: bigint
                       };

export type ChunkRecord = { commitment: Uint8Array;
                            passed: boolean;
                            submitted: boolean
                          };

export type Grant = { scope_hash: Uint8Array;
                      auditor_pubkey_hash: Uint8Array;
                      expiry_epoch: bigint;
                      exercised: boolean
                    };

export type Disclosure = { grant_id: Uint8Array; disclosed_at: bigint };

export type Witnesses<PS> = {
  get_shipment_id(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  get_device_pubkey(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  get_readings(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint[]];
  get_salts(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array[]];
  get_merkle_paths(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array[][]];
  get_scope_preimage(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  get_current_epoch(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
}

export type ImpureCircuits<PS> = {
  register_shipment(context: __compactRuntime.CircuitContext<PS>,
                    shipment_id_0: Uint8Array,
                    stream_roots_0: Uint8Array[],
                    stream_bounds_0: Bounds[],
                    chunk_counts_0: bigint[],
                    device_key_hash_0: Uint8Array,
                    leg_count_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  submit_chunk(context: __compactRuntime.CircuitContext<PS>,
               leg_index_0: bigint,
               stream_index_0: bigint,
               chunk_index_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  finalize_leg(context: __compactRuntime.CircuitContext<PS>, leg_index_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  authorize_auditor(context: __compactRuntime.CircuitContext<PS>,
                    grant_id_0: Uint8Array,
                    scope_hash_0: Uint8Array,
                    auditor_pubkey_hash_0: Uint8Array,
                    expiry_epoch_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  record_disclosure(context: __compactRuntime.CircuitContext<PS>,
                    grant_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  register_shipment(context: __compactRuntime.CircuitContext<PS>,
                    shipment_id_0: Uint8Array,
                    stream_roots_0: Uint8Array[],
                    stream_bounds_0: Bounds[],
                    chunk_counts_0: bigint[],
                    device_key_hash_0: Uint8Array,
                    leg_count_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  submit_chunk(context: __compactRuntime.CircuitContext<PS>,
               leg_index_0: bigint,
               stream_index_0: bigint,
               chunk_index_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  finalize_leg(context: __compactRuntime.CircuitContext<PS>, leg_index_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  authorize_auditor(context: __compactRuntime.CircuitContext<PS>,
                    grant_id_0: Uint8Array,
                    scope_hash_0: Uint8Array,
                    auditor_pubkey_hash_0: Uint8Array,
                    expiry_epoch_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  record_disclosure(context: __compactRuntime.CircuitContext<PS>,
                    grant_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
  in_range(reading_0: bigint, min_0: bigint, max_0: bigint): boolean;
  nullifier_of(shipment_id_0: Uint8Array,
               leg_index_0: bigint,
               device_pubkey_0: Uint8Array): Uint8Array;
  chunk_key(shipment_id_0: Uint8Array,
            leg_index_0: bigint,
            stream_index_0: bigint,
            chunk_index_0: bigint): Uint8Array;
}

export type Circuits<PS> = {
  in_range(context: __compactRuntime.CircuitContext<PS>,
           reading_0: bigint,
           min_0: bigint,
           max_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  nullifier_of(context: __compactRuntime.CircuitContext<PS>,
               shipment_id_0: Uint8Array,
               leg_index_0: bigint,
               device_pubkey_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  chunk_key(context: __compactRuntime.CircuitContext<PS>,
            shipment_id_0: Uint8Array,
            leg_index_0: bigint,
            stream_index_0: bigint,
            chunk_index_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
  register_shipment(context: __compactRuntime.CircuitContext<PS>,
                    shipment_id_0: Uint8Array,
                    stream_roots_0: Uint8Array[],
                    stream_bounds_0: Bounds[],
                    chunk_counts_0: bigint[],
                    device_key_hash_0: Uint8Array,
                    leg_count_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  submit_chunk(context: __compactRuntime.CircuitContext<PS>,
               leg_index_0: bigint,
               stream_index_0: bigint,
               chunk_index_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  finalize_leg(context: __compactRuntime.CircuitContext<PS>, leg_index_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  authorize_auditor(context: __compactRuntime.CircuitContext<PS>,
                    grant_id_0: Uint8Array,
                    scope_hash_0: Uint8Array,
                    auditor_pubkey_hash_0: Uint8Array,
                    expiry_epoch_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  record_disclosure(context: __compactRuntime.CircuitContext<PS>,
                    grant_id_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  shipments: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Shipment;
    [Symbol.iterator](): Iterator<[Uint8Array, Shipment]>
  };
  leg_nullifiers: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  chunk_records: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): ChunkRecord;
    [Symbol.iterator](): Iterator<[Uint8Array, ChunkRecord]>
  };
  auditor_grants: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Grant;
    [Symbol.iterator](): Iterator<[Uint8Array, Grant]>
  };
  disclosure_log: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Disclosure;
    [Symbol.iterator](): Iterator<[Uint8Array, Disclosure]>
  };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
