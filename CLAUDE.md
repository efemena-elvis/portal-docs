# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build (must pass before shipping)
npm run typecheck    # Type-check via nuxt typecheck
npm run generate     # Static site generation
npm run preview      # Preview production build locally
```

There are no test files. Verification is done by running the dev server and exercising the changed code path in the browser.

Known pre-existing type errors exist in `app/components/docs/Mermaid/index.vue` and `app/composables/usePageHeadings.ts` — do not introduce new ones.

## Architecture overview

**Nuxt 4 SPA** (`ssr: false`). No SSR — all data fetching happens client-side via `$fetch` against Nitro server routes.

### Content storage

Content lives in `content/<section-slug>/<page-slug>.json`. Each section has a `_index.json` that defines the ordered page list and section metadata. Drafts are stored as `<slug>.draft.json` alongside the published file.

Page types:
- `GuidePage` — `{ type: 'guide', title, meta, blocks[] }`
- `EndpointPage` — `{ type: 'endpoint', title, meta, description, auth, method, path, headers[], body, params[], responseSchema[], responses[], errors[], blocks[] }`
- `WebhookPage` — `{ type: 'webhook', title, meta, event, headers[], blocks[], responses[] }`

See `app/types/page.ts` for the full interfaces.

### Routing

Single catch-all page: `app/pages/[...slug].vue` fetches the page from `/api/content/[...slug]` and delegates rendering to `<DocsGuidePage>`, `<DocsEndpointPage>`, or `<DocsWebhookPage>` based on `page.type`.

### Block system

Freeform page content is a `blocks: Block[]` array. Each block has `{ id, type, props, content, meta }`. The full union type is in `app/types/content.ts`. Block types include: `prose`, `callout`, `code`, `mermaid`, `image`, `card`, `card-grid`, `badge`, `button`, `support`, `table`, `params-table`, `endpoint-ref`, `step`, `steps`, `list`, `divider`, `spacer`, `auth-note`, `method-path`.

Key block utilities:
- `app/utils/blockDefaults.ts` — `createDefaultBlock(type)` returns a populated default for any block type
- `app/components/docs/BlockRenderer/index.vue` — renders `Block[]` to VNodes using `h()`
- `app/components/admin/BlockForm/index.vue` — routes a block to its edit form component
- `app/components/admin/BlockEditorCard/index.vue` — the drag/hide/delete card shell used in all editor panels

### Admin system

Admin login at `/x/login`. The access code is checked server-side; on success a JWT is issued and stored in `localStorage`. All admin API routes are under `/api/admin/` and require `Authorization: Bearer <token>`.

Key composables:
- `useAdmin()` — singleton, exposes `isAdmin`, `authHeaders()`, `login()`, `logout()`
- `usePageEditor()` — **module-level singleton** managing the active edit session: `blocks`, `extraFields`, `editMode`, `isDirty`, `saveStatus`, `enterEditMode()`, `exitEditMode()`, `patchFields()`, `scheduleSave()`, `publishPage()`, `discardDraft()`
- `useDraftState()` — tracks which slugs have unpublished drafts (shown in topbar)
- `useAdminCollection()` — nav-level CRUD: create/rename/delete/move sections, categories, and pages

### Edit panel flow (guide pages)

```
GuidePage.vue
  → enterEditMode() fetches draft or clones published blocks
  → AdminEditorPanel (slide-in shell: header + scrollable slot + footer with Discard/Publish)
      → AdminBlockEditorList
            → AdminBlockInsertButton (top + between each block)
            → AdminBlockEditorCard (drag handle, type badge, eye/trash, click-to-expand)
                  → AdminBlockForm → {ProseForm, CodeForm, ParamsTableForm, …}
            → AdminBlockPalette modal (picks block type, calls createDefaultBlock)
```

Auto-save fires 400 ms after any change via `scheduleSave()`. Save body: `{ ...publishedPage, ...extraFields, blocks }`.

### Edit panel flow (endpoint pages)

Identical shell (`AdminEditorPanel`) and footer. The slot uses `AdminEndpointEditorList` instead of `AdminBlockEditorList`. Structured endpoint fields (description, auth, method/path, headers, params, responses, errors) are represented as **synthetic blocks** — fake block objects with the correct `type` so `AdminBlockEditorCard` renders the right colored badge. Each synthetic block card expands to show the relevant sub-editor. Free `blocks[]` follow below.

Structured field edits go through `patchFields()` which writes to `extraFields`. On save, `extraFields` is merged into the page body alongside `blocks`.

### Configuration

`docs.config.ts` — the single source of truth for site name, API base URL, data source priority (`'postman' | 'json'`), design tokens (primary color, font, border radius), and layout widths. Changes take effect on next server restart.

`nuxt.config.ts` — reads `docs.config.ts` and exposes public values via `runtimeConfig.public`. Server-only secrets (`ADMIN_ACCESS_CODE`, `ADMIN_JWT_SECRET`, `POSTMAN_API_KEY`, `POSTMAN_COLLECTION_UID`) come from `.env`.

### Component conventions

- Components are folders with `index.vue` (e.g. `app/components/ui/Button/index.vue`). Nuxt auto-imports them as `<UiButton>`, `<DocsCodeBlock>`, `<AdminBlockEditorCard>`, etc.
- Icons: import from `@lucide/vue` only; register new ones in `app/components/ui/Icon/icons.ts`; never add inline SVGs.
- Use `<UiTextarea>`, `<UiSelect>`, `<UiIcon>` etc. — do not hand-roll form primitives.
- `<UiTextarea size="sm">` is the standard input size inside editor panels.

### "On this page" sidebar

`usePageHeadings()` scans `.docs-content` for `h2, h3, [data-toc]` elements. Opt a heading out of the TOC by adding `data-no-toc` attribute. `DocsParamsTable` skips its `<h3>` entirely when `title` is empty, so never pass an empty string to suppress a TOC entry — pass nothing (prop is optional).

### Styling

Semantic color tokens (defined in `tailwind.config.ts`):
- Text: `text-ink-primary / ink-secondary / ink-muted` and dark equivalents `dark:text-dark-text / dark-muted / dark-subtle`
- Brand: `bg-brand-green`, `text-brand-green` (primary), `bg-brand-blue` (links)
- Surfaces: `bg-surface-sage`, `bg-surface-off-white`, `dark:bg-dark-surface`, `dark:bg-dark-sidebar`
- Borders: `border-surface-sage-dark`, `dark:border-dark-border`

Global prose styles for rendered markdown content are in `app/assets/css/main.css` under `.docs-prose`.
