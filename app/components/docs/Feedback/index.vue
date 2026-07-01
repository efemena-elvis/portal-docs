<template>
  <UiCard class="p-5 mt-12 mb-7">
    <div v-if="state === 'idle'">
      <UiText variant="subheading" class="mb-3">Was this page helpful?</UiText>
      <div class="flex items-center gap-2">
        <UiButton
          v-for="option in options"
          :key="option.value"
          variant="secondary"
          size="sm"
          @click="submit(option.value)"
        >
          <span>{{ option.icon }}</span>
          <span>{{ option.label }}</span>
        </UiButton>
      </div>
    </div>

    <div v-else-if="state === 'feedback'">
      <UiText variant="subheading" class="mb-2"
        >Thanks. What could be better?</UiText
      >
      <UiTextarea
        v-model="message"
        :rows="3"
        placeholder="Tell us what was missing or confusing..."
        class="mb-3"
      />
      <div class="flex items-center gap-2">
        <UiButton variant="primary" size="sm" @click="sendFeedback"
          >Send feedback</UiButton
        >
        <UiButton variant="ghost" size="sm" @click="state = 'done'"
          >Skip</UiButton
        >
      </div>
    </div>

    <div v-else-if="state === 'done'">
      <UiText variant="body">Thanks for helping us improve the docs.</UiText>
    </div>
  </UiCard>
</template>

<script setup lang="ts">
const state = ref<"idle" | "feedback" | "done">("idle");
const message = ref("");

const options = [
  { value: "yes", label: "Yes", icon: "👍" },
  { value: "somewhat", label: "Somewhat", icon: "🤔" },
  { value: "no", label: "No", icon: "👎" },
];

function submit(value: string) {
  if (value === "yes") {
    state.value = "done";
  } else {
    state.value = "feedback";
  }
}

function sendFeedback() {
  state.value = "done";
}
</script>
