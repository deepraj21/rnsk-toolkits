import { defineToolkit, defineTool } from '../../core/define.js';
import { SHOPIFY_ICON } from './icon.js';
import { shopifyTools } from './tools/index.js';

export default defineToolkit({
  id: 'shopify',
  displayName: 'Shopify',
  shortDescription:
    'Admin REST API for products, orders, customers, inventory, and shop settings on a Shopify store.',
  category: 'E-commerce',
  icon: SHOPIFY_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'shopifyCredentials',
    provider: {
      fields: ['shop', 'accessToken', 'apiVersion'],
      connectDescription:
        'Connect Shopify with JSON {"shop":"your-store","accessToken":"shpat_...","apiVersion":"2024-10"}. shop is the store subdomain or myshopify.com hostname. Create a custom app in Admin > Settings > Apps and sales channels > Develop apps, install it, and copy the Admin API access token. Grant scopes such as read_products, write_products, read_orders, write_orders, read_customers, write_customers, read_inventory, write_inventory.',
    },
  },
  tools: shopifyTools.map((entry) =>
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
    homepage: 'https://www.shopify.com',
    docsUrl: 'https://shopify.dev/docs/api/admin-rest',
    apiDocsUrl: 'https://shopify.dev/docs/api/admin-rest',
  },
});
