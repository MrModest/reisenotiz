// Credits: https://github.com/saneatsu
// Source: https://stackblitz.com/edit/shadcn-combobox-example

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/icon'

export type ComboboxOptions = {
  value: string
  label: string
}

interface ComboboxProps {
  options: ComboboxOptions[] // TODO: dynamic fetching instead of static options
  selected: ComboboxOptions['value']
  className?: string
  placeholder?: string
  disabled?: boolean
  onSelect: (option: ComboboxOptions) => void
  onCreate?: (label: ComboboxOptions['label']) => void
}

/**
 * CommandItem to create a new query content
 */
function CommandAddItem({
  query,
  onSelect,
}: {
  query: string
  onSelect: () => void
}) {
  return (
    <div
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
          onSelect()
        }
      }}
      className={cn(
        'flex w-full text-accent-foreground cursor-pointer text-sm px-2 py-1.5 rounded-sm items-center focus:outline-none',
        'hover:bg-accent focus:bg-accent'
      )}
    >
      <Icon name='add' className='mr-2 h-4 w-4' />
      Create '{query}'
    </div>
  )
}

export function Combobox({
  options,
  selected,
  className,
  placeholder,
  disabled,
  onSelect,
  onCreate,
}: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  // Queried option already exists
  const isAlreadyCreated = !options.some((option) => option.label === query)

  function handleSelect(option: ComboboxOptions) {
    console.log('onSelect', option)
    if (onSelect) {
      onSelect(option)
      setOpen(false)
      setQuery('')
    }
  }

  function handleCreate() {
    console.log('onCreate', query)
    if (onCreate && query) {
      onCreate(query)
      setOpen(false)
      setQuery('')
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          role='combobox'
          disabled={disabled ?? false}
          aria-expanded={open}
          className={cn('w-full font-normal', className)}
        >
          {selected && selected.length > 0 ? (
            <div className='truncate mr-auto flex items-center gap-1'>
              <span className='px-1 bg-primary/50 rounded-sm'>{options.find((item) => item.value === selected)?.value}</span>
              <span>{options.find((item) => item.value === selected)?.label}</span>
            </div>
          ) : (
            <div className='text-slate-600 mr-auto'>
              {placeholder ?? 'Select'}
            </div>
          )}
          <Icon name='chevrons-up-down' className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-full min-w-[500px] p-0'>
        <Command
          filter={(value, search) => {
            const v = value.toLocaleLowerCase()
            const s = search.toLocaleLowerCase()
            if (v.includes(s)) return 1
            return 0
          }}
        >
          <CommandInput
            placeholder='Search or create new'
            value={query}
            onValueChange={(value: string) => setQuery(value)}
            onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
              if (event.key === 'Enter') {
                // Avoid selecting what is displayed as a choice even if you press Enter for the conversion
                // Note that if you do this, you can select a choice with the arrow keys and press Enter, but it will not be selected
                event.preventDefault()
              }
            }}
          />
          <CommandEmpty className='flex pl-1 py-1 w-full'>
            {query && (
              <CommandAddItem query={query} onSelect={() => handleCreate()} />
            )}
          </CommandEmpty>

          <CommandList>
            <CommandGroup className='overflow-y-auto'>
              {/* No options and no query */}
              {/* Even if written as a Child of CommandEmpty, it may not be displayed only the first time, so write it in CommandGroup. */}
              {options.length === 0 && !query && (
                <div className='py-1.5 pl-8 space-y-1 text-sm'>
                  <p>No items</p>
                  <p>Enter a value to create a new one</p>
                </div>
              )}

              {/* Create */}
              {/* (If query isn't empty or queried item doesn't exist already) */}
              {query && isAlreadyCreated && (
                <CommandAddItem query={query} onSelect={() => handleCreate()} />
              )}

              {/* Select */}
              {options.map(option => (
                <CommandItem
                  key={option.label}
                  tabIndex={0}
                  value={option.label}
                  onSelect={() => {handleSelect(option)}}
                  onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
                    if (event.key === 'Enter') {
                      // Process to prevent onSelect from firing, but it does not work well with StackBlitz.
                      event.stopPropagation()

                      handleSelect(option)
                    }
                  }}
                  className={cn(
                    'cursor-pointer',
                  )}
                >
                  {/* min to avoid the check icon being too small when the option.label is long. */}
                  <Icon name='check'
                    className={cn(
                      'mr-2 h-4 w-4 min-h-4 min-w-4',
                      selected === option.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
