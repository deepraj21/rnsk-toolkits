import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { TELEGRAM_ICON } from './icon.js';
import { telegramTools } from './tools/index.js';

export default defineToolkit({
  id: 'telegram',
  displayName: 'Telegram',
  shortDescription: 'Send messages and media, manage chats, and read updates via the Bot API.',
  category: 'Collaboration & Communication',
  icon: TELEGRAM_ICON,
  auth: {
    type: 'api_key',
    tokenField: 'telegramBotToken',
    provider: {
      in: 'header',
      name: 'Authorization',
      connectDescription:
        'Connect Telegram with a bot token from @BotFather (format 123456:ABC-DEF...). The token is embedded in the Bot API request URL path (https://api.telegram.org/bot<token>/<method>), not sent as a header.',
    },
  },
  allowedHosts: ['api.telegram.org'],
  tools: telegramTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: (entry as any).scope ?? inferToolScope(entry.name),
    }),
  ),
  meta: {
    since: '0.0.10',
    homepage: 'https://telegram.org',
    docsUrl: 'https://core.telegram.org/bots/api',
  },
});
