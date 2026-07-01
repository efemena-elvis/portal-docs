import type { DocsConfig } from '../../docs.config'

type PublicConfig = Pick<DocsConfig, 'site' | 'design' | 'layout' | 'nav'>

export function useDocsConfig(): PublicConfig {
  const config = useRuntimeConfig()
  return config.public as unknown as PublicConfig
}
