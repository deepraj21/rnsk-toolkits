import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { DIGITAL_OCEAN_ICON } from './icon.js';
import { digitalOceanTools } from './tools/index.js';

export default defineToolkit({
  id: 'digital-ocean',
  displayName: 'DigitalOcean',
  shortDescription:
    'Droplets, domains and DNS, firewalls, images, databases, Kubernetes, load balancers, volumes, SSH keys, tags, VPCs, and App Platform.',
  category: 'Developer Tools & DevOps',
  icon: DIGITAL_OCEAN_ICON,
  auth: {
    type: 'api_key',
    tokenField: 'digitalOceanApiKey',
    provider: {
      in: 'header',
      name: 'Authorization',
      prefix: 'Bearer',
      connectDescription:
        'Connect DigitalOcean with a Personal Access Token. Generate one from API > Tokens in the control panel (classic token with read/write scopes as needed). Every API request sends it as the Authorization: Bearer header.',
    },
  },
  allowedHosts: ['api.digitalocean.com'],
  tools: digitalOceanTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: (entry as any).scope ?? inferToolScope(entry.name),
      keywords: (entry as { keywords?: string[] }).keywords ?? [],
    }),
  ),
  meta: {
    since: '0.0.13',
    homepage: 'https://www.digitalocean.com',
    docsUrl: 'https://docs.digitalocean.com/products/',
    apiDocsUrl: 'https://docs.digitalocean.com/reference/api/api-reference/',
  },
});
