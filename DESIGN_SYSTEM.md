# Design System

This document outlines the unified spacing and rounding system for the Reisenotiz project.

## Border Radius Scale

Use these consistent border-radius values throughout the application for a clean, compact appearance with subtle rounding (almost square):

- `rounded-xs` (0.25rem / 4px) - Minimal rounding
- `rounded-sm` (0.375rem / 6px) - Inputs, textareas, subtle elements
- `rounded-md` (0.5rem / 8px) - Buttons, popovers, list items
- `rounded-lg` (0.75rem / 12px) - Large containers, cards, dialogs, collapsible sections

### CSS Variables

Available as CSS variables:
```css
--radius-xs: 0.25rem
--radius-sm: 0.375rem
--radius-md: 0.5rem
--radius-lg: 0.75rem
--radius: var(--radius-md) /* default */
```

### Component Guidelines

| Component Type | Border Radius | Example |
|---------------|---------------|---------|
| Inputs, Textareas | `rounded-sm` | `<Input />`, `<Textarea />` |
| Buttons | `rounded-md` | `<Button />` |
| Cards, Large Containers | `rounded-lg` | `.card`, `<CollapsibleSection />` |
| Dialogs | `rounded-lg` | `<Dialog />` |
| Popovers | `rounded-md` | `<Popover />` |
| List Items | `rounded-md` | `<Item />` |
| Command Items | `rounded-md` | `<CommandItem />` |
| Small Icons/Images | `rounded-md` | `<ItemMedia variant="icon" />` |

## Spacing Scale

Use these consistent, compact spacing values:

- `--spacing-xs` (0.375rem / 6px)
- `--spacing-sm` (0.5rem / 8px)
- `--spacing-md` (0.75rem / 12px)
- `--spacing-lg` (1rem / 16px)
- `--spacing-xl` (1.25rem / 20px)

### Tailwind Equivalents

- `gap-0.5` = 0.125rem (2px) - minimal gaps
- `gap-1` = 0.25rem (4px) - tight gaps
- `gap-2` = 0.5rem (8px) - `--spacing-sm`
- `gap-3` = 0.75rem (12px) - `--spacing-md`
- `gap-4` = 1rem (16px) - `--spacing-lg`

### Padding Guidelines

- Form fields: Use `px-3` (0.75rem) for horizontal padding, minimal vertical
- Form field gaps: Use `gap-0.5` (2px) for tight label-to-input spacing
- Collapsible sections: Use `p-3` (0.75rem) for internal padding
- Cards: Use `p-3` for compact content density
- Dialogs: Use `p-5` for content padding
- Popovers: Use `p-3` for content padding

## Implementation Notes

- All design tokens are defined in `src/index.css`
- Tokens are exposed via Tailwind's `@theme` directive
- Components should use Tailwind utilities (`rounded-lg`, `gap-4`, etc.) rather than hardcoded values
- For custom values, use CSS variables: `var(--radius-lg)`, `var(--spacing-md)`

## Visual Consistency

When creating or modifying components:

1. **Choose the appropriate border radius** based on the component type (see table above)
2. **Use consistent, compact spacing** - prefer minimal gaps and tight padding
3. **Maintain subtle rounding** - inputs and form elements should appear almost square with just a hint of rounding
4. **Keep layouts compact** - avoid excessive padding and whitespace
5. **Test in both light and dark modes** to ensure visual consistency

## Design Philosophy

The design prioritizes:
- **Clean, almost-square aesthetics** - subtle border radius (4-12px max)
- **Compact layouts** - tight spacing and minimal padding
- **Efficient use of space** - dense, information-rich interfaces
- **Visual hierarchy through size, not excessive rounding**
