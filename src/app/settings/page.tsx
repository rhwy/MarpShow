import { TopBar } from "@/ui/components/TopBar";

export default function SettingsPage() {
  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "var(--surface-primary)" }}>
      <TopBar />
      <main className="flex-1 p-8">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-heading)", color: "var(--fg-primary)" }}
        >
          Settings
        </h1>
        <p className="mt-2" style={{ color: "var(--fg-secondary)" }}>
          Manage themes, plugins, and editor preferences.
        </p>
      </main>
    </div>
  );
}
