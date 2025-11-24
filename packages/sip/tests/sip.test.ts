import { beforeEach, describe, expect, test } from "bun:test";
import { Window } from "happy-dom";
import Sip from "../src/client";
import { NullConnector } from "../src/connector/null-connector";
import { PusherConnector } from "../src/connector/pusher-connector";
import { SocketIoConnector } from "../src/connector/socketio-connector";

// Set up DOM environment for all tests
const window = new Window();
// @ts-expect-error - setting up global DOM for tests
global.window = window;
// @ts-expect-error - setting up global DOM for tests
global.document = window.document;

describe("Sip", () => {
  beforeEach(() => {
    // Reset global mocks
    // biome-ignore lint/suspicious/noExplicitAny: Cleanup
    delete (globalThis as any).Pusher;
    // biome-ignore lint/suspicious/noExplicitAny: Cleanup
    delete (globalThis as any).io;
    // biome-ignore lint/suspicious/noExplicitAny: Cleanup
    delete (window as any).Pusher;
    // biome-ignore lint/suspicious/noExplicitAny: Cleanup
    delete (window as any).io;
  });

  test("it creates a simple instance", () => {
    // biome-ignore lint/suspicious/noExplicitAny: Mock injection
    (globalThis as any).Pusher = class MockPusher {
      connection = {
        bind: () => {},
        unbind: () => {},
      };
      subscribe() {
        return {
          bind: () => {},
          unbind: () => {},
        };
      }
      unsubscribe() {}
      disconnect() {}
    };
    // biome-ignore lint/suspicious/noExplicitAny: Mock injection
    (window as any).Pusher = (globalThis as any).Pusher;

    const client = new Sip({
      broadcaster: "fizz",
      key: "test-key",
      wsHost: "localhost",
      wsPort: 6001,
    });

    expect(client).toBeDefined();
    expect(client.connector).toBeInstanceOf(PusherConnector);
  });

  test("it creates a null connector instance", () => {
    const client = new Sip({
      broadcaster: "null",
    });

    expect(client).toBeDefined();
    expect(client.connector).toBeInstanceOf(NullConnector);
  });

  test("it creates a socket.io connector instance", () => {
    // Mock io with internal io manager mock
    const mockIo = () => ({
      on: () => {},
      off: () => {},
      connect: () => {},
      disconnect: () => {},
      emit: () => {},
      io: {
        on: () => {},
      },
    });
    // biome-ignore lint/suspicious/noExplicitAny: Mock injection
    (globalThis as any).io = mockIo;
    // biome-ignore lint/suspicious/noExplicitAny: Mock injection
    (window as any).io = mockIo;

    const client = new Sip({
      broadcaster: "socket.io",
      host: "localhost:6001",
    });

    expect(client).toBeDefined();
    expect(client.connector).toBeInstanceOf(SocketIoConnector);
  });

  test("it supports the 'fizz' broadcaster alias", () => {
    // Mock Pusher (Fizz uses Pusher connector under the hood)
    // biome-ignore lint/suspicious/noExplicitAny: Mock injection
    (globalThis as any).Pusher = class MockPusher {
      connection = {
        bind: () => {},
        unbind: () => {},
      };
      subscribe() {
        return {
          bind: () => {},
          unbind: () => {},
        };
      }
      unsubscribe() {}
      disconnect() {}
    };
    // biome-ignore lint/suspicious/noExplicitAny: Mock injection
    (window as any).Pusher = (globalThis as any).Pusher;

    const client = new Sip<"fizz">({
      broadcaster: "fizz",
      key: "fizz-key",
      wsHost: "127.0.0.1",
      wsPort: 8080,
      disableStats: true,
      enabledTransports: ["ws", "wss"],
    });

    expect(client.connector).toBeInstanceOf(PusherConnector);
    expect(client.connector.options.broadcaster).toBe("fizz");
  });

  test("it can initialize with a custom client for 'fizz'", () => {
    const mockPusher = {
      connection: {
        bind: () => {},
        unbind: () => {},
      },
      subscribe() {
        return {
          bind: () => {},
          unbind: () => {},
        };
      },
      unsubscribe() {},
      disconnect() {},
      signin() {},
    };

    const client = new Sip<"fizz">({
      broadcaster: "fizz",
      key: "test-key",
      withoutInterceptors: true,
      // biome-ignore lint/suspicious/noExplicitAny: Mock injection
      client: mockPusher as any,
    });

    expect(client.connector).toBeDefined();
    expect(client.connector.constructor.name).toBe("PusherConnector");
  });

  test("it can initialize with a custom client for 'pusher'", () => {
    const mockPusher = {
      connection: {
        bind: () => {},
        unbind: () => {},
      },
      subscribe() {
        return {
          bind: () => {},
          unbind: () => {},
        };
      },
      unsubscribe() {},
      disconnect() {},
      signin() {},
    };

    const client = new Sip<"pusher">({
      broadcaster: "pusher",
      key: "test-key",
      cluster: "mt1",
      withoutInterceptors: true,
      // biome-ignore lint/suspicious/noExplicitAny: Mock injection
      client: mockPusher as any,
    });

    expect(client.connector).toBeDefined();
    expect(client.connector.constructor.name).toBe("PusherConnector");
    expect(client.options.broadcaster).toBe("pusher");
  });

  test("it registers interceptors when withoutInterceptors is false", () => {
    // Mock window and axios
    const mockAxios = {
      interceptors: {
        request: {
          use: (
            // biome-ignore lint/suspicious/noExplicitAny: Mock type
            callback: (config: any) => any,
          ) => {
            // Verify callback adds header
            const config = { headers: {} as Record<string, string> };
            callback(config);
            expect(config.headers["X-Socket-Id"]).toBe("123.456");
          },
        },
      },
    };

    // biome-ignore lint/suspicious/noExplicitAny: Mock injection
    (globalThis as any).window = {
      axios: mockAxios,
    };
    // biome-ignore lint/suspicious/noExplicitAny: Mock injection
    (window as any).axios = mockAxios;

    // Mock Pusher for the connector
    const mockPusher = {
      connection: {
        bind: () => {},
        unbind: () => {},
        socket_id: "123.456",
      },
      subscribe() {
        return {
          bind: () => {},
          unbind: () => {},
        };
      },
      unsubscribe() {},
      disconnect() {},
      signin() {},
    };

    const client = new Sip<"fizz">({
      broadcaster: "fizz",
      key: "test-key",
      withoutInterceptors: false,
      // biome-ignore lint/suspicious/noExplicitAny: Mock injection
      client: mockPusher as any,
    });

    expect(() => client.registerInterceptors()).not.toThrow();
  });
});

