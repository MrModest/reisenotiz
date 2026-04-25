export interface StoredDict<T> {
  fetchedAt: string // ISO UTC
  data: Record<string, T>
}

export interface DictionaryConfig<T> {
  storageKey: string
  fetcher: () => Promise<Record<string, T>>
  maxAgeMs: number
}
