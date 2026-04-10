import { TopBar } from "@/ui/components/TopBar";

interface DetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function DetailsPage({ params }: DetailsPageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "var(--surface-primary)" }}>
      <TopBar />
      <main className="flex-1 p-8">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-heading)", color: "var(--fg-primary)" }}
        >
          Details
        </h1>
        <p className="mt-2" style={{ color: "var(--fg-secondary)" }}>
          Details for presentation: {id}
        </p>
      </main>
    </div>
  );
}
