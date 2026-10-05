export interface StoredDict<T> {
  fetchedAt: string // ISO UTC
  data: Record<string, T>
}

export interface DictionaryConfig<T> {
  storageKey: string
  fetcher: () => Promise<Record<string, T>>
  maxAgeMs: number
}

export interface Country {
  code: string // ISO 3166-1 alpha-2
  name: string
}
