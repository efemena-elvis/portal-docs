# Vesicash Docs — Component Architecture Refactor Plan

## 1. Overview

The Vesicash docs UI has outgrown its current flat component structure. Several files are doing too much, inline SVGs are duplicated everywhere, and there is no reusable primitive layer. This plan defines a component-based architecture, organizes components into subfolders, and provides a phased implementation path.

## 2. Goals

- Build a reusable primitive UI layer (`app/components/ui/`).
- Organize docs-specific components into `app/components/docs/` subfolders by responsibility.
- Reduce `app/pages/[...slug].vue` from 517 lines to a thin orchestrator.
- Replace inline SVGs with a Lucide Vue icon registry.
- Improve the code-panel UX to match Paystack/GitBook conventions.
- Keep the site fully functional after every phase.

## 3. Current State Audit

### Folder structure
```
app/components/
└── docs/                  # flat, no subfolders
    ├── Callout.vue
    ├── CodeBlock.vue
    ├── CodePanel.vue
    ├── CodeTabs.vue
    ├── Feedback.vue
    ├── MethodBadge.vue
    ├── Mermaid.vue
    ├── NavTree.vue
    ├── OnThisPage.vue
    ├── PageFooter.vue
    ├── ParamsTable.vue
    ├── ResponseTabs.vue
    ├── SearchModal.vue
    ├── ThemeToggle.vue
    └── Topbar.vue
```

### Problem areas
| File | Lines | Issues |
|---|---|---|
| `app/pages/[...slug].vue` | 517 | Data loading, markdown parsing, code generation, pagination, and layout all in one file. |
| `app/pages/index.vue` | 248 | Inline SVGs, hand-rolled cards, tables, and support CTA. |
| `app/pages/get-started.vue` | 283 | Hand-rolled dark code panels, inline SVGs, step timeline, cards. |
| `app/components/docs/CodePanel.vue` | 135 | Mixes code generation, language tabs, response tabs, and copy logic. |
| `app/components/docs/SearchModal.vue` | 159 | Mixes Fuse search logic, result rendering, and keyboard navigation. |
| `app/components/docs/Topbar.vue` | 110 | Mixes logo, primary nav, search trigger, utility nav, and theme toggle. |
| `app/components/docs/PageFooter.vue` | 86 | Mixes prev/next, support links, and last-updated date. |
| `app/components/docs/Callout.vue` | 93 | Inline SVG icons defined as render functions; hard to extend. |

### Missing primitives
- No `<Text>`, `<Button>`, `<Input>`, `<Textarea>`, `<Icon>`, `<Badge>`, `<Kbd>`, `<Card>`, `<Select>`, or `<Table>` components.
- Inline SVGs duplicated across Topbar, NavTree, OnThisPage, CodeBlock, ThemeToggle, PageFooter, SearchModal, and pages.
- Copy-to-clipboard logic duplicated in CodeBlock, CodePanel, ResponseTabs, and `get-started.vue`.

## 4. Target Architecture

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
│
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
│   ├── CodeLanguageSelect/
│   ├── CodeResponseSelect/
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
│   └── Step/
│
└── shared/                # Layout/composition helpers
    └── AppShell/

app/composables/
├── useCollection.ts        # existing
├── useSearch.ts            # existing, keep search wiring
├── useHighlighter.ts       # existing
├── usePageHeadings.ts      # existing
├── useClipboard.ts         # NEW: shared copy-to-clipboard state
├── useEndpointPage.ts      # NEW: load page + neighbours + baseUrl
├── useDescriptionParser.ts # NEW: parse markdown description
├── useCodeGenerator.ts     # NEW: generate request examples
└── usePagePagination.ts    # NEW: prev/next links

