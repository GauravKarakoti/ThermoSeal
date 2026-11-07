import {
  type ChargedState,
  type CircuitContext,
  type CircuitId,
  type CircuitResults,
  CompactTypeBytes,
  createCircuitContext,
  createConstructorContext,
  type EncodedZswapLocalState,
  persistentHash,
  sampleContractAddress,
} from "@midnight-ntwrk/compact-runtime";
import {
  type Bounds,
  type ChunkRecord,
  Contract,
  type Disclosure,
  type Grant,
  type Ledger,
  ledger,
  pureCircuits,
  type Shipment,
  type Witnesses,
} from "../managed/thermoseal/contract/index.js";
import {
  type ThermoSealPrivateState,
  thermosealWitnesses,
} from "../thermoseal-witnesses.js";

export type { Bounds, Shipment, ChunkRecord, Grant, Disclosure };

const rtBytes32 = new CompactTypeBytes(32);
const rtBytes64 = new CompactTypeBytes(64);

/**
 * ThermoSeal contract simulator for unit testing.
 * Executes impureCircuits directly (no ZK proof generation).
 */
export class ThermoSealSimulator {
  private readonly contract: Contract<ThermoSealPrivateState>;
  private privateState: ThermoSealPrivateState;
  private zswapState: EncodedZswapLocalState;
  private sharedState: ChargedState;
  private readonly contractAddress = sampleContractAddress();

  constructor(devicePubkey: Uint8Array = new Uint8Array(32).fill(1)) {
    this.contract = new Contract<ThermoSealPrivateState>(
      thermosealWitnesses as unknown as Witnesses<ThermoSealPrivateState>,
    );

    this.privateState = {
      shipmentId: new Uint8Array(32),
      devicePubkey,
      readings: Array.from({ length: 128 }, () => 0n),
      salts: Array.from({ length: 128 }, () => new Uint8Array(16)),
      merklePaths: Array.from({ length: 128 }, () =>
        Array.from({ length: 8 }, () => new Uint8Array(32)),
      ),
      scopePreimage: new Uint8Array(64),
      currentEpoch: 0n,
    };

    const init = this.contract.initialState(
      createConstructorContext(this.privateState, "0".repeat(64)),
    );

    this.zswapState = init.currentZswapLocalState;
    this.sharedState = init.currentContractState.data;
  }

  getLedger(): Ledger {
    return ledger(this.sharedState);
  }

  getLedgerSize(): bigint {
    const l = this.getLedger();
    return (
      l.shipments.size() +
      l.leg_nullifiers.size() +
      l.chunk_records.size() +
      l.auditor_grants.size() +
      l.disclosure_log.size()
    );
  }

  readShipment(shipmentId: Uint8Array): Shipment {
    const l = this.getLedger();
    if (!l.shipments.member(shipmentId)) {
      throw new Error("Shipment not found in simulator ledger");
    }
    return l.shipments.lookup(shipmentId);
  }

  readGrant(grantId: Uint8Array): Grant {
    const l = this.getLedger();
    if (!l.auditor_grants.member(grantId)) {
      throw new Error("Grant not found in simulator ledger");
    }
    return l.auditor_grants.lookup(grantId);
  }

  hashDeviceKey(devicePubkey: Uint8Array): Uint8Array {
    return persistentHash(rtBytes32, devicePubkey);
  }

  computeScopeHash(scopePreimage: Uint8Array): Uint8Array {
    return persistentHash(rtBytes64, scopePreimage);
  }

  private ctx(
    circuitId: CircuitId,
    ps: ThermoSealPrivateState,
  ): CircuitContext<ThermoSealPrivateState> {
    return createCircuitContext(
      circuitId,
      this.contractAddress,
      this.zswapState,
      this.sharedState,
      ps,
    );
  }

  private applyResult(
    result: CircuitResults<ThermoSealPrivateState, unknown>,
  ): Ledger {
    const { callContext } = result.context;
    if (callContext.currentPrivateState !== undefined) {
      this.privateState = callContext.currentPrivateState;
    }
    if (callContext.currentZswapLocalState !== undefined) {
      this.zswapState = callContext.currentZswapLocalState;
    }
    this.sharedState = callContext.currentQueryContext.state;
    return ledger(this.sharedState);
  }

  registerShipment(
    shipmentId: Uint8Array,
    streamRoots: [Uint8Array, Uint8Array, Uint8Array],
    streamBounds: [Bounds, Bounds, Bounds],
    chunkCounts: [bigint, bigint, bigint],
    deviceKeyHash: Uint8Array,
    legCount: bigint,
  ): Ledger {
    const ps: ThermoSealPrivateState = { ...this.privateState, shipmentId };
    const result = this.contract.impureCircuits.register_shipment(
      this.ctx("register_shipment", ps),
      shipmentId,
      streamRoots,
      streamBounds,
      chunkCounts,
      deviceKeyHash,
      legCount,
    );
    return this.applyResult(result);
  }

  submitChunk(params: {
    shipmentId: Uint8Array;
    devicePubkey: Uint8Array;
    legIndex: bigint;
    streamIndex: bigint;
    chunkIndex: bigint;
    readings: bigint[];
    salts: Uint8Array[];
    merklePaths: Uint8Array[][];
  }): ChunkRecord {
    const ps: ThermoSealPrivateState = {
      ...this.privateState,
      shipmentId: params.shipmentId,
      devicePubkey: params.devicePubkey,
      readings: params.readings,
      salts: params.salts,
      merklePaths: params.merklePaths,
    };
    const result = this.contract.impureCircuits.submit_chunk(
      this.ctx("submit_chunk", ps),
      params.legIndex,
      params.streamIndex,
      params.chunkIndex,
    );
    const l = this.applyResult(result);

    const key = pureCircuits.chunk_key(
      params.shipmentId,
      params.legIndex,
      params.streamIndex,
      params.chunkIndex,
    );
    if (!l.chunk_records.member(key)) {
      throw new Error("Chunk record not found after submission");
    }
    return l.chunk_records.lookup(key);
  }

  finalizeLeg(
    shipmentId: Uint8Array,
    legIndex: bigint,
    devicePubkey: Uint8Array,
  ): Ledger {
    const ps: ThermoSealPrivateState = {
      ...this.privateState,
      shipmentId,
      devicePubkey,
    };
    const result = this.contract.impureCircuits.finalize_leg(
      this.ctx("finalize_leg", ps),
      legIndex,
    );
    return this.applyResult(result);
  }

  authorizeAuditor(
    grantId: Uint8Array,
    scopeHash: Uint8Array,
    auditorPubkeyHash: Uint8Array,
    expiryEpoch: bigint,
    scopePreimage: Uint8Array,
  ): Ledger {
    const ps: ThermoSealPrivateState = {
      ...this.privateState,
      scopePreimage,
    };
    const result = this.contract.impureCircuits.authorize_auditor(
      this.ctx("authorize_auditor", ps),
      grantId,
      scopeHash,
      auditorPubkeyHash,
      expiryEpoch,
    );
    return this.applyResult(result);
  }

  recordDisclosure(grantId: Uint8Array, currentEpoch: bigint): Ledger {
    const ps: ThermoSealPrivateState = {
      ...this.privateState,
      currentEpoch,
    };
    const result = this.contract.impureCircuits.record_disclosure(
      this.ctx("record_disclosure", ps),
      grantId,
    );
    return this.applyResult(result);
  }
}