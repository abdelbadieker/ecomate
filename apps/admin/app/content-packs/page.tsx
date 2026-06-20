'use client';
import { Video } from 'lucide-react';
import { PricingEntityManager } from '@/components/PricingEntityManager';

export default function ContentPacksPage() {
  return (
    <PricingEntityManager
      config={{
        endpoint: '/api/admin/content-packs',
        title: 'Content Packs',
        subtitle: 'Marketing video bundles shown in the Content Packs pricing on your website.',
        icon: <Video className="text-blue-400 w-9 h-9" />,
        createLabel: 'New Pack',
        fields: [
          { key: 'name', label: 'Pack Name', type: 'text', placeholder: 'Growth Pack' },
          { key: 'video_count', label: 'Videos / month', type: 'number', placeholder: '8', half: true },
          { key: 'sort_order', label: 'Sort Order', type: 'number', placeholder: '2', half: true },
          { key: 'content_price', label: 'Content-only (DZD)', type: 'number', placeholder: '32000', half: true },
          { key: 'ads_price', label: 'With Ads (DZD)', type: 'number', placeholder: '44000', half: true },
          { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Short summary of this pack...' },
          { key: 'features', label: 'Features', type: 'features' },
          { key: 'is_popular', label: 'Mark as Popular', type: 'toggle' },
        ],
        cardMeta: (it) => {
          const c = Number(it.content_price || 0).toLocaleString();
          const a = it.ads_price ? Number(it.ads_price).toLocaleString() : null;
          return (
            <>
              {c} DZD{a ? <span className="text-slate-500 font-medium"> · +ads {a}</span> : null}{' '}
              <span className="text-xs text-slate-500 font-medium">/ {it.period || 'month'}</span>
            </>
          );
        },
      }}
    />
  );
}
