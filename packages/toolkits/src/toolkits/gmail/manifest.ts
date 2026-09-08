import { defineToolkit, defineTool } from '../../core/define.js';
import { GMAIL_ICON } from './icon.js';
import { listMessages } from './tools/list-messages.js';
import { getMessage } from './tools/get-message.js';
import { sendMessage } from './tools/send-message.js';

export default defineToolkit({
  id: 'gmail',
  displayName: 'Gmail',
  shortDescription: 'List, read, and send emails.',
  category: 'Collaboration & Communication',
  icon: GMAIL_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'gmailToken',
    provider: {
      slug: 'gmail',
      env: { clientId: 'GMAIL_CLIENT_ID', clientSecret: 'GMAIL_CLIENT_SECRET' },
      authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
      ],
      exchangeStyle: 'form',
      extraAuthParams: { access_type: 'offline', prompt: 'consent' },
      connectDescription:
        'Connect Gmail to read, draft, and send emails with AI-driven summarization.',
      callbackPath: '/api/auth/gmail/callback',
      stateCookie: 'google_oauth_state',
    },
  },
  allowedHosts: ['gmail.googleapis.com', 'www.googleapis.com'],
  tools: [
    defineTool({
      name: 'gmailListMessages',
      tool: listMessages,
      requiredAuth: 'gmailToken',
      scope: 'read',
    }),
    defineTool({
      name: 'gmailGetMessage',
      tool: getMessage,
      requiredAuth: 'gmailToken',
      scope: 'read',
    }),
    defineTool({
      name: 'gmailSendMessage',
      tool: sendMessage,
      requiredAuth: 'gmailToken',
      scope: 'write',
    }),
  ],
  meta: { since: '0.0.1' },
});
