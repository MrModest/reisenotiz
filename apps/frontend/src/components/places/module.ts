import type { FunctionComponent } from 'react'
import type { ZodType } from 'zod'
import type { IconName } from '@/components/icon'
import type { AnyPlace, PlaceType } from '@/types'

export interface PlaceFieldsProps {
  // Where the place sits in the surrounding form: '' in the place dialog, `departure.place.` in a flight
  prefix?: string
}

export interface PlaceTypeModule<T extends AnyPlace = AnyPlace> {
  type: PlaceType
  label: string
  icon: IconName
  // A blank place of this type, with no id yet
  empty(): T
  // The short line beside a place's name: an airport's code, a site's kind
  meta(place: T): string
  schema: ZodType<T>
  // The type's form fields, the shared ones included
  Fields: FunctionComponent<PlaceFieldsProps>
}
