# Sip Client

`@cuzy/sip` is a universal WebSocket client for the Bun runtime, compatible with the Pusher Protocol (v7). It provides a fluent API for subscribing to channels and listening for events broadcast by your server-side application.

## Installation

```bash
bun add @cuzy/sip pusher-js
```

## Basic Usage

### Configuration

To get started, import `Sip` and configure it with your broadcaster settings:

```typescript
import Sip from "@cuzy/sip";
import Pusher from "pusher-js";

// Configure Sip
const client = new Sip({
  broadcaster: "fizz",
  key: "your-app-key",
  wsHost: "localhost",
  wsPort: 8080,
  forceTLS: false,
  enabledTransports: ["ws", "wss"],
  Pusher: Pusher, // Inject the Pusher client
});
```

### Subscribing to Channels

Once configured, you can listen for events:

```typescript
client.channel("orders")
  .listen("OrderShipped", (e) => {
    console.log("Order shipped:", e.order);
  });
```

### Private Channels

```typescript
client.private("orders.1")
  .listen("OrderShipped", (e) => {
    console.log(e.order);
  });
```

### Presence Channels

```typescript
client.join("chat")
  .here((users) => {
    console.log("Users here:", users);
  })
  .joining((user) => {
    console.log("User joined:", user);
  })
  .leaving((user) => {
    console.log("User left:", user);
  });
```

## React Integration

`@cuzy/sip` ships with first-class React hooks.

```bash
bun add @cuzy/sip react
```

### Setup

Configure Sip globally using `configureSip`. This is typically done in your app entry point.

```typescript
import { configureSip } from "@cuzy/sip/react";
import Pusher from "pusher-js";

configureSip({
  broadcaster: "fizz",
  key: "your-app-key",
  wsHost: "localhost",
  wsPort: 8080,
  forceTLS: false,
  Pusher: Pusher,
});
```

### Hooks

Use the `useSip` hook to subscribe to channels in your components.

```tsx
import { useSip } from "@cuzy/sip/react";

function OrderStatus({ orderId }) {
  useSip(`orders.${orderId}`, "OrderShipped", (event) => {
    console.log("Order updated:", event);
  });

  return <div>Listening for updates...</div>;
}
```

For presence channels, use `useSipPresence`:

```tsx
import { useSipPresence } from "@cuzy/sip/react";

function ChatRoom() {
  const { users, here, joining, leaving } = useSipPresence("chat");

  // users is a reactive state of current users
  
  return (
    <ul>
      {users.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
}
```

## Interceptors & X-Socket-Id

By default, Sip will attempt to register interceptors for popular HTTP clients (Axios, Vue, jQuery, Turbo) to attach the `X-Socket-Id` header to outgoing requests. This is required for broadcasting to "others" (excluding the current user).

If you are running in a non-browser environment or wish to disable this behavior, pass `withoutInterceptors: true`:

```typescript
const client = new Sip({
  broadcaster: "fizz",
  // ...
  withoutInterceptors: true,
});
```

## Broadcasters

### Fizz / Pusher

Sip is designed to work seamlessly with Fizz and other Pusher-compatible servers.

### Socket.IO

To use Socket.IO, install the client:

```bash
bun add socket.io-client
```

And configure Sip:

```typescript
import io from "socket.io-client";

const client = new Sip({
  broadcaster: "socket.io",
  host: "http://localhost:6001",
  client: io,
});
```

### Null

For testing or fallback:

```typescript
const client = new Sip({
  broadcaster: "null",
});
```

