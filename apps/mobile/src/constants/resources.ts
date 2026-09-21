export interface ResourceItem {
  id: string;
  name: string;
  type: 'phone' | 'respite' | 'agency' | 'support_group';
  description: string;
  contact?: string;
  url?: string;
  cost: string;
  icon: string;
}

export const AUSTIN_RESOURCES: ResourceItem[] = [
  {
    id: '1',
    name: 'Caregiver Action Network Helpline',
    type: 'phone',
    description: 'Free helpline for family caregivers. Call anytime.',
    contact: '1-855-227-3640',
    cost: 'Free',
    icon: '📞',
  },
  {
    id: '2',
    name: 'Austin ARCH National Respite Network',
    type: 'respite',
    description: 'Helps you find local respite care providers near Austin.',
    url: 'https://archrespite.org',
    cost: 'Varies',
    icon: '🏠',
  },
  {
    id: '3',
    name: 'Area Agency on Aging — Capital Area',
    type: 'agency',
    description: 'Free services for Austin-area caregivers including respite grants.',
    contact: '512-916-6062',
    cost: 'Free',
    icon: '🧭',
  },
  {
    id: '4',
    name: 'Texas Respite Resource Network',
    type: 'respite',
    description: 'Texas state network connecting caregivers to short-term relief options.',
    url: 'https://txrespite.org',
    cost: 'Free – sliding scale',
    icon: '🌿',
  },
  {
    id: '5',
    name: 'NAMI Austin Caregiver Support Group',
    type: 'support_group',
    description: 'Free peer support meetings for family caregivers. In-person and online.',
    url: 'https://namiaustin.org',
    cost: 'Free',
    icon: '🤝',
  },
];
