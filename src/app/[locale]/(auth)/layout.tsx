import { Navbar } from "@/components/shared/navbar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar hideLogin />
      <main className="flex flex-1 items-center justify-center px-4">
        {children}
      </main>
    </div>
  );
}
