import Dashboard from './Dashboard';
import ProductOnboardingChecklist from '@/components/ProductOnboardingChecklist';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function DashboardV2() {
  usePageTitle('Dashboard');

  return (
    <div className="space-y-5">
      <div className="max-w-2xl mx-auto">
        <ProductOnboardingChecklist />
      </div>
      <Dashboard />
    </div>
  );
}
