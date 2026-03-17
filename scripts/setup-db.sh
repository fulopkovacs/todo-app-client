#!/usr/bin/env bash
set -euo pipefail

DB_NAME="todo-app-client"
DB_USER="${USER}"
DB_HOST="localhost"
DB_PORT="5432"
DATABASE_URL="postgresql://${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
ENV_FILE="$(dirname "$0")/../.env"

if [ -t 1 ]; then
	CYAN='\033[0;36m'
	YELLOW='\033[0;33m'
	RESET='\033[0m'
else
	CYAN=''
	YELLOW=''
	RESET=''
fi

step() {
	printf "%b\n" "${CYAN}$1${RESET}"
}

info() {
	printf "%b\n" "${YELLOW}$1${RESET}"
}

# Resolve psql — prefer brew postgresql@15, fall back to PATH
if command -v /opt/homebrew/opt/postgresql@15/bin/psql &>/dev/null; then
	PSQL="/opt/homebrew/opt/postgresql@15/bin/psql"
	CREATEDB="/opt/homebrew/opt/postgresql@15/bin/createdb"
elif command -v psql &>/dev/null; then
	PSQL="psql"
	CREATEDB="createdb"
else
	echo "Error: psql not found. Install PostgreSQL or add it to PATH." >&2
	exit 1
fi

# Check that the server is reachable
if ! "$PSQL" -U "$DB_USER" -d postgres -c "SELECT 1" &>/dev/null; then
	echo "Error: cannot connect to PostgreSQL at ${DB_HOST}:${DB_PORT} as ${DB_USER}." >&2
	echo "Make sure the service is running (brew services start postgresql@15)." >&2
	exit 1
fi

# Create the database if it doesn't already exist
if "$PSQL" -U "$DB_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1; then
	info "Database '${DB_NAME}' already exists - skipping creation."
else
	"$CREATEDB" -U "$DB_USER" "$DB_NAME"
	step "Created database '${DB_NAME}'."
fi

# Write .env if it doesn't exist, or update DATABASE_URL if it does
if [ ! -f "$ENV_FILE" ]; then
	echo "DATABASE_URL=${DATABASE_URL}" >"$ENV_FILE"
	step "Created ${ENV_FILE} with DATABASE_URL."
elif grep -q "^DATABASE_URL=" "$ENV_FILE"; then
	info "DATABASE_URL already set in ${ENV_FILE} - not overwriting."
else
	echo "DATABASE_URL=${DATABASE_URL}" >>"$ENV_FILE"
	step "Appended DATABASE_URL to ${ENV_FILE}."
fi

# Generate Drizzle artifacts
step "Generating Drizzle artifacts..."
pnpm db:generate

# Apply migrations
step "Applying database migrations..."
pnpm db:dev:migrate

# Running the seed command
step "Seeding the database with initial data..."
pnpm db:dev:seed

# # Create the first admin user
# step "Creating initial admin user..."
# pnpm db:seed

step "\nDone! Database '${DB_NAME}' is ready."
