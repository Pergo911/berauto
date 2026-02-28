import Link from "next/link";

import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { SignOutButton } from "@/components/shared/sign-out-button";
import { Navbar } from "@/components/shared/navbar";

export default async function AdminLayout({
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
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              Admin Panel
            </span>
          </Link>
        }
      >
        <Link href="/admin">
          <Button variant="ghost" size="sm">
            Overview
          </Button>
        </Link>
        <Link href="/admin/cars">
          <Button variant="ghost" size="sm">
            Cars
          </Button>
        </Link>
        <Link href="/admin/users">
          <Button variant="ghost" size="sm">
            Users
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
