import { defineToolkit, defineTool } from '../../core/define.js';
import { ZOHO_ICON } from './icon.js';
import { zohoTools } from './tools/index.js';

export default defineToolkit({
  id: 'zoho',
  displayName: 'Zoho CRM',
  shortDescription: 'Leads, contacts, deals, accounts, events and more.',
  category: 'CRM',
  icon: ZOHO_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'zohoToken',
    provider: {
      slug: 'zoho',
      env: { clientId: 'ZOHO_CLIENT_ID', clientSecret: 'ZOHO_CLIENT_SECRET' },
      authorizeUrl: 'https://accounts.zoho.com/oauth/v2/auth',
      tokenUrl: 'https://accounts.zoho.com/oauth/v2/token',
      scopes: [
        'ZohoCRM.modules.ALL',
        'ZohoCRM.users.READ',
        'ZohoCRM.settings.fields.READ',
        'ZohoCRM.settings.related_lists.READ',
        'ZohoCRM.settings.modules.READ',
        'ZohoCRM.settings.tags.CREATE',
        'ZohoCRM.settings.emails.READ',
        'ZohoSearch.securesearch.READ',
      ],
      scopeSeparator: ',',
      exchangeStyle: 'form',
      extraAuthParams: { access_type: 'offline', prompt: 'consent' },
      connectDescription: 'Connect Zoho CRM to manage leads, contacts, deals, accounts and activities. Requires Zoho CRM account with API access.',
      callbackPath: '/api/auth/zoho/callback',
      stateCookie: 'zoho_oauth_state',
    },
  },
  allowedHosts: [
    'www.zohoapis.com',
    'www.zohoapis.eu',
    'www.zohoapis.in',
    'www.zohoapis.com.au',
    'www.zohoapis.jp',
    'zohoapis.com',
    'accounts.zoho.com',
  ],
  tools: zohoTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: entry.scope,
    }),
  ),
  meta: { since: '0.0.1' },
});
