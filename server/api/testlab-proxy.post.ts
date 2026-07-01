import https from 'node:https'
import http from 'node:http'
import type { IncomingMessage } from 'node:http'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    url: string
    method: string
    headers?: Record<string, string>
    body?: string
  }>(event)

  if (!body?.url) {
    throw createError({ statusCode: 400, statusMessage: 'Missing url' })
  }

  let parsed: URL
  try {
    parsed = new URL(body.url)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid url' })
  }

  const isHttps = parsed.protocol === 'https:'
  const client = isHttps ? https : http

  const bodyBuf = body.body ? Buffer.from(body.body, 'utf-8') : null

  const reqHeaders: Record<string, string> = {
    'User-Agent': 'VesicashDocsTestLab/1.0',
    ...(body.headers ?? {}),
  }

  // Explicitly set Content-Length so servers don't get chunked transfer encoding,
  // which many payment APIs reject with 503/400.
  if (bodyBuf) {
    reqHeaders['Content-Length'] = String(bodyBuf.length)
  }

  return new Promise<{
    status: number
    statusText: string
    headers: Record<string, string>
    body: string
  }>((resolve, reject) => {
    const options: https.RequestOptions = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: (body.method ?? 'GET').toUpperCase(),
      headers: reqHeaders,
      // Allow self-signed / untrusted certs in the dev test lab
      rejectUnauthorized: false,
    }

    const req = client.request(options, (res: IncomingMessage) => {
      const chunks: Buffer[] = []
      res.on('data', (chunk: Buffer) => chunks.push(chunk))
      res.on('end', () => {
        const resHeaders: Record<string, string> = {}
        for (const [k, v] of Object.entries(res.headers)) {
          if (v != null) resHeaders[k] = Array.isArray(v) ? v.join(', ') : v
        }
        resolve({
          status: res.statusCode ?? 200,
          statusText: res.statusMessage ?? '',
          headers: resHeaders,
          body: Buffer.concat(chunks).toString('utf-8'),
        })
      })
      res.on('error', reject)
    })

    req.on('error', (err) => {
      reject(createError({ statusCode: 502, statusMessage: err.message }))
    })

    req.setTimeout(30_000, () => {
      req.destroy()
      reject(createError({ statusCode: 504, statusMessage: 'Request timed out' }))
    })

    if (bodyBuf) req.write(bodyBuf)
    req.end()
  })
})
