import type { CodeGenOptions, CodeExample } from "~/types/docs";
import type { CollectionHeader } from "~/types/page";

const HTTP_MEANINGS: Record<number, string> = {
  200: "Successful",
  201: "Created",
  204: "No Content",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  422: "Unprocessable Entity",
  429: "Too Many Requests",
  500: "Server Error",
};

function httpLabel(code: number | undefined): string {
  if (!code) return "Response";
  const meaning = HTTP_MEANINGS[code];
  return meaning ? `${code} — ${meaning}` : String(code);
}

function formatJson(obj: unknown): string {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
}

function safeJsonParse(str: string | null): unknown {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function buildUrl(path: string, baseUrl: string): string {
  if (path.startsWith("http")) return path;
  const base = baseUrl.replace(/\/$/, "");
  return `${base}${path}`;
}

const SENSITIVE_PATTERNS = ["key", "secret", "token", "auth", "password", "pass", "bearer"];

function isSensitiveHeader(key: string): boolean {
  const lower = key.toLowerCase();
  return SENSITIVE_PATTERNS.some((p) => lower.includes(p));
}

function maskHeaders(headers: CollectionHeader[]): CollectionHeader[] {
  return headers.map((h) =>
    isSensitiveHeader(h.key) ? { ...h, value: "****************" } : h,
  );
}

function generateCurl(
  method: string,
  path: string,
  headers: CollectionHeader[],
  body: string | null,
  baseUrl: string,
): string {
  const url = buildUrl(path, baseUrl);
  let code = `curl --request ${method} \\\n  --url ${url}`;

  for (const h of maskHeaders(headers)) {
    if (h.disabled) continue;
    code += ` \\\n  --header '${h.key}: ${h.value}'`;
  }

  if (body) {
    code += ` \\\n  --data '${body.replace(/'/g, "\\'")}'`;
  }

  return code;
}

function generateNode(
  method: string,
  path: string,
  headers: CollectionHeader[],
  body: string | null,
  baseUrl: string,
): string {
  const url = buildUrl(path, baseUrl);
  const headerObj: Record<string, string> = {};
  for (const h of maskHeaders(headers)) {
    if (!h.disabled) headerObj[h.key] = h.value;
  }

  return `const fetch = require('node-fetch');

const url = '${url}';
const options = {
  method: '${method}',
  headers: ${formatJson(headerObj)},${body ? `\n  body: JSON.stringify(${body})` : ""}
};

fetch(url, options)
  .then(res => res.json())
  .then(json => console.log(json))
  .catch(err => console.error('error:', err));`;
}

function generatePython(
  method: string,
  path: string,
  headers: CollectionHeader[],
  body: string | null,
  baseUrl: string,
): string {
  const url = buildUrl(path, baseUrl);
  const headerObj: Record<string, string> = {};
  for (const h of maskHeaders(headers)) {
    if (!h.disabled) headerObj[h.key] = h.value;
  }

  return `import requests

url = "${url}"
headers = ${formatJson(headerObj).replace(/"/g, "'")}${body ? `\n\npayload = ${body.replace(/"/g, "'")}` : ""}

response = requests.request("${method}", url, headers=headers${body ? ", data=payload" : ""})
print(response.json())`;
}

function generatePhp(
  method: string,
  path: string,
  headers: CollectionHeader[],
  body: string | null,
  baseUrl: string,
): string {
  const url = buildUrl(path, baseUrl);
  const headerLines = maskHeaders(headers)
    .filter((h) => !h.disabled)
    .map((h) => `  '${h.key}: ${h.value}',`)
    .join("\n");

  return `<?php

$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_URL => "${url}",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST => "${method}",
  CURLOPT_HTTPHEADER => [
${headerLines}
  ],${body ? `\n  CURLOPT_POSTFIELDS => '${body.replace(/'/g, "\\'")}',` : ""}
]);

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
  echo "cURL Error #:" . $err;
} else {
  echo $response;
}`;
}

export function useCodeGenerator(opts: Ref<CodeGenOptions>) {
  const examples = computed<CodeExample[]>(() => {
    if (!opts.value) return [];
    const { method, urlPath, headers, body, baseUrl } = opts.value;
    const tabs: CodeExample[] = [];
    if (body) {
      tabs.push({
        id: "json",
        label: "JSON",
        language: "json",
        languageLabel: "JSON",
        code: body,
      });
    }
    tabs.push(
      {
        id: "curl",
        label: "cURL",
        language: "bash",
        languageLabel: "cURL",
        code: generateCurl(method, urlPath, headers, body, baseUrl),
      },
      {
        id: "node",
        label: "Node.js",
        language: "javascript",
        languageLabel: "JavaScript",
        code: generateNode(method, urlPath, headers, body, baseUrl),
      },
      {
        id: "python",
        label: "Python",
        language: "python",
        languageLabel: "Python",
        code: generatePython(method, urlPath, headers, body, baseUrl),
      },
      {
        id: "php",
        label: "PHP",
        language: "php",
        languageLabel: "PHP",
        code: generatePhp(method, urlPath, headers, body, baseUrl),
      },
    );
    return tabs;
  });

  return { examples };
}

export function useResponseExamples(
  savedResponses: Ref<
    { name?: string; status: string; code: number; body: string }[]
  >,
) {
  const examples = computed<CodeExample[]>(() => {
    return savedResponses.value.map((r, idx) => {
      const parsed = safeJsonParse(r.body);
      const label = r.status
        ? `${r.code} — ${r.status}`
        : httpLabel(r.code);
      return {
        id: `response-${idx}`,
        label,
        language: "json",
        code: parsed ? formatJson(parsed) : r.body,
      };
    });
  });

  const defaultTab = computed(() => {
    const successIdx = examples.value.findIndex((r) =>
      r.label.toLowerCase().includes("success"),
    );
    return examples.value[successIdx]?.id ?? examples.value[0]?.id ?? "";
  });

  return { examples, defaultTab };
}
