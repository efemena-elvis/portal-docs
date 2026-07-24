import type { CollectionHeader } from '~/types/page'

export type Language = 'curl' | 'node' | 'python' | 'php'

export const LANGUAGES: { id: Language; label: string }[] = [
  { id: 'curl',   label: 'cURL'      },
  { id: 'node',   label: 'Node.js'   },
  { id: 'python', label: 'Python'    },
  { id: 'php',    label: 'PHP'       },
]

interface CodeGenInput {
  method: string
  urlRaw: string
  headers: CollectionHeader[]
  body: string | null
  baseUrl?: string
}

function resolveUrl(raw: string, baseUrl: string): string {
  return raw
    .replace('{{base_url}}', baseUrl)
    .replace(/\{\{([^}]+)\}\}/g, '<$1>')
}

function headersToObj(headers: CollectionHeader[]): Record<string, string> {
  const obj: Record<string, string> = {}
  for (const h of headers) {
    if (h.key && h.value) obj[h.key] = h.value
  }
  return obj
}

function formatHeaderValue(key: string, value: string): string {
  if (value.startsWith('{{') && value.endsWith('}}')) {
    const name = value.slice(2, -2)
    return `<YOUR_${name.toUpperCase().replace(/-/g, '_')}>`
  }
  return value
}

// ─── cURL ────────────────────────────────────────────────────────────────────
export function toCurl(input: CodeGenInput): string {
  const url = resolveUrl(input.urlRaw, input.baseUrl || 'https://api.portal.vesicash.com')
  const lines: string[] = [`curl --request ${input.method} \\`, `     --url "${url}" \\`]
  for (const h of input.headers) {
    const val = formatHeaderValue(h.key, h.value)
    lines.push(`     --header "${h.key}: ${val}" \\`)
  }
  if (input.body) {
    const compact = input.body.replace(/\n\s*/g, ' ')
    lines.push(`     --data '${compact}'`)
  } else {
    // Remove trailing backslash from last header
    const last = lines[lines.length - 1]
    if (last) lines[lines.length - 1] = last.replace(/ \\$/, '')
  }
  return lines.join('\n')
}

// ─── Node.js ─────────────────────────────────────────────────────────────────
export function toNode(input: CodeGenInput): string {
  const url = resolveUrl(input.urlRaw, input.baseUrl || 'https://api.portal.vesicash.com')
  const headers = headersToObj(input.headers)
  const headersStr = Object.entries(headers)
    .map(([k, v]) => `  '${k}': '${formatHeaderValue(k, v)}'`)
    .join(',\n')

  const bodySection = input.body
    ? `const body = ${input.body};\n\n`
    : ''

  return `${bodySection}const response = await fetch('${url}', {
  method: '${input.method}',
  headers: {
${headersStr}
  },${input.body ? "\n  body: JSON.stringify(body)," : ''}
});

const data = await response.json();
console.log(data);`
}

// ─── Python ──────────────────────────────────────────────────────────────────
export function toPython(input: CodeGenInput): string {
  const url = resolveUrl(input.urlRaw, input.baseUrl || 'https://api.portal.vesicash.com')
  const headers = headersToObj(input.headers)
  const headersStr = Object.entries(headers)
    .map(([k, v]) => `    "${k}": "${formatHeaderValue(k, v)}"`)
    .join(',\n')

  const bodySection = input.body
    ? `payload = ${input.body.replace(/true/g, 'True').replace(/false/g, 'False').replace(/null/g, 'None')}\n\n`
    : ''

  return `import requests

${bodySection}headers = {
${headersStr}
}

response = requests.${input.method.toLowerCase()}(
    "${url}",
    json=${input.body ? 'payload' : 'None'},
    headers=headers
)

print(response.json())`
}

// ─── PHP ─────────────────────────────────────────────────────────────────────
export function toPhp(input: CodeGenInput): string {
  const url = resolveUrl(input.urlRaw, input.baseUrl || 'https://api.portal.vesicash.com')
  const headers = headersToObj(input.headers)
  const headersArr = Object.entries(headers)
    .map(([k, v]) => `  "${k}: ${formatHeaderValue(k, v)}"`)
    .join(",\n")

  const bodySection = input.body
    ? `$payload = json_encode(${input.body});\n\n`
    : ''

  return `<?php
${bodySection}$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_URL => "${url}",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST => "${input.method}",
  CURLOPT_HTTPHEADER => [
${headersArr}
  ],${input.body ? '\n  CURLOPT_POSTFIELDS => $payload,' : ''}
]);

$response = curl_exec($curl);
curl_close($curl);

echo $response;`
}

// ─── Main ────────────────────────────────────────────────────────────────────
export function generateCode(lang: Language, input: CodeGenInput): string {
  switch (lang) {
    case 'curl':   return toCurl(input)
    case 'node':   return toNode(input)
    case 'python': return toPython(input)
    case 'php':    return toPhp(input)
  }
}
