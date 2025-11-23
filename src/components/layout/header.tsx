interface HeaderProps {
  title?: string
}

export function Header({ title = "Reisenotiz" }: HeaderProps) {
  return (
    <header className="border-b border-border bg-background sticky top-0 z-10">
      <div className="px-4 py-4">
        <h1 className="text-2xl font-semibold">{title}</h1>
      </div>
    </header>
  )
}
