# Publishing to JSR

This document outlines the steps to publish the `@cuzy/sip` (Client) and `@cuzy/fizz` (Server) packages to the [JSR registry](https://jsr.io).

## Prerequisites

1.  **JSR Account**: Ensure you have an account on [jsr.io](https://jsr.io).
2.  **Scope Creation**: Create the scope `@cuzy` in your JSR account settings if it doesn't already exist.
3.  **Authentication**: Login to JSR via the command line:
    ```bash
    bunx jsr login
    ```

## 1. Publishing `@cuzy/sip` (Client)

Located in `packages/sip`.

### Configuration

The `jsr.json` is configured as:

```json
{
  "name": "@cuzy/sip",
  "version": "0.2.0",
  "exports": {
    ".": "./src/index.ts",
    "./react": "./src/react/index.ts"
  }
}
```

### Publishing

Run the publish command from the `packages/sip` directory:

```bash
cd packages/sip
bunx jsr publish
```

## 2. Publishing `@cuzy/fizz` (Server)

Located in `packages/fizz`.

### Configuration

The `jsr.json` is configured as:

```json
{
  "name": "@cuzy/fizz",
  "version": "0.1.0",
  "exports": {
    ".": "./src/index.ts",
    "./cli": "./src/cli.ts"
  }
}
```

### Publishing

Run the publish command from the `packages/fizz` directory:

```bash
cd packages/fizz
bunx jsr publish
```

## CI/CD Automation (Optional)

To publish automatically via GitHub Actions:

1.  Go to the package settings on jsr.io (e.g., `jsr.io/@cuzy/sip/settings`).
2.  Link your GitHub repository.
3.  Add the `.github/workflows/publish.yml` (JSR will provide a snippet).

## Version Management

Before publishing updates:
1.  Bump the version in `jsr.json` (and `package.json` to keep them in sync).
2.  Run `bunx jsr publish`.

