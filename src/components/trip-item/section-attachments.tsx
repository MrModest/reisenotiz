import { useWatch } from 'react-hook-form'
import { CollapsibleSection } from './collapsible-section'
import { FieldAttachments } from './field-attachments'

export function AttachmentsSection({ name }: { name: string }) {
  const attachments = useWatch({ name })
  const count = attachments?.length || 0
  const label = count > 0 ? `Attachments (${count})` : 'Attachments'

  return (
    <CollapsibleSection
      label={label}
      defaultOpen={false}
      className='mb-2 mt-6'
    >
      <FieldAttachments name={name} />
    </CollapsibleSection>
  )
}
