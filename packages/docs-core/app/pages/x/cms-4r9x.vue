<template>
  <NuxtLayout name="docs">
    <div class="mb-8">
      <h1 class="text-3xl lg:text-4xl font-bold text-ink-primary dark:text-dark-text">
        Content Management Guide
      </h1>
      <p class="mt-3 text-[15px] text-ink-secondary dark:text-dark-muted">
        Internal reference for writing and managing guide page content in the Vesicash docs.
        This page is not linked in the sidebar or indexed in search — access by direct URL only.
      </p>
    </div>

    <!-- ─── Overview ──────────────────────────────────────────────────── -->
    <h2 id="overview" class="text-xl font-bold text-ink-primary dark:text-dark-text mb-3 mt-10">Overview</h2>
    <div class="docs-prose mb-6">
      <p>
        Guide page content lives in <code>public/collection.json</code> — specifically in each
        request item's <code>description</code> field. The parser reads this field, strips the
        frontmatter, extracts special sections, and renders the rest as a mix of prose, code
        blocks, and component directives.
      </p>
      <p>Two systems work together:</p>
      <ul>
        <li><strong>Standard Markdown</strong> — headings, paragraphs, tables, lists, links, inline code. Rendered as-is.</li>
        <li><strong>@directive blocks</strong> — fenced code blocks with an <code>@alias</code> language identifier that map to specific Vue components. Use these when you need a callout, a step card, a diagram, or any component beyond plain text.</li>
      </ul>
    </div>

    <!-- ─── Frontmatter ───────────────────────────────────────────────── -->
    <h2 id="frontmatter" class="text-xl font-bold text-ink-primary dark:text-dark-text mb-3 mt-10">Page Frontmatter</h2>
    <div class="docs-prose mb-4">
      <p>Every guide description must begin with a YAML frontmatter block:</p>
    </div>
    <DocsCodeBlock variant="simple" language="yaml" title="Required frontmatter" :code="ex.frontmatter" class="mb-6" />
    <div class="docs-prose mb-6">
      <p>
        Without <code>docs-type: guide</code>, the page will render as an API endpoint page
        instead of a guide page. The frontmatter block is stripped before parsing begins.
      </p>
    </div>

    <!-- ─── Special Sections ─────────────────────────────────────────── -->
    <h2 id="special-sections" class="text-xl font-bold text-ink-primary dark:text-dark-text mb-3 mt-10">Special Sections</h2>
    <div class="docs-prose mb-4">
      <p>
        Certain <code>###</code> headings immediately after the frontmatter are intercepted
        and rendered as named callout blocks. They must appear <em>before</em> any other
        <code>##</code> section to take effect.
      </p>
    </div>
    <DocsCodeBlock variant="simple" language="markdown" title="Special ### sections" :code="ex.specialSections" class="mb-4" />
    <div class="docs-prose mb-6">
      <ul>
        <li><code>### In a nutshell</code> — renders as a blue info callout at the top of the page.</li>
        <li><code>### Before you begin</code> — renders as a green prerequisite callout.</li>
      </ul>
      <p>Both are optional. Use them on conceptual pages. Skip them on reference pages.</p>
    </div>

    <!-- ─── Standard Markdown ─────────────────────────────────────────── -->
    <h2 id="standard-markdown" class="text-xl font-bold text-ink-primary dark:text-dark-text mb-3 mt-10">Standard Markdown</h2>
    <div class="docs-prose mb-6">
      <p>Everything not wrapped in a fence block is parsed as standard CommonMark markdown:</p>
      <ul>
        <li><strong>Headings</strong> — <code>##</code> and <code>###</code> appear in "On this page" automatically.</li>
        <li><strong>Paragraphs, bold, italic, inline code</strong> — works as expected.</li>
        <li><strong>Tables</strong> — GFM pipe tables are supported.</li>
        <li><strong>Ordered and unordered lists</strong></li>
        <li><strong>Blockquotes</strong> — rendered with left border styling. For semantic callouts, prefer <code>@callout</code>.</li>
        <li><strong>Links</strong> — <code>[text](href)</code>. Use relative paths for internal links.</li>
        <li><strong>Fenced code blocks</strong> — plain <code>```lang</code> fences render as code blocks with props on the opening line.</li>
      </ul>
    </div>

    <!-- ─── Plain fence props ────────────────────────────────────────── -->
    <h2 id="plain-fence-props" class="text-xl font-bold text-ink-primary dark:text-dark-text mb-3 mt-10">Plain Fence Block Props</h2>
    <div class="docs-prose mb-4">
      <p>
        Standard fenced code blocks accept props on the opening line to control the code block header:
      </p>
    </div>
    <DocsCodeBlock variant="simple" language="markdown" title="Plain fence with props" :code="ex.plainFenceProps" class="mb-4" />
    <div class="docs-prose mb-6">
      <ul>
        <li><code>title="..."</code> — overrides the auto-detected language label in the header</li>
        <li><code>hideCopy</code> — hides the copy button</li>
        <li><code>hideHeader</code> — hides the entire header bar</li>
        <li><code>language="..."</code> — overrides the syntax highlighting language</li>
      </ul>
    </div>

    <!-- ─── @directive System ─────────────────────────────────────────── -->
    <h2 id="directive-system" class="text-xl font-bold text-ink-primary dark:text-dark-text mb-3 mt-10">@directive System</h2>
    <div class="docs-prose mb-4">
      <p>
        Directives use standard Markdown fenced code block syntax. Replace the language
        identifier with <code>@alias</code> to invoke a component:
      </p>
    </div>
    <DocsCodeBlock variant="simple" language="markdown" title="Directive syntax" :code="ex.directiveSyntax" class="mb-4" />
    <div class="docs-prose mb-4">
      <p><strong>Prop value formats:</strong></p>
      <ul>
        <li><code>key="value"</code> — string (double quotes)</li>
        <li><code>key='value'</code> — string (single quotes)</li>
        <li><code>key=true</code> / <code>key=false</code> — explicit boolean</li>
        <li><code>bare-key</code> — shorthand for <code>key=true</code></li>
      </ul>
      <p><strong>Universal props available on every directive:</strong></p>
      <ul>
        <li><code>class="tailwind-classes"</code> — apply Tailwind utility classes to the root element</li>
        <li><code>style="css: value"</code> — apply raw inline CSS; use this for arbitrary values that Tailwind's safelist can't cover (e.g. <code>style="margin-bottom: 120px"</code>)</li>
        <li><code>toc="Section Label"</code> — add this block to "On this page" with the given label</li>
      </ul>
    </div>
    <DocsCallout type="note" title="When to use toc">
      Only set <code>toc="Label"</code> when the section has no <code>##</code> or <code>###</code>
      heading. Using a heading is always preferred — <code>toc</code> exists for sections that
      are visually anchored by a component rather than a heading.
    </DocsCallout>

    <!-- ─── @callout ─────────────────────────────────────────────────── -->
    <h2 id="callout" class="text-xl font-bold text-ink-primary dark:text-dark-text mb-3 mt-10">@callout</h2>
    <div class="docs-prose mb-4">
      <p>Renders a coloured callout box with an icon, optional title, and body text.</p>
    </div>
    <div class="overflow-x-auto mb-4">
      <UiTable>
        <UiTableHead>
          <UiTableRow>
            <UiTableCell header>Prop</UiTableCell>
            <UiTableCell header>Type</UiTableCell>
            <UiTableCell header>Default</UiTableCell>
            <UiTableCell header>Description</UiTableCell>
          </UiTableRow>
        </UiTableHead>
        <UiTableBody>
          <UiTableRow v-for="row in calloutProps" :key="row[0]">
            <UiTableCell><code>{{ row[0] }}</code></UiTableCell>
            <UiTableCell><span class="text-[13px] text-ink-muted dark:text-dark-subtle">{{ row[1] }}</span></UiTableCell>
            <UiTableCell><span class="text-[13px] text-ink-muted dark:text-dark-subtle">{{ row[2] }}</span></UiTableCell>
            <UiTableCell><span class="text-[15px] text-ink-muted dark:text-dark-muted">{{ row[3] }}</span></UiTableCell>
          </UiTableRow>
        </UiTableBody>
      </UiTable>
    </div>
    <DocsCodeBlock variant="simple" language="markdown" title="@callout examples" :code="ex.callout" class="mb-4" />
    <div class="docs-prose mb-2"><p>Renders as:</p></div>
    <DocsCallout type="note" title="Note title">Body text goes here. Supports <strong>markdown</strong>.</DocsCallout>
    <DocsCallout type="warning" title="Warning">Double-check this before going live.</DocsCallout>
    <DocsCallout type="tip">No title — just a tip.</DocsCallout>

    <!-- ─── @code ────────────────────────────────────────────────────── -->
    <h2 id="code" class="text-xl font-bold text-ink-primary dark:text-dark-text mb-3 mt-10">@code</h2>
    <div class="docs-prose mb-4">
      <p>
        Renders a syntax-highlighted code block with full prop control. Use this over a plain
        fence when you need to control the title, hide the copy button, or hide the header.
        The body of the directive is the code content.
      </p>
    </div>
    <div class="overflow-x-auto mb-4">
      <UiTable>
        <UiTableHead>
          <UiTableRow>
            <UiTableCell header>Prop</UiTableCell>
            <UiTableCell header>Type</UiTableCell>
            <UiTableCell header>Default</UiTableCell>
            <UiTableCell header>Description</UiTableCell>
          </UiTableRow>
        </UiTableHead>
        <UiTableBody>
          <UiTableRow v-for="row in codeProps" :key="row[0]">
            <UiTableCell><code>{{ row[0] }}</code></UiTableCell>
            <UiTableCell><span class="text-[13px] text-ink-muted dark:text-dark-subtle">{{ row[1] }}</span></UiTableCell>
            <UiTableCell><span class="text-[13px] text-ink-muted dark:text-dark-subtle">{{ row[2] }}</span></UiTableCell>
            <UiTableCell><span class="text-[15px] text-ink-muted dark:text-dark-muted">{{ row[3] }}</span></UiTableCell>
          </UiTableRow>
        </UiTableBody>
      </UiTable>
    </div>
    <DocsCodeBlock variant="simple" language="markdown" title="@code example" :code="ex.code" class="mb-4" />
    <div class="docs-prose mb-2"><p>Renders as:</p></div>
    <DocsCodeBlock variant="simple" language="text" title="API BASE URL" :hide-copy="true" :code="API_BASE_URL" class="mb-6" />

    <!-- ─── @mermaid ─────────────────────────────────────────────────── -->
    <h2 id="mermaid" class="text-xl font-bold text-ink-primary dark:text-dark-text mb-3 mt-10">@mermaid</h2>
    <div class="docs-prose mb-4">
      <p>Renders a <a href="https://mermaid.js.org/" target="_blank" rel="noopener">Mermaid</a> diagram. The body is the Mermaid DSL code.</p>
    </div>
    <DocsCodeBlock variant="simple" language="markdown" title="@mermaid example" :code="ex.mermaid" class="mb-4" />
    <div class="docs-prose mb-2"><p>Renders as:</p></div>
    <DocsMermaid :diagram="mermaidDiagram" title="Payment flow" />

    <!-- ─── @step ─────────────────────────────────────────────────────── -->
    <h2 id="step" class="text-xl font-bold text-ink-primary dark:text-dark-text mb-3 mt-10">@step</h2>
    <div class="docs-prose mb-4">
      <p>
        Renders a numbered step card. Use multiple consecutive <code>@step</code> directives
        for a visual step sequence — set <code>last</code> on the final step to remove the
        connector line.
      </p>
    </div>
    <div class="overflow-x-auto mb-4">
      <UiTable>
        <UiTableHead>
          <UiTableRow>
            <UiTableCell header>Prop</UiTableCell>
            <UiTableCell header>Type</UiTableCell>
            <UiTableCell header>Required</UiTableCell>
            <UiTableCell header>Description</UiTableCell>
          </UiTableRow>
        </UiTableHead>
        <UiTableBody>
          <UiTableRow v-for="row in stepProps" :key="row[0]">
            <UiTableCell><code>{{ row[0] }}</code></UiTableCell>
            <UiTableCell><span class="text-[13px] text-ink-muted dark:text-dark-subtle">{{ row[1] }}</span></UiTableCell>
            <UiTableCell><span class="text-[13px] text-ink-muted dark:text-dark-subtle">{{ row[2] }}</span></UiTableCell>
            <UiTableCell><span class="text-[15px] text-ink-muted dark:text-dark-muted">{{ row[3] }}</span></UiTableCell>
          </UiTableRow>
        </UiTableBody>
      </UiTable>
    </div>
    <DocsCodeBlock variant="simple" language="markdown" title="@step example" :code="ex.step" class="mb-4" />
    <div class="docs-prose mb-2"><p>Renders as:</p></div>
    <DocsStep :number="1" title="Create your account" description="Takes about 2 minutes">
      Sign up at portal.vesicash.com and verify your business identity.
    </DocsStep>
    <DocsStep :number="2" title="Get your API key" :last="true">
      Navigate to <strong>Settings → API Keys</strong> in the dashboard.
    </DocsStep>

    <!-- ─── @image ─────────────────────────────────────────────────────── -->
    <h2 id="image" class="text-xl font-bold text-ink-primary dark:text-dark-text mb-3 mt-10">@image</h2>
    <div class="docs-prose mb-4">
      <p>
        Renders a responsive image. <code>src</code> can point to a file in <code>public/</code>
        or an external URL. Optional body text becomes a caption below the image.
      </p>
    </div>
    <DocsCodeBlock variant="simple" language="markdown" title="@image example" :code="ex.image" class="mb-6" />

    <!-- ─── @card ─────────────────────────────────────────────────────── -->
    <h2 id="card" class="text-xl font-bold text-ink-primary dark:text-dark-text mb-3 mt-10">@card</h2>
    <div class="docs-prose mb-4">
      <p>Renders a bordered card with prose content inside.</p>
    </div>
    <div class="overflow-x-auto mb-4">
      <UiTable>
        <UiTableHead>
          <UiTableRow>
            <UiTableCell header>Prop</UiTableCell>
            <UiTableCell header>Values</UiTableCell>
            <UiTableCell header>Default</UiTableCell>
          </UiTableRow>
        </UiTableHead>
        <UiTableBody>
          <UiTableRow>
            <UiTableCell><code>variant</code></UiTableCell>
            <UiTableCell><span class="text-[13px] text-ink-muted">default · bordered · elevated</span></UiTableCell>
            <UiTableCell><span class="text-[13px] text-ink-muted">bordered</span></UiTableCell>
          </UiTableRow>
          <UiTableRow>
            <UiTableCell><code>padding</code></UiTableCell>
            <UiTableCell><span class="text-[13px] text-ink-muted">none · sm · md · lg</span></UiTableCell>
            <UiTableCell><span class="text-[13px] text-ink-muted">md</span></UiTableCell>
          </UiTableRow>
        </UiTableBody>
      </UiTable>
    </div>
    <DocsCodeBlock variant="simple" language="markdown" title="@card example" :code="ex.card" class="mb-4" />
    <div class="docs-prose mb-2"><p>Renders as:</p></div>
    <UiCard variant="bordered" padding="md" class="mb-6">
      <div class="docs-prose"><p>Content inside the card. Supports full markdown including <strong>bold</strong>, lists, and code.</p></div>
    </UiCard>

    <!-- ─── @badge ────────────────────────────────────────────────────── -->
    <h2 id="badge" class="text-xl font-bold text-ink-primary dark:text-dark-text mb-3 mt-10">@badge</h2>
    <div class="docs-prose mb-4">
      <p>Renders an inline badge. The body text is the badge label.</p>
    </div>
    <div class="overflow-x-auto mb-4">
      <UiTable>
        <UiTableHead>
          <UiTableRow>
            <UiTableCell header>Prop</UiTableCell>
            <UiTableCell header>Values</UiTableCell>
            <UiTableCell header>Default</UiTableCell>
          </UiTableRow>
        </UiTableHead>
        <UiTableBody>
          <UiTableRow>
            <UiTableCell><code>variant</code></UiTableCell>
            <UiTableCell><span class="text-[13px] text-ink-muted">default · success · warning · error · info</span></UiTableCell>
            <UiTableCell><span class="text-[13px] text-ink-muted">default</span></UiTableCell>
          </UiTableRow>
          <UiTableRow>
            <UiTableCell><code>size</code></UiTableCell>
            <UiTableCell><span class="text-[13px] text-ink-muted">sm · md</span></UiTableCell>
            <UiTableCell><span class="text-[13px] text-ink-muted">md</span></UiTableCell>
          </UiTableRow>
          <UiTableRow>
            <UiTableCell><code>rounded</code></UiTableCell>
            <UiTableCell><span class="text-[13px] text-ink-muted">full · md</span></UiTableCell>
            <UiTableCell><span class="text-[13px] text-ink-muted">full</span></UiTableCell>
          </UiTableRow>
        </UiTableBody>
      </UiTable>
    </div>
    <DocsCodeBlock variant="simple" language="markdown" title="@badge example" :code="ex.badge" class="mb-4" />
    <div class="docs-prose mb-2"><p>Renders as:</p></div>
    <div class="flex gap-2 flex-wrap mb-6">
      <UiBadge variant="success">Live</UiBadge>
      <UiBadge variant="warning" size="sm">Beta</UiBadge>
      <UiBadge variant="error">Deprecated</UiBadge>
      <UiBadge variant="info">v2</UiBadge>
    </div>

    <!-- ─── @button ───────────────────────────────────────────────────── -->
    <h2 id="button" class="text-xl font-bold text-ink-primary dark:text-dark-text mb-3 mt-10">@button</h2>
    <div class="docs-prose mb-4">
      <p>Renders a standalone CTA button. The body text is the button label.</p>
    </div>
    <div class="overflow-x-auto mb-4">
      <UiTable>
        <UiTableHead>
          <UiTableRow>
            <UiTableCell header>Prop</UiTableCell>
            <UiTableCell header>Values / Type</UiTableCell>
            <UiTableCell header>Description</UiTableCell>
          </UiTableRow>
        </UiTableHead>
        <UiTableBody>
          <UiTableRow v-for="row in buttonProps" :key="row[0]">
            <UiTableCell><code>{{ row[0] }}</code></UiTableCell>
            <UiTableCell><span class="text-[13px] text-ink-muted dark:text-dark-subtle">{{ row[1] }}</span></UiTableCell>
            <UiTableCell><span class="text-[15px] text-ink-muted dark:text-dark-muted">{{ row[2] }}</span></UiTableCell>
          </UiTableRow>
        </UiTableBody>
      </UiTable>
    </div>
    <DocsCodeBlock variant="simple" language="markdown" title="@button example" :code="ex.button" class="mb-4" />
    <div class="docs-prose mb-2"><p>Renders as:</p></div>
    <div class="flex gap-3 flex-wrap mb-6">
      <UiButton to="/getting-started/introduction" variant="primary">Get started</UiButton>
      <UiButton href="https://portal.vesicash.com" variant="secondary">Open dashboard</UiButton>
      <UiButton href="mailto:developers@vesicash.com" variant="outline">Contact support</UiButton>
    </div>

    <!-- ─── @support ──────────────────────────────────────────────────── -->
    <h2 id="support" class="text-xl font-bold text-ink-primary dark:text-dark-text mb-3 mt-10">@support</h2>
    <div class="docs-prose mb-4">
      <p>Renders the support CTA card. The body becomes the description text.</p>
    </div>
    <div class="overflow-x-auto mb-4">
      <UiTable>
        <UiTableHead>
          <UiTableRow>
            <UiTableCell header>Prop</UiTableCell>
            <UiTableCell header>Default</UiTableCell>
            <UiTableCell header>Description</UiTableCell>
          </UiTableRow>
        </UiTableHead>
        <UiTableBody>
          <UiTableRow v-for="row in supportProps" :key="row[0]">
            <UiTableCell><code>{{ row[0] }}</code></UiTableCell>
            <UiTableCell><span class="text-[13px] text-ink-muted dark:text-dark-subtle">{{ row[1] }}</span></UiTableCell>
            <UiTableCell><span class="text-[15px] text-ink-muted dark:text-dark-muted">{{ row[2] }}</span></UiTableCell>
          </UiTableRow>
        </UiTableBody>
      </UiTable>
    </div>
    <DocsCodeBlock variant="simple" language="markdown" title="@support example" :code="ex.support" class="mb-4" />
    <div class="docs-prose mb-2"><p>Renders as:</p></div>
    <DocsSupportCta
      title="Questions about rate limits?"
      description="Our engineering team can help you plan for high-volume traffic."
      class="mb-6"
    />

    <!-- ─── @table ────────────────────────────────────────────────────── -->
    <h2 id="table" class="text-xl font-bold text-ink-primary dark:text-dark-text mb-3 mt-10">@table</h2>
    <div class="docs-prose mb-4">
      <p>
        Renders a GFM markdown table with <code>overflow-x-auto</code> wrapping for mobile.
        Use this when a standalone table needs horizontal scroll without surrounding prose.
      </p>
    </div>
    <DocsCodeBlock variant="simple" language="markdown" title="@table example" :code="ex.table" class="mb-6" />

    <!-- ─── @prose ────────────────────────────────────────────────────── -->
    <h2 id="prose" class="text-xl font-bold text-ink-primary dark:text-dark-text mb-3 mt-10">@prose</h2>
    <div class="docs-prose mb-4">
      <p>
        Renders a styled text block. Use this when you need Tailwind class overrides on a
        prose section — custom margin, colour, or size — that standard markdown can't express.
      </p>
    </div>
    <DocsCodeBlock variant="simple" language="markdown" title="@prose example" :code="ex.prose" class="mb-6" />

    <!-- ─── TOC Configuration ─────────────────────────────────────────── -->
    <h2 id="toc-configuration" class="text-xl font-bold text-ink-primary dark:text-dark-text mb-3 mt-10">TOC Configuration</h2>
    <div class="docs-prose mb-4">
      <p>
        The "On this page" sidebar is built from <code>h2</code> and <code>h3</code> headings
        automatically. Directive blocks that set <code>toc="Label"</code> also appear — they
        get an <code>id</code> on their root element and are observed alongside headings.
      </p>
      <p>Use <code>toc</code> only when a section has no heading but should still be linkable.</p>
    </div>
    <DocsCodeBlock variant="simple" language="markdown" title="toc prop example" :code="ex.toc" class="mb-6" />

    <!-- ─── Unknown Directives ────────────────────────────────────────── -->
    <h2 id="unknown-directives" class="text-xl font-bold text-ink-primary dark:text-dark-text mb-3 mt-10">Unknown Directives</h2>
    <div class="docs-prose mb-6">
      <p>
        If you use an alias not in the supported list (e.g. <code>@widget</code>), the
        directive falls back to rendering its content as plain prose, with a warning logged
        to the browser console. The page won't break — but the intended component won't
        render. Check the alias spelling against the table below.
      </p>
    </div>

    <!-- ─── Spacing & Separators ─────────────────────────────────────── -->
    <h2 id="spacing" class="text-xl font-bold text-ink-primary dark:text-dark-text mb-3 mt-10">Spacing & Separators</h2>
    <div class="docs-prose mb-4">
      <p>
        Markdown ignores multiple blank lines between paragraphs, so adding extra blank lines
        in Postman has no visual effect. Use one of these patterns instead.
      </p>
    </div>

    <h3 id="spacing-hr" class="text-base font-semibold text-ink-primary dark:text-dark-text mb-2 mt-6">Horizontal rule (visual divider)</h3>
    <div class="docs-prose mb-4">
      <p>
        Place <code>---</code> on its own line to render a subtle horizontal dividing line
        between sections. This is the simplest option and reads cleanly in Postman.
      </p>
    </div>
    <DocsCodeBlock variant="simple" language="markdown" title="Horizontal rule" :code="ex.spacingHr" class="mb-6" />

    <h3 id="spacing-class" class="text-base font-semibold text-ink-primary dark:text-dark-text mb-2 mt-6">Extra margin via class prop</h3>
    <div class="docs-prose mb-4">
      <p>
        Every directive accepts a <code>class</code> prop. Use Tailwind margin utilities to
        push a block further from the one above it without adding a visible line.
      </p>
    </div>
    <DocsCodeBlock variant="simple" language="markdown" title="Extra top margin on a directive" :code="ex.spacingClass" class="mb-6" />

    <h3 id="spacing-style" class="text-base font-semibold text-ink-primary dark:text-dark-text mb-2 mt-6">Exact pixel spacing via style prop</h3>
    <div class="docs-prose mb-4">
      <p>
        When you need exact pixel control that Tailwind's scale doesn't cover, use the
        <code>style</code> prop instead of <code>class</code>. This bypasses Tailwind entirely —
        no safelist or build-time scanning required, so it works whether you're editing
        locally or managing content directly in Postman.
      </p>
    </div>
    <DocsCodeBlock variant="simple" language="markdown" title="Exact pixel margin via style prop" :code="ex.spacingStyle" class="mb-6" />

    <h3 id="spacing-prose" class="text-base font-semibold text-ink-primary dark:text-dark-text mb-2 mt-6">Blank spacer block</h3>
    <div class="docs-prose mb-4">
      <p>
        When you need precise vertical space between two directives without a heading or rule,
        use an empty <code>@prose</code> block with a height class.
      </p>
      <p>
        <strong>Important:</strong> the closing <code>```</code> must be on its own line.
        Writing <code>```@prose```</code> all on one line is never parsed as a fence — the
        parser requires a newline after the alias before the body and closing fence.
      </p>
    </div>
    <DocsCodeBlock variant="simple" language="markdown" title="Empty spacer — correct syntax" :code="ex.spacingSpacer" class="mb-4" />
    <DocsCallout type="warning" title="Common mistake">
      <code>```@prose```</code> on a single line is ignored — the fence is never detected.
      Always put the closing <code>```</code> on its own line, even for an empty body.
    </DocsCallout>
    <div class="mb-10" />

    <!-- ─── Quick Reference ───────────────────────────────────────────── -->
    <h2 id="quick-reference" class="text-xl font-bold text-ink-primary dark:text-dark-text mb-3 mt-10">Quick Reference</h2>
    <div class="overflow-x-auto mb-10">
      <UiTable>
        <UiTableHead>
          <UiTableRow>
            <UiTableCell header>Alias</UiTableCell>
            <UiTableCell header>Component</UiTableCell>
            <UiTableCell header>Key props</UiTableCell>
          </UiTableRow>
        </UiTableHead>
        <UiTableBody>
          <UiTableRow v-for="row in quickRef" :key="row[0]">
            <UiTableCell><code>{{ row[0] }}</code></UiTableCell>
            <UiTableCell><span class="text-[13px] text-ink-muted dark:text-dark-subtle">{{ row[1] }}</span></UiTableCell>
            <UiTableCell><span class="text-[13px] text-ink-muted dark:text-dark-subtle">{{ row[2] }}</span></UiTableCell>
          </UiTableRow>
        </UiTableBody>
      </UiTable>
    </div>

    <DocsPageFooter :prev="null" :next="null" />
  </NuxtLayout>
</template>

<script setup lang="ts">
// All code example strings live here — never inline in the template.
// Triple-backtick strings inside Vue template bindings break the compiler.
const { api } = useRuntimeConfig().public as { api: { baseUrl: string } }
const API_BASE_URL = api.baseUrl

const ex = {
  frontmatter: `---\ndocs-type: guide\n---`,

  specialSections: [
    '### In a nutshell',
    'One sentence summary of what this page covers.',
    '',
    '### Before you begin',
    '- Prerequisite one',
    '- Prerequisite two',
  ].join('\n'),

  plainFenceProps: [
    '```json title="Success Response" hideCopy',
    '{ "success": true }',
    '```',
    '',
    '```text title="Base URL" hideHeader',
    API_BASE_URL,
    '```',
  ].join('\n'),

  directiveSyntax: [
    '```@alias prop="value" bool-prop toc="TOC Label"',
    'Content goes here.',
    'This can span multiple lines.',
    '```',
  ].join('\n'),

  callout: [
    '```@callout type="note" title="Note title"',
    'Body text goes here. Supports **markdown**.',
    '```',
    '',
    '```@callout type="warning" title="Warning"',
    'Double-check this before going live.',
    '```',
    '',
    '```@callout type="tip"',
    'No title — just a tip.',
    '```',
  ].join('\n'),

  code: [
    '```@code title="API BASE URL" hideCopy',
    API_BASE_URL,
    '```',
  ].join('\n'),

  mermaid: [
    '```@mermaid title="Payment flow"',
    'flowchart LR',
    '  A[Initiate payment] --> B[User checkout]',
    '  B --> C{Payment status}',
    '  C -->|success| D[Webhook fired]',
    '  C -->|failed| E[Show error]',
    '```',
  ].join('\n'),

  step: [
    '```@step number=1 title="Create your account" description="Takes about 2 minutes"',
    'Sign up at [portal.vesicash.com](https://portal.vesicash.com) and verify your business.',
    '```',
    '',
    '```@step number=2 title="Get your API key" last',
    'Navigate to **Settings → API Keys** in the dashboard.',
    '```',
  ].join('\n'),

  image: [
    '```@image src="/screenshots/dashboard.png" alt="Vesicash dashboard" class="shadow-lg"',
    'Figure caption goes here (optional).',
    '```',
  ].join('\n'),

  card: [
    '```@card variant="bordered" padding="md"',
    'Content inside the card. Supports full markdown including **bold**, lists, and code.',
    '```',
  ].join('\n'),

  badge: [
    '```@badge variant="success"',
    'Live',
    '```',
    '',
    '```@badge variant="warning" size="sm"',
    'Beta',
    '```',
  ].join('\n'),

  button: [
    '```@button to="/getting-started/introduction" variant="primary"',
    'Get started',
    '```',
    '',
    '```@button href="https://portal.vesicash.com" variant="secondary"',
    'Open dashboard',
    '```',
    '',
    '```@button href="mailto:developers@vesicash.com" variant="outline"',
    'Contact support',
    '```',
  ].join('\n'),

  support: [
    '```@support title="Questions about rate limits?"',
    'Our engineering team can help you plan for high-volume traffic.',
    '```',
  ].join('\n'),

  table: [
    '```@table toc="Supported Currencies"',
    '| Country | Currency | Code | Min Amount |',
    '|---------|----------|------|------------|',
    '| Ghana   | Cedis    | GHS  | 100        |',
    '| Nigeria | Naira    | NGN  | 5000       |',
    '```',
  ].join('\n'),

  prose: [
    '```@prose class="text-sm text-ink-muted mt-4"',
    'This note renders in a smaller muted font with custom top margin.',
    '```',
  ].join('\n'),

  toc: [
    '```@callout type="note" title="Rate Limit Response" toc="Rate Limit Response"',
    'When you hit the limit, the API returns 429 Too Many Requests.',
    '```',
  ].join('\n'),

  spacingHr: [
    '## Section One',
    '',
    'Some content here.',
    '',
    '---',
    '',
    '## Section Two',
    '',
    'More content here.',
  ].join('\n'),

  spacingClass: [
    '```@callout type="tip" title="Pro tip" class="mt-10"',
    'This callout has extra space above it.',
    '```',
    '',
    '```@step number=1 title="First step" class="mt-8"',
    'This step starts further down the page.',
    '```',
  ].join('\n'),

  spacingStyle: [
    '```@callout type="tip" title="Need exact spacing?" style="margin-bottom: 120px"',
    'This callout has exactly 120px of space below it — no Tailwind class required.',
    '```',
    '',
    '```@prose style="margin-top: 60px; padding: 0 24px"',
    'You can combine multiple CSS properties in one style prop.',
    '```',
  ].join('\n'),

  spacingSpacer: [
    '```@step number=1 title="First step" last',
    'Do this.',
    '```',
    '',
    '```@prose class="h-8"',
    '',          // body must exist — even a blank line — before the closing fence
    '```',
    '',
    '```@callout type="note"',
    'This block has extra space above it.',
    '```',
  ].join('\n'),
}

