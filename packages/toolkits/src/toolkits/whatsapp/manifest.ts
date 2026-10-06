import { defineToolkit, defineTool } from '../../core/define.js';
import { WHATSAPP_ICON } from './icon.js';
import { whatsappTools } from './tools/index.js';

export default defineToolkit({
  id: 'whatsapp',
  displayName: 'WhatsApp',
  shortDescription:
    'Send messages, templates, and media plus manage numbers, templates, flows, and WABA via Meta Graph API.',
  category: 'Collaboration & Communication',
  icon: WHATSAPP_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'whatsappCredentials',
    provider: {
      fields: ['accessToken', 'wabaId', 'apiVersion'],
      connectDescription:
        'Connect WhatsApp with a Meta system user access token (App Dashboard > WhatsApp > API Setup) plus your WhatsApp Business Account ID. All calls send Authorization: Bearer <token> to https://graph.facebook.com (default version v26.0). Add wabaId once to skip passing it per call.',
    },
  },
  allowedHosts: ['graph.facebook.com'],
  tools: whatsappTools.map((entry) =>
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
    since: '0.0.14',
    homepage: 'https://business.whatsapp.com',
    docsUrl: 'https://developers.facebook.com/docs/whatsapp',
    apiDocsUrl: 'https://developers.facebook.com/docs/whatsapp/cloud-api/reference/',
  },
});
