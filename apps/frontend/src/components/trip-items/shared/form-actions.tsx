import { useFormState } from 'react-hook-form'
import { Button } from '@/components/ui/button'

// A form's footer bar, inside its `<form>`. Save waits for a change, so a save never writes a no-op
export function FormActions({ onCancel }: { onCancel: () => void }) {
  const { isDirty } = useFormState()

  return (
    <div className='flex shrink-0 gap-2 border-t border-border bg-background px-4 py-3'>
      <Button type='button' variant='outline' className='h-9 flex-1' onClick={onCancel}>
        Cancel
      </Button>
      <Button type='submit' className='h-9 flex-1' disabled={!isDirty}>
        Save
      </Button>
    </div>
  )
}
