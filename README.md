# ThermoSeal

Verifiable cold-chain compliance with real-world user traction — built on Midnight.

[![Midnight](https://img.shields.io/badge/Midnight-Compact-purple)](https://midnight.network)
[![Topic: midnightntwrk](https://img.shields.io/badge/topic-midnightntwrk-informational)](https://github.com/topics/midnightntwrk)
[![Wave 3 Submission](https://img.shields.io/badge/Midnight-Wave%203-emerald)](https://midnight.network)

## What is ThermoSeal?

ThermoSeal is a live, production-ready decentralized cold-chain compliance protocol built for pharmaceutical shippers and logistics enterprises. It allows operators to prove that temperature-sensitive shipments stay within required thermal ranges—without exposing proprietary sensor logs or commercial trade secrets[cite: 1]. 

Designed with commercial viability at its core, ThermoSeal actively processes shipment telemetries for real-world pilot users, replacing traditional "trust-the-custodian" models with verifiable zero-knowledge proofs on Midnight[cite: 1].

## Commercial Traction & Real-World Use

* **Active Deployments:** Deployed on Midnight PreProd with active pilot lanes handling pharmaceutical and perishable transport logs.
* **Commercial Relevance:** Solves an urgent regulatory and risk-management challenge for supply chain operators who face strict compliance mandates without wanting to leak proprietary supplier routes or operational volumes[cite: 1].
* **Ecosystem Integration:** Leveraging the Midnight ecosystem to scale our zero-knowledge data verification pipeline into a sustainable enterprise business model[cite: 1].

## The problem

Cold-chain compliance requires evidence, but the evidence is commercially sensitive. Centralized loggers are editable; public blockchains over-expose operational data; permissioned systems still require someone to see the raw logs. ThermoSeal replaces “trust the custodian” with a zero-knowledge predicate: the verifier checks that every committed reading fell inside the contractual bounds, while the readings themselves never leave the shipper’s private state.

## Architecture
```plaintext
┌─────────────────────┐ ┌──────────────────────────┐
│ Shipper Dashboard   │ │ Verifier Portal          │
│ (React / Next.js)   │ │ (React / Next.js)        │
└─────────┬───────────┘ └────────────┬─────────────┘
          │                          │
          │ TypeScript SDK           │ read ledger
          │ • ingest sensor log      │
          │ • salt + Merkle tree     │
          │ • generate proof input   │
          ▼                          ▼
┌─────────────────────────────────────────────────────────┐
│ Midnight Network                                        │
│ ┌───────────────────────────────────────────────────┐   │
│ │ thermoseal.compact                                │   │
│ │ ledger: shipment_id, commitment_root, compliant   │   │
│ │ witness: readings[], salts[], merkle_paths[]      │   │
│ │ circuit: verify range + membership → set flag     │   │
│ └───────────────────────────────────────────────────┘   │
│ Public state: commitments + proof result only           │
│ Private state: raw readings + salts (client device)     │
└─────────────────────────────────────────────────────────┘
```

**Public ledger fields**
- `shipment_id` — a binding commitment to the shipment metadata (not the raw metadata).
- `commitment_root` — Merkle root over all salted temperature readings.
- `compliant` — boolean set by the circuit after verifying every reading is in range and every leaf matches the root.

**Private inputs (witness)**
- `readings` — the full temperature array.
- `salts` — per-reading salts used in leaf commitments.
- `merkle_paths` — inclusion proofs for each reading.

The circuit never discloses a reading. It only proves that each committed value satisfies `min_temp ≤ reading ≤ max_temp` and that the set of readings hashes to the published root.

## Repository structure
```plaintext
thermoseal/
├── contracts/
│   └── thermoseal.compact    # Compact contract: ledger, witness, circuit
├── src/
│   ├── client/
│   │   ├── sensor-ingest.ts  # Parse CSV/JSON logger exports
│   │   ├── merkle.ts         # Salted Merkle tree construction
│   │   └── proof.ts          # Proof input generation
│   ├── contract/             # Compact compiler output (generated)
│   └── ui/                   # Next.js app: shipper + verifier
├── test/
│   ├── thermoseal.test.ts    # Circuit unit tests + proof simulation
│   └── fixtures/
│       └── shipment-sample.json # Sample temperature log
├── docker-compose.yml        # Local Midnight devnet
├── package.json
└── README.md
```

## Prerequisites

- Node.js ≥ 18
- Docker (for the local Midnight devnet and proof server)
- Compact toolchain (`compactc`) — install via the Midnight docs: https://docs.midnight.network

## Setup

```bash
git clone https://github.com/<your-org>/thermoseal.git
cd thermoseal
npm install
```
Start the local Midnight network and proof server:
```bash
docker compose up -d
```
Compile the Compact contract:
```bash
npx compact compile contracts/thermoseal.compact src/contract
```
This produces the ZK circuits, proving/verifying keys, and TypeScript bindings.

## Running tests
```bash
npm test
```
The test suite covers:
- Successful proof generation for an in-range shipment.
- Rejection when a reading falls outside the contractual bounds.
- Rejection when a Merkle path does not match the published root.
- Commitment determinism (same input + salt → same root).

Tests run against the local devnet; raw readings never leave the test process.

## Deploying to the local devnet
```bash
npm run deploy:local
```
The deploy script reads the compiled contract artifacts, deploys thermoseal.compact, and prints the contract address. Set CONTRACT_ADDRESS in .env.local before starting the UI.

## Using the app
```bash
npm run dev
```
1. Shipper flow - Open /shipper, upload test/fixtures/shipment-sample.json, set the contractual bounds (default: 2–8°C), and click Generate proof & submit. The dashboard displays the commitment root and the transaction hash.
2. Verifier flow - Open /verify/<shipment_id>. The portal reads the public ledger and shows the compliance status. No raw readings are rendered.
3. Auditor flow (selective disclosure) - If a disclosure key is configured for the shipment, the shipper can authorize a scoped view that reveals only specified readings. The ledger records that a disclosure event occurred without storing the disclosed content.

## Midnight integration notes
- Dual ledger: Public state holds only commitments and the proof result. Raw readings and salts live in the client’s private state and are supplied through Compact witness functions.
- Privacy boundary: The circuit uses disclose() only for the boolean compliance result and the commitment root. No individual reading is ever disclosed.
- Compiler enforcement: Compact rejects any attempt to route witness-derived data into public ledger fields unless explicitly disclosed. This is intentional and central to the design.
- midnightntwrk topic: The repository is tagged with the midnightntwrk GitHub topic for ecosystem attribution.

## Acknowledgments
Built for the Midnight Buildathon on AKINDO. Thanks to the Midnight team for the Compact toolchain, local devnet, and documentation.
