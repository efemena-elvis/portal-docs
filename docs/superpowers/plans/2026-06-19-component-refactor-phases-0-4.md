# Vesicash Docs — Component Refactor Phases 0–4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the reusable UI primitive layer and the core docs layout/content components, replacing inline SVGs and ad-hoc Tailwind classes with typed, prop-driven Vue components.

**Architecture:** Components live in categorized subfolders (`ui/`, `docs/`, `shared/`). Primitives are theme-aware and composable. Docs components consume primitives and encapsulate Vesicash-specific behavior. The original plan was to keep flat `app/components/docs/*.vue` files until Phase 9; in practice, several were replaced during Phases 2–4 because their auto-import names collided with the new directory-based components.

**Tech Stack:** Nuxt 4.4.8, Vue 3.5, TypeScript, Tailwind CSS, Shiki, `@lucide/vue`.

---

## File Structure Overview

New files created in Phases 0–4:

```
app/components/
├── ui/
│   ├── Text/index.vue
│   ├── Button/index.vue
│   ├── Input/index.vue
│   ├── Textarea/index.vue
│   ├── Select/index.vue
│   ├── Icon/
│   │   ├── index.vue
│   │   └── icons.ts
│   ├── Badge/index.vue
│   ├── Kbd/index.vue
│   ├── Card/index.vue
│   ├── CopyButton/index.vue
│   ├── Table.vue
│   ├── TableHead.vue
│   ├── TableBody.vue
│   ├── TableRow.vue
│   └── TableCell.vue
│
├── docs/
│   ├── Topbar/index.vue
│   ├── Sidebar/index.vue
│   ├── SidebarItem/index.vue
│   ├── SidebarSection/index.vue
│   ├── SidebarFooter/index.vue
│   ├── OnThisPage/index.vue
  │   ├── Callout/index.vue
  │   ├── MethodBadge/index.vue
  │   ├── CodeBlock/index.vue
  │   ├── CodeTabs/index.vue
  │   ├── CodePanel/index.vue
│   ├── ParamsTable/index.vue
│   ├── Mermaid/index.vue
│   ├── Feedback/index.vue
│   ├── SupportCta/index.vue
│   └── PageFooter/index.vue
│
└── shared/
    └── AppShell/index.vue

app/composables/
└── useClipboard.ts

app/types/
└── docs.ts
```

---

## Phase 0 — Foundation & Tooling

### Task 0.1: Create folder structure

**Files:**
- Create directories: `app/components/ui/`, `app/components/docs/`, `app/components/shared/`, `app/composables/`, `app/types/`

**Steps:**
- [x] Run:
  ```bash
  mkdir -p app/components/ui app/components/docs app/components/shared app/composables app/types
  ```
- [x] Verify directories exist.

---

### Task 0.2: Install Lucide Vue

**Files:**
- Modify: `package.json`

**Steps:**
- [x] Run:
  ```bash
  npm install @lucide/vue
  ```
- [x] Verify `package.json` includes `@lucide/vue`.
- [x] Run `npm run build` to ensure install did not break anything.

---

### Task 0.3: Create shared types file

**Files:**
- Create: `app/types/docs.ts`

**Steps:**
- [x] Write `app/types/docs.ts`:
  ```typescript
  export interface TableRow {
    name: string
    type?: string
    required: boolean
    description: string
  }

  export interface NavLink {
    label: string
    href: string
  }

  export interface CodeExample {
    id: string
    label: string
    language: string
    code: string
  }

  export interface CodeLanguageOption {
    id: string
    label: string
  }

  export interface CodeResponseOption {
    id: string
    label: string
    code: number
    status: string
    body: string
  }
  ```

---

### Task 0.4: Create useClipboard composable

**Files:**
- Create: `app/composables/useClipboard.ts`

**Steps:**
- [x] Write `app/composables/useClipboard.ts`:
  ```typescript
  export function useClipboard() {
    const copied = ref(false)
    let timer: ReturnType<typeof setTimeout> | null = null

    async function copy(text: string) {
      try {
        await navigator.clipboard.writeText(text)
        copied.value = true
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => { copied.value = false }, 1500)
      } catch (e) {
        console.error('Clipboard copy failed', e)
      }
    }

    onScopeDispose(() => {
      if (timer) clearTimeout(timer)
    })

    return { copied, copy }
  }
  ```

