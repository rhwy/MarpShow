import { TopBar } from "@/ui/components/TopBar";

interface EditorPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "var(--surface-primary)" }}>
      <TopBar />
      <main className="flex-1 p-8">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-heading)", color: "var(--fg-primary)" }}
        >
          Editor
        </h1>
        <p className="mt-2" style={{ color: "var(--fg-secondary)" }}>
          Editing presentation: {id}
        </p>
      </main>
    </div>
  );
}
