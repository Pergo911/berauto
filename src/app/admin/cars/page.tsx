import { Suspense } from "react";

import { getCars } from "@/lib/data/cars";
import { carSearchSchema } from "@/lib/validations/cars";
import { AdminCarTable } from "@/components/cars/admin-car-table";
import { AdminCarFilters } from "@/components/cars/admin-car-filters";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";

type SearchParams = Promise<{
  search?: string;
  status?: string;
  sort?: string;
}>;

export default async function AdminCarsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const parsed = carSearchSchema.safeParse(params);

  const filters = parsed.success ? parsed.data : {};
  const cars = await getCars(filters);

  return (
    <div>
      <PageHeader title="Car Management" className="mb-6" />

      {/* Filters */}
      <div className="mb-6">
        <Suspense fallback={null}>
          <AdminCarFilters defaults={params} />
        </Suspense>
      </div>

      <Separator className="mb-6" />

      <AdminCarTable cars={cars} />
    </div>
  );
}
