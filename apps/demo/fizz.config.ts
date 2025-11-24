import type { FizzConfig } from "@cuzy/fizz";

export default {
  default: "fizz",
  servers: {
    fizz: {
      host: "0.0.0.0",
      port: Bun.env.FIZZ_PORT ?? 8080,
    },
  },
  apps: {
    provider: "config",
    apps: [
      {
        app_id: Bun.env.BUN_PUBLIC_FIZZ_APP_ID ?? "my-app-id",
        key: Bun.env.BUN_PUBLIC_FIZZ_APP_KEY ?? "my-app-key",
        secret: Bun.env.BUN_PUBLIC_FIZZ_APP_SECRET ?? "my-app-secret",
        allowed_origins: ["*"],
      },
    ],
  },
} as FizzConfig;

