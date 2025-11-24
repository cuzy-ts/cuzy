# Cuzy (Fizz & Sip)

A complete, Bun-powered real-time WebSocket stack implementing the Pusher Protocol (v7).

## Overview

Cuzy provides a high-performance WebSocket server (`@cuzy/fizz`) and a universal client (`@cuzy/sip`) built specifically for the Bun runtime. It offers a modern, type-safe alternative to traditional Node.js WebSocket servers while maintaining compatibility with the industry-standard Pusher Protocol.

## Components

### 🥂 Fizz (`@cuzy/fizz`)
The WebSocket server.
- **Native Performance:** Built directly on `Bun.serve`.
- **Scalable:** Redis Pub/Sub for horizontal scaling.
- **Pusher Compatible:** Works with existing tools.

### 🥤 Sip (`@cuzy/sip`)
The client library.
- **Universal:** Works in browsers and Node/Bun.
- **React Ready:** First-class hooks (`useSip`).
- **Type-Safe:** Full TypeScript support.

## Quick Start

### 1. Install

```bash
# Clone the repository
git clone https://github.com/tomnagengast/cuzy
cd cuzy

# Install dependencies
bun install

# Build packages
bun run build
```

### 2. Run the Demo

```bash
cd apps/demo
bun run dev
```

This starts the Fizz server on port 8080 and the React frontend on port 3000.

## Usage

### Fizz Server

```typescript
import { createServer } from '@cuzy/fizz';

const { server } = await createServer({
  host: "0.0.0.0",
  port: 8080,
  enableEventLogging: true,
});
```

### Sip Client

```typescript
import { Sip } from '@cuzy/sip';

const client = new Sip({
  broadcaster: "fizz",
  key: "my-app-key",
  wsHost: "localhost",
  wsPort: 8080,
});

client.channel("orders").listen("OrderShipped", (e) => {
  console.log(e);
});
```

## Configuration (`fizz.config.ts`)

```typescript
import type { FizzConfig } from "@cuzy/fizz";

export default {
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
        app_id: "my-app-id",
        key: "my-app-key",
        secret: "my-app-secret",
        allowed_origins: ["*"],
      },
    ],
  },
} as FizzConfig;
```

## Environment Variables

- `FIZZ_SERVER_HOST` - Server host
- `FIZZ_SERVER_PORT` - Server port
- `FIZZ_APP_ID` - Application ID
- `FIZZ_APP_KEY` - Application key
- `FIZZ_APP_SECRET` - Application secret

## Project Structure

```
cuzy/
├── apps/
│   └── demo/                  # Example chat application
├── packages/
│   ├── sip/                   # Client library (@cuzy/sip)
│   └── fizz/                  # Server library (@cuzy/fizz)
│       ├── src/
│       └── tests/
```

## API Endpoints

- `GET /up` - Health check
- `POST /apps/{appId}/events` - Trigger event
- `GET /apps/{appId}/channels` - List channels
- `GET /apps/{appId}/connections` - List connections

## License

MIT

