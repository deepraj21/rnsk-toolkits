import { defineToolkit, defineTool } from '../../core/define.js';
import { PAYPAL_ICON } from './icon.js';
import { paypalTools } from './tools/index.js';

export default defineToolkit({
  id: 'paypal',
  displayName: 'PayPal',
  shortDescription:
    'Checkout orders, captures and refunds, payouts, invoicing, and transaction reporting via PayPal REST.',
  category: 'Finance & Accounting',
  icon: PAYPAL_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'paypalCredentials',
    provider: {
      fields: ['clientId', 'clientSecret', 'environment', 'accessToken'],
      connectDescription:
        'Connect PayPal with JSON {"clientId":"...","clientSecret":"...","environment":"sandbox"} (or "live") from Developer Dashboard > Apps & Credentials. The toolkit obtains an OAuth2 client-credentials token from /v1/oauth2/token. Alternatively pass {"accessToken":"...","environment":"live"} for a pre-issued bearer token.',
    },
  },
  allowedHosts: ['api-m.sandbox.paypal.com', 'api-m.paypal.com'],
  tools: paypalTools.map((entry) =>
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
    since: '0.0.17',
    homepage: 'https://www.paypal.com',
    docsUrl: 'https://developer.paypal.com/api/rest/',
    apiDocsUrl: 'https://developer.paypal.com/api/rest/',
  },
});
