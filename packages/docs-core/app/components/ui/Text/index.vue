<template>
  <component :is="as" :class="[sizeClass, weightClass, colorClass]">
    <slot />
  </component>
</template>

<script setup lang="ts">
export type TextVariant =
  | "body"
  | "heading"
  | "small"
  | "muted"
  | "lead"
  | "label"
  | "subheading"
  | "code";

interface Props {
  as?: string;
  variant?: TextVariant;
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  weight?: "normal" | "medium" | "semibold" | "bold";
  color?: "default" | "muted" | "subtle" | "primary" | "brand";
}

const props = withDefaults(defineProps<Props>(), {
  as: "p",
  variant: "body",
  color: "default",
});

const sizeClass = computed(() => {
  if (props.size) return `text-${props.size}`;
  const map: Record<TextVariant, string> = {
    body: "text-base",
    heading: "text-lg",
    small: "text-xs",
    muted: "text-sm",
    lead: "text-lg",
    label: "text-xs",
    subheading: "text-sm",
    code: "text-xs",
  };
  return map[props.variant];
});

const weightClass = computed(() => {
  if (props.weight) return `font-${props.weight}`;
  const map: Record<TextVariant, string> = {
    body: "font-normal",
    heading: "font-semibold",
    small: "font-normal",
    muted: "font-normal",
    lead: "font-normal",
    label: "font-semibold uppercase tracking-wider",
    subheading: "font-semibold",
    code: "font-mono",
  };
  return map[props.variant];
});

const colorClass = computed(() => {
  const effectiveColor =
    props.color === "default" &&
    (props.variant === "label" || props.variant === "code")
      ? "muted"
      : props.color;
  const map: Record<string, string> = {
    default: "text-ink-primary dark:text-dark-text",
    muted: "text-ink-muted dark:text-dark-subtle",
    subtle: "text-ink-secondary dark:text-dark-muted",
    primary: "text-ink-primary dark:text-dark-text",
    brand: "text-brand-green",
  };
  return map[effectiveColor];
});
</script>
