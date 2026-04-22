import {getTranslations} from 'next-intl/server';

import {getCars} from '@/lib/data/cars';
import {getBrands} from '@/lib/data/brands';
import {AdminCarTable} from '@/components/cars/admin-car-table';
import {PageHeader} from '@/components/shared/page-header';
import {BackLink} from '@/components/shared/back-link';

export default async function AdminCarsPage() {
  const t = await getTranslations('Admin.carsPage');
  const [cars, brands] = await Promise.all([getCars(), getBrands()]);

  return (
    <div>
      <BackLink href="/admin" label={t('backToDashboard')} />
      <PageHeader title={t('title')} className="mb-6" />
      <AdminCarTable cars={cars} brands={brands} />
    </div>
  );
}
