import { defineToolkit, defineTool } from '../../core/define.js';
import { KUBERNETES_ICON } from './icon.js';
import { kubernetesTools } from './tools/index.js';

export default defineToolkit({
  id: 'kubernetes',
  displayName: 'Kubernetes',
  shortDescription: 'Manage pods, deployments, services, config, storage, nodes, jobs and autoscaling via the Kubernetes API.',
  category: 'Developer Tools & DevOps',
  icon: KUBERNETES_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'kubernetesCredentials',
    provider: {
      fields: ['clusterUrl', 'bearerToken'],
      connectDescription:
        'Connect any Kubernetes cluster (EKS, GKE, AKS, self-hosted) with its API server URL and a ServiceAccount bearer token. Create one with kubectl create token <serviceaccount> -n <namespace> (optionally add defaultNamespace to the credentials JSON). The cluster endpoint must present a publicly trusted TLS certificate.',
    },
  },
  tools: kubernetesTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: entry.scope,
    }),
  ),
  meta: {
    since: '0.0.12',
    homepage: 'https://kubernetes.io',
    docsUrl: 'https://kubernetes.io/docs/reference/kubernetes-api/',
  },
});
