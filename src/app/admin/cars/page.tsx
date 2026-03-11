import { getCars } from "@/lib/data/cars";
import { AdminCarTable } from "@/components/cars/admin-car-table";
import { PageHeader } from "@/components/shared/page-header";

export default async function AdminCarsPage() {
  const cars = await getCars();

  return (
    <div>
      <PageHeader title="Car Management" className="mb-6" />
      <AdminCarTable cars={cars} />
    </div>
  );
}
