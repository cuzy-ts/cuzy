import { resolve } from "node:path";
import type {
  AppConnectionOptions,
  AppsConfig,
  FizzAppConfig,
  FizzConfig,
  FizzServerConfig,
  RedisServerConfig,
  ScalingConfig,
  ServerOptions,
} from "./types.js";

/**
 * Read an environment variable with an optional default value
 *
 * Uses Bun.env for better performance and Bun-specific environment handling.
 *
 * @param key - The environment variable key
 * @param defaultValue - The default value if the environment variable is not set
 * @returns The environment variable value or the default value
 */
export function env(key: string, defaultValue?: string): string | undefined {
  return Bun.env[key] ?? defaultValue;
}

/**
 * Read an environment variable and parse it as a boolean
 *
 * Handles common boolean string representations:
 * - true: 'true', '1', 'yes', 'on'
 * - false: 'false', '0', 'no', 'off', empty string
 *
 * @param key - The environment variable key
 * @param defaultValue - The default boolean value if the environment variable is not set
 * @returns The parsed boolean value
 */
export function envBool(key: string, defaultValue: boolean): boolean {
  const value = Bun.env[key];
  if (value === undefined || value === "") {
    return defaultValue;
  }
  const normalized = value.toLowerCase().trim();
  return (
    normalized === "true" ||
    normalized === "1" ||
    normalized === "yes" ||
    normalized === "on"
  );
}

/**
 * Read an environment variable and parse it as an integer
 *
 * @param key - The environment variable key
 * @param defaultValue - The default number value if the environment variable is not set
 * @returns The parsed integer value
 */
