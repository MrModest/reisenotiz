import { describe, it, expect, afterEach, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { ThemeProvider, useTheme } from './theme-context'

function Probe() {
  const { theme } = useTheme()
  return (
    <>
      <span data-testid='theme'>{theme}</span>
      <input aria-label='note' />
      <textarea aria-label='description' />
    </>
  )
}

function renderProvider() {
  return render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>,
  )
}

const theme = () => screen.getByTestId('theme').textContent

describe('theme hotkey', () => {
  beforeEach(() => {
    localStorage.setItem('theme', 'light')
  })

  afterEach(() => {
    cleanup()
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('toggles the theme on a bare "d" and applies the dark class', () => {
    renderProvider()
    expect(theme()).toBe('light')

    fireEvent.keyDown(document.body, { key: 'd' })
    expect(theme()).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    fireEvent.keyDown(document.body, { key: 'd' })
    expect(theme()).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('toggles on Cmd+Shift+D and Ctrl+Shift+D', () => {
    renderProvider()

    fireEvent.keyDown(document.body, { key: 'D', metaKey: true, shiftKey: true })
    expect(theme()).toBe('dark')

    fireEvent.keyDown(document.body, { key: 'D', ctrlKey: true, shiftKey: true })
    expect(theme()).toBe('light')
  })

  it('ignores the bare hotkey while the user is typing', () => {
    renderProvider()

    fireEvent.keyDown(screen.getByLabelText('note'), { key: 'd' })
    expect(theme()).toBe('light')

    fireEvent.keyDown(screen.getByLabelText('description'), { key: 'd' })
    expect(theme()).toBe('light')
  })

  it('ignores unrelated modifier combinations', () => {
    renderProvider()

    // plain Cmd+D is the browser bookmark shortcut — must not be hijacked
    fireEvent.keyDown(document.body, { key: 'd', metaKey: true })
    expect(theme()).toBe('light')

    fireEvent.keyDown(document.body, { key: 'd', altKey: true })
    expect(theme()).toBe('light')
  })

  it('persists the chosen theme', () => {
    renderProvider()

    fireEvent.keyDown(document.body, { key: 'd' })
    expect(localStorage.getItem('theme')).toBe('dark')
  })
})
