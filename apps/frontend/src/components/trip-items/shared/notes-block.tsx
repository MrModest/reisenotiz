import { SectionLabel } from './field-label'

export function NotesBlock({ note }: { note: string }) {
  if (!note.trim()) return null
  return (
    <section className='flex flex-col gap-1.5'>
      <SectionLabel>Notes</SectionLabel>
      <p className='text-[13px] leading-[1.6] whitespace-pre-line wrap-anywhere'>{note}</p>
    </section>
  )
}
