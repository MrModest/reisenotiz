import { useState } from 'react'
import { Link } from 'react-router'
import { isValidAutomergeUrl, useRepo } from '@automerge/react'
import { useHeaderTitle } from '@/hooks/use-header-title'
import { Icon } from '@/components/icon'
import { routes } from '@/lib/routes'
import { Item, ItemContent, ItemGroup, ItemMedia, ItemTitle, ItemDescription } from '@/components/ui/item'
import { Field, FieldLabel, FieldContent, FieldDescription, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRootDocUrl } from '@/contexts/root-doc-context'
import { ROOT_DOC_KEY } from '@/store/automerge/root-doc'

const FIND_TIMEOUT_MS = 8000

function SyncSettings() {
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

export function SettingsPage() {
  useHeaderTitle('Settings')

  return (
    <div className='p-4 w-default flex flex-col gap-6'>
      <ItemGroup>
        <Item variant='outline' render={<Link to={routes.records.root} />}>
          <ItemMedia variant='icon'>
            <Icon name='inbox' />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Records</ItemTitle>
            <ItemDescription>Manage custom airports and other records</ItemDescription>
          </ItemContent>
          <Icon name='chevron-right' className='size-4 text-muted-foreground' />
        </Item>
      </ItemGroup>
      <SyncSettings />
    </div>
  )
}
