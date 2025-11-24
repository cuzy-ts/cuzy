# @cuzy/sip

A universal, type-safe WebSocket client for Fizz, compatible with the Pusher Protocol (v7).

## Features

*   **Universal Protocol:** Works with any server implementing the Pusher Protocol (Fizz, Pusher, Soketi).
*   **Type-Safe:** Full TypeScript support.
*   **Lightweight:** Minimal overhead.
*   **React Ready:** Includes first-class hooks for React applications.

## Installation

```bash
bun add @cuzy/sip pusher-js
```

## Usage

### Basic Usage

```ts
import { Sip } from "@cuzy/sip";

const client = new Sip({
  broadcaster: "fizz",
  key: "your-app-key",
  wsHost: "localhost",
  wsPort: 8080,
  forceTLS: false,
});

client.channel("orders")
  .listen("OrderShipped", (e) => {
    console.log(e.order.name);
  });
```

### Interceptors

`@cuzy/sip` can automatically attach the `X-Socket-Id` header to outgoing HTTP requests for Axios, Vue, jQuery, and Turbo. This is useful for authorizing private channels.

## React Hooks

We provide a dedicated React package for easy integration.

```bash
bun add @cuzy/sip
```

### Configuration

Configure Sip once at the root of your app:

```tsx
// src/main.tsx
import { configureSip } from "@cuzy/sip/react";

configureSip({
  broadcaster: "fizz",
  key: "your-app-key",
  wsHost: "localhost",
  wsPort: 8080,
});
```

### Hooks

#### `useSip`

Listen to private channels and events.

```tsx
import { useSip } from "@cuzy/sip/react";

function OrderTracker({ orderId }) {
  useSip(
    `orders.${orderId}`, 
    "OrderShipped", 
    (event) => {
      console.log("Shipped!", event);
    },
    [orderId]
  );

  return <div>Tracking Order {orderId}</div>;
}
```

#### `useSipPresence`

Join presence channels.

```tsx
import { useSipPresence } from "@cuzy/sip/react";

function Room({ roomId }) {
  useSipPresence(
    `chat.${roomId}`,
    "here",
    (users) => {
      console.log("Users here:", users);
    }
  );
  
  // ...
}
```

## License

MIT

