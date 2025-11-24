# Plan: Finish Fizz Package Porting

## Metadata

prompt: `read @specs/2025-11-18-port-pairity.md and @.claude/commands/plan.md and the write a spec to finish the fizz package porting`
task_type: feature
complexity: medium

## Task Description

Complete the porting of the `fizz` server package by implementing the missing horizontal scaling and distributed features found in Laravel Fizz. This primarily involves wiring up the existing but unused Redis Pub/Sub components to enable event fan-out, distributed metrics, and cross-node connection termination.

## Objective

Update the `fizz` package so that when `scaling.enabled` is true, the server connects to Redis, subscribes to the configured channel, propagates events across nodes, and aggregates metrics/termination requests globally.

## Problem Statement

Currently, `fizz` operates strictly as a single-node WebSocket server. While the configuration structures for scaling exist (`FizzServerConfig.scaling`) and the low-level Redis components (`RedisPubSubProvider`) have been ported, they are never instantiated or used in the server factory. As a result:
- Events are only dispatched locally.
- Metrics only reflect the current node.
- Terminating a user's connections only works if they are connected to the current node.

## Solution Approach

The solution involves modifying the server initialization flow (`Factory` and `createServer`) to:
1. Check `config.scaling.enabled`.
2. Instantiate `RedisPubSubProvider` if enabled.
3. Inject this provider into the `EventDispatcher`, `MetricsHandler`, and `UsersTerminateController`.
4. Start the subscription loop to feed incoming Redis messages into the `PusherPubSubIncomingMessageHandler`.

## Relevant Files

- `packages/fizz/src/servers/fizz/factory.ts`: Main entry point for wiring components.
- `packages/fizz/src/event-dispatcher.ts`: Needs logic to publish events via Pub/Sub.
- `packages/fizz/src/protocols/pusher/metrics-handler.ts`: Needs Pub/Sub injection for distributed metrics.
- `packages/fizz/src/protocols/pusher/http/controllers/users-terminate-controller.ts`: Needs Pub/Sub injection for distributed termination.
- `packages/fizz/src/servers/fizz/server-provider.ts`: Needs to reflect scaling status.
- `packages/fizz/src/core/server.ts`: Verify interface compatibility for new dependencies.

## Implementation Phases

### Phase 1: Foundation & Wiring
Initialize the Redis components in the Factory when configuration demands it. Ensure the dependencies are available to the core system.

### Phase 2: Core Logic Updates
Update the Dispatcher, Metrics, and Controllers to utilize the now-available `PubSubProvider`.

### Phase 3: Incoming Message Handling
Ensure the server actually listens to the Redis channel and processes incoming messages from other nodes.

## Step by Step Tasks

### 1. Update Server Provider
- Modify `packages/fizz/src/servers/fizz/server-provider.ts` to accept a `PubSubProvider` in its constructor (or via a setter) and return `true` for `subscribesToEvents()` if a valid provider is present.
- Ensure `publish(payload: any)` delegates to the `PubSubProvider`.

### 2. Initialize Redis in Factory
- In `packages/fizz/src/servers/fizz/factory.ts`, inside `make()`:
  - Check if `config.scaling.enabled` is true.
  - If true, instantiate `RedisPubSubProvider` using `config.scaling`.
  - Pass this provider to the `ServerProvider`.
  - Create `PusherPubSubIncomingMessageHandler`.
  - Setup the subscription loop: `provider.subscribe(channel, (msg) => handler.handle(msg))`.

### 3. Wire Event Dispatcher for Scaling
- In `packages/fizz/src/event-dispatcher.ts`:
  - Update `dispatch()` to check if the `server` (via `ServerProvider`) `subscribesToEvents()`.
  - If it does, call `server.publish(payload)` instead of/in addition to `dispatchSynchronously` (depending on Fizz logic logic—usually dispatching to Redis means *other* nodes pick it up, and the local node handles it via the loop back or direct local dispatch. NOTE: Fizz usually publishes to Redis, and the Redis message coming back triggers the local broadcast to avoid duplicates, OR it broadcasts locally and publishes remote. I need to check `PusherPubSubIncomingMessageHandler` implementation to see if it handles local sip suppression or if we should broadcast locally + publish).
  - *Self-correction*: Fizz's `EventDispatcher` in PHP: if `pubSub` is active, it calls `broadcast` (which publishes). If not, it calls `dispatchSynchronously`.

### 4. Enable Distributed Metrics
- In `packages/fizz/src/servers/fizz/factory.ts`:
  - Pass the initialized `PubSubProvider` to `MetricsHandler` constructor.
- Verify `packages/fizz/src/protocols/pusher/metrics-handler.ts` uses the provider to broadcast metrics requests if present.

### 5. Enable Distributed Connection Termination
- In `packages/fizz/src/servers/fizz/factory.ts`:
  - Pass the initialized `PubSubProvider` to `UsersTerminateController`.
- Verify `packages/fizz/src/protocols/pusher/http/controllers/users-terminate-controller.ts` uses the provider to publish termination commands.

### 6. Validate & Cleanup
- Ensure the server starts up correctly with and without scaling enabled.
- Verify no regressions in existing tests.

## Testing Strategy

- **Unit Tests**: Create new tests in `packages/fizz/tests` that mock `RedisPubSubProvider` and verify that `EventDispatcher` calls `publish` when scaling is enabled.
- **Integration Check**: Run the existing test suite `bun test` to ensure single-node functionality remains broken.

## Acceptance Criteria

- `Factory.make` instantiates `RedisPubSubProvider` when scaling is enabled.
- `EventDispatcher` publishes events to Redis when scaling is enabled.
- `MetricsHandler` and `UsersTerminateController` receive the Pub/Sub provider.
- Code compiles with no lint errors.

## Validation Commands

- `bun run build` in `packages/fizz`
- `bun test` in `packages/fizz`

