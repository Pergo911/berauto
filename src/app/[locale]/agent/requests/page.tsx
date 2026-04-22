import {getTranslations} from 'next-intl/server';

import {getRentals} from '@/lib/data/rentals';
import {EmptyState} from '@/components/shared/empty-state';
import {PageHeader} from '@/components/shared/page-header';
import {BackLink} from '@/components/shared/back-link';
import {RentalAgentCard} from '@/components/rentals/rental-agent-card';
import {ApproveRejectActions} from '@/components/rentals/approve-reject-actions';
import {RentalTable} from '@/components/rentals/rental-table';

export default async function AgentRequestsPage() {
  const t = await getTranslations('Agent.requests');
  const [pendingRentals, pastRentals] = await Promise.all([
    getRentals({status: 'PENDING', sort: 'newest'}),
    getRentals({status: 'REJECTED', sort: 'newest'}),
  ]);

  return (
    <div className="space-y-10">
      <section>
        <BackLink href="/agent" label={t('backToDashboard')} />
        <PageHeader title={t('title')} className="mb-6" />

        {pendingRentals.length === 0 ? (
          <EmptyState variant="plain" message={t('emptyPending')} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pendingRentals.map((rental) => (
              <RentalAgentCard
                key={rental.id}
                rental={rental}
                action={<ApproveRejectActions rentalId={rental.id} />}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">
          {t('pastRequests')}
          <span className="ml-2 text-base font-normal text-muted-foreground">
            ({pastRentals.length})
          </span>
        </h2>
        <RentalTable
          rentals={pastRentals}
          showUser
          hideStatusFilter
          variant="agent"
        />
      </section>
    </div>
  );
}
