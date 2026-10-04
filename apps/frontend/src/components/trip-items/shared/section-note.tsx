import { useWatch } from 'react-hook-form'
import { CollapsibleSection } from './collapsible-section'
import { FieldTextarea } from './field-textarea'

export interface NoteSectionProps {
  name: string
  placeholder?: string
}

export function NoteSection({ name, placeholder }: NoteSectionProps) {
  const note = useWatch({ name })

  const firstLine = note?.split('\n')[0] ?? ''
  const truncated = firstLine.length > 60 ? firstLine.slice(0, 60) + '...' : firstLine
  const preview = note?.trim() ? <span className='text-sm text-foreground'>{truncated}</span> : undefined

  return (
    <CollapsibleSection label='Note' preview={preview} defaultOpen={false} className='my-4'>
      <FieldTextarea name={name} label='' placeholder={placeholder} />
    </CollapsibleSection>
  )
}
