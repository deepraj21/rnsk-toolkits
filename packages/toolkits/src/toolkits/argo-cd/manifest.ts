import { defineToolkit, defineTool } from '../../core/define.js';
import { ARGO_CD_ICON } from './icon.js';
import { argoCdTools } from './tools/index.js';

export default defineToolkit({
  id: 'argo-cd',
  displayName: 'Argo CD',
  shortDescription:
    'GitOps with Argo CD: sync and roll back applications, manage clusters, repos, projects, tokens, and certificates.',
  category: 'Developer Tools & DevOps',
  icon: ARGO_CD_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'argoCdCredentials',
    provider: {
      fields: ['baseUrl', 'token', 'username', 'password'],
      connectDescription:
        'Connect Argo CD with your argocd-server URL (e.g. https://argocd.example.com:8080) plus an account or project token (Authorization: Bearer), or a local username+password which is exchanged at POST /api/v1/session for a JWT per call.',
    },
  },
  tools: argoCdTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: entry.scope,
      keywords: (entry as { keywords?: string[] }).keywords ?? [],
    }),
  ),
  meta: {
    since: '0.0.15',
    homepage: 'https://argo-cd.readthedocs.io',
    docsUrl: 'https://argo-cd.readthedocs.io/en/stable/developer-guide/api-docs/',
    apiDocsUrl: 'https://argo-cd.readthedocs.io/en/stable/developer-guide/api-docs/',
  },
});
