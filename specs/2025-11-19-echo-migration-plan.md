# Sip Migration Plan (Laravel Sip → `@fizz/sip`)

Date: 2025-11-19  
Scope: `_source/sip` → `packages/sip` (core + React)

## 1. Background & Goals

- Fizz follows **"Architectural Parity, Syntactical Idiom"** (see `docs/contributing.md`).
- `_source/sip` contains the upstream `laravel-sip` + React packages.
- `packages/sip` is a Bun/TS port that:
  - Implements a slimmer `Sip` client focused on **fizz/pusher** via `PusherConnector`.
  - Ships React helpers in `packages/sip/src/react/**`.
  - Still depends on `laravel-sip` for its React types/config and some behaviours.
- **Goal:** Fully migrate the upstream Sip packages into `packages/sip`, so that:
  - `@fizz/sip` is the single source of truth for Sip client behaviour.
  - We preserve architectural parity with upstream while adopting Bun/TS idioms.
  - We can drop the runtime dependency on `laravel-sip` for web consumers.

Non-goals for this migration:

- Supporting PHP/Laravel-specific concepts (Artisan, service providers) inside the Sip client.
- Re-introducing any Laravel-specific coupling that does not make sense for a generic Bun/TS client.

## 2. Current State Summary

### 2.1 `_source/sip` (upstream)

- `packages/laravel-sip`:
  - `Sip` class:
    - Supports broadcasters: `"fizz"`, `"pusher"`, `"ably"`, `"socket.io"`, `"null"`, and custom constructor-based connectors.
    - Registers interceptors (Axios, Vue HTTP, jQuery, Turbo) to attach `X-Socket-Id`.
  - Connectors:
    - `PusherConnector` (Pusher/Fizz/Ably).
    - `SocketIoConnector` (socket.io-client).
    - `NullConnector` (no-op, fake socket id).
  - Channels:
    - Pusher channels (`Channel`, private, presence, encrypted).
    - Socket.io channels (public/private/presence).
    - Null channels (public/private/presence/encrypted).
  - Utilities:
    - `EventFormatter`, `isConstructor`, broadcast driver types (`Broadcaster`, `BroadcastDriver`, `SipOptions`, etc.).

- `packages/react`:
  - `configureSip` sets sensible defaults from `import.meta.env` for all broadcasters.
  - `useSip`, `useSipNotification`, `useSipPresence`, `useSipPublic`, `useSipModel`.
  - Types reference the upstream `laravel-sip` types and `Broadcaster` mapping.

### 2.2 `packages/sip` (Bun-focused port)

- Core (`packages/sip/src`):
  - `Sip` implementation:
    - Only recognises `"fizz"` and `"pusher"` broadcasters.
    - Always uses `PusherConnector` (no socket.io, ably, or null connectors).
    - Does not register any HTTP interceptors for `X-Socket-Id`.
  - `Connector` + `PusherConnector`:
    - Largely aligned with upstream Pusher connector behaviour.
    - `Connector` has reduced generics and uses local `SipOptions` / `SipOptionsWithDefaults`.
  - Channels:
    - Pusher channels and presence/private/encrypted variants.
    - Null channel variants exist but there is no socket.io implementation.
  - Types:
    - Local `BroadcastDriver = "pusher" | "fizz"`.
    - `SipOptions` is a simplified, broader type compared to upstream.

- React (`packages/sip/src/react`):
  - `configureSip` / `sip`:
    - Still imports `Sip`, `BroadcastDriver`, `SipOptions` from **upstream `laravel-sip`**.
    - Defaults for `fizz` and `pusher` are inlined and driven by the caller (demo app sets config explicitly).
  - Hooks & types:
    - `useSip` and friends are effectively a port of upstream React hooks.
    - Types (`Connection`, `ChannelReturnType`, etc.) import `BroadcastDriver` and `Broadcaster` from **`laravel-sip`**, not local types.

- Demo app (`apps/demo`):
  - Uses `@fizz/sip/react`:
    - Calls `configureSip({ broadcaster: "fizz", ... })` with runtime config injected via script tag.
    - Uses `useSip` for a `private-${channel}` stream and raw `pusher.send_event` for client events.
  - Relies only on the `"fizz"` + Pusher path; does not exercise socket.io/ably/null.

## 3. Migration Principles

- **Parity-first:** Mirror upstream Sip + React behaviour and public API, especially:
  - Broadcaster names and options shape.
  - Channel methods (`listen`, `listenForWhisper`, `notification`, `here`, `joining`, `leaving`, `whisper`, etc.).
  - Connector responsibilities and option handling.
