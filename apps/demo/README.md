# Fizz Demo Chat App

A real-time chat application demonstrating Fizz WebSocket server integration with React.

## Quick Start

```bash
# Install dependencies
bun install

# Start both Fizz WebSocket server and frontend dev server
bun run dev
```

The command starts:
- **Fizz WebSocket server** on `ws://0.0.0.0:8080`
- **Frontend dev server** with hot module reloading

Open the URL shown in the console (typically `http://localhost:3000`) to access the chat app.

## What This Demo Shows

This demo showcases:

1. **Embedding Fizz** - How to use `createServer()` to start Fizz programmatically
2. **@cuzy/sip Integration** - Direct usage of `@cuzy/sip/react` hooks
3. **Private Channel Authentication** - Implementing the `/broadcasting/auth` endpoint
4. **Client Events** - Sending messages between connected clients

## Key Integration Points

### Starting Fizz

```typescript
import { createServer } from '@cuzy/fizz';

const { server, shutdown } = await createServer({
  config: {
    // ... configuration
  },
});
```

### Using Sip in React

```typescript
import { configureSip, useSip } from '@cuzy/sip/react';

// Configure once
configureSip({
  broadcaster: 'fizz',
  key: 'my-app-key',
  wsHost: 'localhost',
  wsPort: 8080,
  // ...
});

// Subscribe to channels
useSip('private-chat', 'client-message', handleMessage, []);
```

## Environment Variables

The demo uses these environment variables (all optional):

- `BUN_PUBLIC_FIZZ_HOST` - Server host (default: localhost)
- `BUN_PUBLIC_FIZZ_PORT` - Server port (default: 8080)
- `BUN_PUBLIC_FIZZ_SCHEME` - http or https (default: http)
- `BUN_PUBLIC_FIZZ_APP_KEY` - Application key (default: my-app-key)

## Features

- Real-time chat with multiple channels
- Connection status tracking
- Auto-reconnection handling
- Message history persistence
- Clean, focused implementation showcasing Fizz