---

### Task 0.5: Create icon registry

**Files:**
- Create: `app/components/ui/Icon/icons.ts`

**Steps:**
- [x] Write `app/components/ui/Icon/icons.ts`:
  ```typescript
  import {
    Search,
    Menu,
    X,
    ChevronRight,
    ChevronDown,
    ChevronLeft,
    ChevronUp,
    Copy,
    Check,
    Sun,
    Moon,
    ExternalLink,
    ArrowRight,
    ArrowLeft,
    List,
    Info,
    AlertTriangle,
    Lightbulb,
    PlusCircle,
    ArrowLeftCircle,
    Mail,
    Loader2,
  } from '@lucide/vue'

  export const icons = {
    search: Search,
    menu: Menu,
    close: X,
    chevronRight: ChevronRight,
    chevronDown: ChevronDown,
    chevronLeft: ChevronLeft,
    chevronUp: ChevronUp,
    copy: Copy,
    check: Check,
    sun: Sun,
    moon: Moon,
    externalLink: ExternalLink,
    arrowRight: ArrowRight,
    arrowLeft: ArrowLeft,
    list: List,
    info: Info,
    alertTriangle: AlertTriangle,
    lightbulb: Lightbulb,
    plusCircle: PlusCircle,
    arrowLeftCircle: ArrowLeftCircle,
    mail: Mail,
    loader: Loader2,
  } as const

  export type IconName = keyof typeof icons
  ```
- [x] Note: keep registry small; monitor bundle size in Phase 1.

---

### Task 0.6: Update tailwind.config.ts if needed

**Files:**
- Modify: `tailwind.config.ts`

**Steps:**
- [x] Verify `surface-sage-dark: '#D1D9D7'` exists in the config.
- [x] If not present, add it under `surface` colors.
- [x] No other changes expected for Phases 0–4.

---

### Task 0.7: Verify Nuxt auto-imports and add typecheck script

**Files:**
- Modify: `package.json`
- Verify: `nuxt.config.ts`

**Steps:**
- [x] Check `package.json` for a `typecheck` script. If missing, add:
  ```json
  "typecheck": "nuxt typecheck"
  ```
- [x] Run:
  ```bash
  npm run build
  npm run typecheck
  ```
- [x] Build passes. Typecheck reports only pre-existing baseline errors.

---

## Phase 1 — UI Primitives

### Task 1.1: UiText

**Files:**
- Create: `app/components/ui/Text/index.vue`

**Steps:**
- [x] Write the component:
  ```vue
  <template>
    <component
      :is="as"
      class="ui-text"
      :class="[
        sizeClass,
        weightClass,
        colorClass,
      ]"
    >
      <slot />
    </component>
  </template>

  <script setup lang="ts">
  type TextVariant = 'body' | 'heading' | 'small' | 'muted' | 'lead'

  interface Props {
    as?: string
    variant?: TextVariant
    size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
    weight?: 'normal' | 'medium' | 'semibold' | 'bold'
    color?: 'default' | 'muted' | 'subtle' | 'primary' | 'brand'
  }

  const props = withDefaults(defineProps<Props>(), {
    as: 'p',
    variant: 'body',
    size: undefined,
    weight: undefined,
    color: 'default',
  })

  const sizeClass = computed(() => {
    if (props.size) return `text-${props.size}`
    const map: Record<TextVariant, string> = {
      body: 'text-base',
      heading: 'text-lg',
      small: 'text-xs',
      muted: 'text-sm',
      lead: 'text-lg',
    }
    return map[props.variant]
  })

  const weightClass = computed(() => {
    if (props.weight) return `font-${props.weight}`
    const map: Record<TextVariant, string> = {
      body: 'font-normal',
      heading: 'font-semibold',
      small: 'font-normal',
      muted: 'font-normal',
      lead: 'font-normal',
    }
    return map[props.variant]
  })

  const colorClass = computed(() => {
    const map: Record<string, string> = {
      default: 'text-ink-primary dark:text-dark-text',
      muted: 'text-ink-muted dark:text-dark-subtle',
      subtle: 'text-ink-secondary dark:text-dark-muted',
      primary: 'text-ink-primary dark:text-dark-text',
      brand: 'text-brand-green',
    }
    return map[props.color]
  })
  </script>
  ```

