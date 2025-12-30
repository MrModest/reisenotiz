import { Switch } from '@/components/ui/switch'
import { Icon } from '@/components/icon'
import { Theme } from '@/hooks/use-theme'

export default function ThemeSwitcher({ theme, onSwitch }: {
  theme: Theme,
  onSwitch: (theme: Theme) => void
}) {
  const isDark = theme === 'dark'

  return (
    <div className='flex items-center space-x-3'>
      <Icon name='light-theme' className='size-4' />
      <Switch
        checked={isDark}
        onCheckedChange={() => onSwitch(isDark ? 'light' : 'dark')}
        aria-label='Toggle theme'
      />
      <Icon name='dark-theme' className='size-4' />
    </div>
  )
}
