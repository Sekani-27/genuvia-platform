import { createApp } from '@backstage/frontend-defaults';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import kubernetesPlugin from '@backstage/plugin-kubernetes/alpha';
import { navModule } from './modules/nav';
import genuviaDecisionsPlugin from '@internal/backstage-plugin-genuvia-decisions';

export default createApp({
  features: [catalogPlugin, kubernetesPlugin, genuviaDecisionsPlugin, navModule],
});
