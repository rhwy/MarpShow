import { TopBar } from "@/ui/components/TopBar";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "var(--surface-primary)" }}>
      <TopBar />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1
            className="text-4xl font-bold"
            style={{ fontFamily: "var(--font-heading)", color: "var(--fg-primary)" }}
          >
            404
          </h1>
          <p className="mt-2" style={{ color: "var(--fg-secondary)" }}>
            Page not found.
          </p>
        </div>
      </main>
    </div>
  );
}
