import { ZonedInstant } from "@/lib/datetime"
import { UUID } from "@/types/common/uuid"

export interface Trip {
  id: UUID;
  name: string;
  description: string;
  startDate: ZonedInstant;
  endDate: ZonedInstant;
}
