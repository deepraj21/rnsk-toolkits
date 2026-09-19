import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { DISCORD_ICON } from './icon.js';
import { discordTools } from './tools/index.js';

export default defineToolkit({
  id: 'discord',
  displayName: 'Discord',
  shortDescription: 'User identity, guilds, invites, apps, and entitlements.',
  category: 'Collaboration & Communication',
  icon: DISCORD_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'discordToken',
    provider: {
      slug: 'discord',
      env: { clientId: 'DISCORD_CLIENT_ID', clientSecret: 'DISCORD_CLIENT_SECRET' },
      authorizeUrl: 'https://discord.com/oauth2/authorize',
      tokenUrl: 'https://discord.com/api/oauth2/token',
      scopes: [
        'identify',
        'email',
        'openid',
        'connections',
        'guilds',
        'guilds.members.read',
        'applications.commands.permissions.update',
        'role_connections.write',
        'applications.entitlements',
      ],
      scopeSeparator: ' ',
      exchangeStyle: 'basic',
      connectDescription:
        'Connect Discord to read user identity, guilds, invites, and entitlements, and to manage application command permissions and role connections.',
      callbackPath: '/api/auth/discord/callback',
      stateCookie: 'discord_oauth_state',
    },
  },
  allowedHosts: ['discord.com', 'cdn.discord.com'],
  tools: discordTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: (entry as any).scope ?? inferToolScope(entry.name),
    }),
  ),
  meta: {
    since: '0.0.9',
    homepage: 'https://discord.com',
    docsUrl: 'https://docs.discord.com/developers/',
    apiDocsUrl: 'https://docs.discord.com/developers/api-reference',
  },
});
