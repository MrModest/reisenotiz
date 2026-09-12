import { describe, it, expect } from 'vitest'
import { readFileSync, globSync } from 'node:fs'

/**
 * index.css defines its own --spacing-xs…--spacing-xl scale, which shadows Tailwind's named
 * sizing utilities for exactly those five names: `max-w-lg` compiles to `max-width: 1rem`
 * instead of 32rem. It still typechecks, lints and builds — it just renders collapsed.
 *
 * Use an arbitrary value (`max-w-[32rem]`) or the numeric spacing scale (`max-w-72`).
 * Larger names like `max-w-2xl` are unaffected: no --spacing-2xl is defined, so they keep
 * resolving to Tailwind's --container-* sizes.
 */
const SHADOWED = /\b(?:max-w|min-w|max-h|min-h)-(?:xs|sm|md|lg|xl)\b/
const COMMENT = /^\s*(?:\/\/|\/\*|\*|\{\/\*)/

describe('named sizing utilities', () => {
  it('are not used for the sizes this theme shadows', () => {
    const files = globSync('src/**/*.{ts,tsx}', { cwd: process.cwd() })
    const offenders: string[] = []

    for (const file of files) {
      if (file.endsWith('sizing-utilities.test.ts')) continue
      readFileSync(file, 'utf8')
        .split('\n')
        .forEach((line, index) => {
          if (COMMENT.test(line)) return
          if (SHADOWED.test(line)) offenders.push(`${file}:${index + 1}  ${line.trim()}`)
        })
    }

    expect(offenders).toEqual([])
  })
})
