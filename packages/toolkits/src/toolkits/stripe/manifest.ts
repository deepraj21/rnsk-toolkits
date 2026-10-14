import { defineToolkit, defineTool } from '../../core/define.js';
import { STRIPE_ICON } from './icon.js';
import { stripeTools } from './tools/index.js';

export default defineToolkit({
  id: 'stripe',
  displayName: 'Stripe',
  shortDescription:
    'Customers, PaymentIntents, Checkout, charges, refunds, invoices, and subscriptions via the Stripe REST API.',
  category: 'Finance & Accounting',
  icon: STRIPE_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'stripeCredentials',
    provider: {
      fields: ['secretKey', 'connectAccountId'],
      connectDescription:
        'Connect Stripe with JSON {"secretKey":"sk_test_..."} or {"secretKey":"sk_live_...","connectAccountId":"acct_..."} for Connect. Create restricted keys in Developers > API keys. Never use publishable keys (pk_*) for server calls.',
    },
  },
  allowedHosts: ['api.stripe.com'],
  tools: stripeTools.map((entry) =>
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
    homepage: 'https://stripe.com',
    docsUrl: 'https://stripe.com/docs/api',
    apiDocsUrl: 'https://stripe.com/docs/api',
  },
});
