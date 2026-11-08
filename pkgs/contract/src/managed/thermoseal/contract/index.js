import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
__compactRuntime.checkRuntimeVersion('0.15.0');

const _descriptor_0 = new __compactRuntime.CompactTypeBytes(32);

const _descriptor_1 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

const _descriptor_2 = __compactRuntime.CompactTypeBoolean;

class _Grant_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_2.alignment())));
  }
  fromValue(value_0) {
    return {
      scope_hash: _descriptor_0.fromValue(value_0),
      auditor_pubkey_hash: _descriptor_0.fromValue(value_0),
      expiry_epoch: _descriptor_1.fromValue(value_0),
      exercised: _descriptor_2.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.scope_hash).concat(_descriptor_0.toValue(value_0.auditor_pubkey_hash).concat(_descriptor_1.toValue(value_0.expiry_epoch).concat(_descriptor_2.toValue(value_0.exercised))));
  }
}

const _descriptor_3 = new _Grant_0();

class _Disclosure_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_1.alignment());
  }
  fromValue(value_0) {
    return {
      grant_id: _descriptor_0.fromValue(value_0),
      disclosed_at: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.grant_id).concat(_descriptor_1.toValue(value_0.disclosed_at));
  }
}

const _descriptor_4 = new _Disclosure_0();

const _descriptor_5 = new __compactRuntime.CompactTypeVector(3, _descriptor_0);

const _descriptor_6 = new __compactRuntime.CompactTypeUnsignedInteger(65535n, 2);

class _Bounds_0 {
  alignment() {
    return _descriptor_6.alignment().concat(_descriptor_6.alignment());
  }
  fromValue(value_0) {
    return {
      min: _descriptor_6.fromValue(value_0),
      max: _descriptor_6.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_6.toValue(value_0.min).concat(_descriptor_6.toValue(value_0.max));
  }
}

const _descriptor_7 = new _Bounds_0();

const _descriptor_8 = new __compactRuntime.CompactTypeVector(3, _descriptor_7);

const _descriptor_9 = new __compactRuntime.CompactTypeVector(3, _descriptor_6);

const _descriptor_10 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

const _descriptor_11 = new __compactRuntime.CompactTypeVector(8, _descriptor_2);

class _Shipment_0 {
  alignment() {
    return _descriptor_5.alignment().concat(_descriptor_8.alignment().concat(_descriptor_9.alignment().concat(_descriptor_0.alignment().concat(_descriptor_10.alignment().concat(_descriptor_11.alignment().concat(_descriptor_10.alignment()))))));
  }
  fromValue(value_0) {
    return {
      stream_roots: _descriptor_5.fromValue(value_0),
      stream_bounds: _descriptor_8.fromValue(value_0),
      chunk_counts: _descriptor_9.fromValue(value_0),
      device_key_hash: _descriptor_0.fromValue(value_0),
      leg_count: _descriptor_10.fromValue(value_0),
      legs_compliant: _descriptor_11.fromValue(value_0),
      finalized_legs: _descriptor_10.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_5.toValue(value_0.stream_roots).concat(_descriptor_8.toValue(value_0.stream_bounds).concat(_descriptor_9.toValue(value_0.chunk_counts).concat(_descriptor_0.toValue(value_0.device_key_hash).concat(_descriptor_10.toValue(value_0.leg_count).concat(_descriptor_11.toValue(value_0.legs_compliant).concat(_descriptor_10.toValue(value_0.finalized_legs)))))));
  }
}

const _descriptor_12 = new _Shipment_0();

class _ChunkRecord_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment()));
  }
  fromValue(value_0) {
    return {
      commitment: _descriptor_0.fromValue(value_0),
      passed: _descriptor_2.fromValue(value_0),
      submitted: _descriptor_2.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.commitment).concat(_descriptor_2.toValue(value_0.passed).concat(_descriptor_2.toValue(value_0.submitted)));
  }
}

const _descriptor_13 = new _ChunkRecord_0();

const _descriptor_14 = new __compactRuntime.CompactTypeVector(8, _descriptor_0);

const _descriptor_15 = new __compactRuntime.CompactTypeBytes(16);

const _descriptor_16 = new __compactRuntime.CompactTypeVector(128, _descriptor_14);

const _descriptor_17 = new __compactRuntime.CompactTypeBytes(64);

const _descriptor_18 = new __compactRuntime.CompactTypeVector(128, _descriptor_6);

const _descriptor_19 = new __compactRuntime.CompactTypeVector(128, _descriptor_15);

const _descriptor_20 = new __compactRuntime.CompactTypeVector(2, _descriptor_0);

const _descriptor_21 = new __compactRuntime.CompactTypeVector(4, _descriptor_0);

const _descriptor_22 = new __compactRuntime.CompactTypeVector(5, _descriptor_0);

class _Either_0 {
  alignment() {
    return _descriptor_2.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_2.fromValue(value_0),
      left: _descriptor_0.fromValue(value_0),
      right: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.is_left).concat(_descriptor_0.toValue(value_0.left).concat(_descriptor_0.toValue(value_0.right)));
  }
}

const _descriptor_23 = new _Either_0();

const _descriptor_24 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

class _ContractAddress_0 {
  alignment() {
    return _descriptor_0.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.bytes);
  }
}

const _descriptor_25 = new _ContractAddress_0();

