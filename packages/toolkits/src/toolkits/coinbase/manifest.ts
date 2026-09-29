import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { COINBASE_ICON } from './icon.js';
import { coinbaseTools } from './tools/index.js';

export default defineToolkit({
  id: 'coinbase',
  displayName: 'Coinbase',
  shortDescription:
    'Market data for Coinbase Exchange, Advanced Trade, and International Exchange, plus loans and wallets.',
  category: 'Finance & Accounting',
  icon: COINBASE_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'coinbaseCredentials',
    provider: {
      fields: ['apiKey', 'apiSecret', 'passphrase'],
      connectDescription:
        'Connect Coinbase with an API key triple: API key, base64 API secret, and passphrase (passphrase required for Exchange endpoints such as loans). Only the loans and wallets tools use credentials — all market-data tools are public and work without connecting. Credential JSON is HMAC-signed per request and never logged.',
    },
  },
  allowedHosts: [
    'api.exchange.coinbase.com',
    'api.international.coinbase.com',
    'api.coinbase.com',
  ],
  tools: coinbaseTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: (entry as { requiredAuth?: string }).requiredAuth,
      scope: (entry as any).scope ?? inferToolScope(entry.name),
      keywords: (entry as { keywords?: string[] }).keywords ?? [],
    }),
  ),
  meta: {
    since: '0.0.13',
    homepage: 'https://www.coinbase.com',
    docsUrl: 'https://docs.cdp.coinbase.com/',
    apiDocsUrl: 'https://docs.cdp.coinbase.com/api-reference/exchange-api/rest-api/overview',
  },
});
