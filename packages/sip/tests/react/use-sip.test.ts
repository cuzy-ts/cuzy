import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { renderHook } from "@testing-library/react";
import { Window } from "happy-dom";
import type { Sip } from "../../src/client";
import { configureSip } from "../../src/react/config";
import * as useSipModule from "../../src/react/hooks/use-sip";

// Set up DOM environment
const window = new Window();
const document = window.document;
// @ts-expect-error - setting up global DOM for tests
global.window = window;
// @ts-expect-error - setting up global DOM for tests
global.document = document;

// Mock Sip for testing (for future use)
const _createMockSip = () => {
  const mockPrivateChannel = {
    leaveChannel: () => {},
    listen: () => {},
    stopListening: () => {},
    notification: () => {},
    stopListeningForNotification: () => {},
  };

  const mockPublicChannel = {
    leaveChannel: () => {},
    listen: () => {},
    stopListening: () => {},
  };

  const mockPresenceChannel = {
    leaveChannel: () => {},
    listen: () => {},
    stopListening: () => {},
    here: () => {},
    joining: () => {},
    leaving: () => {},
    whisper: () => {},
  };

  return {
    private: () => mockPrivateChannel,
    channel: () => mockPublicChannel,
    encryptedPrivate: () => {},
    listen: () => {},
    leave: () => {},
    leaveChannel: () => {},
    leaveAllChannels: () => {},
    join: () => mockPresenceChannel,
    options: { broadcaster: "null" },
  } as unknown as Sip<"null">;
};

describe("useSip hook", () => {
  beforeEach(() => {
    configureSip({
      broadcaster: "null",
    });
  });

  afterEach(() => {
    // Clean up any configured client
  });

  test("subscribes to a channel and listens for events", () => {
    const mockCallback = () => {};
    const channelName = "test-channel";
    const event = "test-event";

    const { result } = renderHook(() =>
      useSipModule.useSip(channelName, event, mockCallback),
    );

    expect(result.current).toHaveProperty("leaveChannel");
    expect(typeof result.current.leave).toBe("function");
    expect(result.current).toHaveProperty("leave");
    expect(typeof result.current.leaveChannel).toBe("function");
  });
});

