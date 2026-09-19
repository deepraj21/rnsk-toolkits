import { defineToolkit, defineTool } from '../../core/define.js';
import { GROWW_ICON } from './icon.js';
import { growwTools } from './tools/index.js';

export default defineToolkit({
  id: 'groww',
  displayName: 'Groww',
  shortDescription: 'Trade equities and F&O, manage orders and smart orders, and fetch live market data.',
  category: 'Finance & Accounting',
  icon: GROWW_ICON,
  auth: {
    type: 'bearer_token',
    tokenField: 'growwAccessToken',
    provider: {
      connectDescription:
        'Connect Groww with a Trading API access token. Generate one from Groww Profile > Settings > Trading APIs > Generate API keys > Access Token (expires daily at 6:00 AM). Alternatively generate it via your API key + secret checksum or TOTP flow, then paste the access token here. All trading calls send it as Authorization: Bearer <token> with X-API-VERSION: 1.0.',
    },
  },
  allowedHosts: ['api.groww.in', 'growwapi-assets.groww.in'],
  tools: growwTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: (entry as { requiredAuth?: 'growwAccessToken' }).requiredAuth,
      scope: entry.scope,
    }),
  ),
  meta: {
    since: '0.0.7',
    homepage: 'https://groww.in',
    docsUrl: 'https://groww.in/trade-api/docs/curl',
    apiDocsUrl: 'https://groww.in/trade-api/docs/curl',
  },
});