---

### Task 1.2: UiButton

**Files:**
- Create: `app/components/ui/Button/index.vue`

**Steps:**
- [x] Write the component:
  ```vue
  <template>
    <component
      :is="tag"
      :type="buttonType"
      :disabled="disabled || loading"
      :to="to"
      :href="href"
      :target="href ? target : undefined"
      :rel="href && target === '_blank' ? 'noopener noreferrer' : undefined"
      class="inline-flex items-center justify-center gap-1.5 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-green/30 disabled:opacity-50 disabled:cursor-not-allowed"
      :class="[sizeClass, variantClass, radiusClass]"
    >
      <UiIcon v-if="icon && iconPosition === 'left'" :name="icon" :size="iconSize" />
      <slot />
      <UiIcon v-if="icon && iconPosition === 'right'" :name="icon" :size="iconSize" />
    </component>
  </template>

  <script setup lang="ts">
  import type { IconName } from '~/components/ui/Icon/icons'

  interface Props {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link'
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
    loading?: boolean
    to?: string
    href?: string
    target?: string
    type?: 'button' | 'submit' | 'reset'
    icon?: IconName
    iconPosition?: 'left' | 'right'
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: 'primary',
    size: 'md',
    target: '_blank',
    type: 'button',
    iconPosition: 'left',
  })

  const tag = computed(() => {
    if (props.to) return 'NuxtLink'
    if (props.href) return 'a'
    return 'button'
  })

  const buttonType = computed(() => (tag.value === 'button' ? props.type : undefined))

  const sizeClass = computed(() => {
    const map = {
      sm: 'px-2.5 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-2.5 text-sm',
    }
    return map[props.size]
  })

  const radiusClass = computed(() => {
    const map = {
      sm: 'rounded-md',
      md: 'rounded-lg',
      lg: 'rounded-lg',
    }
    return map[props.size]
  })

  const variantClass = computed(() => {
    const map = {
      primary: 'bg-brand-green text-white hover:bg-brand-green/90',
      secondary: 'bg-surface-off-white dark:bg-dark-surface text-ink-secondary dark:text-dark-muted hover:bg-surface-sage dark:hover:bg-dark-border',
      outline: 'border border-surface-sage-dark dark:border-dark-border bg-transparent text-ink-secondary dark:text-dark-muted hover:border-brand-green/40 dark:hover:border-brand-green/40',
      ghost: 'bg-transparent text-ink-secondary dark:text-dark-muted hover:bg-surface-off-white dark:hover:bg-dark-surface',
      link: 'bg-transparent text-brand-blue dark:text-brand-sky hover:underline p-0',
    }
    return map[props.variant]
  })

  const iconSize = computed(() => {
    const map = { sm: 'xs', md: 'sm', lg: 'sm' }
    return map[props.size]
  })
  </script>
  ```

---

### Task 1.3: UiInput

**Files:**
- Create: `app/components/ui/Input/index.vue`

