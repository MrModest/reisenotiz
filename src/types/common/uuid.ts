import { v4 as uuidv4, NIL as NIL_UUID, validate } from 'uuid'

export type UUID = string & { readonly _: unique symbol }

export function generateUUID(): UUID {
  return uuidv4() as UUID
}

export const NoneId = NIL_UUID as UUID

export function toUUID(uuid: string): UUID {
  if (!validate(uuid)) {
    throw new Error(`The string '${uuid}' is not a valid UUID!`)
  }

  return uuid as UUID
}