- **Idiom-aware:**
  - Keep code idiomatic TypeScript and compatible with Bun bundling.
  - Avoid leaking browser-only globals into server contexts; guard those behaviours.
- **Incremental & non-breaking:**
  - Maintain the current behaviour for `"fizz"` and `"pusher"` during migration.
  - Keep `apps/demo` working throughout.
  - Only remove the `laravel-sip` dependency after local types and behaviour are validated.

## 4. Detailed Migration Plan

### Phase 0 – Baseline & Test Harness

1. Mirror upstream tests:
   - Copy/port relevant tests from `_source/sip/packages/laravel-sip/tests` and `_source/sip/packages/react/tests` into `packages/sip/tests`.
   - Focus first on:
     - `Sip` constructor behaviour and connector selection.
     - Channel subscription / unsubscription behaviour.
     - `EventFormatter` formatting rules.
     - React hooks subscription lifecycle (`useSip`, `useSipNotification`, presence/public/model variants).
2. Configure Bun test runner:
   - Ensure `packages/sip` `bun test` can run a subset of ported tests with minimal polyfills (e.g. fake Pusher/socket.io clients, simple DOM shims where needed).
3. Establish a parity matrix:
   - Document which upstream features are considered **must-have** for Fizz:
     - `fizz`/`pusher`/`null` broadcasters: required.
     - `socket.io`: optional but nice to have for broader compatibility.
     - `ably`: optional; can be implemented later on top of Pusher-style semantics.

### Phase 1 – Core Sip Class & Types

1. Introduce local `Broadcaster`/`BroadcastDriver`/`SipOptions` types:
   - Port the upstream type definitions into `packages/sip/src/types.ts`:
     - `BroadcastDriver` union covering all supported drivers.
     - `Broadcaster` mapped type describing connector, channel types, and options per driver.
     - Driver-specific option types (e.g. `PusherOptions`, socket.io options) where needed.
   - Update the local `Sip` class to use these types instead of the current simplified `BroadcastDriver`/`SipOptions`.
2. Align `Sip` class logic:
   - Update `packages/sip/src/sip.ts` to mirror `_source/sip/packages/laravel-sip/src/sip.ts`:
     - Support `"fizz"`, `"pusher"`, `"ably"`, `"socket.io"`, `"null"`, and constructor-based broadcasters.
     - For `"fizz"` and `"ably"`, construct `PusherConnector` with appropriate option mapping (cluster, broadcaster override).
     - For `"null"`, use a new `NullConnector` implementation (Phase 2).
   - Preserve the ability to disable interceptors via `withoutInterceptors`, but:
     - Default to `withoutInterceptors: true` for Fizz (browser consumers can opt-in later).
3. Socket id & interceptors wiring:
   - Implement `registerInterceptors` in the local `Sip` class, but:
     - Guard usages of `axios`, `Vue`, `jQuery`, and `Turbo` behind type-safe runtime checks.
     - Keep the code tree-shakable by colocating interceptors in a separate module if necessary.

### Phase 2 – Channels & Connectors

1. Channels:
   - Review the existing Pusher channel implementations in `packages/sip/src/channel/**` and reconcile with upstream:
     - Ensure method names and behaviours match (`listen`, `listenToAll`, `subscribed`, `error`, whisper helpers, notification helpers).
     - Confirm presence channel interface parity (here/joining/leaving/whisper).
   - Implement missing channel classes:
     - `SocketIoChannel`, `SocketIoPrivateChannel`, `SocketIoPresenceChannel`.
     - `NullEncryptedPrivateChannel` if not already present to fully match upstream null behaviour.
   - Align exports with upstream:
     - Ensure `packages/sip/src/channel/index.ts` exports the same set of channel types as upstream.
2. Connectors:
   - Port `NullConnector` into `packages/sip/src/connector/null-connector.ts`:
     - No-op connect/leave/disconnect, but returns proper Null channel instances and a stable fake socket id.
   - Port `SocketIoConnector` into `packages/sip/src/connector/socketio-connector.ts`:
     - Accept socket.io client via `options.client` or global `window.io`.
     - Mirror reconnection semantics and channel resubscription logic.
   - Update `packages/sip/src/connector/index.ts` to export new connectors.
   - Ensure the base `Connector` remains environment-safe:
     - CSRF token extraction logic aligns with upstream but checks for `window`/`document` existence.

### Phase 3 – React Package: Remove `laravel-sip` Runtime Dependency

1. Types:
   - Update `packages/sip/src/react/types.ts` to import `BroadcastDriver`, `Broadcaster` and related types from **local** `packages/sip/src/types` instead of `laravel-sip`.
   - Keep the API surface identical so React consumers see no type-level breaking changes.
