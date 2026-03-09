**Phase 1 — Database Schema Change**

- Replace the current duplicated car availability model in `src/db/schema.ts`:
  - remove `cars.isAvailable`
  - change `carStatusEnum` from `AVAILABLE | RENTED | MAINTENANCE` to `AVAILABLE | MAINTENANCE | UNAVAILABLE`
  - treat `UNAVAILABLE` as the admin-only manual hold state
  - stop persisting rental occupancy on the car row; occupancy becomes derived from rentals only
- Extend lifecycle/audit fields in `src/db/schema.ts`:
  - add `cars.updatedAt`
  - add nullable `rentalEvents.mileageKm` for structured `HANDOVER` and `RETURN` odometer capture
  - add a unique constraint/index on `invoices.rentalId` so one rental can only have one invoice
- Add DB indexes for the planned read paths:
  - cars by `status`
  - rentals by `carId + status + date window`
  - rentals by `userId + createdAt`
  - rentals by `agentId + createdAt`
  - rentals by `status + createdAt`
  - rental events by `rentalId + timestamp`
  - invoices by `issuedAt` and unique `rentalId`
- Update `src/db/seed.ts` to match the new model:
  - remove `isAvailable` usage
  - convert previously `RENTED` cars to `AVAILABLE`
  - keep active occupation represented only through `rentals`
  - add `mileageKm` values to seeded `HANDOVER` and `RETURN` events
  - keep at least one `UNAVAILABLE` car and one `MAINTENANCE` car for admin/public testing
- Generate and apply migrations with the normal Drizzle flow, then verify with:
  - `pnpm db:generate`
  - `pnpm db:migrate`
  - `pnpm db:seed`
  - `pnpm typecheck`

**Phase 2 — UI, Data Fetching, and Mutations**

- Add a server-side query layer under `src/lib/data/`:
  - `cars.ts`, `rentals.ts`, `invoices.ts`, `users.ts`, `dashboard.ts`
  - queries return page-ready DTOs, including numeric conversion for `dailyRate` and `amount`
  - all list pages use validated URL search params for filtering/search/sorting
- Add/extend validation modules:
  - fix `src/lib/validations/cars.ts` to use `z.coerce.number()` for form-safe numeric inputs
  - extend rental validation for date ordering and checkout-style overlap rules (`[startDate, endDate)`)
  - add search/filter schemas for cars, rentals, invoices, and admin users
  - admin normal-user search uses a single `q` field with minimum 2 characters
- Implement Server Actions in `src/actions/`:
  - `cars.ts`: `createCar`, `updateCar`, `deleteCar`
  - `rentals.ts`: `createRentalRequest`, `getApprovalConflicts`, `approveRental`, `rejectRental`, `handoverRental`, `returnRental`
  - `invoices.ts`: `issueInvoice`
  - all actions validate input, call `auth()`, enforce roles, use DB transactions where needed, write `rental_events`, and `revalidatePath` for affected routes
- Encode the approved lifecycle rules:
  - multiple overlapping `PENDING` requests are allowed
  - only `APPROVED` and `ACTIVE` rentals block booking
  - overlap uses checkout-style boundaries: conflict when `existing.startDate < requested.endDate` and `existing.endDate > requested.startDate`
  - approving a request recomputes conflicting `PENDING` requests, shows them in a confirmation dialog, then approves one and auto-rejects the rest in one transaction
  - handover/return require structured mileage; return updates the car’s current mileage
- Build the UI in route order:
  - `src/app/page.tsx`: real public car list with filters and derived availability
  - `src/app/(public)/cars/[id]/page.tsx`: car detail plus rental request form
  - `src/app/dashboard/rentals/page.tsx`: user rental history with filters
  - `src/app/agent/requests/page.tsx`: pending queue with approve/reject and conflict popup
  - `src/app/agent/active/page.tsx`: approved/active rentals with handover/return mileage forms
  - `src/app/agent/invoices/page.tsx`: closed rentals awaiting invoice plus issued invoices
  - `src/app/admin/cars/page.tsx`: car CRUD and status management (`AVAILABLE`, `MAINTENANCE`, `UNAVAILABLE`)
  - `src/app/admin/users/page.tsx`: always-visible admins/agents list plus combined search for normal users by ID, email, or name
- Add domain UI components as needed under:
  - `src/components/cars/`
  - `src/components/rentals/`
  - `src/components/invoices/`
  - `src/components/users/`
- Finish with documentation updates after the structure settles:
  - update `README.md`
  - update `tech_stack.md`
  - update `AGENTS.md`
  - do not edit `original_specification.md`

**Implementation notes**

- Public/admin availability should be computed, not stored:
  - car is bookable only if `cars.status === "AVAILABLE"` and no overlapping `APPROVED`/`ACTIVE` rental exists
  - `UNAVAILABLE` and `MAINTENANCE` always block booking
- Admin user management behavior:
  - admins and agents are listed directly
  - normal users are not bulk-listed
  - one combined search field matches `id`, `email`, or `name`
  - require at least 2 characters before searching
- Revalidation should be centralized by domain so mutations consistently refresh `/`, `/cars/[id]`, `/dashboard*`, `/agent*`, and `/admin*` as needed

**Done criteria**

- Phase 1 is done when migration, seed, and type-safe schema usage all pass.
- Phase 2 is done when all core pages render live data, all core mutations work end-to-end, and `pnpm lint`, `pnpm typecheck`, and `pnpm build` all pass.
