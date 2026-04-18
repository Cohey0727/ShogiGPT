set shell := ["bash", "-lc"]

client_dir := "client"
server_dir := "server"

# Install dependencies
install:
	cd {{client_dir}} && bun install
	cd {{server_dir}} && bun install

# Start dev environment (Docker + client)
dev:
	@echo "Starting Docker Compose services..."
	@docker compose up -d
	@echo "Waiting for services to be ready..."
	@sleep 3
	mprocs \
		"docker compose logs -f" \
		"cd {{client_dir}} && bun run dev"

# Build both packages
build:
	cd {{client_dir}} && bun run build
	cd {{server_dir}} && bun run build

# Start with Docker + client
start:
	@echo "Starting Docker Compose services..."
	@docker compose up -d
	@echo "Waiting for services to be ready..."
	@sleep 3
	mprocs \
		"docker compose logs -f" \
		"cd {{client_dir}} && bun run start"

# Lint
lint:
	cd {{client_dir}} && bun run lint
	cd {{server_dir}} && bun run lint

# Generate/push Drizzle migrations
db-generate:
	cd {{server_dir}} && bun run db:generate

db-push:
	cd {{server_dir}} && bun run db:push

db-studio:
	cd {{server_dir}} && bun run db:studio

# Reset Docker (WARNING: deletes SQLite DB)
reset:
	docker compose down -v
	docker compose up -d

# Ngrok tunnel with Caddy reverse proxy
ngrok:
	@echo "Starting Docker Compose services..."
	@docker compose up -d
	@echo "Waiting for services to be ready..."
	@sleep 3
	mprocs \
		"docker compose logs -f" \
		"cd {{client_dir}} && bun run start" \
		"caddy run --config ./Caddyfile" \
		"ngrok http 8080"

# Localtunnel with Caddy reverse proxy
localtunnel:
	@echo "Starting Docker Compose services..."
	@docker compose up -d
	@echo "Waiting for services to be ready..."
	@sleep 3
	mprocs \
		"docker compose logs -f" \
		"cd {{client_dir}} && bun run start" \
		"caddy run --config ./Caddyfile" \
		"echo 'Tunnel password (your global IP):' && curl -s ifconfig.me && echo && npx localtunnel --port 8080"

# Cloudflare Tunnel with Caddy reverse proxy
cloudflared:
	@echo "Starting Docker Compose services..."
	@docker compose up -d
	@echo "Waiting for services to be ready..."
	@sleep 3
	mprocs \
		"docker compose logs -f" \
		"cd {{client_dir}} && bun run start" \
		"caddy run --config ./Caddyfile" \
		"cloudflared tunnel --url http://localhost:8080"
