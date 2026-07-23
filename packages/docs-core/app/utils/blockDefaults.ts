import type { Block } from '~/types/content'

function uid(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

const EMPTY_META = { class: '', style: '', toc: '', hidden: false }

export function createDefaultBlock(type: Block['type']): Block {
  const base = { id: uid(), meta: { ...EMPTY_META } }

  switch (type) {
    case 'prose':
      return { ...base, type, props: { variant: 'body' }, content: 'New paragraph…' }

    case 'callout':
      return { ...base, type, props: { variant: 'note' }, content: 'Add callout text here.' }

    case 'code':
      return { ...base, type, props: { language: 'bash', title: '', hideHeader: false, hideCopy: false }, content: '# your code here' }

    case 'mermaid':
      return { ...base, type, props: { title: '' }, content: 'graph LR\n  A --> B' }

    case 'image':
      return { ...base, type, props: { src: '', alt: '' }, content: null }

    case 'card':
      return { ...base, type, props: { variant: 'default', padding: 'md' }, content: 'Card content here.' }

    case 'badge':
      return { ...base, type, props: { variant: 'default', size: 'md', rounded: 'md', text: 'Badge' }, content: null }

    case 'button':
      return { ...base, type, props: { variant: 'primary', size: 'md', href: '#', to: '', icon: '', iconPosition: 'left' }, content: 'Button label' }

    case 'support':
      return { ...base, type, props: { buttonText: 'Contact Support', href: 'mailto:developers@vesicash.com' }, content: 'Need help? Reach out to our team.' }

    case 'table':
      return {
        ...base, type,
        props: {
          headers: [{ text: 'Column 1' }, { text: 'Column 2' }],
          rows: [{ cells: [{ text: 'Cell A' }, { text: 'Cell B' }] }],
        },
        content: null,
      }

    case 'params-table':
      return {
        ...base, type,
        props: {
          title: '',
          rows: [{ name: 'param', type: 'string', required: true, description: 'Description' }],
        },
        content: null,
      }

    case 'auth-note':
      return {
        ...base, type,
        props: {},
        content: 'Requires a valid API key passed in the `x-api-key` request header. See the [Authentication](/getting-started/authentication) guide for details.',
      }

    case 'method-path':
      return {
        ...base, type,
        props: { method: 'GET', path: '/api/v1/...', baseUrl: '' },
        content: null,
      }

    case 'endpoint-ref':
      return { ...base, type, props: { method: 'GET', path: '/api/v1/...', slug: '' }, content: null }

    case 'step':
      return { ...base, type, props: { number: 1, title: 'Step title', description: '', last: false }, content: null }

    case 'steps':
      return {
        ...base, type,
        props: {},
        content: null,
        children: [
          { id: uid(), type: 'step', props: { number: 1, title: 'First step', description: '', last: false }, content: null, meta: { ...EMPTY_META } },
          { id: uid(), type: 'step', props: { number: 2, title: 'Second step', description: '', last: true }, content: null, meta: { ...EMPTY_META } },
        ],
      }

    case 'card-grid':
      return {
        ...base, type,
        props: {
          columns: 2,
          items: [
            { title: 'Card title', description: 'Short description', href: '#', icon: { kind: 'emoji' as const, value: '⚡' } },
          ],
        },
        content: null,
      }

    case 'list':
      return {
        ...base, type,
        props: { ordered: false, items: [{ content: 'First item' }, { content: 'Second item' }] },
        content: null,
      }

    case 'divider':
      return { ...base, type, props: { weight: 'thin', color: '' }, content: null }

    case 'spacer':
      return { ...base, type, props: { size: 'md' }, content: null }

    case 'errors-table':
      return {
        ...base, type,
        props: { title: '', rows: [{ code: '', status: 400, description: '' }] },
        content: null,
      }

    case 'code-request':
      return { ...base, type, props: {}, content: null }

    case 'code-response':
      return {
        ...base, type,
        props: { responses: [{ status: 'OK', code: 200, body: '{}' }] },
        content: null,
      }

    default:
      return { ...base, type: 'prose' as any, props: { variant: 'body' }, content: '' }
  }
}
