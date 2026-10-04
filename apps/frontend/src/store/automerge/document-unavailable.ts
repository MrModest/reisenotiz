// automerge-repo builds this as `new Error(`Document ${id} is unavailable`)` in `Repo.find` and
// exposes no error type, so the message is the only thing to match. Nowhere else matches it.
export function isDocumentUnavailableError(error: unknown): boolean {
  return error instanceof Error && /^Document \S+ is unavailable$/.test(error.message)
}
