import { LongRightArrowIcon } from "@/components/icon/LongRightArrowIcon"

export function DateRange({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex flex-col md:flex-row gap-x-4 justify-between items-center'>
      {children}
    </div>
  )
}

DateRange.Point = function DateRangeStart({ children }: { children: React.ReactNode }) {
  return (
    <div className='bg-card border rounded-lg p-2 w-full md:w-fit'>
      {children}
    </div>
  )
}

DateRange.Separator = function DateRangeSeparator({ label }: { label?: string }) {
  return <LongRightArrowIcon label={label} />
}
