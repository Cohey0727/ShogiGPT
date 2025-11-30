set shell := ["bash", "-lc"]

client_dir := "client"
server_dir := "server"
hasura_dir := "hasura"

# Install dependencies
install:
	cd {{client_dir}} && bun install
	cd {{server_dir}} && bun install

# Start dev servers
dev:
	@echo "Starting Docker Compose services..."
	@docker compose up -d
	@echo "Waiting for services to be ready..."
	@sleep 3
	mprocs \
		"docker compose logs -f" \
		"cd {{server_dir}} && bun run dev" \
		"cd {{client_dir}} && bun run dev" \
		"cd {{hasura_dir}} && hasura console --endpoint http://localhost:7777 --admin-secret shogi_password --console-port 7776"

# Build both packages
build:
	cd {{client_dir}} && bun run build
	cd {{server_dir}} && bun run build

# Start dev environment with Docker and mprocs (without hasura console)
start:
	@echo "Starting Docker Compose services..."
	@docker compose up -d
	@echo "Waiting for services to be ready..."
	@sleep 3
	mprocs \
		"docker compose logs -f" \
		"cd {{server_dir}} && bun run start" \
		"cd {{client_dir}} && bun run start"

lint:
	cd {{client_dir}} && bun run lint
	cd {{server_dir}} && bun run lint

# Generate GraphQL types
codegen:
	@echo "Fetching OpenAPI spec from shogi-ai..."
	curl -s http://localhost:8000/openapi.json | jq '.' > shogi-ai/openapi.json
	@echo "Saved to shogi-ai/openapi.json"
	@echo "Reloading Hasura metadata to include remote schemas..."
	@cd {{hasura_dir}} && hasura metadata reload --endpoint http://localhost:7777 --admin-secret shogi_password
	@echo "Exporting Hasura GraphQL schema..."
	bunx get-graphql-schema http://localhost:7777/v1/graphql > {{hasura_dir}}/schema.graphql
	@echo "Saved to {{hasura_dir}}/schema.graphql"
	cd {{server_dir}} && bun run codegen
	cd {{client_dir}} && bun run codegen

# Run database migrations
migrate:
	cd {{server_dir}} && bunx prisma migrate dev
	@echo "Reloading Hasura metadata after migration..."
	@cd {{hasura_dir}} && hasura metadata reload --endpoint http://localhost:7777 --admin-secret shogi_password

# Reload Hasura metadata (useful after schema changes)
hasura-reload:
	@echo "Reloading Hasura metadata..."
	@cd {{hasura_dir}} && hasura metadata reload --endpoint http://localhost:7777 --admin-secret shogi_password
	@echo "Metadata reloaded successfully"

# Apply Hasura metadata from files
hasura-apply:
	@echo "Applying Hasura metadata..."
	@cd {{hasura_dir}} && hasura metadata apply --endpoint http://localhost:7777 --admin-secret shogi_password
	@echo "Metadata applied successfully"

# Reset Docker database (WARNING: deletes all data)
reset:
	docker compose down -v
	docker compose up -d

# Start ngrok tunnel with Caddy reverse proxy and dev servers
ngrok:
	@echo "Starting Docker Compose services..."
	@docker compose up -d
	@echo "Waiting for services to be ready..."
	@sleep 3
	mprocs \
		"docker compose logs -f" \
		"cd {{server_dir}} && bun run start" \
		"cd {{client_dir}} && bun run start" \
		"caddy run --config ./Caddyfile" \
		"ngrok http 8080"

# Start localtunnel with Caddy reverse proxy and dev servers
localtunnel:
	@echo "Starting Docker Compose services..."
	@docker compose up -d
	@echo "Waiting for services to be ready..."
	@sleep 3
	mprocs \
		"docker compose logs -f" \
		"cd {{server_dir}} && bun run start" \
		"cd {{client_dir}} && bun run start" \
		"caddy run --config ./Caddyfile" \
		"npx localtunnel --port 8080"
