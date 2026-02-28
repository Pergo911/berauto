import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Navbar } from "@/components/shared/navbar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar
        brand={
          <Link href="/" className="text-xl font-bold">
            BerAuto
          </Link>
        }
      >
        <ThemeToggle />
        <Link href="/">
          <Button variant="ghost" size="sm">
            Back to Home
          </Button>
        </Link>
      </Navbar>
      <main className="flex flex-1 items-center justify-center px-4">
        {children}
      </main>
    </div>
  );
}
