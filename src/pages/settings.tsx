import { useHeaderTitle } from "@/hooks/use-header-title"

export function SettingsPage() {
  useHeaderTitle("Settings")

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Settings</h1>
      <p className="text-muted-foreground">Settings page coming soon...</p>
    </div>
  )
}
