/**
 * Uploads all files from the local content/ directory to the R2 bucket.
 * Reads credentials from .env in the project root.
 *
 * Usage:  node scripts/seed-r2.mjs [--dry-run]
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createInterface } from 'node:readline'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const CONTENT_DIR = join(ROOT, 'content')

// ── Load .env ──────────────────────────────────────────────────────────────────
const envPath = join(ROOT, '.env')
if (!existsSync(envPath)) {
  console.error('No .env file found at', envPath)
  process.exit(1)
}
const envContent = readFileSync(envPath, 'utf-8')
const env = Object.fromEntries(
  envContent
    .split('\n')
    .filter(l => l.trim() && !l.startsWith('#') && l.includes('='))
    .map(l => {
      const idx = l.indexOf('=')
      const key = l.slice(0, idx).trim()
      const value = l.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
      return [key, value]
    }),
)

const { CF_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME } = env

if (!CF_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
  console.error('Missing R2 credentials in .env — need CF_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME')
  process.exit(1)
}

const dryRun = process.argv.includes('--dry-run')

// ── Collect all files ──────────────────────────────────────────────────────────
function walkDir(dir) {
  const results = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) {
      results.push(...walkDir(full))
    } else {
      results.push(full)
    }
  }
  return results
}

const allFiles = walkDir(CONTENT_DIR)
const keys = allFiles.map(f => relative(CONTENT_DIR, f).replace(/\\/g, '/'))

console.log(`Found ${keys.length} files in content/`)
if (dryRun) {
  keys.forEach(k => console.log('  [dry-run]', k))
  process.exit(0)
}

// ── Confirm before uploading ───────────────────────────────────────────────────
const rl = createInterface({ input: process.stdin, output: process.stdout })
await new Promise(resolve => {
  rl.question(`Upload ${keys.length} files to R2 bucket "${R2_BUCKET_NAME}"? [y/N] `, answer => {
    rl.close()
    if (answer.toLowerCase() !== 'y') {
      console.log('Aborted.')
      process.exit(0)
    }
    resolve()
  })
})

// ── Upload ─────────────────────────────────────────────────────────────────────
const client = new S3Client({
  region: 'auto',
  endpoint: `https://${CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
})

let uploaded = 0
let failed = 0

for (const key of keys) {
  const localPath = join(CONTENT_DIR, key)
  try {
    const body = readFileSync(localPath, 'utf-8')
    await client.send(new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: 'application/json',
    }))
    console.log(`  ✓ ${key}`)
    uploaded++
  } catch (err) {
    console.error(`  ✗ ${key}:`, err.message)
    failed++
  }
}

console.log(`\nDone. ${uploaded} uploaded, ${failed} failed.`)
if (failed > 0) process.exit(1)