app/types/
└── docs.ts                 # NEW: shared types (TableRow, NavLink, etc.)
```

### Sub-component strategy
Nuxt auto-imports components based on relative path. To avoid names like `<UiTableTableRow>`, table sub-components live flat in `app/components/ui/` (`Table.vue`, `TableRow.vue`, `TableCell.vue`, etc.). They are imported and composed by `<UiTable>` internally where needed, but consumers can also use them directly.

## 5. Component Inventory

### 5.1 UI primitives (`app/components/ui/`)

| Component | Key props | Responsibility |
|---|---|---|
| `<UiText>` | `as`, `variant` (`body/heading/small/muted/lead`), `size`, `weight`, `color`, `class` | Consistent typography. |
| `<UiButton>` | `variant` (`primary/secondary/outline/ghost/link`), `size` (`sm/md/lg`), `disabled`, `loading`, `to`, `href`, `type`, `icon`, `iconPosition` | Renders `<button>`, `<NuxtLink>`, or `<a>`. |
| `<UiInput>` | `modelValue`, `type`, `placeholder`, `disabled`, `readonly`, `error`, `size` (`sm/md/lg`), `icon`, `clearable` | Text/search inputs. |
| `<UiTextarea>` | `modelValue`, `rows`, `placeholder`, `disabled`, `error`, `resize` | Multi-line input. |
| `<UiSelect>` | `modelValue`, `options`, `placeholder`, `disabled`, `size` | Dropdown/select primitive. |
| `<UiIcon>` | `name`, `size` (`xs/sm/md/lg/xl`), `class` | Renders Lucide icons from registry. |
| `<UiBadge>` | `variant` (`default/success/warning/error/info`), `size` (`sm/md`), `rounded` | Status/label chips. |
| `<UiKbd>` | `size` (`sm/md`) | Keyboard hints. |
| `<UiCard>` | `variant` (`default/bordered/elevated`), `padding`, `radius`, `class` | Container with header/body/footer slots. |
| `<UiCopyButton>` | `text`, `size`, `variant` | Copy-to-clipboard button with copied feedback. |
| `<UiTable>` | `striped`, `bordered`, `compact` | Table wrapper. |
| `<UiTableHead>` | — | Header section. |
| `<UiTableBody>` | — | Body section. |
| `<UiTableRow>` | — | Row. |
| `<UiTableCell>` | `header`, `class` | Cell; `header` applies th styles. |

### 5.2 Docs components (`app/components/docs/`)

| Component | Props | Responsibility |
|---|---|---|
| `<DocsTopbar>` | `primaryNav`, `utilityNav`, `logo` | Header bar. Emits `open-search`, `toggle-sidebar`. |
| `<DocsSidebar>` | `sections`, `open` | Left sidebar shell. |
| `<DocsSidebarItem>` | `item`, `level` | Recursive nav item/group. |
| `<DocsSidebarSection>` | `title` | Sidebar section header. |
| `<DocsSidebarFooter>` | — | Sidebar footer text. |
| `<DocsOnThisPage>` | `selector` | Right-rail TOC. |
| `<DocsBreadcrumb>` | `items` | Page breadcrumb. |
| `<DocsEndpointHeader>` | `method`, `path` | Method badge + URL path. |
| `<DocsEndpointPage>` | `page` | Full endpoint page layout. |
| `<DocsGuidePage>` | `page` | Full guide page layout. |
| `<DocsSearchModal>` | `open` | Modal shell. |
| `<DocsSearchResultItem>` | `result`, `selected` | Single search result row. |
| `<DocsCodePanel>` | `dark`, `class` | Panel shell with `header-left` / `header-right` slots. |
| `<DocsCodeBlock>` | `code`, `language`, `lineNumbers`, `filename`, `dark` | Code display with copy. |
| `<DocsCodeTabs>` | `tabs`, `defaultTab` | Tab wrapper around code blocks. |
| `<DocsCodeLanguageSelect>` | `modelValue`, `options` | Dropdown for request languages. |
| `<DocsCodeResponseSelect>` | `modelValue`, `options` | Dropdown for response statuses. |
| `<DocsParamsTable>` | `title`, `rows` | Parameter table built on `<UiTable>`. |
| `<DocsMethodBadge>` | `method` | HTTP method badge. |
| `<DocsCallout>` | `type`, `title` | Note/warning/tip boxes. |
| `<DocsMermaid>` | `diagram`, `title` | Diagram renderer inside `<UiCard>`. |
| `<DocsFeedback>` | `pagePath` | 3-state feedback widget. |
| `<DocsSupportCta>` | `title`, `description`, `href`, `buttonText` | Support call-to-action. |
| `<DocsPageFooter>` | `prev`, `next` | Prev/next links only. |
| `<DocsHero>` | `title`, `description`, `actions`, `badge` | Home page hero. |
| `<DocsCapabilityCard>` | `icon`, `title`, `description`, `href`, `bg` | Home grid cards. |
| `<DocsFlowCard>` | `icon`, `title`, `description`, `href`, `tag` | Home integration flow cards. |
| `<DocsStepTimeline>` | — | Vertical step list wrapper. |
| `<DocsStep>` | `number`, `title`, `last` | Individual numbered step. |

### 5.3 Code panel UX

Based on Paystack + GitBook review:

- **Request sample panel** — always dark.
  - Top left: `<DocsMethodBadge>` + endpoint path.
  - Top right: `<DocsCodeLanguageSelect>` + `<UiCopyButton>`.
  - Body: `<DocsCodeBlock dark lineNumbers />` with generated cURL/Node/Python/PHP.

- **Response panel** — always dark.
  - Top left: “Sample Response”.
  - Top right: `<DocsCodeResponseSelect>` + `<UiCopyButton>`.
  - Body: `<DocsCodeBlock dark lineNumbers language="json" />`.

- **Body sample panel** — light by default (GitBook-style).
  - Top: `<DocsCodeTabs>` for variants like *Required parameters*, *Optional parameters included*, *Passing metadata*.
  - Body: `<DocsCodeBlock lineNumbers />` without the dark theme.

- **Prose code blocks** — follow global theme by default; can opt into `dark` via prop.

- **Line numbers** — implemented via Shiki output + CSS counters on `.line`, with copy behavior tested across browsers.

## 6. Composable APIs

| Composable | Signature | Responsibility |
|---|---|---|
| `useClipboard()` | `useClipboard(): { copy, copied }` | Shared copy-to-clipboard state and feedback timer. |
| `useSearch()` | `useSearch(): Promise<Fuse<SearchResult>>` | Initialize Fuse index lazily. |
| `useEndpointPage(slug)` | `useEndpointPage(slug: string): { page, loading, baseUrl, error }` | Load page data + base URL. |
| `usePagePagination(page)` | `usePagePagination(page: Ref<EndpointPage \| null>): { prev, next }` | Compute prev/next links. |
| `useDescriptionParser(desc)` | `useDescriptionParser(desc: Ref<string>): ParsedDescription` | Extract intro, callouts, params, monitor fields. |
| `useCodeGenerator(opts)` | `useCodeGenerator(opts: Ref<CodeGenOptions>): { examples, languages }` | Generate request examples per language. |

## 7. Phased Implementation Plan

### Phase 0 — Foundation & Tooling
- [x] Create folder structure: `app/components/ui/`, `app/components/docs/`, `app/components/shared/`, `app/types/`.
- [x] Install `@lucide/vue` (selected over deprecated `lucide-vue-next`).
- [x] Create `app/components/ui/Icon/icons.ts` with a small static registry of Lucide icons used across the app. Keep it compact to avoid bundle bloat.
- [x] Create `app/types/docs.ts` for shared types (`TableRow`, `NavLink`, `CodeExample`, etc.).
- [x] Create `app/composables/useClipboard.ts`.
- [x] Update `tailwind.config.ts` with any missing tokens needed by primitives.
- [x] Verify Nuxt auto-import behavior with nested folders (`UiButton`, `DocsSidebar`, etc.).
- [x] Add/verify `typecheck` script in `package.json` if not present.
- [x] Run `npm run build` and `nuxt typecheck` to establish a baseline.

### Phase 1 — UI Primitives
- [x] `<UiText>` with `as`, `variant`, `size`, `weight`, `color` props.
- [x] `<UiButton>` with variants, sizes, loading, `to`/`href` support.
- [x] `<UiInput>` with icon, clearable, error states.
- [x] `<UiTextarea>` with resize control and error states.
- [x] `<UiSelect>` dropdown primitive.
- [x] `<UiIcon>` registry lookup + size support.
- [x] `<UiBadge>` with color variants.
- [x] `<UiKbd>` for keyboard hints.
- [x] `<UiCard>` with slots.
- [x] `<UiCopyButton>` using `useClipboard`.
- [x] `<UiTable>` family (flat files: `Table.vue`, `TableHead.vue`, `TableBody.vue`, `TableRow.vue`, `TableCell.vue`).
- [ ] Create a temporary `/demo` page or story-style preview to verify primitives visually — **skipped**.
- [x] Run `npm run build` and `nuxt typecheck`.

### Phase 2 — Layout & Navigation Components
- [x] `<SharedAppShell>` to wrap topbar + sidebar + main + right rail.
- [x] `<DocsTopbar>` using `<UiButton>`, `<UiInput>`, `<UiIcon>`, `<DocsThemeToggle>`.
- [x] `<DocsSidebar>` refactored from `docs.vue` layout.
- [x] `<DocsSidebarItem>` extracted from `NavTree.vue`.
- [x] `<DocsSidebarSection>` and `<DocsSidebarFooter>`.
- [x] `<DocsOnThisPage>` using `<UiText>`.
- [x] Update `app/layouts/docs.vue` to consume new layout components.
- [x] Run `npm run build` and `nuxt typecheck`.

### Phase 3 — Content Components
- [x] `<DocsCallout>` rebuilt on `<UiIcon>` + `<UiText>`.
- [x] `<DocsMethodBadge>` as thin wrapper over `<UiBadge>`.
- [x] `<DocsCodeBlock>` with syntax highlight and `<UiCopyButton>`. Optional `lineNumbers` and forced `dark` prop deferred.
- [x] `<DocsCodeTabs>` wrapping `<DocsCodeBlock>`.
- [ ] `<DocsCodeLanguageSelect>` and `<DocsCodeResponseSelect>` using `<UiSelect>` — **deferred to Phase 5**.
- [x] `<DocsCodePanel>` implemented as a concrete request/response panel (matches existing API; slot-based shell deferred).
- [x] `<DocsParamsTable>` rebuilt on `<UiTable>` family.
- [x] `<DocsMermaid>` wrapped in `<UiCard>`.
- [x] Run `npm run build` and `nuxt typecheck`.

### Phase 4 — Feedback, Support, Footer
- [x] `<DocsFeedback>` using `<UiButton>`, `<UiTextarea>`, `<UiText>`.
- [x] `<DocsSupportCta>`.
- [x] `<DocsPageFooter>` rebuilt with prev/next links, support links, and last-updated date retained to keep existing consumers working.
- [x] Swap home page support CTA to `<DocsSupportCta>`.
- [x] Run `npm run build` and `nuxt typecheck`.

### Phase 5 — Search
- [x] `<DocsSearchResultItem>` extracted from `SearchModal.vue`.
- [x] Refactor `useSearch.ts` to expose `useSearch()` (Fuse instance) and a reactive `useSearchResults(query)` if needed.
- [x] `<DocsSearchModal>` refactored to shell + result list using primitives.
- [x] Replace inline SVGs in search with `<UiIcon>`.
- [x] Run `npm run build` and `nuxt typecheck`.

### Phase 6 — Page Decomposition
- [x] Create `composables/useEndpointPage.ts`.
- [x] Create `composables/useDescriptionParser.ts`.
- [x] Create `composables/useCodeGenerator.ts`.
- [x] Create `composables/usePagePagination.ts`.
- [x] Create `<DocsEndpointPage>`.
- [x] Create `<DocsGuidePage>`.
- [x] Rewrite `app/pages/[...slug].vue` to ~50 lines.
- [x] Run `npm run build` and `nuxt typecheck`.

### Phase 7 — Home & Get Started Pages
- [x] `<DocsHero>`, `<DocsCapabilityCard>`, `<DocsFlowCard>` for `app/pages/index.vue`.
- [x] `<DocsStepTimeline>` and `<DocsStep>` for `app/pages/get-started.vue`.
- [x] Refactor `app/pages/index.vue` to use primitives and new docs components.
- [x] Refactor `app/pages/get-started.vue` to use `<DocsCodeBlock dark>` and new components.
- [x] Run `npm run build` and `nuxt typecheck`.

### Phase 8 — Reference Pages
- [x] Refactor `app/pages/reference/variables.vue` to use `<DocsBreadcrumb>`, `<UiTable>`, `<UiBadge>`.
- [x] Refactor `app/pages/reference/errors.vue` to use `<DocsBreadcrumb>`, `<UiTable>`, `<UiBadge>`.
- [x] Run `npm run build` and `nuxt typecheck`.

### Phase 9 — Cleanup & Verification
- [x] Delete old flat `app/components/docs/*.vue` files after confirming replacements.
- [x] Delete temporary `/demo` page if created.
- [x] Run `npm run build` and `nuxt typecheck`.
- [x] Run lint if configured (no lint script configured; skipped).
- [x] Verify every page type renders: home, get-started, guide, endpoint, reference variables, reference errors, 404.
- [x] Verify dark mode, search, sidebar collapse, code copy, language/response switches, feedback widget.
- [x] Update `ui-improvements-plan.md` to mark completed items.
- [x] Create/update `AGENTS.md` with new component conventions.

## 8. Consumers to Refactor

| File | Components / patterns to replace |
|---|---|
| `app/layouts/docs.vue` | `<DocsTopbar>`, `<DocsSidebar>`, `<DocsOnThisPage>`, `<SharedAppShell>` |
| `app/pages/[...slug].vue` | `<DocsEndpointPage>`, `<DocsGuidePage>`, composables |
| `app/pages/index.vue` | `<DocsHero>`, `<DocsCapabilityCard>`, `<DocsFlowCard>`, `<UiButton>`, `<UiIcon>`, `<UiTable>`, `<DocsSupportCta>`, `<DocsPageFooter>` |
| `app/pages/get-started.vue` | `<DocsStepTimeline>`, `<DocsStep>`, `<DocsCodePanel>`, `<DocsCodeBlock>`, `<UiButton>`, `<UiIcon>`, `<UiCopyButton>`, `<DocsCallout>` |
| `app/pages/reference/variables.vue` | `<DocsBreadcrumb>`, `<UiTable>` |
| `app/pages/reference/errors.vue` | `<DocsBreadcrumb>`, `<UiTable>`, `<UiBadge>` |

## 9. Migration Rules

- **Never break the build between phases.** Each phase ends with `npm run build` and `nuxt typecheck` passing.
- **Duplicate-then-delete:** build new components alongside old ones, swap consumers, then delete old files only in Phase 9. In practice, several flat files were deleted earlier (during Phases 2–4) because their auto-import names collided with the new directory-based components.
- **Keep prop interfaces stable** where possible to minimize consumer changes.
- **Preserve public behavior:** line numbers are new, but existing code blocks must still highlight and copy.
- **Version control recommended:** the project is not currently a git repo. Consider initializing git before Phase 1 so each phase can be rolled back if needed.

## 10. Testing Strategy

- **Build check:** `npm run build` after every phase.
- **Type check:** `nuxt typecheck` after every phase.
- **Lint:** run configured linter after Phase 9 (or after any phase that touches many files).
- **Visual smoke test:** open home, get-started, guide, endpoint, reference variables, reference errors in both light and dark mode.
- **Interaction checks:** search shortcut, sidebar expand/collapse, code copy, language/response switches, feedback widget, prev/next links.
- **Bundle check:** run build and inspect chunk sizes after adding Lucide registry; remove unused icons if bundle grows unexpectedly.

## 11. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Nuxt auto-import naming conflicts with nested folders. | Keep sub-components flat in `ui/`; use `index.vue` for single-export components. Verify registration in Phase 0. |
| Line numbers break Shiki output or copy behavior. | Use CSS counters on `.line`; test copy/paste across browsers. |
| Large refactor introduces regressions. | Phase-by-phase delivery with build + type + smoke tests at each boundary; keep old files until Phase 9. |
| Lucide registry bloats bundle. | Keep registry small; audit bundle size after Phase 1; remove unused icons. |
| Always-dark panels clash with existing prose code blocks. | Make `dark` an explicit prop on `DocsCodeBlock`; request/response panels pass `dark`, body panels default to theme. |
| Project is not under version control. | Initialize git before Phase 1, or maintain manual backups before destructive phases. |

## 12. Success Criteria

- `app/pages/[...slug].vue` is under 60 lines.
- No inline SVGs remain in components except brand-specific assets (logo).
- All components live in categorized subfolders.
- `npm run build` passes.
- `nuxt typecheck` passes.
- Endpoint pages show body sample, request sample, and response panels with dropdowns/tabs.
- Home and get-started pages use the new component library.
- Site looks and behaves the same or better than before the refactor.
