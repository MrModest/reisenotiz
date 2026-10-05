import { useState } from 'react'
import { Icon } from '@/components/icon'
import { Input } from '@/components/ui/input'
import { generateUUID, type Person } from '@/types'

interface PersonChipsProps {
  people: Person[]
  // Absent: the chips are read-only
  onChange?: (people: Person[]) => void
  id?: string
}

export function PersonChips({ people, onChange, id }: PersonChipsProps) {
  const [draft, setDraft] = useState('')

  function add() {
    const fullname = draft.trim()
    if (fullname) onChange?.([...people, { id: generateUUID(), fullname, contacts: [] }])
    setDraft('')
  }

  return (
    <div className='flex flex-col gap-2'>
      {people.length > 0 && (
        <div className={onChange ? 'flex flex-wrap gap-1.5' : 'flex flex-wrap justify-end gap-1.5'}>
          {people.map((p) => (
            <span key={p.id} className='inline-flex max-w-full items-center gap-1 rounded-sm bg-secondary px-2 py-1 font-sans text-sm wrap-anywhere'>
              {p.fullname}
              {onChange && (
                <button
                  type='button'
                  aria-label={`Remove ${p.fullname}`}
                  className='shrink-0 text-muted-foreground hover:text-foreground'
                  onClick={() => onChange(people.filter((other) => other.id !== p.id))}
                >
                  <Icon name='x' className='size-3.5' />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
      {onChange && (
        <Input
          id={id}
          value={draft}
          maxLength={100}
          placeholder='Add a name'
          onChange={(e) => setDraft(e.target.value)}
          onBlur={add}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return
            e.preventDefault()
            add()
          }}
        />
      )}
    </div>
  )
}
