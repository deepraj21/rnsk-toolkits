import { defineToolkit, defineTool } from '../../core/define.js';
import { TWILIO_ICON } from './icon.js';
import { twilioTools } from './tools/index.js';

export default defineToolkit({
  id: 'twilio',
  displayName: 'Twilio',
  shortDescription:
    'SMS, voice calls, phone numbers, and line-type lookups via the Twilio REST API.',
  category: 'Collaboration & Communication',
  icon: TWILIO_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'twilioCredentials',
    provider: {
      fields: ['accountSid', 'authToken'],
      connectDescription:
        'Connect Twilio with JSON {"accountSid":"AC...","authToken":"..."} from Console > Account > API keys & tokens. Use the primary Auth Token or a restricted API key secret paired with the Account SID. Requests use HTTP Basic auth to api.twilio.com and lookups.twilio.com.',
    },
  },
  allowedHosts: ['api.twilio.com', 'lookups.twilio.com'],
  tools: twilioTools.map((entry) =>
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
    homepage: 'https://www.twilio.com',
    docsUrl: 'https://www.twilio.com/docs/usage/api',
    apiDocsUrl: 'https://www.twilio.com/docs/usage/api',
  },
});
