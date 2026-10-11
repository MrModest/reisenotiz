import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Joins the parts that are present: `joinWith(' · ', ['Departure', terminal, seat && `Seat ${seat}`])`
export function joinWith(separator: string, parts: (string | null | undefined | false)[]): string {
  return parts.filter(Boolean).join(separator)
}
