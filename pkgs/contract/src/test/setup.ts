import { ThermoSealSimulator } from "./thermoseal-simulator.js";

/**
 * Initializes local test environment simulation.
 */
export async function devnet() {
  // Local devnet harness initialization (or no-op for simulator-backed tests)
  return Promise.resolve();
}

export async function deployThermoSeal() {
  return new ThermoSealSimulator();
}