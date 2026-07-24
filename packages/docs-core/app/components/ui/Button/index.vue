<template>
  <component
    :is="tag"
    :type="buttonType"
    :disabled="disabled || loading"
    :to="to"
    :href="href"
    :target="href ? resolvedTarget : undefined"
    :rel="href && resolvedTarget === '_blank' ? 'noopener noreferrer' : undefined"
    class="inline-flex items-center justify-center gap-1.5 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-green/30 disabled:opacity-50 disabled:cursor-not-allowed"
    :class="[sizeClass, variantClass, radiusClass]"
  >
    <UiIcon
      v-if="icon && iconPosition === 'left'"
      :name="icon"
      :size="iconSize"
    />
    <slot />
    <UiIcon
      v-if="icon && iconPosition === 'right'"
      :name="icon"
      :size="iconSize"
    />
  </component>
</template>

<script setup lang="ts">
import { resolveComponent } from "vue";
import type { IconName } from "~/components/ui/Icon/icons";

interface Props {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  to?: string;
  href?: string;
  target?: string;
  type?: "button" | "submit" | "reset";
  icon?: IconName;
  iconPosition?: "left" | "right";
}

const props = withDefaults(defineProps<Props>(), {
  variant: "primary",
  size: "md",
  target: "_blank",
  type: "button",
  iconPosition: "left",
});

// resolveComponent must be called during setup (not inside computed) so that
// Vue 3 can find the globally-registered NuxtLink in the current app context.
const NuxtLinkComponent = resolveComponent("NuxtLink");

const tag = computed(() => {
  if (props.to) return NuxtLinkComponent;
  if (props.href) return "a";
  return "button";
});

// mailto: and tel: links hand off to the OS — omit target entirely so the
// browser uses its native protocol handler without SPA interference
const resolvedTarget = computed(() => {
  if (props.href && /^(mailto|tel):/.test(props.href)) return undefined;
  return props.target;
});

const buttonType = computed(() =>
  tag.value === "button" ? props.type : undefined,
);

const sizeClass = computed(() => {
  const map = {
    sm: "px-2.5 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-sm",
  };
  return map[props.size];
});

const radiusClass = computed(() => {
  const map = {
    sm: "rounded-md",
    md: "rounded-lg",
    lg: "rounded-lg",
  };
  return map[props.size];
});

const variantClass = computed(() => {
  const map = {
    primary: "bg-brand-green text-white hover:bg-brand-green/90",
    secondary:
      "bg-surface-off-white dark:bg-dark-surface text-ink-secondary dark:text-dark-muted hover:bg-surface-sage dark:hover:bg-dark-border",
    outline:
      "border border-surface-sage-dark dark:border-dark-border bg-transparent text-ink-secondary dark:text-dark-muted hover:border-brand-green/40 dark:hover:border-brand-green/40",
    ghost:
      "bg-transparent text-ink-secondary dark:text-dark-muted hover:bg-surface-off-white dark:hover:bg-dark-surface",
    link: "bg-transparent text-brand-blue dark:text-brand-sky hover:underline p-0",
  };
  return map[props.variant];
});

const iconSize = computed(() => {
  const map: Record<string, "xs" | "sm"> = { sm: "xs", md: "sm", lg: "sm" };
  return map[props.size];
});
</script>