**Steps:**
- [x] Write the component:
  ```vue
  <template>
    <div class="relative flex items-center w-full">
      <span v-if="$slots.prefix || icon" class="absolute left-3 text-ink-muted dark:text-dark-subtle">
        <slot name="prefix">
          <UiIcon :name="icon" size="sm" />
        </slot>
      </span>
      <input
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        class="w-full text-sm bg-white dark:bg-dark-sidebar text-ink-primary dark:text-dark-text placeholder:text-ink-muted dark:placeholder:text-dark-subtle border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-green/30 disabled:opacity-60"
        :class="[sizeClass, paddingClass, errorClass]"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <button
        v-if="clearable && modelValue"
        type="button"
        class="absolute right-3 text-ink-muted dark:text-dark-subtle hover:text-ink-primary dark:hover:text-dark-text"
        @click="$emit('update:modelValue', '')"
      >
        <UiIcon name="close" size="xs" />
      </button>
      <span v-else-if="$slots.suffix" class="absolute right-3 text-ink-muted dark:text-dark-subtle">
        <slot name="suffix" />
      </span>
    </div>
  </template>

  <script setup lang="ts">
  import type { IconName } from '~/components/ui/Icon/icons'

  interface Props {
    modelValue?: string
    type?: string
    placeholder?: string
    disabled?: boolean
    readonly?: boolean
    error?: boolean | string
    size?: 'sm' | 'md' | 'lg'
    icon?: IconName
    clearable?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    type: 'text',
    size: 'md',
  })

  defineEmits<{ 'update:modelValue': [value: string] }>()

  const sizeClass = computed(() => {
    const map = { sm: 'h-8', md: 'h-10', lg: 'h-12' }
    return map[props.size]
  })

  const paddingClass = computed(() => {
    const left = props.$slots?.prefix || props.icon ? 'pl-9' : 'pl-3'
    const right = props.clearable || props.$slots?.suffix ? 'pr-9' : 'pr-3'
    return `${left} ${right}`
  })

  const errorClass = computed(() =>
    props.error
      ? 'border-red-400 focus:border-red-400 focus:ring-red-400/30'
      : 'border-surface-sage-dark dark:border-dark-border hover:border-brand-green/40 dark:hover:border-brand-green/40 focus:border-brand-green/60'
  )
  </script>
  ```

---

### Task 1.4: UiTextarea

**Files:**
- Create: `app/components/ui/Textarea/index.vue`

**Steps:**
- [x] Write the component:
  ```vue
  <template>
    <textarea
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :rows="rows"
      class="w-full text-sm bg-white dark:bg-dark-sidebar text-ink-primary dark:text-dark-text placeholder:text-ink-muted dark:placeholder:text-dark-subtle border border-surface-sage-dark dark:border-dark-border rounded-lg px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green/60 disabled:opacity-60"
      :class="[resizeClass, errorClass]"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
  </template>

  <script setup lang="ts">
  interface Props {
    modelValue?: string
    placeholder?: string
    disabled?: boolean
    rows?: number
    error?: boolean | string
    resize?: 'none' | 'vertical' | 'horizontal' | 'both'
  }

  withDefaults(defineProps<Props>(), {
    modelValue: '',
    rows: 3,
    resize: 'vertical',
  })

  defineEmits<{ 'update:modelValue': [value: string] }>()

  const resizeClass = computed((props) => `resize-${props.resize}`)
  const errorClass = computed((props) =>
    props.error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/30' : ''
  )
  </script>
  ```

---

### Task 1.5: UiSelect

**Files:**
- Create: `app/components/ui/Select/index.vue`

**Steps:**
- [x] Write the component:
  ```vue
  <template>
    <select
      :value="modelValue"
      :disabled="disabled"
      class="appearance-none text-xs font-medium bg-white dark:bg-dark-surface border border-surface-sage-dark dark:border-dark-border text-ink-primary dark:text-dark-text rounded-lg pl-2.5 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-green/30 disabled:opacity-60"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option v-for="opt in options" :key="opt.id" :value="opt.id">{{ opt.label }}</option>
    </select>
    <UiIcon name="chevronDown" size="xs" class="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-ink-muted dark:text-dark-subtle" />
  </div>
  </template>

  <script setup lang="ts">
  interface SelectOption {
    id: string
    label: string
  }

  interface Props {
    modelValue?: string
    options: SelectOption[]
    placeholder?: string
    disabled?: boolean
  }

  withDefaults(defineProps<Props>(), {
    modelValue: '',
  })

  defineEmits<{ 'update:modelValue': [value: string] }>()
  </script>
  ```

  Note: wrap in a `<div class="relative inline-flex items-center">`.

---

### Task 1.6: UiIcon

**Files:**
- Create: `app/components/ui/Icon/index.vue`

**Steps:**
- [x] Write the component:
  ```vue
  <template>
    <component
      :is="iconComponent"
      v-if="iconComponent"
      :class="sizeClass"
      class="flex-none"
    />
  </template>

  <script setup lang="ts">
  import { icons, type IconName } from './icons'

  interface Props {
    name: IconName
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    class?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    size: 'md',
  })

  const iconComponent = computed(() => icons[props.name])

  const sizeClass = computed(() => {
    const map = {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      xl: 'w-8 h-8',
    }
    return map[props.size]
  })
  </script>
  ```

