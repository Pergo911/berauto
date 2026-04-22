import {ClipboardList, CarFront, FileText} from 'lucide-react';
import {getTranslations} from 'next-intl/server';

import {getAgentDashboardStats} from '@/lib/data/dashboard';
import {getRentals} from '@/lib/data/rentals';
import {StatCard} from '@/components/shared/stat-card';
import {PageHeader} from '@/components/shared/page-header';
import {RentalTable} from '@/components/rentals/rental-table';

export default async function AgentPage() {
  const t = await getTranslations('Agent.dashboard');

  const [stats, allRentals] = await Promise.all([
    getAgentDashboardStats(),
    getRentals({sort: 'newest'}),
  ]);

  const statCards = [
    {
      key: 'pendingRentals' as const,
      title: t('cards.requests.title'),
      description: t('cards.requests.description'),
      href: '/agent/requests',
      icon: ClipboardList,
      subLabel: t('cards.requests.subLabel'),
    },
    {
      key: 'activeRentals' as const,
      title: t('cards.rentals.title'),
      description: t('cards.rentals.description'),
      href: '/agent/active',
      icon: CarFront,
      subLabel: t('cards.rentals.subLabel'),
    },
    {
      key: 'closedRentalsWithoutInvoice' as const,
      title: t('cards.invoices.title'),
      description: t('cards.invoices.description'),
      href: '/agent/invoices',
      icon: FileText,
      subLabel: t('cards.invoices.subLabel'),
    },
  ];

  return (
    <div className="space-y-10">
      <section>
        <PageHeader title={t('title')} className="mb-6" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((card) => (
            <StatCard
              key={card.key}
              title={card.title}
              description={card.description}
              value={stats[card.key]}
              icon={card.icon}
              href={card.href}
              subLabel={card.subLabel}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">
          {t('rentalHistory')}
          <span className="ml-2 text-base font-normal text-muted-foreground">
            ({allRentals.length})
          </span>
        </h2>
        <RentalTable rentals={allRentals} showUser variant="agent" />
      </section>
    </div>
  );
}
