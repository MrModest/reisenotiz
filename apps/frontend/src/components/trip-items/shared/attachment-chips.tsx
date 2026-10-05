import { Icon } from '@/components/icon'
import type { Attachment } from '@/types'
import { SectionLabel } from './field-label'

export function AttachmentChips({ attachments }: { attachments: Attachment[] }) {
  if (attachments.length === 0) return null
  return (
    <section className='flex flex-col gap-1.5'>
      <SectionLabel>Attachments</SectionLabel>
      <div className='flex flex-wrap gap-2'>
        {attachments.map((a) => (
          <a
            key={a.id}
            href={a.link}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex max-w-full items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm wrap-anywhere transition-colors duration-150 hover:bg-accent/50'
          >
            <Icon name='attachment' className='size-4 shrink-0 text-muted-foreground' />
            {a.name}
          </a>
        ))}
      </div>
    </section>
  )
}