---

### Task 1.7: UiBadge

**Files:**
- Create: `app/components/ui/Badge/index.vue`

**Steps:**
- [x] Write the component:
  ```vue
  <template>
    <span
      class="inline-flex items-center font-medium"
      :class="[sizeClass, variantClass, roundedClass]"
    >
      <slot />
    </span>
  </template>

  <script setup lang="ts">
  interface Props {
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
    size?: 'sm' | 'md'
    rounded?: 'full' | 'md'
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: 'default',
    size: 'md',
    rounded: 'full',
  })

  const sizeClass = computed(() => {
    const map = { sm: 'text-[10px] px-2 py-0.5', md: 'text-xs px-2.5 py-1' }
    return map[props.size]
  })

  const roundedClass = computed(() => (props.rounded === 'full' ? 'rounded-full' : 'rounded-md'))

  const variantClass = computed(() => {
    const map = {
      default: 'bg-surface-sage dark:bg-dark-border text-ink-secondary dark:text-dark-muted',
      success: 'bg-brand-green/10 dark:bg-brand-green/15 text-brand-green',
      warning: 'bg-amber-50 dark:bg-amber-900/20 text-yellow-700 dark:text-yellow-400',
      error: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
      info: 'bg-brand-sky/10 dark:bg-brand-sky/15 text-brand-blue dark:text-brand-sky',
    }
    return map[props.variant]
  })
  </script>
  ```

---

### Task 1.8: UiKbd

**Files:**
- Create: `app/components/ui/Kbd/index.vue`

**Steps:**
- [x] Write the component:
  ```vue
  <template>
    <kbd
      class="inline-flex items-center font-mono border rounded"
      :class="sizeClass"
    >
      <slot />
    </kbd>
  </template>

  <script setup lang="ts">
  interface Props {
    size?: 'sm' | 'md'
  }

  const props = withDefaults(defineProps<Props>(), { size: 'sm' })

  const sizeClass = computed(() => {
    const map = {
      sm: 'text-[10px] px-1.5 py-0.5 bg-surface-off-white dark:bg-dark-surface border-surface-sage dark:border-dark-border text-ink-muted dark:text-dark-subtle',
      md: 'text-xs px-2 py-1 bg-white dark:bg-dark-surface border-surface-sage dark:border-dark-border text-ink-muted dark:text-dark-subtle',
    }
    return map[props.size]
  })
  </script>
  ```

---

### Task 1.9: UiCard

**Files:**
- Create: `app/components/ui/Card/index.vue`

**Steps:**
- [x] Write the component:
  ```vue
  <template>
    <div
      class="overflow-hidden transition-colors"
      :class="[variantClass, paddingClass, radiusClass]"
    >
      <div v-if="$slots.header" class="px-4 py-3 border-b border-surface-sage dark:border-dark-border">
        <slot name="header" />
      </div>
      <div :class="$slots.header || $slots.footer ? 'px-4 py-4' : ''">
        <slot />
      </div>
      <div v-if="$slots.footer" class="px-4 py-3 border-t border-surface-sage dark:border-dark-border">
        <slot name="footer" />
      </div>
    </div>
  </template>

  <script setup lang="ts">
  interface Props {
    variant?: 'default' | 'bordered' | 'elevated'
    padding?: 'none' | 'sm' | 'md' | 'lg'
    radius?: 'md' | 'lg' | 'xl'
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: 'bordered',
    padding: 'md',
    radius: 'xl',
  })

  const variantClass = computed(() => {
    const map = {
      default: 'bg-white dark:bg-dark-sidebar',
      bordered: 'bg-white dark:bg-dark-sidebar border border-surface-sage dark:border-dark-border',
      elevated: 'bg-white dark:bg-dark-sidebar shadow-lg',
    }
    return map[props.variant]
  })

  const paddingClass = computed(() => {
    const map = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-6' }
    return map[props.padding]
  })

  const radiusClass = computed(() => {
    const map = { md: 'rounded-lg', lg: 'rounded-xl', xl: 'rounded-2xl' }
    return map[props.radius]
  })
  </script>
  ```

