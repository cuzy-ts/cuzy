import Pusher from "pusher-js";
import Sip from "../../client";
import type { BroadcastDriver, SipOptions } from "../../types";

let clientInstance: Sip<BroadcastDriver> | null = null;
let clientConfig: SipOptions<BroadcastDriver> | null = null;

const getSipInstance = <T extends BroadcastDriver>(): Sip<T> => {
  if (clientInstance) {
    return clientInstance as Sip<T>;
  }

  if (!clientConfig) {
    throw new Error(
      "Sip has not been configured. Please call `configureSip()`.",
    );
  }

  if (
    clientConfig.broadcaster === "fizz" ||
    clientConfig.broadcaster === "pusher" ||
    clientConfig.broadcaster === "ably"
  ) {
    // biome-ignore lint/suspicious/noExplicitAny: Dynamic assignment of Pusher library
    (clientConfig as any).Pusher ??= (Pusher as any)?.default ?? Pusher;
  }

  clientInstance = new Sip(clientConfig);

  return clientInstance as Sip<T>;
};

export const configureSip = <T extends BroadcastDriver>(
  config: SipOptions<T>,
): void => {
  const defaults: Record<string, Record<string, unknown>> = {
    fizz: {
      broadcaster: "fizz",
      enabledTransports: ["ws", "wss"],
    },
    pusher: {
      broadcaster: "pusher",
      forceTLS: true,
      enabledTransports: ["ws", "wss"],
    },
    "socket.io": {
      broadcaster: "socket.io",
    },
    null: {
      broadcaster: "null",
    },
    ably: {
      broadcaster: "pusher",
      wsHost: "realtime-pusher.ably.io",
      wsPort: 443,
      disableStats: true,
      encrypted: true,
    },
  };

  clientConfig = {
    ...defaults[config.broadcaster as string],
    ...config,
  } as SipOptions<BroadcastDriver>;

  if (clientInstance) {
    clientInstance = null;
  }
};

export const client = <T extends BroadcastDriver>(): Sip<T> =>
  getSipInstance<T>();

export const clientIsConfigured = () => clientConfig !== null;