2. Config:
   - Update `packages/sip/src/react/config/index.ts`:
     - Import the local `Sip` class and types from `@fizz/sip` instead of `laravel-sip`.
     - Keep the current demo-friendly `configureSip` signature, but:
       - Support optional `ConfigDefaults` mapping similar to upstream (using explicit config rather than `import.meta.env`).
       - Factor out the defaults so other apps can opt into environment-based defaults later.
     - Continue to inject `Pusher` constructor into the config (`sipConfig.Pusher ??= Pusher`), but use local types.
3. Hooks:
   - Compare `packages/sip/src/react/hooks/use-sip.ts` with `_source/sip/packages/react/src/hooks/use-sip.ts` and:
     - Ensure the subscription reference counting, `leaveChannel` semantics, and re-subscription behaviour are the same.
     - Replace any residual `any[]` or loose typing with strict, local types, aligned with repo standards.
4. Demo app verification:
   - Point `apps/demo` at the updated `@fizz/sip/react` without `laravel-sip` in the dependency graph.
   - Verify:
     - Connection lifecycle status updates.
     - Private channel subscription.
     - Client events via `pusher.send_event`.

### Phase 4 – Interceptors & X-Socket-Id (Optional but Parity-Oriented)

1. Strategy:
   - Decide on a default stance:
     - Option A: Keep interceptors disabled by default, but fully implement them behind `withoutInterceptors: false`.
     - Option B: Extract interceptors into a separate small helper (`@fizz/sip/interceptors`) that can be opt-in imported.
2. Implementation:
   - Port the upstream interceptor logic into a dedicated module:
     - `registerAxiosInterceptor`, `registerVueInterceptor`, `registerJQueryInterceptor`, `registerTurboInterceptor`.
     - Each helper takes an `Sip` instance (or function to get `socketId`) instead of importing it directly.
   - Have `Sip.registerInterceptors()` call these helpers conditionally, matching upstream semantics but keeping the code tree-shakable.
3. Documentation:
   - Clearly document how to enable interceptors in browser apps, and how they interact with Laravel backends expecting `X-Socket-Id`.

### Phase 5 – Packaging & Dependency Cleanup

1. Package dependencies:
   - Remove `laravel-sip` from `packages/sip/package.json` dependencies once:
     - Local `Sip` and types are complete.
     - React hooks/types are using local definitions.
   - Keep `pusher-js` as a dependency for now; consider making it a peer dependency later if needed.
   - Add optional peer dependency for `socket.io-client` if/when `SocketIoConnector` is enabled.
2. Build pipeline:
   - Ensure `bun build` still produces:
     - ESM bundles for core (`dist/index.js`) and React (`dist/react/index.js`).
     - Type declarations via `tsc`.
   - Verify tree-shaking friendliness:
     - Interceptors and optional connectors should not bloat bundles if unused.
3. Versioning & release:
   - Bump `@fizz/sip` minor version (e.g. `0.2.x`) for the fully local Sip implementation.
   - Note in the changelog that `laravel-sip` is no longer required at runtime.

### Phase 6 – Tests, Docs & Examples

1. Tests:
   - Expand test coverage to include:
     - All drivers we support (`fizz`, `pusher`, `null`, and optionally `socket.io`).
     - React hooks lifecycle under mount/unmount, dependency changes, and multiple subscribers.
   - Add lightweight tests for interceptors (can be smoke-style with simple mocks).
2. Documentation:
   - Add or update docs for Sip usage:
     - Basic setup with `configureSip` and `useSip`.
     - Multi-driver configuration with `fizz`, `pusher`, `null`, and optional `socket.io`.
     - Interceptors and `X-Socket-Id` behaviour (if implemented).
   - Cross-link from `docs/contributing.md` to this migration plan as the reference for Sip parity work.
3. Examples:
   - Extend `apps/demo` or add a new example to showcase:
     - Presence channels.
     - Notifications and `useSipNotification`.
     - Public channels and `useSipPublic`.

## 5. Open Questions

- Do we want first-class support for `socket.io` and `ably` in Fizz v1, or is `"fizz" + "pusher" + "null"` sufficient for the initial release?
- Should interceptors live:
  - Inside the main `Sip` bundle (parity, simpler), or
  - In a separate opt-in module (`@fizz/sip/interceptors`) to keep the default bundle minimal?
- What minimum browser/Node/Bun environments do we target for Sip, and how aggressively should we guard global usages (`window`, `document`, `Vue`, `axios`, `jQuery`, `Turbo`)?

