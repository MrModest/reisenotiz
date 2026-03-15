import { v7 as uuidv7, NIL as NIL_UUID, validate } from 'uuid'

export type UUID = ReturnType<typeof crypto.randomUUID>

export function generateUUID(): UUID {
  return uuidv7() as UUID
}

export const NoneId = NIL_UUID satisfies UUID

export function validated(uuid: string): string {
  if (!validate(uuid)) {
    throw new Error(`The string '${uuid}' is not a valid UUID!`)
  }

  return uuid
}
