import { defineToolkit, defineTool } from '../../core/define.js';
import { PULUMI_ICON } from './icon.js';
import { pulumiTools } from './tools/index.js';

export default defineToolkit({
  id: 'pulumi',
  displayName: 'Pulumi',
  shortDescription:
    'Pulumi Cloud stacks, updates, deployments, drift, webhooks, org membership, and access tokens via the Pulumi REST API.',
  category: 'Developer Tools & DevOps',
  icon: PULUMI_ICON,
  auth: {
    type: 'bearer_token',
    tokenField: 'pulumiAccessToken',
    provider: {
      connectDescription:
        'Connect Pulumi with a Pulumi Cloud access token (PULUMI_ACCESS_TOKEN). Create one from Pulumi Cloud > Settings > Access Tokens. Prefer organization-scoped tokens with least privilege for automation; personal tokens inherit your user permissions. All API calls send Authorization: Bearer <token>.',
    },
  },
  allowedHosts: ['api.pulumi.com'],
  tools: pulumiTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: entry.scope,
      keywords: entry.keywords ?? [],
    }),
  ),
  meta: {
    since: '0.0.16',
    homepage: 'https://www.pulumi.com',
    docsUrl: 'https://www.pulumi.com/docs/pulumi-cloud/cloud-api/',
    apiDocsUrl: 'https://www.pulumi.com/docs/pulumi-cloud/cloud-api/',
  },
});
