import { useState } from 'react'
import { isValidAutomergeUrl, useRepo } from '@automerge/react'
import { PageHeader } from '@/components/layout/page-header'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useTheme } from '@/hooks/use-theme'
import { Switch } from '@/components/ui/switch'
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

export function AppearanceSettings() {
  const [theme, setTheme] = useTheme()

  return (
    <Field orientation='horizontal'>
      <FieldLabel htmlFor='dark-theme'>Dark theme</FieldLabel>
      <Switch
        id='dark-theme'
        checked={theme === 'dark'}
        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
      />
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
