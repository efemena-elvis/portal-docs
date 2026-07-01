<template>
  <div class="p-4 space-y-4">
    <component
      :is="formComponent"
      :block="block"
      @update="$emit('update', $event)"
    />

    <!-- Meta / Advanced — hidden for block types that have no user-configurable meta -->
    <AdminBlockMetaEditor v-if="showMeta" :block="block" @update="$emit('update', $event)" />
  </div>
</template>

<script setup lang="ts">
import type { Block } from '~/types/content'
import ProseForm from '../forms/ProseForm.vue'
import CalloutForm from '../forms/CalloutForm.vue'
import CodeForm from '../forms/CodeForm.vue'
import MermaidForm from '../forms/MermaidForm.vue'
import ImageForm from '../forms/ImageForm.vue'
import CardForm from '../forms/CardForm.vue'
import BadgeForm from '../forms/BadgeForm.vue'
import ButtonForm from '../forms/ButtonForm.vue'
import SupportForm from '../forms/SupportForm.vue'
import TableForm from '../forms/TableForm.vue'
import ParamsTableForm from '../forms/ParamsTableForm.vue'
import EndpointRefForm from '../forms/EndpointRefForm.vue'
import StepForm from '../forms/StepForm.vue'
import StepsForm from '../forms/StepsForm.vue'
import CardGridForm from '../forms/CardGridForm.vue'
import ListForm from '../forms/ListForm.vue'
import DividerForm from '../forms/DividerForm.vue'
import SpacerForm from '../forms/SpacerForm.vue'
import AuthNoteForm from '../forms/AuthNoteForm.vue'
import MethodPathForm from '../forms/MethodPathForm.vue'
import ErrorsTableForm from '../forms/ErrorsTableForm.vue'
import CodeRequestForm from '../forms/CodeRequestForm.vue'
import CodeResponseForm from '../forms/CodeResponseForm.vue'

interface Props { block: Block }
const props = defineProps<Props>()
defineEmits<{ update: [block: Block] }>()

const NO_META_TYPES = new Set<Block['type']>(['code-request', 'code-response'])

const FORM_COMPONENTS: Partial<Record<Block['type'], unknown>> = {
  prose: ProseForm,
  callout: CalloutForm,
  code: CodeForm,
  mermaid: MermaidForm,
  image: ImageForm,
  card: CardForm,
  badge: BadgeForm,
  button: ButtonForm,
  support: SupportForm,
  table: TableForm,
  'params-table': ParamsTableForm,
  'endpoint-ref': EndpointRefForm,
  step: StepForm,
  steps: StepsForm,
  'card-grid': CardGridForm,
  list: ListForm,
  divider: DividerForm,
  spacer: SpacerForm,
  'auth-note': AuthNoteForm,
  'method-path': MethodPathForm,
  'errors-table': ErrorsTableForm,
  'code-request': CodeRequestForm,
  'code-response': CodeResponseForm,
}

const formComponent = computed(() => FORM_COMPONENTS[props.block.type] ?? null)
const showMeta = computed(() => !NO_META_TYPES.has(props.block.type))
</script>