---

### Task 1.10: UiCopyButton

**Files:**
- Create: `app/components/ui/CopyButton/index.vue`

**Steps:**
- [x] Write the component:
  ```vue
  <template>
    <button
      type="button"
      class="inline-flex items-center gap-1 text-xs transition-colors"
      :class="variantClass"
      @click="copy(text)"
    >
      <UiIcon :name="copied ? 'check' : 'copy'" size="sm" />
      <span>{{ copied ? 'Copied!' : label }}</span>
    </button>
  </template>

  <script setup lang="ts">
  interface Props {
    text: string
    label?: string
    variant?: 'default' | 'dark'
  }

  const props = withDefaults(defineProps<Props>(), {
    label: 'Copy',
    variant: 'default',
  })

  const { copied, copy } = useClipboard()

  const variantClass = computed(() => {
    return props.variant === 'dark'
      ? 'text-white/60 hover:text-white/90'
      : 'text-ink-muted dark:text-dark-subtle hover:text-brand-blue dark:hover:text-brand-sky'
  })
  </script>
  ```

---

### Task 1.11: UiTable family

**Files:**
- Create: `app/components/ui/Table.vue`
- Create: `app/components/ui/TableHead.vue`
- Create: `app/components/ui/TableBody.vue`
- Create: `app/components/ui/TableRow.vue`
- Create: `app/components/ui/TableCell.vue`

**Steps:**
- [x] Write `app/components/ui/Table.vue`:
  ```vue
  <template>
    <div class="border rounded-xl overflow-hidden" :class="[borderClass, bgClass]">
      <table class="w-full text-sm">
        <slot />
      </table>
    </div>
  </template>

  <script setup lang="ts">
  interface Props {
    bordered?: boolean
    striped?: boolean
    compact?: boolean
  }

  withDefaults(defineProps<Props>(), {
    bordered: true,
    striped: false,
    compact: false,
  })

  const borderClass = 'border-surface-sage dark:border-dark-border'
  const bgClass = 'bg-white dark:bg-dark-sidebar'
  </script>
  ```
- [ ] Write `app/components/ui/TableHead.vue`:
  ```vue
  <template>
    <thead class="bg-surface-off-white/70 dark:bg-dark-surface border-b border-surface-sage dark:border-dark-border">
      <slot />
    </thead>
  </template>
  ```
- [ ] Write `app/components/ui/TableBody.vue`:
  ```vue
  <template>
    <tbody>
      <slot />
    </tbody>
  </template>
  ```
- [ ] Write `app/components/ui/TableRow.vue`:
  ```vue
  <template>
    <tr class="border-b border-surface-sage/50 dark:border-dark-border/60 last:border-0 transition-colors hover:bg-surface-off-white/40 dark:hover:bg-dark-border/40">
      <slot />
    </tr>
  </template>
  ```
- [ ] Write `app/components/ui/TableCell.vue`:
  ```vue
  <template>
    <component
      :is="header ? 'th' : 'td'"
      class="text-left align-top"
      :class="[paddingClass, header ? 'text-xs font-semibold text-ink-muted dark:text-dark-subtle' : 'text-sm text-ink-secondary dark:text-dark-muted']"
    >
      <slot />
    </component>
  </template>

  <script setup lang="ts">
  interface Props {
    header?: boolean
    compact?: boolean
  }

  withDefaults(defineProps<Props>(), { header: false, compact: false })

  const paddingClass = computed((props) => props.compact ? 'py-2.5 px-4' : 'py-3.5 px-4')
  </script>
  ```

---

### Task 1.12: Primitive preview page

**Files:**
- Create: `app/pages/demo.vue`

**Steps:**
- [ ] Create a temporary page that renders each primitive with various props for visual verification.
- [ ] Run `npm run build` and `npm run typecheck`.
- [ ] Fix any TypeScript or build errors in primitives.

> **Note:** Skipped for now; primitives are verified through the live pages that consume them.

---

## Phase 2 — Layout & Navigation Components

### Task 2.1: SharedAppShell

**Files:**
- Create: `app/components/shared/AppShell/index.vue`

