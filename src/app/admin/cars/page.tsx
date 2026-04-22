import { getCars } from "@/lib/data/cars";
import { getBrands } from "@/lib/data/brands";
import { AdminCarTable } from "@/components/cars/admin-car-table";
import { PageHeader } from "@/components/shared/page-header";
import { BackLink } from "@/components/shared/back-link";

export default async function AdminCarsPage() {
  const [cars, brands] = await Promise.all([getCars(), getBrands()]);

  return (
    <div>
      <BackLink href="/admin" label="Back to Dashboard" />
      <PageHeader title="Car Management" className="mb-6" />
      <AdminCarTable cars={cars} brands={brands} />
    </div>
  );
}
