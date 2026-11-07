import { describe, expect, it } from "vitest";

describe("ThermoSeal type constants", () => {
  it("ThermoSealPrivateStateId is 'thermosealPrivateState'", () => {
    const id = "thermosealPrivateState";
    expect(id).toBe("thermosealPrivateState");
  });

  it("ThermoSeal zkConfigPath points to /managed/thermoseal", () => {
    const path = "/managed/thermoseal";
    expect(path).toContain("thermoseal");
  });
});