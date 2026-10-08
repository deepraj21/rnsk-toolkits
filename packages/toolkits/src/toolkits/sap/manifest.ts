import { defineToolkit, defineTool } from '../../core/define.js';
import { SAP_ICON } from './icon.js';
import { sapTools } from './tools/index.js';

export default defineToolkit({
  id: 'sap',
  displayName: 'SAP',
  shortDescription:
    'SAP S/4HANA OData: business partners, sales orders, products, and generic OData read/write with CSRF.',
  category: 'Finance & Accounting',
  icon: SAP_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'sapCredentials',
    provider: {
      fields: ['baseUrl', 'username', 'password', 'sapClient', 'accessToken'],
      connectDescription:
        'Connect SAP S/4HANA or OData APIs with JSON {"baseUrl":"https://my.s4hana.cloud.sap","username":"COMM_USER","password":"...","sapClient":"100"}. Use a communication user with least privilege on required API catalogs (API_BUSINESS_PARTNER, API_SALES_ORDER_SRV, API_PRODUCT_SRV). Alternatively OAuth from SAP BTP: {"baseUrl":"...","accessToken":"..."}. Write operations fetch CSRF tokens automatically.',
    },
  },
  tools: sapTools.map((entry) =>
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
    homepage: 'https://www.sap.com',
    docsUrl: 'https://api.sap.com/',
    apiDocsUrl: 'https://api.sap.com/',
  },
});
