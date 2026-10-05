import { Icon } from '@/components/icon'
import { Input } from '@/components/ui/input'
import { generateUUID, type Person } from '@/types'

interface EditProps {
  onChange: (people: Person[]) => void
  // The name being typed, held by the form so it counts as a change and is saved with it
  draft: string
  onDraftChange: (draft: string) => void
  id?: string
}

// Read-only with `people` alone; editable when the form also hands over the draft
export function PersonChips({ people, ...edit }: { people: Person[] } & (EditProps | { onChange?: never })) {
  const editing = 'draft' in edit ? edit : undefined

  function commit() {
    if (!editing) return
    const fullname = editing.draft.trim()
    if (fullname) editing.onChange([...people, { id: generateUUID(), fullname, contacts: [] }])
    editing.onDraftChange('')
  }

  return (
    <div className='flex flex-col gap-2'>
      {people.length > 0 && (
        <div className={editing ? 'flex flex-wrap gap-1.5' : 'flex flex-wrap justify-end gap-1.5'}>
          {people.map((p) => (
            <span key={p.id} className='inline-flex max-w-full items-center gap-1 rounded-sm bg-secondary px-2 py-1 font-sans text-sm wrap-anywhere'>
              {p.fullname}
              {editing && (
                <button
                  type='button'
                  aria-label={`Remove ${p.fullname}`}
                  className='shrink-0 text-muted-foreground hover:text-foreground'
                  onClick={() => editing.onChange(people.filter((other) => other.id !== p.id))}
                >
                  <Icon name='x' className='size-3.5' />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
      {editing && (
        <Input
          id={editing.id}
          value={editing.draft}
          maxLength={100}
          placeholder='Add a name'
          onChange={(e) => editing.onDraftChange(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return
            e.preventDefault()
            commit()
          }}
        />
      )}
    </div>
  )
}
