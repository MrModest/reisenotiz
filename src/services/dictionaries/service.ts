import { DictionaryConfig, StoredDict } from "./types"

export class Dictionary<T extends { name: string }> {
  private cache: Record<string, T> = {}
  private fetchedAt: string = ''
  private loaded = false

  constructor(private readonly config: DictionaryConfig<T>) { }

  // FIXME: Current logic will lose any custom values stored in localStorage.
  // Need a way for a proper merging public dataset with user's custom entries.
  async load(): Promise<void> {
    if (this.loaded) return

    const raw = localStorage.getItem(this.config.storageKey)
    const now = Date.now()

    if (raw) {
      try {
        const stored: StoredDict<T> = JSON.parse(raw)
        const fetchedAt = Date.parse(stored.fetchedAt)

        if (Number.isFinite(fetchedAt) && now - fetchedAt <= this.config.maxAgeMs) {
          this.cache = stored.data
          this.fetchedAt = stored.fetchedAt
          this.loaded = true
          return
        }
      } catch(err) {
        const errMsg = (err instanceof Error) ? err.message : String(err)
        console.warn(`Failed to parse dictionary cache for '${this.config.storageKey}': ${errMsg}`)
        // corrupted cache → refetch
      }
    }

    // Fetch fresh data
    const data = await this.config.fetcher()

    const payload: StoredDict<T> = {
      fetchedAt: new Date(now).toISOString(), // UTC by definition
      data
    }

    this.cache = data
    localStorage.setItem(
      this.config.storageKey,
      JSON.stringify(payload)
    )

    this.loaded = true
  }

  private ensureLoaded(): void {
    if (!this.loaded) {
      throw new Error(
        `Dictionary "${this.config.storageKey}" accessed before load()`
      )
    }
  }

  get(key: string): T | undefined {
    this.ensureLoaded()
    return this.cache[key]
  }

  getAll(): Readonly<Record<string, T>> {
    this.ensureLoaded()
    return this.cache
  }

  async add(item: T): Promise<void> {
    this.ensureLoaded()
    this.cache[item.name] = item

    const payload: StoredDict<T> = {
      fetchedAt: this.fetchedAt, // don't overwrite so server updates can be detected
      data: this.cache
    }

    localStorage.setItem(
      this.config.storageKey,
      JSON.stringify(payload)
    )

    //TODO: add the new item to server via API
  }

  findByName(name: string): T[] {
    this.ensureLoaded()
    return Object.values(this.cache)
      .filter(item => item.name.startsWith(name))
  }
}
