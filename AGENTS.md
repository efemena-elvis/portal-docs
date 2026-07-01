# Agent Guide — Vesicash Docs

This file contains conventions and workflow notes for coding agents working on the Vesicash developer documentation site.

## Project basics

- **Framework:** Nuxt 4.4.8 + Vue 3.5 + TypeScript + Tailwind CSS
- **Routing:** File-based under `app/pages/`
- **Default layout:** `app/layouts/docs.vue` wraps `SharedAppShell` with `DocsTopbar`, `DocsSidebar`, and `DocsOnThisPage`
- **Icons:** `@lucide/vue` only. Add new icons to `app/components/ui/Icon/icons.ts`; do not add inline SVGs except for brand logos/illustrations.
- **Code highlighting:** Shiki via `app/composables/useHighlighter.ts`

## Component architecture

Components are organized into categorized folders:

```
app/components/
├── ui/                    # Reusable primitives (no docs-specific logic)
│   ├── Text/
│   ├── Button/
│   ├── Input/
│   ├── Textarea/
│   ├── Select/
│   ├── Icon/
│   ├── Badge/
│   ├── Kbd/
│   ├── Card/
│   ├── CopyButton/
│   ├── Table.vue
│   ├── TableHead.vue
│   ├── TableBody.vue
│   ├── TableRow.vue
│   └── TableCell.vue
├── docs/                  # Vesicash docs domain
│   ├── Topbar/
│   ├── Sidebar/
│   ├── SidebarItem/
│   ├── SidebarSection/
│   ├── SidebarFooter/
│   ├── OnThisPage/
│   ├── Breadcrumb/
│   ├── EndpointHeader/
│   ├── EndpointPage/
│   ├── GuidePage/
│   ├── SearchModal/
│   ├── SearchResultItem/
│   ├── CodePanel/
│   ├── CodeBlock/
│   ├── CodeTabs/
│   ├── ParamsTable/
│   ├── MethodBadge/
│   ├── Callout/
│   ├── Mermaid/
│   ├── Feedback/
│   ├── SupportCta/
│   ├── PageFooter/
│   ├── Hero/
│   ├── CapabilityCard/
│   ├── FlowCard/
│   ├── StepTimeline/
│   ├── Step/
│   └── ThemeToggle/
└── shared/
    └── AppShell/
```

### Rules

- Single-export components live in a folder with `index.vue` (e.g. `app/components/ui/Button/index.vue`). Nuxt auto-imports them as `<UiButton>` / `<DocsCodeBlock>`.
- Table sub-components are intentionally flat files (`Table.vue`, `TableRow.vue`, etc.) to avoid names like `<UiTableTableRow>`.
- Do not create new flat `.vue` files directly in `app/components/docs/` unless they are table-style sub-components.
- Keep props typed with `interface Props`. Prefer `withDefaults` for defaults.
- Use `<UiText>`, `<UiButton>`, `<UiIcon>`, `<UiBadge>`, `<UiCard>`, and `<UiCopyButton>` instead of hand-rolled markup.

## Composables

```
app/composables/
├── useCollection.ts        # Load collection data + meta
├── useSearch.ts            # Fuse search index
├── useSearchResults.ts     # Reactive search result list
├── useHighlighter.ts       # Shiki highlighter
├── usePageHeadings.ts      # Extract headings for "On this page"
├── useClipboard.ts         # Copy-to-clipboard state
├── useEndpointPage.ts      # Load a page by slug + baseUrl
├── usePagePagination.ts    # Prev/next links
├── useDescriptionParser.ts # Parse markdown description
├── useCodeGenerator.ts     # Generate request examples
└── useResponseExamples.ts  # Build response example map
```

## Shared types

`app/types/docs.ts` contains shared types: `TableRow`, `NavLink`, `CodeExample`, `CodeLanguageOption`, `CodeResponseOption`, `PaginationNeighbor`, etc.

## Page conventions

- Content pages should use `<NuxtLayout name="docs">`.
- Use `<DocsBreadcrumb>` for pages that need a breadcrumb.
- Use `<DocsPageFooter :prev="..." :next="...">` at the bottom of content pages.
- Home page: `app/pages/index.vue` uses `<DocsHero>`, `<DocsCapabilityCard>`, `<DocsFlowCard>`, `<DocsSupportCta>`.
- Get Started: `app/pages/get-started.vue` uses `<DocsStepTimeline>` / `<DocsStep>`.
- Endpoint/Guide pages are handled by `app/pages/[...slug].vue`, which delegates to `<DocsEndpointPage>` or `<DocsGuidePage>`.

## Styling

- Tailwind config lives at `tailwind.config.ts`.
- Common semantic colors:
  - `bg-brand-green` / `text-brand-green` for primary actions and success
  - `bg-brand-blue` / `text-brand-blue` for links and info
  - `bg-brand-navy` for dark code panels
  - `text-ink-primary`, `text-ink-secondary`, `text-ink-muted` for text hierarchy
  - `dark:text-dark-text`, `dark:text-dark-muted`, `dark:text-dark-subtle` for dark mode
- Code blocks: `<DocsCodeBlock>` defaults to theme-aware. Pass `dark` for navy request/response panels.

## Build & type check

After any meaningful change, run:

```bash
npm run build
npm run typecheck
```

- `npm run build` must pass.
- `nuxt typecheck` currently reports pre-existing errors in `app/components/docs/Mermaid/index.vue` and `app/composables/usePageHeadings.ts`. Do not introduce new type errors.

## Plans & specs

- Architecture plan: `docs/superpowers/specs/2026-06-19-component-architecture-plan.md`
- Phase-by-phase plan: `docs/superpowers/plans/2026-06-19-component-refactor-phases-0-4.md`
- UI/UX improvements: `ui-improvements-plan.md`

When you complete a phase or make a structural change, update the relevant plan/spec and this file if conventions change.
