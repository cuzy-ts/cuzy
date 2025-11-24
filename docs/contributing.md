# Contributing to Cuzy

This document outlines the development philosophy, architecture decisions, and coding standards for the Cuzy monorepo (Fizz & Sip).

## Philosophy

**"Native Performance, Standard Protocols"**

Cuzy is a suite of real-time tools built specifically for the **Bun** runtime. Our goal is to provide the fastest, most developer-friendly WebSocket stack in the JavaScript ecosystem by leveraging Bun's native capabilities.

### Core Tenets

1.  **Bun-First:** We do not support Node.js. We leverage `Bun.serve`, `Bun.file`, and `Bun.env` directly. This avoids polyfill bloat and maximizes I/O throughput.
2.  **Protocol Compliance:** We adhere strictly to the **Pusher Protocol (v7)**. This ensures compatibility with a massive ecosystem of existing libraries, debuggers, and tools, without locking users into a proprietary protocol.
3.  **Type Safety:** Everything is written in TypeScript with strict mode enabled. We prefer explicit interfaces over loose typing.
4.  **Zero Dependencies (Client):** The `@cuzy/sip` client should be lightweight. We wrap `pusher-js` for protocol compatibility but aim to keep the footprint minimal.

## Architecture

### Fizz (Server)
Fizz is the WebSocket server.
*   **Entry Point:** `src/servers/fizz/factory.ts` wires up the Bun server.
*   **Managers:** We use the Manager pattern (e.g., `ChannelManager`) to handle state.
*   **Scalability:** Supports Redis Pub/Sub for horizontal scaling across multiple nodes.

### Sip (Client)
Sip is the client library.
*   **Connector Pattern:** Abstract connectors allow swapping underlying transports (though we focus on Pusher protocol).
*   **React Hooks:** First-class support for React via `@cuzy/sip/react`.

## Coding Standards

### 1. Naming Conventions
*   **Classes:** PascalCase (e.g., `ChannelManager`).
*   **Methods/Variables:** camelCase (e.g., `broadcastEvent`).
*   **Private Fields:** We prefer TypeScript `private` keywords over `#` syntax for better tooling support, unless runtime privacy is strictly required.

### 2. React Patterns
*   **Hooks:** Encapsulate logic in custom hooks (e.g., `useSip`).
*   **Context:** Use Context for global connection state to avoid prop drilling.

### 3. Path Aliases
Use the configured path aliases:
*   `@/*` maps to `./src/*`

### 4. Testing
*   **Test Runner:** We use `bun test`.
*   **Philosophy:** Test behavior, not implementation details. Use E2E tests for connection flows.

## Workflow

1.  **Analyze:** Understand the feature requirement.
2.  **Plan:** Map the TypeScript structure.
3.  **Implement:** Write code using Bun idioms.
4.  **Verify:** Write tests (`bun test`).

