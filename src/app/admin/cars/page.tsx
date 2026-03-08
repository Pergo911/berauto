import { getCars } from "@/lib/data/cars";
import { carSearchSchema } from "@/lib/validations/cars";
import { AdminCarTable } from "@/components/cars/admin-car-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

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
      <h1 className="mb-6 text-3xl font-bold">Car Management</h1>

      {/* Filters */}
      <form className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="grid gap-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            name="search"
            type="search"
            placeholder="Make, model, or plate..."
            defaultValue={params.search ?? ""}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={params.status ?? ""}
            className="flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <option value="">All statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="UNAVAILABLE">Unavailable</option>
          </select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="sort">Sort</Label>
          <select
            id="sort"
            name="sort"
            defaultValue={params.sort ?? ""}
            className="flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <option value="">Newest first</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="year-asc">Year: Oldest first</option>
            <option value="year-desc">Year: Newest first</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-all hover:bg-primary/90"
          >
            Filter
          </button>
        </div>
      </form>

      <Separator className="mb-6" />

      <AdminCarTable cars={cars} />
    </div>
  );
}
