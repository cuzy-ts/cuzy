#!/usr/bin/env bash

# Test script for starting the Fizz server
# This will start the server and make a health check request

export FIZZ_APP_KEY=test-app-key
export FIZZ_APP_SECRET=test-app-secret
export FIZZ_APP_ID=test-app-id
export FIZZ_SERVER_HOST=127.0.0.1
export FIZZ_SERVER_PORT=8081
export FIZZ_HOST=localhost
export FIZZ_PORT=8081
export FIZZ_SCHEME=http
export FIZZ_ALLOWED_ORIGINS=*

echo "Starting Fizz server..."
echo "Environment configured:"
echo "  Host: $FIZZ_SERVER_HOST"
echo "  Port: $FIZZ_SERVER_PORT"
echo ""

# Start server in background
timeout 5s bun run packages/fizz/src/cli.ts start &
SERVER_PID=$!

# Wait for server to start
sleep 2

# Make health check request
echo "Testing health check endpoint..."
curl -s http://127.0.0.1:8081/up || echo "Health check failed"

# Stop server
kill $SERVER_PID 2>/dev/null || true

echo ""
echo "Test complete"

