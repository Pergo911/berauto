import Link from "next/link";

import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { SignOutButton } from "@/components/shared/sign-out-button";

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold">
            BerAuto
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              Agent Panel
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/agent">
              <Button variant="ghost" size="sm">
                Overview
              </Button>
            </Link>
            <Link href="/agent/requests">
              <Button variant="ghost" size="sm">
                Requests
              </Button>
            </Link>
            <Link href="/agent/active">
              <Button variant="ghost" size="sm">
                Active Rentals
              </Button>
            </Link>
            <Link href="/agent/invoices">
              <Button variant="ghost" size="sm">
                Invoices
              </Button>
            </Link>
            <ThemeToggle />
            {session?.user && (
              <span className="text-sm text-muted-foreground">
                {session.user.name}
              </span>
            )}
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main className="container mx-auto flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
