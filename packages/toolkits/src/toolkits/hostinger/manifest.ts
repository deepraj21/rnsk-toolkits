import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { HOSTINGER_ICON } from './icon.js';
import { hostingerTools } from './tools/index.js';

export default defineToolkit({
  id: 'hostinger',
  displayName: 'Hostinger',
  shortDescription: 'Domains, DNS, WHOIS, VPS, hosting, websites, and billing.',
  category: 'Developer Tools & DevOps',
  icon: HOSTINGER_ICON,
  auth: {
    type: 'api_key',
    tokenField: 'hostingerApiKey',
    provider: {
      in: 'header',
      name: 'Authorization',
      prefix: 'Bearer',
      connectDescription:
        'Connect Hostinger with an API token. Generate one from your Hostinger dashboard under the API section. All requests send it as Authorization: Bearer <token>.',
    },
  },
  allowedHosts: ['developers.hostinger.com'],
  tools: hostingerTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: (entry as any).scope ?? inferToolScope(entry.name),
    }),
  ),
  meta: {
    since: '0.0.9',
    homepage: 'https://www.hostinger.com',
    docsUrl: 'https://developers.hostinger.com/',
    apiDocsUrl: 'https://docs.hostinger.com/api-reference/overview',
  },
});
