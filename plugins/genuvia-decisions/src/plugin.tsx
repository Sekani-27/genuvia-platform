import React from 'react';
import { createFrontendPlugin } from '@backstage/frontend-plugin-api';
import { EntityCardBlueprint } from '@backstage/plugin-catalog-react/alpha';

const decisionsCard = EntityCardBlueprint.make({
  name: 'genuvia-decisions',
  params: {
    filter: 'kind:component',
    loader: async () => {
      const { DecisionsCard } = await import('./components/DecisionsCard');
      return <DecisionsCard />;
    },
  },
});

export const genuviaDecisionsPlugin = createFrontendPlugin({
  id: 'genuvia-decisions',
  extensions: [decisionsCard],
});
