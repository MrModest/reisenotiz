// Automerge rejects `undefined` anywhere in a document; a JSON round trip drops those keys.
export function withoutUndefined<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}
