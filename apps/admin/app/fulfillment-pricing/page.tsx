'use client';
import { PackageCheck } from 'lucide-react';
import { PricingEntityManager } from '@/components/PricingEntityManager';

export default function FulfillmentPricingPage() {
  return (
    <PricingEntityManager
      config={{
        endpoint: '/api/admin/fulfillment-pricing',
        title: 'Fulfillment Pricing',
        subtitle: 'Performance-based fulfillment tiers shown in the Fulfillment pricing on your website.',
        icon: <PackageCheck className="text-blue-400 w-9 h-9" />,
        createLabel: 'New Tier',
        fields: [
          { key: 'name', label: 'Tier Name', type: 'text', placeholder: 'Full Service' },
          { key: 'rate_percent', label: 'Revenue Share (%)', type: 'number', placeholder: '15', half: true },
          { key: 'sort_order', label: 'Sort Order', type: 'number', placeholder: '2', half: true },
          { key: 'description', label: 'Description', type: 'textarea', placeholder: 'What this tier includes...' },
          { key: 'features', label: 'Features', type: 'features' },
          { key: 'is_popular', label: 'Mark as Popular', type: 'toggle' },
        ],
        cardMeta: (it) => (
          <>
            {it.rate_percent}% <span className="text-xs text-slate-500 font-medium">of delivered revenue</span>
          </>
        ),
      }}
    />
  );
}
