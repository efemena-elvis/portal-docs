/**
 * Seeds the R2 bucket from the local content/ directory.
 *
 * Exits gracefully if the bucket already contains any objects — this is a
 * one-time bootstrap tool, not a sync tool. Run it once on a fresh bucket.
 *
 * Usage:
 *   node scripts/seed-r2.mjs            # check + confirm + upload
 *   node scripts/seed-r2.mjs --dry-run  # list files that would be uploaded
 */

import { S3Client, ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3'
import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createInterface } from 'node:readline'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const CONTENT_DIR = join(ROOT, 'content')

// ── Load .env ─────────────────────────────────────────────────────────────────
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

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
})

// ── Guard: bail if bucket is not empty ────────────────────────────────────────
if (!dryRun) {
  console.log(`Checking R2 bucket "${R2_BUCKET_NAME}"...`)
  const check = await client.send(new ListObjectsV2Command({
    Bucket: R2_BUCKET_NAME,
    MaxKeys: 1,
  }))

  if ((check.KeyCount ?? 0) > 0) {
    console.log(`Bucket "${R2_BUCKET_NAME}" already contains objects — skipping seed to avoid overwriting live content.`)
    console.log('If you intend to reseed, empty the bucket first.')
    process.exit(0)
  }

  console.log('Bucket is empty — proceeding with seed.\n')
}

// ── Collect local files ───────────────────────────────────────────────────────
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

if (keys.length === 0) {
  console.log('Nothing to seed — content/ is empty. Add content via the admin panel first.')
  process.exit(0)
}

if (dryRun) {
  keys.forEach(k => console.log('  [dry-run]', k))
  process.exit(0)
}

// ── Confirm ───────────────────────────────────────────────────────────────────
const rl = createInterface({ input: process.stdin, output: process.stdout })
await new Promise(resolve => {
  rl.question(`Upload ${keys.length} files to "${R2_BUCKET_NAME}"? [y/N] `, answer => {
    rl.close()
    if (answer.toLowerCase() !== 'y') {
      console.log('Aborted.')
      process.exit(0)
    }
    resolve()
  })
})

// ── Upload ────────────────────────────────────────────────────────────────────
let uploaded = 0
let failed = 0

for (const key of keys) {
  const localPath = join(CONTENT_DIR, key)
  try {
    await client.send(new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: readFileSync(localPath, 'utf-8'),
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