const mermaidDiagram = [
  'flowchart LR',
  '  A[Initiate payment] --> B[User checkout]',
  '  B --> C{Payment status}',
  '  C -->|success| D[Webhook fired]',
  '  C -->|failed| E[Show error]',
].join('\n')

const calloutProps = [
  ['type', 'string', 'note', 'note · warning · tip'],
  ['title', 'string', '—', 'Optional heading above the body'],
  ['class', 'string', '—', 'Additional Tailwind classes'],
  ['toc', 'string', '—', 'Add to TOC with this label'],
]

const codeProps = [
  ['language', 'string', 'text', 'Syntax highlighting language (json, bash, javascript …)'],
  ['title', 'string', 'auto', 'Override the auto-detected language label in the header'],
  ['hideCopy', 'bool', 'false', 'Hide the copy button'],
  ['hideHeader', 'bool', 'false', 'Hide the entire header bar'],
  ['class', 'string', '—', 'Additional Tailwind classes'],
  ['toc', 'string', '—', 'Add to TOC with this label'],
]

const stepProps = [
  ['number', 'integer', '1', 'The step number shown in the circle badge'],
  ['title', 'string', '—', 'Step heading (required)'],
  ['description', 'string', '—', 'Optional subtitle below the heading'],
  ['last', 'bool', 'false', 'Hide the connector line below (use on the final step)'],
  ['class', 'string', '—', 'Additional Tailwind classes'],
  ['toc', 'string', '—', 'Add to TOC with this label'],
]

