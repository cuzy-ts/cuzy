import type { Channel, PresenceChannel } from "../channel";
import type {
  BroadcastDriver,
  SipOptions,
  SipOptionsWithDefaults,
} from "../types";

export abstract class Connector<TBroadcaster extends BroadcastDriver = "fizz"> {
  static readonly _defaultOptions = {
    auth: {
      headers: {},
    },
    authEndpoint: "/broadcasting/auth",
    userAuthentication: {
      endpoint: "/broadcasting/user-auth",
      headers: {},
    },
    csrfToken: null,
    bearerToken: null,
    host: null,
    key: null,
    namespace: "App.Events",
  } as const;

  options!: SipOptionsWithDefaults<TBroadcaster>;

  constructor(options: SipOptions<TBroadcaster>) {
    this.setOptions(options);
    this.connect();
  }

  protected setOptions(options: SipOptions<TBroadcaster>): void {
    this.options = {
      ...Connector._defaultOptions,
      ...options,
      broadcaster: options.broadcaster as TBroadcaster,
      key: options.key ?? "",
    } as SipOptionsWithDefaults<TBroadcaster>;

    let token = this.csrfToken();

    if (token) {
      this.options.auth.headers["X-CSRF-TOKEN"] = token;
      this.options.userAuthentication.headers["X-CSRF-TOKEN"] = token;
    }

    token = this.options.bearerToken;

    if (token) {
      this.options.auth.headers.Authorization = `Bearer ${token}`;
      this.options.userAuthentication.headers.Authorization = `Bearer ${token}`;
    }
  }

  protected csrfToken(): string | null {
    if (this.options.csrfToken) {
      return this.options.csrfToken;
    }

    if (
      typeof document !== "undefined" &&
      typeof document.querySelector === "function"
    ) {
      return (
        document
          .querySelector('meta[name="csrf-token"]')
          ?.getAttribute("content") ?? null
      );
    }

    return null;
  }

  abstract connect(): void;

  abstract channel(channel: string): Channel;

  abstract privateChannel(channel: string): Channel;

  abstract presenceChannel(channel: string): PresenceChannel;

  abstract leave(channel: string): void;

  abstract leaveChannel(channel: string): void;

  abstract socketId(): string | undefined;

  abstract disconnect(): void;

  listen(
    _name: string,
    _event: string,
    _callback: (...args: unknown[]) => unknown,
  ): Channel {
    throw new Error("listen method not implemented");
  }

  encryptedPrivateChannel(_name: string): Channel {
    throw new Error("encryptedPrivateChannel method not implemented");
  }
}

