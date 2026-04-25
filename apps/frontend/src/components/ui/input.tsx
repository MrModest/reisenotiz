import * as React from 'react'

import { cn } from '@/lib/utils'
import { inputStyles } from './input-styles'

function Input({ className, type = 'text', ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot='input'
      className={cn(
        ...inputStyles,
        'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground',
        'file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
