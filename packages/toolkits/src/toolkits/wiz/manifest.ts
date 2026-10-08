import { defineToolkit, defineTool } from '../../core/define.js';
import { WIZ_ICON } from './icon.js';
import { wizTools } from './tools/index.js';

export default defineToolkit({
  id: 'wiz',
  displayName: 'Wiz',
  shortDescription:
    'Cloud security posture: issues, cloud resources, accounts, and projects via the Wiz GraphQL API.',
  category: 'Developer Tools & DevOps',
  icon: WIZ_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'wizCredentials',
    provider: {
      fields: ['clientId', 'clientSecret', 'apiUrl', 'authUrl', 'audience'],
      connectDescription:
        'Connect Wiz with a service account from Settings > Service Accounts. JSON: clientId, clientSecret, apiUrl (https://api.<region>.app.wiz.io/graphql), authUrl (https://auth.app.wiz.io/oauth/token or https://auth.wiz.io/oauth/token for Auth0), audience (wiz-api or beyond-api). OAuth client credentials fetch a short-lived Bearer token per request.',
    },
  },
  tools: wizTools.map((entry) =>
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
    homepage: 'https://www.wiz.io',
    docsUrl: 'https://docs.wiz.io/wiz-docs/docs/wiz-api',
    apiDocsUrl: 'https://docs.wiz.io/wiz-docs/docs/wiz-api',
  },
});
