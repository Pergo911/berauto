import { CarFront, Home } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/shared/navbar";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container mx-auto flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mb-6 flex items-center justify-center rounded-full bg-muted p-6">
          <CarFront className="h-14 w-14 text-muted-foreground" />
        </div>

        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Error 404
        </p>
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Not found
        </h1>
        <p className="mb-8 max-w-md text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on the road.
        </p>

        <Button asChild size="lg">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </main>
    </div>
  );
}