const buttonProps = [
  ['to', 'string', 'Internal route (uses NuxtLink)'],
  ['href', 'string', 'External URL or mailto:'],
  ['variant', 'primary · secondary · outline · ghost · link', 'Default: primary'],
  ['size', 'sm · md · lg', 'Default: md'],
]

const supportProps = [
  ['title', 'Need help integrating?', 'Card heading'],
  ['buttonText', 'Contact support', 'Button label'],
  ['href', 'mailto:developers@vesicash.com', 'Button destination'],
]

const quickRef = [
  ['@prose', 'Styled div', 'class, toc'],
  ['@callout', 'DocsCallout', 'type, title, class, toc'],
  ['@code', 'DocsCodeBlock', 'language, title, hideCopy, hideHeader, class, toc'],
  ['@mermaid', 'DocsMermaid', 'title, class, toc'],
  ['@step', 'DocsStep', 'number, title, description, last, class, toc'],
  ['@steps', 'Step wrapper div', 'class, toc'],
  ['@image', 'figure + img', 'src, alt, class, toc'],
  ['@card', 'UiCard', 'variant, padding, class, toc'],
  ['@badge', 'UiBadge', 'variant, size, rounded, class'],
  ['@button', 'UiButton', 'to, href, variant, size, class'],
  ['@support', 'DocsSupportCta', 'title, buttonText, href, class'],
  ['@table', 'Prose table wrapper', 'class, toc'],
]
</script>
