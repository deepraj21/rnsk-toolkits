import { defineToolkit, defineTool } from '../../core/define.js';
import { OKTA_ICON } from './icon.js';
import { oktaTools } from './tools/index.js';

export default defineToolkit({
  id: 'okta',
  displayName: 'Okta',
  shortDescription:
    'Okta Workforce Identity: users, groups, app assignments, lifecycle actions, MFA factors, org settings, and system log.',
  category: 'Developer Tools & DevOps',
  icon: OKTA_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'oktaCredentials',
    provider: {
      fields: ['oktaDomain', 'apiToken'],
      connectDescription:
        'Connect Okta with your org domain (e.g. dev-123456.okta.com) and a Management API token from Security > API > Tokens. Use a custom admin role with least privilege (users, groups, apps, logs as needed). Credentials are JSON: {"oktaDomain":"your-org.okta.com","apiToken":"00..."}. Requests use Authorization: SSWS <token> against https://{oktaDomain}/api/v1.',
    },
  },
  tools: oktaTools.map((entry) =>
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
    homepage: 'https://www.okta.com',
    docsUrl: 'https://developer.okta.com/docs/reference/core-okta-api/',
    apiDocsUrl: 'https://developer.okta.com/docs/reference/core-okta-api/',
  },
});
