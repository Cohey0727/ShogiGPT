set shell := ["bash", "-lc"]

client_dir := "client"

# Install dependencies for the client app
install:
	cd {{client_dir}} && bun install

# Start dev server with hot reload
dev:
	cd {{client_dir}} && bun run dev

# Build static assets into dist/
build:
	cd {{client_dir}} && bun run build

# Serve built assets (make sure to run `just build` first)
start:
	cd {{client_dir}} && bun run start

# Run linter
lint:
	cd {{client_dir}} && bun run lint