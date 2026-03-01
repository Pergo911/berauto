import Link from "next/link";

import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { SignOutButton } from "@/components/shared/sign-out-button";
import { Navbar } from "@/components/shared/navbar";

export default async function HomePage() {
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
        <ThemeToggle />
        {session?.user ? (
          <>
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <span className="text-sm text-muted-foreground">
              {session.user.name}
            </span>
            <SignOutButton />
          </>
        ) : (
          <>
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Register</Button>
            </Link>
          </>
        )}
      </Navbar>

      <main className="container mx-auto flex-1 px-4 py-8">
        <section className="mb-12 text-center">
          <h1 className="mb-4 text-2xl font-bold tracking-tight sm:text-4xl">
            Welcome to BerAuto
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Find and rent the perfect car for your needs. Browse our selection
            of vehicles and submit a rental request in minutes.
          </p>
        </section>

        <section>
          <h2 className="mb-6 text-2xl font-semibold">Available Cars</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Placeholder cards */}
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle>Car Placeholder {i}</CardTitle>
                  <CardDescription>
                    This will show real car data once connected to the database.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Daily rate: -- Ft/day
                  </p>
                  <Link href={`/cars/${i}`}>
                    <Button className="mt-4 w-full" variant="outline">
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>BerAuto Car Rental &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
