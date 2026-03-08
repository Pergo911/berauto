import Link from "next/link";
import { redirect } from "next/navigation";
import { Car, Clock, Loader } from "lucide-react";

import { auth } from "@/lib/auth";
import { getUserDashboardStats } from "@/lib/data/dashboard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const stats = await getUserDashboardStats(session.user.id);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/dashboard/rentals">
          <Button variant="outline" size="sm">
            View all rentals
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="size-5 text-muted-foreground" />
              Total Rentals
            </CardTitle>
            <CardDescription>Your complete rental history.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalRentals}</p>
            <p className="text-sm text-muted-foreground">Total rentals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-5 text-muted-foreground" />
              Active Rentals
            </CardTitle>
            <CardDescription>Currently active rentals.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.activeRentals}</p>
            <p className="text-sm text-muted-foreground">Active now</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader className="size-5 text-muted-foreground" />
              Pending Requests
            </CardTitle>
            <CardDescription>Rentals awaiting approval.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.pendingRentals}</p>
            <p className="text-sm text-muted-foreground">Pending approval</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
