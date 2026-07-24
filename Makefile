# ─────────────────────────────────────────────────────────────────────────────
# Vesicash Docs — Monorepo Makefile
# Usage:  make dev                    # start all apps
#         make dev APP=portal-docs    # start one app
#         make build APP=portal-docs
#         make typecheck
#         make install
# ─────────────────────────────────────────────────────────────────────────────

.PHONY: install dev build preview typecheck generate clean seed-r2 help

## Install all workspace dependencies
install:
	pnpm install

## Start dev server — all apps by default, or pass APP=<name> for one
dev:
ifdef APP
	pnpm turbo run dev --filter=$(APP)
else
	pnpm turbo run dev
endif

## Build a specific app for production  [APP=<name>]
build:
ifdef APP
	pnpm turbo run build --filter=$(APP)
else
	pnpm turbo run build
endif

## Preview the production build of an app  [APP=<name> required]
preview:
ifndef APP
	$(error APP is required: make preview APP=portal-docs)
endif
	cd apps/$(APP) && pnpm preview

## Run static site generation  [APP=<name>]
generate:
ifdef APP
	pnpm turbo run generate --filter=$(APP)
else
	pnpm turbo run generate
endif

## Run TypeScript type checks across all packages
typecheck:
	pnpm turbo run typecheck

## Build all apps
build-all:
	pnpm turbo run build

## Seed R2 bucket from local content/ — only runs if the bucket is empty  [APP=<name> required]
seed-r2:
ifndef APP
	$(error APP is required: make seed-r2 APP=portal-docs)
endif
	cd apps/$(APP) && node scripts/seed-r2.mjs

## Dry-run seed — lists files that would be uploaded without touching R2  [APP=<name> required]
seed-r2-dry:
ifndef APP
	$(error APP is required: make seed-r2-dry APP=portal-docs)
endif
	cd apps/$(APP) && node scripts/seed-r2.mjs --dry-run

## Remove all build artifacts and caches  [APP=<name> to clean one app]
clean:
ifdef APP
	rm -rf apps/$(APP)/.nuxt apps/$(APP)/.output apps/$(APP)/.turbo
	@echo "Cleaned $(APP)."
else
	find . -name ".nuxt" -type d -not -path "*/node_modules/*" -exec rm -rf {} + 2>/dev/null || true
	find . -name ".output" -type d -not -path "*/node_modules/*" -exec rm -rf {} + 2>/dev/null || true
	find . -name ".turbo" -type d -exec rm -rf {} + 2>/dev/null || true
	@echo "All build artifacts cleaned."
endif

## Show this help
help:
	@echo ""
	@echo "Vesicash Docs Monorepo"
	@echo "─────────────────────────────────────────────────────────────"
	@grep -E '^##' Makefile | sed 's/^## /  /'
	@echo ""
	@echo "  Available apps:  $$(ls apps/)"
	@echo ""
