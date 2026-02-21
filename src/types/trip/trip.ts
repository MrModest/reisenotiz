import { ZonedInstant } from "@/lib/datetime"

export interface Trip {
  id: string;
  name: string;
  description: string;
  startDate: ZonedInstant;
  endDate: ZonedInstant;
}
