set shell := ["bash", "-lc"]

client_dir := "client"
server_dir := "server"

# Install dependencies
install:
	cd {{client_dir}} && bun install
	cd {{server_dir}} && bun install

# Start dev servers (Docker Compose + client + server)
dev:
	@echo "Starting Docker Compose services..."
	@docker compose up -d
	@echo "Waiting for services to be ready..."
	@sleep 2
	mprocs \
		"docker compose logs -f" \
		"cd {{server_dir}} && bun run dev" \
		"cd {{client_dir}} && bun run dev"

# Build both packages
build:
	cd {{client_dir}} && bun run build
	cd {{server_dir}} && bun run build

# Serve both packages
start:
	#!/usr/bin/env bash
	set -euo pipefail
	trap 'trap - INT TERM EXIT; kill 0' INT TERM EXIT
	(cd {{server_dir}} && bun run start) &
	(cd {{client_dir}} && bun run start) &
	wait

lint:
	cd {{client_dir}} && bun run lint
	cd {{server_dir}} && bun run lint

# Generate GraphQL types
codegen:
	@echo "Fetching OpenAPI spec from shogi-ai..."
	curl -s http://localhost:8000/openapi.json | jq '.' > shogi-ai/openapi.json
	@echo "Saved to shogi-ai/openapi.json"
	cd {{server_dir}} && bun run codegen
	cd {{client_dir}} && bun run codegen

# Run database migrations
migrate:
	cd {{server_dir}} && bunx prisma migrate dev

# Reset Docker database (WARNING: deletes all data)
reset:
	docker compose down -v
	docker compose up -d