export function envInt(key: string, defaultValue: number): number {
  const value = Bun.env[key];
  if (value === undefined || value === "") {
    return defaultValue;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Read an environment variable and parse it as an array by splitting on a delimiter
 *
 * @param key - The environment variable key
 * @param delimiter - The delimiter to split the string on (default: ',')
 * @param defaultValue - The default array value if the environment variable is not set
 * @returns The parsed array value
 */
export function envArray(
  key: string,
  delimiter = ",",
  defaultValue: string[] = [],
): string[] {
  const value = Bun.env[key];
  if (value === undefined || value === "") {
    return defaultValue;
  }
  return value
    .split(delimiter)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

/**
 * Load Redis server configuration from environment variables
 *
 * @returns The Redis server configuration
 */
function loadRedisServerConfig(): RedisServerConfig {
  const url = env("REDIS_URL");
  const host = env("REDIS_HOST", "127.0.0.1");
  const port = env("REDIS_PORT", "6379");
  const username = env("REDIS_USERNAME");
  const password = env("REDIS_PASSWORD");
  const database = env("REDIS_DB", "0");
  const timeout = envInt("REDIS_TIMEOUT", 60);

  return {
    ...(url !== undefined ? { url } : {}),
    ...(host !== undefined ? { host } : {}),
    ...(port !== undefined ? { port } : {}),
    ...(username !== undefined ? { username } : {}),
    ...(password !== undefined ? { password } : {}),
    ...(database !== undefined ? { database } : {}),
    ...(timeout !== undefined ? { timeout } : {}),
  };
}

/**
 * Load scaling configuration from environment variables
 *
 * @returns The scaling configuration
 */
function loadScalingConfig(): ScalingConfig {
  const channel = env("FIZZ_SCALING_CHANNEL", "fizz");
  const server = loadRedisServerConfig();

  return {
    enabled: envBool("FIZZ_SCALING_ENABLED", false),
    ...(channel !== undefined ? { channel } : {}),
    ...(Object.keys(server).length > 0 ? { server } : {}),
  };
}

/**
 * Load server options from environment variables
 *
 * @returns The server options
 */
function loadServerOptions(): ServerOptions {
  return {
    tls: {},
  };
}

/**
 * Load Fizz server configuration from environment variables
 *
 * @returns The Fizz server configuration
 */
function loadFizzServerConfig(): FizzServerConfig {
  const path = env("FIZZ_SERVER_PATH", "");
  const hostname = env("FIZZ_HOST");
  const options = loadServerOptions();
  const max_request_size = envInt("FIZZ_MAX_REQUEST_SIZE", 10000);
  const scaling = loadScalingConfig();
  const pulse_ingest_interval = envInt("FIZZ_PULSE_INGEST_INTERVAL", 15);
  const telescope_ingest_interval = envInt(
    "FIZZ_TELESCOPE_INGEST_INTERVAL",
    15,
  );

  return {
    host: env("FIZZ_SERVER_HOST", "127.0.0.1") ?? "127.0.0.1",
    port: envInt("FIZZ_SERVER_PORT", 8080),
    ...(path !== undefined ? { path } : {}),
    ...(hostname !== undefined ? { hostname } : {}),
    ...(options !== undefined ? { options } : {}),
    ...(max_request_size !== undefined ? { max_request_size } : {}),
    ...(scaling !== undefined ? { scaling } : {}),
    ...(pulse_ingest_interval !== undefined ? { pulse_ingest_interval } : {}),
    ...(telescope_ingest_interval !== undefined
      ? { telescope_ingest_interval }
      : {}),
  };
}

/**
 * Load application connection options from environment variables
 *
 * @returns The application connection options
 */
function loadAppConnectionOptions(): AppConnectionOptions {
  const scheme = env("FIZZ_SCHEME", "https") as "http" | "https";
  const host = env("FIZZ_HOST");
  const port = envInt("FIZZ_PORT", 443);
  const useTLS = scheme === "https";

  return {
    ...(host !== undefined ? { host } : {}),
    ...(port !== undefined ? { port } : {}),
    ...(scheme !== undefined ? { scheme } : {}),
    ...(useTLS !== undefined ? { useTLS } : {}),
  };
}

/**
 * Load Fizz application configuration from environment variables
 *
 * @returns The Fizz application configuration
 */
function loadFizzAppConfig(): FizzAppConfig {
  const key = env("FIZZ_APP_KEY");
  const secret = env("FIZZ_APP_SECRET");
  const appId = env("FIZZ_APP_ID");

  if (!key || !secret || !appId) {
    throw new Error(
      "Missing required application credentials. Please set FIZZ_APP_KEY, FIZZ_APP_SECRET, and FIZZ_APP_ID environment variables.",
    );
  }

  const options = loadAppConnectionOptions();
  const allowed_origins = envArray("FIZZ_ALLOWED_ORIGINS", ",", ["*"]);
  const ping_interval = envInt("FIZZ_APP_PING_INTERVAL", 60);
  const activity_timeout = envInt("FIZZ_APP_ACTIVITY_TIMEOUT", 30);
  const max_connections = env("FIZZ_APP_MAX_CONNECTIONS")
    ? envInt("FIZZ_APP_MAX_CONNECTIONS", 0)
    : undefined;
  const max_message_size = envInt("FIZZ_APP_MAX_MESSAGE_SIZE", 10000);

  return {
    key,
    secret,
    app_id: appId,
    ...(Object.keys(options).length > 0 ? { options } : {}),
    ...(allowed_origins !== undefined ? { allowed_origins } : {}),
    ...(ping_interval !== undefined ? { ping_interval } : {}),
    ...(activity_timeout !== undefined ? { activity_timeout } : {}),
    ...(max_connections !== undefined ? { max_connections } : {}),
    ...(max_message_size !== undefined ? { max_message_size } : {}),
  };
}

/**
 * Load applications configuration from environment variables
 *
 * @returns The applications configuration
 */
function loadAppsConfig(): AppsConfig {
  return {
    provider: "config",
    apps: [loadFizzAppConfig()],
  };
}

/**
 * Load the complete Fizz configuration from environment variables or config file
 *
 * This function reads all necessary environment variables and constructs
 * a complete FizzConfig object with sensible defaults matching the Fizz defaults.
 *
 * If a configPath is provided, it will attempt to load and merge that configuration
 * with environment variables (env vars take precedence).
 *
 * Required environment variables:
 * - FIZZ_APP_KEY: Application key for authentication
 * - FIZZ_APP_SECRET: Application secret for authentication
 * - FIZZ_APP_ID: Application ID
 *
 * Optional environment variables (with defaults):
 * - FIZZ_SERVER (default: 'fizz')
 * - FIZZ_SERVER_HOST (default: '127.0.0.1')
 * - FIZZ_SERVER_PORT (default: 8080)
 * - FIZZ_SERVER_PATH (default: '')
 * - FIZZ_HOST (default: undefined)
 * - FIZZ_MAX_REQUEST_SIZE (default: 10000)
 * - FIZZ_SCALING_ENABLED (default: false)
 * - FIZZ_SCALING_CHANNEL (default: 'fizz')
 * - REDIS_URL (default: undefined)
 * - REDIS_HOST (default: '127.0.0.1')
 * - REDIS_PORT (default: '6379')
 * - REDIS_USERNAME (default: undefined)
 * - REDIS_PASSWORD (default: undefined)
 * - REDIS_DB (default: '0')
 * - REDIS_TIMEOUT (default: 60)
 * - FIZZ_PULSE_INGEST_INTERVAL (default: 15)
 * - FIZZ_TELESCOPE_INGEST_INTERVAL (default: 15)
 * - FIZZ_PORT (default: 443)
 * - FIZZ_SCHEME (default: 'https')
 * - FIZZ_APP_PING_INTERVAL (default: 60)
 * - FIZZ_APP_ACTIVITY_TIMEOUT (default: 30)
 * - FIZZ_APP_MAX_CONNECTIONS (default: undefined)
 * - FIZZ_APP_MAX_MESSAGE_SIZE (default: 10000)
 * - FIZZ_ALLOWED_ORIGINS (default: '*', comma-separated)
 *
 * @param configPath - Optional path to a configuration file to load
 * @throws {Error} If required environment variables are not set
 * @returns The complete Fizz configuration
 */
export async function loadConfig(configPath?: string): Promise<FizzConfig> {
  const defaultServer = env("FIZZ_SERVER", "fizz") ?? "fizz";

  // Determine which config file to load
  // Priority: 1. Explicit configPath, 2. ./fizz.config.ts, 3. Environment only
  let fileToLoad = configPath;
  if (!fileToLoad) {
    // Check for default config file in current working directory
    try {
      // Use Bun's file system to check if file exists
      const defaultConfigPath = "./fizz.config.ts";
      const file = Bun.file(defaultConfigPath);
      if (await file.exists()) {
        // Resolve to absolute path for reliable import
        fileToLoad = resolve(process.cwd(), "fizz.config.ts");
      }
    } catch {
      // File doesn't exist, that's fine - we'll use env config only
      fileToLoad = undefined;
    }
  }

  // If a config file path is determined, try to load and merge it
  if (fileToLoad) {
    try {
      // For absolute paths, use file:// protocol for ES module import
      // For relative paths provided by user, use as-is
      const importPath = fileToLoad.startsWith("/")
        ? `file://${fileToLoad}`
        : fileToLoad;
      const fileConfig = await import(importPath);
      const config = fileConfig.default || fileConfig;

      // Build server config from environment (always needed)
      const envServerConfig: FizzConfig = {
        default: defaultServer,
        servers: {
          [defaultServer]: loadFizzServerConfig(),
        },
        apps: {
          provider: "config",
          apps: [],
        },
      };

      // Try to load apps from environment, but don't fail if they're missing
      // when a config file is provided - merge/append instead
      let envApps: FizzAppConfig[] = [];
      try {
        const envAppsConfig = loadAppsConfig();
        envApps = envAppsConfig.apps;
      } catch (_error) {
        // If env vars are missing, that's fine - we'll use config file apps only
        // This allows config-driven deployments without requiring FIZZ_APP_* vars
      }

      // Merge configs - env vars take precedence for servers, but append apps
      return {
        ...config,
        default: envServerConfig.default,
        servers: {
          ...config.servers,
          ...envServerConfig.servers,
        },
        apps: {
          provider: config.apps?.provider ?? envServerConfig.apps.provider,
          apps: [
            ...(config.apps?.apps ?? []),
            ...envApps, // Append env apps after config apps
          ],
        },
      };
    } catch (_error) {
      // If config file doesn't exist or can't be loaded, fall through to env-only config
      console.warn(
        `Warning: Could not load config file at ${fileToLoad}, using environment variables`,
      );
    }
  }

  // No config file or config file failed to load - use environment only
  // Build default config from environment
  const envConfig: FizzConfig = {
    default: defaultServer,
    servers: {
      [defaultServer]: loadFizzServerConfig(),
    },
    apps: loadAppsConfig(),
  };

  return envConfig;
}

