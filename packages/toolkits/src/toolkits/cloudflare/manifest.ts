import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { CLOUDFLARE_ICON } from './icon.js';
import { cloudflareTools } from './tools/index.js';

export default defineToolkit({
  id: 'cloudflare',
  displayName: 'Cloudflare',
  shortDescription: 'DNS records, zones, WAF lists, firewall, tunnels, and load balancing.',
  category: 'Developer Tools & DevOps',
  icon: CLOUDFLARE_ICON,
  auth: {
    type: 'api_key',
    tokenField: 'cloudflareApiKey',
    provider: {
      in: 'header',
      name: 'Authorization',
      prefix: 'Bearer',
      connectDescription:
        'Connect Cloudflare with an API token. Create one from My Profile > API Tokens using a template such as Edit zone DNS, with access to the zones and accounts you want to manage.',
    },
  },
  allowedHosts: ['api.cloudflare.com'],
  tools: cloudflareTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: (entry as any).scope ?? inferToolScope(entry.name),
    }),
  ),
  meta: {
    since: '0.0.8',
    homepage: 'https://www.cloudflare.com',
    docsUrl: 'https://developers.cloudflare.com/api/',
    apiDocsUrl: 'https://developers.cloudflare.com/api/',
  },
});
