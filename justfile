set shell := ["bash", "-lc"]

client_dir := "client"
server_dir := "server"

# Install dependencies
install:
	cd {{client_dir}} && bun install
	cd {{server_dir}} && bun install

# Start dev servers
dev:
	if command -v mprocs >/dev/null 2>&1; then \
		mprocs \
			"cd {{server_dir}} && bun run dev" \
			"cd {{client_dir}} && bun run dev"; \
	else \
		echo "mprocs not found; falling back to simple background runner" >&2; \
		set -euo pipefail; \
		trap 'trap - INT TERM EXIT; kill 0' INT TERM EXIT; \
		(cd {{server_dir}} && bun run dev) & \
		(cd {{client_dir}} && bun run dev) & \
		wait; \
	fi

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
	cd {{server_dir}} && bun run codegen
	cd {{client_dir}} && bun run codegen

# Reset database (WARNING: deletes all data)
db-reset:
	docker compose down -v
	docker compose up -d postgres

