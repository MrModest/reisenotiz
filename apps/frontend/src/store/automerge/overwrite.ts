import { withoutUndefined } from './without-undefined'

// Writes `next` into the record field by field, so Automerge records only the fields that changed.
// A field `next` lacks is deleted; a key not yet in the record is created.
export function overwrite<T extends object>(record: Record<string, T>, key: string, next: T): void {
  const value = withoutUndefined(next)
  const stored = record[key]
  if (!stored) {
    record[key] = value
    return
  }
  for (const field of Object.keys(stored)) {
    if (!(field in value)) delete stored[field as keyof T]
  }
  Object.assign(stored, value)
}
