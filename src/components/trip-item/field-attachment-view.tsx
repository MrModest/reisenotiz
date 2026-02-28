import { Attachment } from '@/types'
import { Icon } from '@/components/icon'
import { Badge } from '@/components/ui/badge'

export function FieldAttachmentView({ attachment }: { attachment: Attachment }) {
  return (
    <Badge
      variant='outline'
      className='h-7 text-xs px-3'
      render={<a href={attachment.link} target='_blank' rel='noopener noreferrer' />}
    >
      <Icon name='attachment' />
      {attachment.name}
    </Badge>
  )
}