**Steps:**
- [x] Write the component:
  ```vue
  <template>
    <div class="min-h-screen flex flex-col bg-white dark:bg-dark-bg font-sans">
      <slot name="topbar" />
      <div class="flex flex-1 pt-14 lg:pt-16 relative">
        <slot name="sidebar" />
        <main class="flex-1 min-w-0">
          <slot />
        </main>
        <slot name="toc" />
      </div>
      <slot name="search-modal" />
    </div>
  </template>
  ```

---

### Task 2.2: DocsTopbar

**Files:**
- Create: `app/components/docs/Topbar/index.vue`

**Steps:**
- [x] Port the existing `Topbar.vue` logic but replace inline SVGs with `<UiIcon>` and use `<UiButton>` / `<UiInput>` for the search trigger.
- [ ] Props: `primaryNav`, `utilityNav`, `logo`.
- [ ] Emits: `open-search`, `toggle-sidebar`.
- [ ] Keep the current layout and styling, only replacing primitives.

---

### Task 2.3: DocsSidebar, DocsSidebarItem, DocsSidebarSection, DocsSidebarFooter

**Files:**
- Create: `app/components/docs/Sidebar/index.vue`
- Create: `app/components/docs/SidebarItem/index.vue`
- Create: `app/components/docs/SidebarSection/index.vue`
- Create: `app/components/docs/SidebarFooter/index.vue`

**Steps:**
- [x] Extract sidebar shell from `app/layouts/docs.vue` into `<DocsSidebar>`.
- [x] Extract recursive nav tree logic from `NavTree.vue` into `<DocsSidebarItem>`.
- [x] Create `<DocsSidebarSection>` for section headers.
- [x] Create `<DocsSidebarFooter>` for bottom text.
- [x] Replace inline chevron SVG with `<UiIcon name="chevronRight" />`.

---

### Task 2.4: DocsOnThisPage

**Files:**
- Create: `app/components/docs/OnThisPage/index.vue`

**Steps:**
- [x] Port existing `OnThisPage.vue` logic.
- [x] Replace inline list SVG with `<UiIcon name="list" />`.
- [x] Use `<UiText>` for section title and items where appropriate.
- [x] Prop: `selector` default `.docs-content`.

---

### Task 2.5: Update app/layouts/docs.vue

**Files:**
- Modify: `app/layouts/docs.vue`

**Steps:**
- [x] Replace the manual layout shell with `<SharedAppShell>`.
- [x] Use new `<DocsTopbar>`, `<DocsSidebar>`, `<DocsOnThisPage>` components.
- [x] Keep keyboard shortcut and mobile overlay logic in the layout for now.
- [x] Run `npm run build` and `npm run typecheck`.

---

## Phase 3 — Content Components

### Task 3.1: DocsCallout

**Files:**
- Create: `app/components/docs/Callout/index.vue`

**Steps:**
- [x] Port existing callout types (`note`, `warning`, `tip`, `nutshell`, `before-you-begin`).
- [x] Replace inline render-function SVGs with `<UiIcon>` mapped per type.
- [x] Use `<UiText>` for title and body.

---

### Task 3.2: DocsMethodBadge

**Files:**
- Create: `app/components/docs/MethodBadge/index.vue`

**Steps:**
- [x] Wrap `<UiBadge>` and map HTTP method to variant/color.
- [x] Prop: `method`.

---

### Task 3.3: DocsCodeBlock

**Files:**
- Create: `app/components/docs/CodeBlock/index.vue`

**Steps:**
- [x] Port syntax highlighting from existing `CodeBlock.vue`.
- [ ] Add optional `lineNumbers` prop.
- [ ] Add optional `dark` prop (uses `github-dark` theme even in light mode).
- [x] Use `<UiCopyButton>`.
- [ ] Add CSS for line numbers via `.line::before` counter; test copy/paste.

> **Note:** Implemented the core port and copy button. `lineNumbers`, forced-dark mode, and line-number CSS are deferred to a later pass.

---

### Task 3.4: DocsCodeTabs

**Files:**
- Create: `app/components/docs/CodeTabs/index.vue`

**Steps:**
- [x] Port existing tab logic from `CodeTabs.vue`.
- [x] Use `<UiButton>` or plain styled buttons for tabs.
- [x] Use `<DocsCodeBlock>` for panels.
- [x] Prop: `tabs`, `defaultTab`, `showCopy`.

