import type { FetchOptions } from 'ofetch'

type Fetcher = <T>(path: string, options?: FetchOptions<'json'>) => Promise<T>

export const useApi = (): Fetcher => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase || undefined

  return async <T>(path: string, options: FetchOptions<'json'> = {}) => {
    return await $fetch<T>(path, {
      baseURL,
      ...options,
    })
  }
}
