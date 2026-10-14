import { defineToolkit, defineTool } from '../../core/define.js';
import { RESEND_ICON } from './icon.js';
import { resendTools } from './tools/index.js';

export default defineToolkit({
  id: 'resend',
  displayName: 'Resend',
  shortDescription:
    'Transactional email, domains, API keys, audiences, and contacts via the Resend REST API.',
  category: 'Collaboration & Communication',
  icon: RESEND_ICON,
  auth: {
    type: 'bearer_token',
    tokenField: 'resendApiKey',
    provider: {
      connectDescription:
        'Connect Resend with an API key (re_...) from Dashboard > API Keys. Use sending_access keys when possible. All requests use Authorization: Bearer <key> against https://api.resend.com.',
    },
  },
  allowedHosts: ['api.resend.com'],
  tools: resendTools.map((entry) =>
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
    homepage: 'https://resend.com',
    docsUrl: 'https://resend.com/docs/api-reference/introduction',
    apiDocsUrl: 'https://resend.com/docs/api-reference/introduction',
  },
});