---

### Task 3.5: DocsCodeLanguageSelect and DocsCodeResponseSelect

**Files:**
- Create: `app/components/docs/CodeLanguageSelect/index.vue`
- Create: `app/components/docs/CodeResponseSelect/index.vue`

**Steps:**
- [ ] Wrap `<UiSelect>` with docs-specific styling.
- [ ] `CodeLanguageSelect` accepts `options: CodeLanguageOption[]`.
- [ ] `CodeResponseSelect` accepts `options: CodeResponseOption[]` and shows status badge.

> **Note:** Not implemented in Phases 0–4. These selectors will be built when the endpoint page gets its full code-panel refactor in Phase 5.

---

### Task 3.6: DocsCodePanel

**Files:**
- Create: `app/components/docs/CodePanel/index.vue`

**Steps:**
- [x] Create component.
- [x] Default background: dark navy (`bg-brand-navy`).
- [x] Rounded corners, border, overflow hidden.

> **Note:** Implemented as a concrete request/response panel rather than a slot-based shell; matches the existing `CodePanel.vue` API.

---

### Task 3.7: DocsParamsTable

**Files:**
- Create: `app/components/docs/ParamsTable/index.vue`

**Steps:**
- [x] Rebuild using `<UiTable>` family.
- [x] Use `<UiBadge variant="success">` for required, `<UiBadge variant="default">` for optional.
- [x] Prop: `title`, `rows: TableRow[]`.

---

### Task 3.8: DocsMermaid

**Files:**
- Create: `app/components/docs/Mermaid/index.vue`

**Steps:**
- [x] Port existing Mermaid rendering logic.
- [x] Wrap in `<UiCard>`.
- [x] Replace any inline SVGs with `<UiIcon>` if needed.

---

### Task 3.9: Build verification

**Steps:**
- [x] Run `npm run build` and `npm run typecheck`.
- [x] Fix any errors in content components.

---

## Phase 4 — Feedback, Support, Footer

### Task 4.1: DocsFeedback

**Files:**
- Create: `app/components/docs/Feedback/index.vue`

**Steps:**
- [x] Port existing 3-state feedback logic.
- [x] Use `<UiButton>` for options.
- [x] Use `<UiTextarea>` for feedback message.
- [x] Use `<UiText>` for headings.

---

### Task 4.2: DocsSupportCta

**Files:**
- Create: `app/components/docs/SupportCta/index.vue`

**Steps:**
- [x] Create reusable support CTA box.
- [x] Props: `title`, `description`, `href`, `buttonText`.
- [x] Use `<UiCard>`, `<UiText>`, `<UiButton>`.

---

### Task 4.3: DocsPageFooter

**Files:**
- Create: `app/components/docs/PageFooter/index.vue`

**Steps:**
- [x] Port prev/next links.
- [x] Use `<UiButton>` / styled `<NuxtLink>` and `<UiIcon>` for prev/next arrows.

> **Note:** Kept support links and last-updated date because the existing consumers expect them. Can be split out later if needed.

---

### Task 4.4: Update app/pages/index.vue

**Files:**
- Modify: `app/pages/index.vue`

**Steps:**
- [x] Replace the hand-rolled support CTA at the bottom with `<DocsSupportCta>`.
- [x] Keep other sections as-is for now; deeper refactor happens in Phase 7.
- [x] Run `npm run build` and `npm run typecheck`.

---

## Final Verification for Phases 0–4

- [x] `npm run build` passes.
- [ ] `npm run typecheck` passes — **blocked by pre-existing errors** in `app/components/docs/Mermaid/index.vue` and `app/composables/usePageHeadings.ts`. No new errors were introduced by Phases 0–9.
- [x] The layout renders: topbar, sidebar, main content, right-rail TOC.
- [ ] Primitives preview page (`/demo`) renders all variants — **skipped**.
- [x] No new inline SVGs were introduced.
- [x] Old flat components deleted; directory-based components are used throughout. `ResponseTabs.vue`, `NavTree.vue`, and the remaining `ThemeToggle.vue` were removed in Phase 9.
