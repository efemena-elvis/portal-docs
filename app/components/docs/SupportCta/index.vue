<template>
  <UiCard class="p-6 mb-10">
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div>
        <UiText variant="subheading" class="mb-2">{{ title }}</UiText>
        <UiText
          variant="body"
          class="text-ink-secondary/80 dark:text-dark-muted/80 text-[15.5px]"
          >{{ description }}</UiText
        >
      </div>

      <UiButton :href="href" variant="secondary" class="shrink-0">
        <UiIcon name="mail" size="sm" />
        {{ buttonText }}
      </UiButton>
    </div>
  </UiCard>
</template>

<script setup lang="ts">
interface Props {
  title?: string;
  description?: string;
  buttonText?: string;
  href?: string;
}

withDefaults(defineProps<Props>(), {
  title: "Need help integrating?",
  description: "Reach out to our engineering team for implementation support.",
  buttonText: "Contact support",
  href: "mailto:developers@vesicash.com",
});
</script>
