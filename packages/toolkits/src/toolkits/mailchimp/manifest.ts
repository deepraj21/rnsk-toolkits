import { defineToolkit, defineTool } from '../../core/define.js';
import { MAILCHIMP_ICON } from './icon.js';
import { mailchimpTools } from './tools/index.js';

export default defineToolkit({
  id: 'mailchimp',
  displayName: 'Mailchimp',
  shortDescription:
    'Manage Mailchimp audiences and contacts, create and send email campaigns, and read campaign performance reports.',
  category: 'Marketing & Social Media',
  icon: MAILCHIMP_ICON,
  auth: {
    type: 'bearer_token',
    tokenField: 'mailchimpApiKey',
    provider: {
      connectDescription:
        'Connect Mailchimp with an API key. In Mailchimp: Profile > Extras > API keys > Create A Key, then copy the full key (it ends in your data-center suffix, e.g. "abc123...-us21") and paste it here. The toolkit derives your account API host from that suffix and sends the key as a Bearer token. A Manager-level user key can create and send; a Viewer key is read-only.',
    },
  },
  allowedHosts: ['api.mailchimp.com'],
  tools: mailchimpTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: entry.scope,
      keywords: (entry as { keywords?: string[] }).keywords ?? [],
    }),
  ),
  meta: {
    since: '0.0.19',
    homepage: 'https://mailchimp.com',
    docsUrl: 'https://mailchimp.com/developer/marketing/api/',
  },
});
