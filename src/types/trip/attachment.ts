import { UUID } from '@/types/common/uuid'

export interface Attachment {
  id: UUID;
  tripItemId: UUID;
  link: string;
  name: string;
  note: string
}
