# @cuzy/fizz

A high-performance, Bun-powered WebSocket server compatible with the Pusher Protocol (v7).

## Features

*   **Native Performance:** Built directly on `Bun.serve` and Bun's native WebSocket implementation for maximum throughput.
*   **Standard Protocol:** Fully compatible with the Pusher Protocol v7, allowing use with existing client libraries like `pusher-js` and `@cuzy/sip`.
*   **Scalable:** Built-in Redis Pub/Sub support for horizontal scaling across multiple nodes.
*   **Type-Safe:** Written in strict TypeScript.

## Installation

```bash
bun add @cuzy/fizz
```

## Usage

### CLI

Start the server using the CLI:

```bash
bunx fizz start
```

Options:
*   `--host`: Host to bind to (default: 0.0.0.0)
*   `--port`: Port to listen on (default: 8080)
*   `--debug`: Enable debug logging

### Programmatic Usage

```typescript
import { createServer } from "@cuzy/fizz";

const { server } = await createServer({
  host: "0.0.0.0",
  port: 8080,
  enableEventLogging: true,
});

console.log(`Server running on ${server.port}`);
```

## Configuration

Create a `fizz.config.ts` in your project root:

```typescript
import type { FizzConfig } from "@cuzy/fizz";

const config: FizzConfig = {
  default: "fizz",
  servers: {
    fizz: {
      host: "0.0.0.0",
      port: 8080,
    },
  },
  apps: {
    provider: "config",
    apps: [
      {
        app_id: "my-app",
        key: "my-key",
        secret: "my-secret",
        allowed_origins: ["*"],
      },
    ],
  },
};

export default config;
```

## License

MIT

