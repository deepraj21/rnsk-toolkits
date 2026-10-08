import { defineToolkit, defineTool } from '../../core/define.js';
import { DOCUSIGN_ICON } from './icon.js';
import { docusignTools } from './tools/index.js';

export default defineToolkit({
  id: 'docusign',
  displayName: 'DocuSign',
  shortDescription:
    'eSignature envelopes, templates, recipients, documents, and account users via REST API v2.1.',
  category: 'Document & File Management',
  icon: DOCUSIGN_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'docusignCredentials',
    provider: {
      fields: ['accountId', 'baseUrl', 'accessToken'],
      connectDescription:
        'Connect DocuSign with JSON {"accountId":"...","baseUrl":"https://demo.docusign.net/restapi","accessToken":"..."}. Obtain accessToken via OAuth (JWT grant for service integration or Authorization Code for user context). Call GET https://account-d.docusign.com/oauth/userinfo to discover account base_uri and account_id. Tokens expire — refresh before connect or use long-lived JWT exchange in your host.',
    },
  },
  tools: docusignTools.map((entry) =>
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
    homepage: 'https://www.docusign.com',
    docsUrl: 'https://developers.docusign.com/docs/esign-rest-api/reference/',
    apiDocsUrl: 'https://developers.docusign.com/docs/esign-rest-api/reference/',
  },
});
