import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Navbar } from "@/components/shared/navbar";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function CarDetailPage(props: {
  params: Promise<{ id: string }>;
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
        <Link href="/login">
          <Button variant="ghost">Login</Button>
        </Link>
        <Link href="/register">
          <Button>Register</Button>
        </Link>
      </Navbar>

      <main className="container mx-auto flex-1 px-4 py-8">
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-muted-foreground hover:underline"
        >
          &larr; Back to all cars
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Car Details</CardTitle>
              <CardDescription>
                Detailed car information will be loaded from the database.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Make, model, year, mileage, and daily rate will appear here.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rental Request</CardTitle>
              <CardDescription>
                Submit a rental request for this vehicle.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Rental request form will be implemented here.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
