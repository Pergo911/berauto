import { Navbar } from "@/components/shared/navbar";

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar panel="agent" />
      <main className="container mx-auto flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
