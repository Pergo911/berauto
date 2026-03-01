import Link from "next/link";

import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { SignOutButton } from "@/components/shared/sign-out-button";
import { Navbar } from "@/components/shared/navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar
        brand={
          <Link href="/" className="text-xl font-bold">
            BerAuto
          </Link>
        }
      >
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            Dashboard
          </Button>
        </Link>
        <Link href="/dashboard/rentals">
          <Button variant="ghost" size="sm">
            My Rentals
          </Button>
        </Link>
        <ThemeToggle />
        {session?.user && (
          <span className="text-sm text-muted-foreground">
            {session.user.name}
          </span>
        )}
        <SignOutButton />
      </Navbar>
      <main className="container mx-auto flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
