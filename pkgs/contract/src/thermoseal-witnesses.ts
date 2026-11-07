export const ThermoSealPrivateStateId = "thermosealPrivateState" as const;

export type ThermoSealPrivateState = {
  readonly shipmentId: Uint8Array;
  readonly devicePubkey: Uint8Array;
  readonly readings: bigint[];
  readonly salts: Uint8Array[];
  readonly merklePaths: Uint8Array[][];
  readonly scopePreimage: Uint8Array;
  readonly currentEpoch: bigint;
};

type WebCrypto = { getRandomValues<T extends Uint8Array>(array: T): T };

// biome-ignore lint/suspicious/noExplicitAny: cross-env Web Crypto API — not in ESNext lib
const _crypto: WebCrypto = (globalThis as unknown as { crypto: WebCrypto })
  .crypto;

const CHUNK_SIZE = 128;
const MERKLE_DEPTH = 8;

export const INITIAL_THERMOSEAL_PRIVATE_STATE: ThermoSealPrivateState = {
  shipmentId: new Uint8Array(32),
  devicePubkey: _crypto.getRandomValues(new Uint8Array(32)),
  readings: Array.from({ length: CHUNK_SIZE }, () => 0n),
  salts: Array.from({ length: CHUNK_SIZE }, () => new Uint8Array(16)),
  merklePaths: Array.from({ length: CHUNK_SIZE }, () =>
    Array.from({ length: MERKLE_DEPTH }, () => new Uint8Array(32)),
  ),
  scopePreimage: new Uint8Array(64),
  currentEpoch: 0n,
};

type WitnessCtx = { readonly privateState: ThermoSealPrivateState };

export const thermosealWitnesses = {
  get_shipment_id: (ctx: WitnessCtx): [ThermoSealPrivateState, Uint8Array] => [
    ctx.privateState,
    ctx.privateState.shipmentId,
  ],

  get_device_pubkey: (
    ctx: WitnessCtx,
  ): [ThermoSealPrivateState, Uint8Array] => [
    ctx.privateState,
    ctx.privateState.devicePubkey,
  ],

  get_readings: (ctx: WitnessCtx): [ThermoSealPrivateState, bigint[]] => {
    const { readings } = ctx.privateState;
    if (readings.length !== CHUNK_SIZE) {
      throw new Error(
        `Invalid readings length: expected ${CHUNK_SIZE}, got ${readings.length}`,
      );
    }
    return [ctx.privateState, readings];
  },

  get_salts: (ctx: WitnessCtx): [ThermoSealPrivateState, Uint8Array[]] => {
    const { salts } = ctx.privateState;
    if (salts.length !== CHUNK_SIZE) {
      throw new Error(
        `Invalid salts length: expected ${CHUNK_SIZE}, got ${salts.length}`,
      );
    }
    return [ctx.privateState, salts];
  },

  get_merkle_paths: (
    ctx: WitnessCtx,
  ): [ThermoSealPrivateState, Uint8Array[][]] => {
    const { merklePaths } = ctx.privateState;
    if (merklePaths.length !== CHUNK_SIZE) {
      throw new Error(
        `Invalid merklePaths length: expected ${CHUNK_SIZE}, got ${merklePaths.length}`,
      );
    }
    return [ctx.privateState, merklePaths];
  },

  get_scope_preimage: (
    ctx: WitnessCtx,
  ): [ThermoSealPrivateState, Uint8Array] => [
    ctx.privateState,
    ctx.privateState.scopePreimage,
  ],

  get_current_epoch: (ctx: WitnessCtx): [ThermoSealPrivateState, bigint] => [
    ctx.privateState,
    ctx.privateState.currentEpoch,
  ],
};