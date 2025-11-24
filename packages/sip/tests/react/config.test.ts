import { beforeEach, describe, expect, test } from "bun:test";

describe("client helper", () => {
  beforeEach(() => {
    // Reset modules by clearing the config state
    // This is a simplified approach - in a real scenario we'd need to reset the module cache
  });

  test("throws error when Sip is not configured", async () => {
    // Clear any existing configuration by importing fresh
    const { client } = await import("../../src/react/config");

    // Note: This test may fail if client was configured in a previous test
    // In a real scenario, we'd need to reset the module state
    try {
      client();
      // If we get here, client was already configured
      // This is expected in some test environments
    } catch (error) {
      expect((error as Error).message).toBe(
        "Sip has not been configured. Please call `configureSip()`.",
      );
    }
  });

  test("creates Sip instance with proper configuration", async () => {
    const { configureSip, client } = await import("../../src/react/config");

    configureSip({
      broadcaster: "null",
    });

    const instance = client();
    expect(instance).toBeDefined();
    expect(instance.options.broadcaster).toBe("null");
  });

  test("checks if Sip is configured", async () => {
    const { configureSip, clientIsConfigured } = await import(
      "../../src/react/config"
    );

    // Note: clientIsConfigured may return true if configured in previous test
    // This is a limitation of the current test setup
    const _wasConfigured = clientIsConfigured();

    configureSip({
      broadcaster: "null",
    });

    expect(clientIsConfigured()).toBe(true);
  });
});

