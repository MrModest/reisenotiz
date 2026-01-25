import { Switch } from '@/components/ui/switch'
import { Icon } from '@/components/icon'
import { Theme } from '@/hooks/use-theme'
import { cn } from '@/lib/utils'

export default function ThemeSwitcher({ theme, onSwitch, collapsed = false, className }: {
  theme: Theme,
  onSwitch: (theme: Theme) => void,
  collapsed?: boolean,
  className?: string
}) {
  const isDark = theme === 'dark'

  if (collapsed) {
    return (
      <button
        onClick={() => onSwitch(isDark ? 'light' : 'dark')}
        className={cn(
          'flex items-center justify-center p-3 m-2 rounded-md transition-colors',
          'hover:bg-accent hover:text-accent-foreground text-muted-foreground',
          className
        )}
        aria-label='Toggle theme'
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <Icon name={isDark ? 'dark-theme' : 'light-theme'} className='size-5' />
      </button>
    )
  }

  return (
    <div className={cn('flex items-center gap-2 p-4', className)}>
      <Icon name='light-theme' className='size-5' />
      <Switch
        checked={isDark}
        onCheckedChange={() => onSwitch(isDark ? 'light' : 'dark')}
        aria-label='Toggle theme'
      />
      <Icon name='dark-theme' className='size-5' />
    </div>
  )
}
