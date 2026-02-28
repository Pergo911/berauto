import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold">
            BerAuto
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              Admin Panel
            </span>
          </Link>
          <nav className="flex items-center gap-4">
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
            <form>
              <Button variant="outline" size="sm" type="submit">
                Sign Out
              </Button>
            </form>
          </nav>
        </div>
      </header>
      <main className="container mx-auto flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
