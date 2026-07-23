# ─────────────────────────────────────────────────────────────────────────────
# Vesicash Docs — Monorepo Makefile
# Usage:  make dev APP=vesicash-docs
#         make build APP=vesicash-docs
#         make typecheck
#         make install
# ─────────────────────────────────────────────────────────────────────────────

APP ?= vesicash-docs

.PHONY: install dev build preview typecheck generate clean help

## Install all workspace dependencies
install:
	pnpm install

## Start dev server for a specific app  [APP=vesicash-docs]
dev:
	pnpm turbo run dev --filter=$(APP)

## Build a specific app for production  [APP=vesicash-docs]
build:
	pnpm turbo run build --filter=$(APP)

## Preview the production build of an app  [APP=vesicash-docs]
preview:
	cd apps/$(APP) && pnpm preview

## Run static site generation for a specific app  [APP=vesicash-docs]
generate:
	pnpm turbo run generate --filter=$(APP)

## Run TypeScript type checks across all packages
typecheck:
	pnpm turbo run typecheck

## Build all apps
build-all:
	pnpm turbo run build

## Remove all build artifacts and caches
clean:
	find . -name ".nuxt" -type d -not -path "*/node_modules/*" -exec rm -rf {} + 2>/dev/null || true
	find . -name ".output" -type d -not -path "*/node_modules/*" -exec rm -rf {} + 2>/dev/null || true
	find . -name ".turbo" -type d -exec rm -rf {} + 2>/dev/null || true
	@echo "Build artifacts cleaned."

## Show this help
help:
	@echo ""
	@echo "Vesicash Docs Monorepo"
	@echo "─────────────────────────────────────────────────────────────"
	@grep -E '^##' Makefile | sed 's/^## /  /'
	@echo ""
	@echo "  Available apps:"
	@ls apps/
	@echo ""
