import { createApp } from '@backstage/frontend-defaults';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import kubernetesPlugin from '@backstage/plugin-kubernetes/alpha';
import argocdPlugin from '@roadiehq/backstage-plugin-argo-cd/alpha';
import { navModule } from './modules/nav';
import genuviaDecisionsPlugin from '@internal/backstage-plugin-genuvia-decisions';
import { genuviaThemeExtension } from './theme/genuvia';

export default createApp({
  features: [catalogPlugin, kubernetesPlugin, argocdPlugin, genuviaDecisionsPlugin, genuviaThemeExtension, navModule],
});
