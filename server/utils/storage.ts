import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  CopyObjectCommand,
} from '@aws-sdk/client-s3'
import {
  existsSync, readFileSync, writeFileSync, unlinkSync,
  mkdirSync, readdirSync, statSync, renameSync, rmSync,
} from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { resolve } from 'node:path'

export interface StorageDriver {
  readFile(key: string): Promise<string | null>
  writeFile(key: string, content: string): Promise<void>
  deleteFile(key: string): Promise<void>
  fileExists(key: string): Promise<boolean>
  listKeys(prefix?: string): Promise<string[]>
  moveFile(fromKey: string, toKey: string): Promise<void>
  deletePrefix(prefix: string): Promise<void>
}

// ── Filesystem driver (local dev) ─────────────────────────────────────────────

class FilesystemDriver implements StorageDriver {
  constructor(private root: string) {}

  async readFile(key: string): Promise<string | null> {
    const p = join(this.root, key)
    if (!existsSync(p)) return null
    try { return readFileSync(p, 'utf-8') } catch { return null }
  }

  async writeFile(key: string, content: string): Promise<void> {
    const p = join(this.root, key)
    mkdirSync(dirname(p), { recursive: true })
    writeFileSync(p, content, 'utf-8')
  }

  async deleteFile(key: string): Promise<void> {
    const p = join(this.root, key)
    if (existsSync(p)) unlinkSync(p)
  }

  async fileExists(key: string): Promise<boolean> {
    return existsSync(join(this.root, key))
  }

  async listKeys(prefix = ''): Promise<string[]> {
    const dir = join(this.root, prefix)
    if (!existsSync(dir)) return []
    const results: string[] = []
    const walk = (d: string) => {
      for (const name of readdirSync(d)) {
        const full = join(d, name)
        if (statSync(full).isDirectory()) walk(full)
        else results.push(relative(this.root, full).replace(/\\/g, '/'))
      }
    }
    walk(dir)
    return results
  }

  async moveFile(fromKey: string, toKey: string): Promise<void> {
    const src = join(this.root, fromKey)
    const dst = join(this.root, toKey)
    mkdirSync(dirname(dst), { recursive: true })
    renameSync(src, dst)
  }

  async deletePrefix(prefix: string): Promise<void> {
    const dir = join(this.root, prefix)
    if (existsSync(dir)) rmSync(dir, { recursive: true, force: true })
  }
}

// ── R2 driver (production) ────────────────────────────────────────────────────

class R2Driver implements StorageDriver {
  private client: S3Client
  private bucket: string

  constructor(accountId: string, accessKeyId: string, secretAccessKey: string, bucket: string) {
    this.bucket = bucket
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    })
  }

  async readFile(key: string): Promise<string | null> {
    try {
      const res = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }))
      return await res.Body!.transformToString('utf-8')
    } catch (e: any) {
      if (e?.name === 'NoSuchKey' || e?.$metadata?.httpStatusCode === 404) return null
      throw e
    }
  }

  async writeFile(key: string, content: string): Promise<void> {
    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: content,
      ContentType: 'application/json',
    }))
  }

  async deleteFile(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }))
  }

  async fileExists(key: string): Promise<boolean> {
    try {
      await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }))
      return true
    } catch { return false }
  }

  async listKeys(prefix = ''): Promise<string[]> {
    const keys: string[] = []
    let token: string | undefined
    do {
      const res = await this.client.send(new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix || undefined,
        ContinuationToken: token,
      }))
      for (const obj of res.Contents ?? []) {
        if (obj.Key) keys.push(obj.Key)
      }
      token = res.IsTruncated ? res.NextContinuationToken : undefined
    } while (token)
    return keys
  }

  async moveFile(fromKey: string, toKey: string): Promise<void> {
    await this.client.send(new CopyObjectCommand({
      Bucket: this.bucket,
      CopySource: `${this.bucket}/${fromKey}`,
      Key: toKey,
    }))
    await this.deleteFile(fromKey)
  }

  async deletePrefix(prefix: string): Promise<void> {
    const keys = await this.listKeys(prefix)
    if (keys.length === 0) return
    for (let i = 0; i < keys.length; i += 1000) {
      const batch = keys.slice(i, i + 1000)
      await this.client.send(new DeleteObjectsCommand({
        Bucket: this.bucket,
        Delete: { Objects: batch.map(k => ({ Key: k })) },
      }))
    }
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

let _storage: StorageDriver | null = null

export function getStorage(): StorageDriver {
  if (_storage) return _storage
  const { CF_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME } = process.env
  if (CF_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET_NAME) {
    _storage = new R2Driver(CF_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME)
  } else {
    _storage = new FilesystemDriver(resolve(process.cwd(), 'content'))
  }
  return _storage
}

// Rename all keys under a prefix (no native rename in R2 — copy+delete each)
export async function renameStoragePrefix(storage: StorageDriver, fromPrefix: string, toPrefix: string): Promise<void> {
  const keys = await storage.listKeys(fromPrefix)
  await Promise.all(keys.map(k => storage.moveFile(k, toPrefix + k.slice(fromPrefix.length))))
}
