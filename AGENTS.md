# AGENTS.md

This file provides context for AI agents working on the Cuzy repository.

## Project Identity
**Cuzy** is a real-time WebSocket stack built for the **Bun** runtime.
*   **Fizz:** The high-performance WebSocket server.
*   **Sip:** The TypeScript client library.

## Context & Constraints

- **Runtime:** **Bun Only**. Do not suggest Node.js solutions. Use `Bun.serve`, `Bun.write`, `Bun.env`.
- **Protocol:** Implements the **Pusher Protocol (v7)**.
- **Language:** TypeScript (Strict).
- **Formatting:** Biome.

## Directory Structure
- `apps/demo`: A reference React application demonstrating Fizz & Sip.
- `packages/fizz`: The server package.
- `packages/sip`: The client package.

## Key Commands
- `bun run dev`: Start development mode.
- `bun run build`: Build all packages.
- `bun test`: Run the test suite.

## Interaction Guidelines
- Be concise.
- Prefer Bun native APIs over Node.js compatibility layers (e.g., use `Bun.file()` instead of `fs.readFile()`).
- When modifying the server, ensure it remains compatible with the Pusher protocol spec.

