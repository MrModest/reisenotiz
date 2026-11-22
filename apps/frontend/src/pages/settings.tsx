import { useState } from 'react'
import { isValidAutomergeUrl, useRepo } from '@automerge/react'
import { PageHeader } from '@/components/layout/page-header'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useTheme, type Theme } from '@/hooks/use-theme'
import { ChipRow } from '@/components/ui/chip-row'
import { Field, FieldLabel, FieldContent, FieldDescription, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRootDocUrl } from '@/contexts/root-doc-context'
import { ROOT_DOC_KEY } from '@/store/automerge/root-doc'

const FIND_TIMEOUT_MS = 8000

export function SyncSettings() {
  const repo = useRepo()
  const rootDocUrl = useRootDocUrl()
  const [value, setValue] = useState<string>(rootDocUrl)
  const [error, setError] = useState<string>()
  const [checking, setChecking] = useState(false)

  async function handleSave() {
    const trimmed = value.trim()
    if (!isValidAutomergeUrl(trimmed)) {
      setError('Not a valid document ID')
      return
    }

    setChecking(true)
    setError(undefined)
    try {
      await repo.find(trimmed, { signal: AbortSignal.timeout(FIND_TIMEOUT_MS) })
    } catch {
      setChecking(false)
      setError('Could not reach this document. Make sure a sync server is configured and the ID is correct.')
      return
    }

    localStorage.setItem(ROOT_DOC_KEY, trimmed)
    window.location.reload()
  }

  return (
    <Field>
      <FieldLabel htmlFor='root-doc-url'>Sync Document ID</FieldLabel>
      <FieldContent>
        <Input
          id='root-doc-url'
          value={value}
          disabled={checking}
          onChange={(e) => {
            setValue(e.target.value)
            setError(undefined)
          }}
        />
        {error && <FieldError>{error}</FieldError>}
        <FieldDescription>Paste the same ID on another device to sync your trips.</FieldDescription>
      </FieldContent>
      <Button onClick={handleSave} disabled={checking || value.trim() === rootDocUrl}>
        {checking ? 'Checking…' : 'Save'}
      </Button>
    </Field>
  )
}

const themeOptions: { value: Theme; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

export function AppearanceSettings() {
  const [theme, setTheme] = useTheme()

  return (
    <Field>
      <FieldLabel>Theme</FieldLabel>
      <ChipRow options={themeOptions} value={theme} onValueChange={setTheme} aria-label='Theme' />
      {theme === 'system' && (
        <FieldDescription>
          Follows your device, currently{' '}
          <span className='[@media(prefers-color-scheme:dark)]:hidden'>light</span>
          <span className='hidden [@media(prefers-color-scheme:dark)]:inline'>dark</span>.
        </FieldDescription>
      )}
    </Field>
  )
}

const sectionTitle = 'font-mono text-[10px] tracking-[.08em] uppercase text-muted-foreground'

export function SettingsPage() {
  useDocumentTitle('Settings')

  return (
    <>
      <PageHeader title='Settings' />
      <div className='min-h-0 flex-1 overflow-y-auto p-4 flex flex-col gap-6'>
        <section className='flex flex-col gap-3'>
          <h2 className={sectionTitle}>Appearance</h2>
          <AppearanceSettings />
        </section>
        <section className='flex flex-col gap-3'>
          <h2 className={sectionTitle}>Sync</h2>
          <SyncSettings />
        </section>
      </div>
    </>
  )
}