export class Contract {
  witnesses;
  constructor(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract constructor: expected 1 argument, received ${args_0.length}`);
    }
    const witnesses_0 = args_0[0];
    if (typeof(witnesses_0) !== 'object') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor is not an object');
    }
    if (typeof(witnesses_0.get_shipment_id) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named get_shipment_id');
    }
    if (typeof(witnesses_0.get_device_pubkey) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named get_device_pubkey');
    }
    if (typeof(witnesses_0.get_readings) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named get_readings');
    }
    if (typeof(witnesses_0.get_salts) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named get_salts');
    }
    if (typeof(witnesses_0.get_merkle_paths) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named get_merkle_paths');
    }
    if (typeof(witnesses_0.get_scope_preimage) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named get_scope_preimage');
    }
    if (typeof(witnesses_0.get_current_epoch) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named get_current_epoch');
    }
    this.witnesses = witnesses_0;
    this.circuits = {
      in_range(context, ...args_1) {
        return { result: pureCircuits.in_range(...args_1), context };
      },
      nullifier_of(context, ...args_1) {
        return { result: pureCircuits.nullifier_of(...args_1), context };
      },
      chunk_key(context, ...args_1) {
        return { result: pureCircuits.chunk_key(...args_1), context };
      },
      register_shipment: (...args_1) => {
        if (args_1.length !== 7) {
          throw new __compactRuntime.CompactError(`register_shipment: expected 7 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const shipment_id_0 = args_1[1];
        const stream_roots_0 = args_1[2];
        const stream_bounds_0 = args_1[3];
        const chunk_counts_0 = args_1[4];
        const device_key_hash_0 = args_1[5];
        const leg_count_0 = args_1[6];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('register_shipment',
                                     'argument 1 (as invoked from Typescript)',
                                     'thermoseal.compact line 165 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(shipment_id_0.buffer instanceof ArrayBuffer && shipment_id_0.BYTES_PER_ELEMENT === 1 && shipment_id_0.length === 32)) {
          __compactRuntime.typeError('register_shipment',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'thermoseal.compact line 165 char 1',
                                     'Bytes<32>',
                                     shipment_id_0)
        }
        if (!(Array.isArray(stream_roots_0) && stream_roots_0.length === 3 && stream_roots_0.every((t) => t.buffer instanceof ArrayBuffer && t.BYTES_PER_ELEMENT === 1 && t.length === 32))) {
          __compactRuntime.typeError('register_shipment',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'thermoseal.compact line 165 char 1',
                                     'Vector<3, Bytes<32>>',
                                     stream_roots_0)
        }
        if (!(Array.isArray(stream_bounds_0) && stream_bounds_0.length === 3 && stream_bounds_0.every((t) => typeof(t) === 'object' && typeof(t.min) === 'bigint' && t.min >= 0n && t.min <= 65535n && typeof(t.max) === 'bigint' && t.max >= 0n && t.max <= 65535n))) {
          __compactRuntime.typeError('register_shipment',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'thermoseal.compact line 165 char 1',
                                     'Vector<3, struct Bounds<min: Uint<0..65536>, max: Uint<0..65536>>>',
                                     stream_bounds_0)
        }
        if (!(Array.isArray(chunk_counts_0) && chunk_counts_0.length === 3 && chunk_counts_0.every((t) => typeof(t) === 'bigint' && t >= 0n && t <= 65535n))) {
          __compactRuntime.typeError('register_shipment',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'thermoseal.compact line 165 char 1',
                                     'Vector<3, Uint<0..65536>>',
                                     chunk_counts_0)
        }
        if (!(device_key_hash_0.buffer instanceof ArrayBuffer && device_key_hash_0.BYTES_PER_ELEMENT === 1 && device_key_hash_0.length === 32)) {
          __compactRuntime.typeError('register_shipment',
                                     'argument 5 (argument 6 as invoked from Typescript)',
                                     'thermoseal.compact line 165 char 1',
                                     'Bytes<32>',
                                     device_key_hash_0)
        }
        if (!(typeof(leg_count_0) === 'bigint' && leg_count_0 >= 0n && leg_count_0 <= 255n)) {
          __compactRuntime.typeError('register_shipment',
                                     'argument 6 (argument 7 as invoked from Typescript)',
                                     'thermoseal.compact line 165 char 1',
                                     'Uint<0..256>',
                                     leg_count_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(shipment_id_0).concat(_descriptor_5.toValue(stream_roots_0).concat(_descriptor_8.toValue(stream_bounds_0).concat(_descriptor_9.toValue(chunk_counts_0).concat(_descriptor_0.toValue(device_key_hash_0).concat(_descriptor_10.toValue(leg_count_0)))))),
            alignment: _descriptor_0.alignment().concat(_descriptor_5.alignment().concat(_descriptor_8.alignment().concat(_descriptor_9.alignment().concat(_descriptor_0.alignment().concat(_descriptor_10.alignment())))))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._register_shipment_0(context,
                                                   partialProofData,
                                                   shipment_id_0,
                                                   stream_roots_0,
                                                   stream_bounds_0,
                                                   chunk_counts_0,
                                                   device_key_hash_0,
                                                   leg_count_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      submit_chunk: (...args_1) => {
        if (args_1.length !== 4) {
          throw new __compactRuntime.CompactError(`submit_chunk: expected 4 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const leg_index_0 = args_1[1];
        const stream_index_0 = args_1[2];
        const chunk_index_0 = args_1[3];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('submit_chunk',
                                     'argument 1 (as invoked from Typescript)',
                                     'thermoseal.compact line 196 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(leg_index_0) === 'bigint' && leg_index_0 >= 0n && leg_index_0 <= 255n)) {
          __compactRuntime.typeError('submit_chunk',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'thermoseal.compact line 196 char 1',
                                     'Uint<0..256>',
                                     leg_index_0)
        }
        if (!(typeof(stream_index_0) === 'bigint' && stream_index_0 >= 0n && stream_index_0 <= 255n)) {
          __compactRuntime.typeError('submit_chunk',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'thermoseal.compact line 196 char 1',
                                     'Uint<0..256>',
                                     stream_index_0)
        }
        if (!(typeof(chunk_index_0) === 'bigint' && chunk_index_0 >= 0n && chunk_index_0 <= 65535n)) {
          __compactRuntime.typeError('submit_chunk',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'thermoseal.compact line 196 char 1',
                                     'Uint<0..65536>',
                                     chunk_index_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_10.toValue(leg_index_0).concat(_descriptor_10.toValue(stream_index_0).concat(_descriptor_6.toValue(chunk_index_0))),
            alignment: _descriptor_10.alignment().concat(_descriptor_10.alignment().concat(_descriptor_6.alignment()))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._submit_chunk_0(context,
                                              partialProofData,
                                              leg_index_0,
                                              stream_index_0,
                                              chunk_index_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      finalize_leg: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`finalize_leg: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const leg_index_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('finalize_leg',
                                     'argument 1 (as invoked from Typescript)',
                                     'thermoseal.compact line 259 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(leg_index_0) === 'bigint' && leg_index_0 >= 0n && leg_index_0 <= 255n)) {
          __compactRuntime.typeError('finalize_leg',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'thermoseal.compact line 259 char 1',
                                     'Uint<0..256>',
                                     leg_index_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_10.toValue(leg_index_0),
            alignment: _descriptor_10.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._finalize_leg_0(context,
                                              partialProofData,
                                              leg_index_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      authorize_auditor: (...args_1) => {
        if (args_1.length !== 5) {
          throw new __compactRuntime.CompactError(`authorize_auditor: expected 5 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const grant_id_0 = args_1[1];
        const scope_hash_0 = args_1[2];
        const auditor_pubkey_hash_0 = args_1[3];
        const expiry_epoch_0 = args_1[4];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('authorize_auditor',
                                     'argument 1 (as invoked from Typescript)',
                                     'thermoseal.compact line 317 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(grant_id_0.buffer instanceof ArrayBuffer && grant_id_0.BYTES_PER_ELEMENT === 1 && grant_id_0.length === 32)) {
          __compactRuntime.typeError('authorize_auditor',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'thermoseal.compact line 317 char 1',
                                     'Bytes<32>',
                                     grant_id_0)
        }
        if (!(scope_hash_0.buffer instanceof ArrayBuffer && scope_hash_0.BYTES_PER_ELEMENT === 1 && scope_hash_0.length === 32)) {
          __compactRuntime.typeError('authorize_auditor',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'thermoseal.compact line 317 char 1',
                                     'Bytes<32>',
                                     scope_hash_0)
        }
        if (!(auditor_pubkey_hash_0.buffer instanceof ArrayBuffer && auditor_pubkey_hash_0.BYTES_PER_ELEMENT === 1 && auditor_pubkey_hash_0.length === 32)) {
          __compactRuntime.typeError('authorize_auditor',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'thermoseal.compact line 317 char 1',
                                     'Bytes<32>',
                                     auditor_pubkey_hash_0)
        }
        if (!(typeof(expiry_epoch_0) === 'bigint' && expiry_epoch_0 >= 0n && expiry_epoch_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('authorize_auditor',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'thermoseal.compact line 317 char 1',
                                     'Uint<0..18446744073709551616>',
                                     expiry_epoch_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(grant_id_0).concat(_descriptor_0.toValue(scope_hash_0).concat(_descriptor_0.toValue(auditor_pubkey_hash_0).concat(_descriptor_1.toValue(expiry_epoch_0)))),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment())))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._authorize_auditor_0(context,
                                                   partialProofData,
                                                   grant_id_0,
                                                   scope_hash_0,
                                                   auditor_pubkey_hash_0,
                                                   expiry_epoch_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      record_disclosure: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`record_disclosure: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const grant_id_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('record_disclosure',
                                     'argument 1 (as invoked from Typescript)',
                                     'thermoseal.compact line 345 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(grant_id_0.buffer instanceof ArrayBuffer && grant_id_0.BYTES_PER_ELEMENT === 1 && grant_id_0.length === 32)) {
          __compactRuntime.typeError('record_disclosure',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'thermoseal.compact line 345 char 1',
                                     'Bytes<32>',
                                     grant_id_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(grant_id_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._record_disclosure_0(context,
                                                   partialProofData,
                                                   grant_id_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      }
    };
    this.impureCircuits = {
      register_shipment: this.circuits.register_shipment,
      submit_chunk: this.circuits.submit_chunk,
      finalize_leg: this.circuits.finalize_leg,
      authorize_auditor: this.circuits.authorize_auditor,
      record_disclosure: this.circuits.record_disclosure
    };
    this.provableCircuits = {
      register_shipment: this.circuits.register_shipment,
      submit_chunk: this.circuits.submit_chunk,
      finalize_leg: this.circuits.finalize_leg,
      authorize_auditor: this.circuits.authorize_auditor,
      record_disclosure: this.circuits.record_disclosure
    };
  }
  initialState(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const constructorContext_0 = args_0[0];
    if (typeof(constructorContext_0) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'constructorContext' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!('initialPrivateState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialPrivateState' in argument 1 (as invoked from Typescript)`);
    }
    if (!('initialZswapLocalState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript)`);
    }
    if (typeof(constructorContext_0.initialZswapLocalState) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript) to be an object`);
    }
    const state_0 = new __compactRuntime.ContractState();
    let stateValue_0 = __compactRuntime.StateValue.newArray();
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    state_0.data = new __compactRuntime.ChargedState(stateValue_0);
    state_0.setOperation('register_shipment', new __compactRuntime.ContractOperation());
    state_0.setOperation('submit_chunk', new __compactRuntime.ContractOperation());
    state_0.setOperation('finalize_leg', new __compactRuntime.ContractOperation());
    state_0.setOperation('authorize_auditor', new __compactRuntime.ContractOperation());
    state_0.setOperation('record_disclosure', new __compactRuntime.ContractOperation());
    const context = __compactRuntime.createCircuitContext(__compactRuntime.dummyContractAddress(), constructorContext_0.initialZswapLocalState.coinPublicKey, state_0.data, constructorContext_0.initialPrivateState);
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: []
    };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(0n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(1n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(2n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(3n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(4n),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    state_0.data = new __compactRuntime.ChargedState(context.currentQueryContext.state.state);
    return {
      currentContractState: state_0,
      currentPrivateState: context.currentPrivateState,
      currentZswapLocalState: context.currentZswapLocalState
    }
  }
  _persistentHash_0(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_5, value_0);
    return result_0;
  }
  _persistentHash_1(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_21, value_0);
    return result_0;
  }
  _persistentHash_2(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_22, value_0);
    return result_0;
  }
  _persistentHash_3(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_20, value_0);
    return result_0;
  }
  _persistentHash_4(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_0, value_0);
    return result_0;
  }
  _persistentHash_5(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_17, value_0);
    return result_0;
  }
  _in_range_0(reading_0, min_0, max_0) {
    __compactRuntime.assert(reading_0 >= min_0, 'Reading below minimum bound');
    __compactRuntime.assert(reading_0 <= max_0, 'Reading above maximum bound');
    return true;
  }
  _get_shipment_id_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.get_shipment_id(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('get_shipment_id',
                                 'return value',
                                 'thermoseal.compact line 66 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _get_device_pubkey_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.get_device_pubkey(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('get_device_pubkey',
                                 'return value',
                                 'thermoseal.compact line 67 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _get_readings_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.get_readings(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(Array.isArray(result_0) && result_0.length === 128 && result_0.every((t) => typeof(t) === 'bigint' && t >= 0n && t <= 65535n))) {
      __compactRuntime.typeError('get_readings',
                                 'return value',
                                 'thermoseal.compact line 68 char 1',
                                 'Vector<128, Uint<0..65536>>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_18.toValue(result_0),
      alignment: _descriptor_18.alignment()
    });
    return result_0;
  }
  _get_salts_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.get_salts(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(Array.isArray(result_0) && result_0.length === 128 && result_0.every((t) => t.buffer instanceof ArrayBuffer && t.BYTES_PER_ELEMENT === 1 && t.length === 16))) {
      __compactRuntime.typeError('get_salts',
                                 'return value',
                                 'thermoseal.compact line 69 char 1',
                                 'Vector<128, Bytes<16>>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_19.toValue(result_0),
      alignment: _descriptor_19.alignment()
    });
    return result_0;
  }
  _get_merkle_paths_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.get_merkle_paths(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(Array.isArray(result_0) && result_0.length === 128 && result_0.every((t) => Array.isArray(t) && t.length === 8 && t.every((t) => t.buffer instanceof ArrayBuffer && t.BYTES_PER_ELEMENT === 1 && t.length === 32)))) {
      __compactRuntime.typeError('get_merkle_paths',
                                 'return value',
                                 'thermoseal.compact line 70 char 1',
                                 'Vector<128, Vector<8, Bytes<32>>>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_16.toValue(result_0),
      alignment: _descriptor_16.alignment()
    });
    return result_0;
  }
  _get_scope_preimage_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.get_scope_preimage(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 64)) {
      __compactRuntime.typeError('get_scope_preimage',
                                 'return value',
                                 'thermoseal.compact line 71 char 1',
                                 'Bytes<64>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_17.toValue(result_0),
      alignment: _descriptor_17.alignment()
    });
    return result_0;
  }
  _get_current_epoch_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.get_current_epoch(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'bigint' && result_0 >= 0n && result_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('get_current_epoch',
                                 'return value',
                                 'thermoseal.compact line 72 char 1',
                                 'Uint<0..18446744073709551616>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_1.toValue(result_0),
      alignment: _descriptor_1.alignment()
    });
    return result_0;
  }
  _get_chunk_count_0(counts_0, index_0) {
    if (this._equal_0(index_0, 0n)) {
      return counts_0[0];
    } else {
      if (this._equal_1(index_0, 1n)) {
        return counts_0[1];
      } else {
        return counts_0[2];
      }
    }
  }
  _get_bounds_0(bounds_0, index_0) {
    if (this._equal_2(index_0, 0n)) {
      return bounds_0[0];
    } else {
      if (this._equal_3(index_0, 1n)) {
        return bounds_0[1];
      } else {
        return bounds_0[2];
      }
    }
  }
  _get_root_0(roots_0, index_0) {
    if (this._equal_4(index_0, 0n)) {
      return roots_0[0];
    } else {
      if (this._equal_5(index_0, 1n)) {
        return roots_0[1];
      } else {
        return roots_0[2];
      }
    }
  }
  _nullifier_of_0(shipment_id_0, leg_index_0, device_pubkey_0) {
    const leg_bytes_0 = __compactRuntime.convertFieldToBytes(32,
                                                             leg_index_0,
                                                             'thermoseal.compact line 115 char 21');
    return this._persistentHash_0([shipment_id_0, leg_bytes_0, device_pubkey_0]);
  }
  _chunk_key_0(shipment_id_0, leg_index_0, stream_index_0, chunk_index_0) {
    const leg_bytes_0 = __compactRuntime.convertFieldToBytes(32,
                                                             leg_index_0,
                                                             'thermoseal.compact line 127 char 24');
    const stream_bytes_0 = __compactRuntime.convertFieldToBytes(32,
                                                                stream_index_0,
                                                                'thermoseal.compact line 128 char 24');
    const chunk_bytes_0 = __compactRuntime.convertFieldToBytes(32,
                                                               chunk_index_0,
                                                               'thermoseal.compact line 129 char 24');
    return this._persistentHash_1([shipment_id_0,
                                   leg_bytes_0,
                                   stream_bytes_0,
                                   chunk_bytes_0]);
  }
  _leaf_commit_0(reading_0, salt_0) {
    const reading_bytes_0 = __compactRuntime.convertFieldToBytes(32,
                                                                 reading_0,
                                                                 'thermoseal.compact line 140 char 25');
    const salt_bytes_0 = __compactRuntime.convertFieldToBytes(32,
                                                              __compactRuntime.convertBytesToField(16,
                                                                                                   salt_0,
                                                                                                   'thermoseal.compact line 141 char 26'),
                                                              'thermoseal.compact line 141 char 25');
    return this._persistentHash_3([reading_bytes_0, salt_bytes_0]);
  }
  _merkle_step_0(acc_0, sibling_0) {
    return this._persistentHash_3([acc_0, sibling_0]);
  }
  _verify_merkle_0(path_0, leaf_0, root_0) {
    const computed_root_0 = this._folder_0((...args_0) =>
                                             this._merkle_step_0(...args_0),
                                           leaf_0,
                                           path_0);
    return this._equal_6(computed_root_0, root_0);
  }
  _register_shipment_0(context,
                       partialProofData,
                       shipment_id_0,
                       stream_roots_0,
                       stream_bounds_0,
                       chunk_counts_0,
                       device_key_hash_0,
                       leg_count_0)
  {
    const pub_id_0 = shipment_id_0;
    __compactRuntime.assert(!_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_10.toValue(0n),
                                                                                                                   alignment: _descriptor_10.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_id_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'Shipment already registered');
    __compactRuntime.assert(leg_count_0 > 0n, 'Leg count must be greater than 0');
    __compactRuntime.assert(leg_count_0 <= 8n, 'Leg count cannot exceed 8');
    const zero_flags_0 = [false, false, false, false, false, false, false, false];
    const shipment_0 = { stream_roots: stream_roots_0,
                         stream_bounds: stream_bounds_0,
                         chunk_counts: chunk_counts_0,
                         device_key_hash: device_key_hash_0,
                         leg_count: leg_count_0,
                         legs_compliant: zero_flags_0,
                         finalized_legs: 0n };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(0n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_id_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_12.toValue(shipment_0),
                                                                                              alignment: _descriptor_12.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _submit_chunk_0(context,
                  partialProofData,
                  leg_index_0,
                  stream_index_0,
                  chunk_index_0)
  {
    const pub_id_0 = this._get_shipment_id_0(context, partialProofData);
    const pub_leg_0 = leg_index_0;
    const pub_stream_0 = stream_index_0;
    const pub_chunk_0 = chunk_index_0;
    __compactRuntime.assert(_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_10.toValue(0n),
                                                                                                                  alignment: _descriptor_10.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_id_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Shipment not found');
    const shipment_0 = _descriptor_12.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                  partialProofData,
                                                                                  [
                                                                                   { dup: { n: 0 } },
                                                                                   { idx: { cached: false,
                                                                                            pushPath: false,
                                                                                            path: [
                                                                                                   { tag: 'value',
                                                                                                     value: { value: _descriptor_10.toValue(0n),
                                                                                                              alignment: _descriptor_10.alignment() } }] } },
                                                                                   { idx: { cached: false,
                                                                                            pushPath: false,
                                                                                            path: [
                                                                                                   { tag: 'value',
                                                                                                     value: { value: _descriptor_0.toValue(pub_id_0),
                                                                                                              alignment: _descriptor_0.alignment() } }] } },
                                                                                   { popeq: { cached: false,
                                                                                              result: undefined } }]).value);
    __compactRuntime.assert(pub_stream_0 < 3n, 'Invalid stream index');
    const max_chunks_0 = this._get_chunk_count_0(shipment_0.chunk_counts,
                                                 pub_stream_0);
    __compactRuntime.assert(pub_chunk_0 < max_chunks_0,
                            'Chunk index out of bounds');
    __compactRuntime.assert(pub_leg_0 < shipment_0.leg_count,
                            'Leg index out of bounds');
    const bounds_0 = this._get_bounds_0(shipment_0.stream_bounds, pub_stream_0);
    const root_0 = this._get_root_0(shipment_0.stream_roots, pub_stream_0);
    const readings_0 = this._get_readings_0(context, partialProofData);
    const salts_0 = this._get_salts_0(context, partialProofData);
    const paths_0 = this._get_merkle_paths_0(context, partialProofData);
    this._folder_1(context,
                   partialProofData,
                   ((context, partialProofData, t_0, i_0) =>
                    {
                      __compactRuntime.assert(this._in_range_0(readings_0[i_0],
                                                               bounds_0.min,
                                                               bounds_0.max),
                                              'Reading out of contractual bounds');
                      return t_0;
                    }),
                   [],
                   [0n,
                    1n,
                    2n,
                    3n,
                    4n,
                    5n,
                    6n,
                    7n,
                    8n,
                    9n,
                    10n,
                    11n,
                    12n,
                    13n,
                    14n,
                    15n,
                    16n,
                    17n,
                    18n,
                    19n,
                    20n,
                    21n,
                    22n,
                    23n,
                    24n,
                    25n,
                    26n,
                    27n,
                    28n,
                    29n,
                    30n,
                    31n,
                    32n,
                    33n,
                    34n,
                    35n,
                    36n,
                    37n,
                    38n,
                    39n,
                    40n,
                    41n,
                    42n,
                    43n,
                    44n,
                    45n,
                    46n,
                    47n,
                    48n,
                    49n,
                    50n,
                    51n,
                    52n,
                    53n,
                    54n,
                    55n,
                    56n,
                    57n,
                    58n,
                    59n,
                    60n,
                    61n,
                    62n,
                    63n,
                    64n,
                    65n,
                    66n,
                    67n,
                    68n,
                    69n,
                    70n,
                    71n,
                    72n,
                    73n,
                    74n,
                    75n,
                    76n,
                    77n,
                    78n,
                    79n,
                    80n,
                    81n,
                    82n,
                    83n,
                    84n,
                    85n,
                    86n,
                    87n,
                    88n,
                    89n,
                    90n,
                    91n,
                    92n,
                    93n,
                    94n,
                    95n,
                    96n,
                    97n,
                    98n,
                    99n,
                    100n,
                    101n,
                    102n,
                    103n,
                    104n,
                    105n,
                    106n,
                    107n,
                    108n,
                    109n,
                    110n,
                    111n,
                    112n,
                    113n,
                    114n,
                    115n,
                    116n,
                    117n,
                    118n,
                    119n,
                    120n,
                    121n,
                    122n,
                    123n,
                    124n,
                    125n,
                    126n,
                    127n]);
    const anchor_leaf_0 = this._leaf_commit_0(readings_0[0], salts_0[0]);
    __compactRuntime.assert(this._verify_merkle_0(paths_0[0],
                                                  anchor_leaf_0,
                                                  root_0),
                            'Merkle path verification failed');
    const leg_bytes_0 = __compactRuntime.convertFieldToBytes(32,
                                                             pub_leg_0,
                                                             'thermoseal.compact line 235 char 24');
    const stream_bytes_0 = __compactRuntime.convertFieldToBytes(32,
                                                                pub_stream_0,
                                                                'thermoseal.compact line 236 char 24');
    const chunk_bytes_0 = __compactRuntime.convertFieldToBytes(32,
                                                               pub_chunk_0,
                                                               'thermoseal.compact line 237 char 24');
    const commitment_0 = this._persistentHash_2([pub_id_0,
                                                 leg_bytes_0,
                                                 stream_bytes_0,
                                                 chunk_bytes_0,
                                                 root_0]);
    const key_0 = this._chunk_key_0(pub_id_0,
                                    pub_leg_0,
                                    pub_stream_0,
                                    pub_chunk_0);
    __compactRuntime.assert(!_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_10.toValue(2n),
                                                                                                                   alignment: _descriptor_10.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'Chunk already submitted');
    const tmp_0 = { commitment: commitment_0, passed: true, submitted: true };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(2n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(tmp_0),
                                                                                              alignment: _descriptor_13.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _finalize_leg_0(context, partialProofData, leg_index_0) {
    const pub_id_0 = this._get_shipment_id_0(context, partialProofData);
    const pub_leg_0 = leg_index_0;
    const pub_device_0 = this._get_device_pubkey_0(context, partialProofData);
    __compactRuntime.assert(_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_10.toValue(0n),
                                                                                                                  alignment: _descriptor_10.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_id_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Shipment not found');
    const shipment_0 = _descriptor_12.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                  partialProofData,
                                                                                  [
                                                                                   { dup: { n: 0 } },
                                                                                   { idx: { cached: false,
                                                                                            pushPath: false,
                                                                                            path: [
                                                                                                   { tag: 'value',
                                                                                                     value: { value: _descriptor_10.toValue(0n),
                                                                                                              alignment: _descriptor_10.alignment() } }] } },
                                                                                   { idx: { cached: false,
                                                                                            pushPath: false,
                                                                                            path: [
                                                                                                   { tag: 'value',
                                                                                                     value: { value: _descriptor_0.toValue(pub_id_0),
                                                                                                              alignment: _descriptor_0.alignment() } }] } },
                                                                                   { popeq: { cached: false,
                                                                                              result: undefined } }]).value);
    __compactRuntime.assert(pub_leg_0 < shipment_0.leg_count,
                            'Leg index out of bounds');
    const device_hash_0 = this._persistentHash_4(pub_device_0);
    __compactRuntime.assert(this._equal_7(device_hash_0,
                                          shipment_0.device_key_hash),
                            'Device pubkey mismatch');
    const n_0 = this._nullifier_of_0(pub_id_0, pub_leg_0, pub_device_0);
    __compactRuntime.assert(!_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_10.toValue(1n),
                                                                                                                   alignment: _descriptor_10.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(n_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'Leg already finalized');
    this._folder_3(context,
                   partialProofData,
                   ((context, partialProofData, t_0, s_0) =>
                    {
                      const chunk_count_0 = shipment_0.chunk_counts[s_0];
                      __compactRuntime.assert(chunk_count_0 <= 2n,
                                              'Chunk count exceeds circuit bound of 2');
                      this._folder_2(context,
                                     partialProofData,
                                     ((context, partialProofData, t_1, c_0) =>
                                      {
                                        if (c_0 < chunk_count_0) {
                                          const key_0 = this._chunk_key_0(pub_id_0,
                                                                          pub_leg_0,
                                                                          s_0,
                                                                          c_0);
                                          __compactRuntime.assert(_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                                            partialProofData,
                                                                                                                            [
                                                                                                                             { dup: { n: 0 } },
                                                                                                                             { idx: { cached: false,
                                                                                                                                      pushPath: false,
                                                                                                                                      path: [
                                                                                                                                             { tag: 'value',
                                                                                                                                               value: { value: _descriptor_10.toValue(2n),
                                                                                                                                                        alignment: _descriptor_10.alignment() } }] } },
                                                                                                                             { push: { storage: false,
                                                                                                                                       value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                                                                    alignment: _descriptor_0.alignment() }).encode() } },
                                                                                                                             'member',
                                                                                                                             { popeq: { cached: true,
                                                                                                                                        result: undefined } }]).value),
                                                                  'Missing chunk record');
                                          const rec_0 = _descriptor_13.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                                   partialProofData,
                                                                                                                   [
                                                                                                                    { dup: { n: 0 } },
                                                                                                                    { idx: { cached: false,
                                                                                                                             pushPath: false,
                                                                                                                             path: [
                                                                                                                                    { tag: 'value',
                                                                                                                                      value: { value: _descriptor_10.toValue(2n),
                                                                                                                                               alignment: _descriptor_10.alignment() } }] } },
                                                                                                                    { idx: { cached: false,
                                                                                                                             pushPath: false,
                                                                                                                             path: [
                                                                                                                                    { tag: 'value',
                                                                                                                                      value: { value: _descriptor_0.toValue(key_0),
                                                                                                                                               alignment: _descriptor_0.alignment() } }] } },
                                                                                                                    { popeq: { cached: false,
                                                                                                                               result: undefined } }]).value);
                                          __compactRuntime.assert(rec_0.submitted,
                                                                  'Chunk not marked submitted');
                                          __compactRuntime.assert(rec_0.passed,
                                                                  'Chunk did not pass compliance checks');
                                        }
                                        return t_1;
                                      }),
                                     [],
                                     [0n, 1n]);
                      return t_0;
                    }),
                   [],
                   [0n, 1n, 2n]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(1n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(n_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newNull().encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    const updated_legs_0 = [this._equal_14(pub_leg_0, 0n)
                            ||
                            shipment_0.legs_compliant[0],
                            this._equal_15(pub_leg_0, 1n)
                            ||
                            shipment_0.legs_compliant[1],
                            this._equal_12(pub_leg_0, 2n)
                            ||
                            shipment_0.legs_compliant[2],
                            this._equal_13(pub_leg_0, 3n)
                            ||
                            shipment_0.legs_compliant[3],
                            this._equal_10(pub_leg_0, 4n)
                            ||
                            shipment_0.legs_compliant[4],
                            this._equal_11(pub_leg_0, 5n)
                            ||
                            shipment_0.legs_compliant[5],
                            this._equal_8(pub_leg_0, 6n)
                            ||
                            shipment_0.legs_compliant[6],
                            this._equal_9(pub_leg_0, 7n)
                            ||
                            shipment_0.legs_compliant[7]];
    const tmp_0 = { stream_roots: shipment_0.stream_roots,
                    stream_bounds: shipment_0.stream_bounds,
                    chunk_counts: shipment_0.chunk_counts,
                    device_key_hash: shipment_0.device_key_hash,
                    leg_count: shipment_0.leg_count,
                    legs_compliant: updated_legs_0,
                    finalized_legs:
                      ((t1) => {
                        if (t1 > 255n) {
                          throw new __compactRuntime.CompactError('thermoseal.compact line 311 char 22: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 255');
                        }
                        return t1;
                      })(shipment_0.finalized_legs + 1n) };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(0n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_id_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_12.toValue(tmp_0),
                                                                                              alignment: _descriptor_12.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _authorize_auditor_0(context,
                       partialProofData,
                       grant_id_0,
                       scope_hash_0,
                       auditor_pubkey_hash_0,
                       expiry_epoch_0)
  {
    const pub_grant_id_0 = grant_id_0;
    const pub_scope_0 = scope_hash_0;
    __compactRuntime.assert(!_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_10.toValue(3n),
                                                                                                                   alignment: _descriptor_10.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_grant_id_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'Grant ID already exists');
    const preimage_0 = this._get_scope_preimage_0(context, partialProofData);
    const computed_scope_0 = this._persistentHash_5(preimage_0);
    __compactRuntime.assert(this._equal_16(computed_scope_0, pub_scope_0),
                            'Scope preimage does not match scope_hash');
    const tmp_0 = { scope_hash: pub_scope_0,
                    auditor_pubkey_hash: auditor_pubkey_hash_0,
                    expiry_epoch: expiry_epoch_0,
                    exercised: false };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(3n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_grant_id_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(tmp_0),
                                                                                              alignment: _descriptor_3.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _record_disclosure_0(context, partialProofData, grant_id_0) {
    const pub_grant_id_0 = grant_id_0;
    __compactRuntime.assert(_descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_10.toValue(3n),
                                                                                                                  alignment: _descriptor_10.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_grant_id_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Grant not found');
    const grant_0 = _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                              partialProofData,
                                                                              [
                                                                               { dup: { n: 0 } },
                                                                               { idx: { cached: false,
                                                                                        pushPath: false,
                                                                                        path: [
                                                                                               { tag: 'value',
                                                                                                 value: { value: _descriptor_10.toValue(3n),
                                                                                                          alignment: _descriptor_10.alignment() } }] } },
                                                                               { idx: { cached: false,
                                                                                        pushPath: false,
                                                                                        path: [
                                                                                               { tag: 'value',
                                                                                                 value: { value: _descriptor_0.toValue(pub_grant_id_0),
                                                                                                          alignment: _descriptor_0.alignment() } }] } },
                                                                               { popeq: { cached: false,
                                                                                          result: undefined } }]).value);
    __compactRuntime.assert(!grant_0.exercised,
                            'Grant has already been exercised');
    const current_epoch_0 = this._get_current_epoch_0(context, partialProofData);
    __compactRuntime.assert(current_epoch_0 <= grant_0.expiry_epoch,
                            'Grant has expired');
    const tmp_0 = { scope_hash: grant_0.scope_hash,
                    auditor_pubkey_hash: grant_0.auditor_pubkey_hash,
                    expiry_epoch: grant_0.expiry_epoch,
                    exercised: true };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(3n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_grant_id_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(tmp_0),
                                                                                              alignment: _descriptor_3.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    const tmp_1 = { grant_id: pub_grant_id_0, disclosed_at: current_epoch_0 };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_10.toValue(4n),
                                                                  alignment: _descriptor_10.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(pub_grant_id_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(tmp_1),
                                                                                              alignment: _descriptor_4.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _equal_0(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_1(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_2(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_3(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_4(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_5(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _folder_0(f, x, a0) {
    for (let i = 0; i < 8; i++) { x = f(x, a0[i]); }
    return x;
  }
  _equal_6(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _folder_1(context, partialProofData, f, x, a0) {
    for (let i = 0; i < 128; i++) { x = f(context, partialProofData, x, a0[i]); }
    return x;
  }
  _equal_7(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _folder_2(context, partialProofData, f, x, a0) {
    for (let i = 0; i < 2; i++) { x = f(context, partialProofData, x, a0[i]); }
    return x;
  }
  _folder_3(context, partialProofData, f, x, a0) {
    for (let i = 0; i < 3; i++) { x = f(context, partialProofData, x, a0[i]); }
    return x;
  }
  _equal_8(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_9(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_10(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_11(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_12(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_13(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_14(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_15(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_16(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
}
export function ledger(stateOrChargedState) {
  const state = stateOrChargedState instanceof __compactRuntime.StateValue ? stateOrChargedState : stateOrChargedState.state;
  const chargedState = stateOrChargedState instanceof __compactRuntime.StateValue ? new __compactRuntime.ChargedState(stateOrChargedState) : stateOrChargedState;
  const context = {
    currentQueryContext: new __compactRuntime.QueryContext(chargedState, __compactRuntime.dummyContractAddress()),
    costModel: __compactRuntime.CostModel.initialCostModel()
  };
  const partialProofData = {
    input: { value: [], alignment: [] },
    output: undefined,
    publicTranscript: [],
    privateTranscriptOutputs: []
  };
  return {
    shipments: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_10.toValue(0n),
                                                                                                     alignment: _descriptor_10.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                                                                 alignment: _descriptor_1.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_10.toValue(0n),
                                                                                                     alignment: _descriptor_10.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'thermoseal.compact line 55 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_10.toValue(0n),
                                                                                                     alignment: _descriptor_10.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'thermoseal.compact line 55 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_12.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_10.toValue(0n),
                                                                                                      alignment: _descriptor_10.alignment() } }] } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_0.toValue(key_0),
                                                                                                      alignment: _descriptor_0.alignment() } }] } },
                                                                           { popeq: { cached: false,
                                                                                      result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[0];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_12.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    leg_nullifiers: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_10.toValue(1n),
                                                                                                     alignment: _descriptor_10.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                                                                 alignment: _descriptor_1.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_10.toValue(1n),
                                                                                                     alignment: _descriptor_10.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const elem_0 = args_0[0];
        if (!(elem_0.buffer instanceof ArrayBuffer && elem_0.BYTES_PER_ELEMENT === 1 && elem_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'thermoseal.compact line 56 char 1',
                                     'Bytes<32>',
                                     elem_0)
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_10.toValue(1n),
                                                                                                     alignment: _descriptor_10.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(elem_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[1];
        return self_0.asMap().keys().map((elem) => _descriptor_0.fromValue(elem.value))[Symbol.iterator]();
      }
    },
    chunk_records: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_10.toValue(2n),
                                                                                                     alignment: _descriptor_10.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                                                                 alignment: _descriptor_1.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_10.toValue(2n),
                                                                                                     alignment: _descriptor_10.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'thermoseal.compact line 57 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_10.toValue(2n),
                                                                                                     alignment: _descriptor_10.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'thermoseal.compact line 57 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_13.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_10.toValue(2n),
                                                                                                      alignment: _descriptor_10.alignment() } }] } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_0.toValue(key_0),
                                                                                                      alignment: _descriptor_0.alignment() } }] } },
                                                                           { popeq: { cached: false,
                                                                                      result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[2];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_13.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    auditor_grants: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_10.toValue(3n),
                                                                                                     alignment: _descriptor_10.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                                                                 alignment: _descriptor_1.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_10.toValue(3n),
                                                                                                     alignment: _descriptor_10.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'thermoseal.compact line 58 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_10.toValue(3n),
                                                                                                     alignment: _descriptor_10.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'thermoseal.compact line 58 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_10.toValue(3n),
                                                                                                     alignment: _descriptor_10.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_0.toValue(key_0),
                                                                                                     alignment: _descriptor_0.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[3];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_3.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    disclosure_log: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_10.toValue(4n),
                                                                                                     alignment: _descriptor_10.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                                                                 alignment: _descriptor_1.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_10.toValue(4n),
                                                                                                     alignment: _descriptor_10.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'thermoseal.compact line 59 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_10.toValue(4n),
                                                                                                     alignment: _descriptor_10.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'thermoseal.compact line 59 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_10.toValue(4n),
                                                                                                     alignment: _descriptor_10.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_0.toValue(key_0),
                                                                                                     alignment: _descriptor_0.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[4];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_4.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    }
  };
}
const _emptyContext = {
  currentQueryContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress())
};
const _dummyContract = new Contract({
  get_shipment_id: (...args) => undefined,
  get_device_pubkey: (...args) => undefined,
  get_readings: (...args) => undefined,
  get_salts: (...args) => undefined,
  get_merkle_paths: (...args) => undefined,
  get_scope_preimage: (...args) => undefined,
  get_current_epoch: (...args) => undefined
});
export const pureCircuits = {
  in_range: (...args_0) => {
    if (args_0.length !== 3) {
      throw new __compactRuntime.CompactError(`in_range: expected 3 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const reading_0 = args_0[0];
    const min_0 = args_0[1];
    const max_0 = args_0[2];
    if (!(typeof(reading_0) === 'bigint' && reading_0 >= 0n && reading_0 <= 65535n)) {
      __compactRuntime.typeError('in_range',
                                 'argument 1',
                                 'thermoseal.compact line 8 char 1',
                                 'Uint<0..65536>',
                                 reading_0)
    }
    if (!(typeof(min_0) === 'bigint' && min_0 >= 0n && min_0 <= 65535n)) {
      __compactRuntime.typeError('in_range',
                                 'argument 2',
                                 'thermoseal.compact line 8 char 1',
                                 'Uint<0..65536>',
                                 min_0)
    }
    if (!(typeof(max_0) === 'bigint' && max_0 >= 0n && max_0 <= 65535n)) {
      __compactRuntime.typeError('in_range',
                                 'argument 3',
                                 'thermoseal.compact line 8 char 1',
                                 'Uint<0..65536>',
                                 max_0)
    }
    return _dummyContract._in_range_0(reading_0, min_0, max_0);
  },
  nullifier_of: (...args_0) => {
    if (args_0.length !== 3) {
      throw new __compactRuntime.CompactError(`nullifier_of: expected 3 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const shipment_id_0 = args_0[0];
    const leg_index_0 = args_0[1];
    const device_pubkey_0 = args_0[2];
    if (!(shipment_id_0.buffer instanceof ArrayBuffer && shipment_id_0.BYTES_PER_ELEMENT === 1 && shipment_id_0.length === 32)) {
      __compactRuntime.typeError('nullifier_of',
                                 'argument 1',
                                 'thermoseal.compact line 110 char 1',
                                 'Bytes<32>',
                                 shipment_id_0)
    }
    if (!(typeof(leg_index_0) === 'bigint' && leg_index_0 >= 0n && leg_index_0 <= 255n)) {
      __compactRuntime.typeError('nullifier_of',
                                 'argument 2',
                                 'thermoseal.compact line 110 char 1',
                                 'Uint<0..256>',
                                 leg_index_0)
    }
    if (!(device_pubkey_0.buffer instanceof ArrayBuffer && device_pubkey_0.BYTES_PER_ELEMENT === 1 && device_pubkey_0.length === 32)) {
      __compactRuntime.typeError('nullifier_of',
                                 'argument 3',
                                 'thermoseal.compact line 110 char 1',
                                 'Bytes<32>',
                                 device_pubkey_0)
    }
    return _dummyContract._nullifier_of_0(shipment_id_0,
                                          leg_index_0,
                                          device_pubkey_0);
  },
  chunk_key: (...args_0) => {
    if (args_0.length !== 4) {
      throw new __compactRuntime.CompactError(`chunk_key: expected 4 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const shipment_id_0 = args_0[0];
    const leg_index_0 = args_0[1];
    const stream_index_0 = args_0[2];
    const chunk_index_0 = args_0[3];
    if (!(shipment_id_0.buffer instanceof ArrayBuffer && shipment_id_0.BYTES_PER_ELEMENT === 1 && shipment_id_0.length === 32)) {
      __compactRuntime.typeError('chunk_key',
                                 'argument 1',
                                 'thermoseal.compact line 121 char 1',
                                 'Bytes<32>',
                                 shipment_id_0)
    }
    if (!(typeof(leg_index_0) === 'bigint' && leg_index_0 >= 0n && leg_index_0 <= 255n)) {
      __compactRuntime.typeError('chunk_key',
                                 'argument 2',
                                 'thermoseal.compact line 121 char 1',
                                 'Uint<0..256>',
                                 leg_index_0)
    }
    if (!(typeof(stream_index_0) === 'bigint' && stream_index_0 >= 0n && stream_index_0 <= 255n)) {
      __compactRuntime.typeError('chunk_key',
                                 'argument 3',
                                 'thermoseal.compact line 121 char 1',
                                 'Uint<0..256>',
                                 stream_index_0)
    }
    if (!(typeof(chunk_index_0) === 'bigint' && chunk_index_0 >= 0n && chunk_index_0 <= 65535n)) {
      __compactRuntime.typeError('chunk_key',
                                 'argument 4',
                                 'thermoseal.compact line 121 char 1',
                                 'Uint<0..65536>',
                                 chunk_index_0)
    }
    return _dummyContract._chunk_key_0(shipment_id_0,
                                       leg_index_0,
                                       stream_index_0,
                                       chunk_index_0);
  }
};
export const contractReferenceLocations =
  { tag: 'publicLedgerArray', indices: { } };
//# sourceMappingURL=index.js.map
