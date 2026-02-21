import { v4 as uuidv4, NIL as NIL_UUID, validate } from 'uuid'

export function generateUUID(): string {
  return uuidv4()
}

export const NoneId = NIL_UUID as string

export function validated(uuid: string): string {
  if (!validate(uuid)) {
    throw new Error(`The string '${uuid}' is not a valid UUID!`)
  }

  return uuid
}
