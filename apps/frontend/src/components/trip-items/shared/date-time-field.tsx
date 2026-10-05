import { FieldDatePicker } from './field-date-picker'
import { FieldInput } from './field-input'

interface DateTimeFieldProps {
  dateName: string
  timeName: string
  dateLabel?: string
  timeLabel?: string
}

// A date and a time typed as wall-clock values; submit anchors them to the place's zone
export function DateTimeField({ dateName, timeName, dateLabel = 'Date', timeLabel = 'Time' }: DateTimeFieldProps) {
  return (
    <div className='grid grid-cols-2 gap-3'>
      <FieldDatePicker name={dateName} label={dateLabel} />
      <FieldInput name={timeName} label={timeLabel} placeholder='HH:MM' inputMode='numeric' inputClassName='font-mono' />
    </div>
  )
}
