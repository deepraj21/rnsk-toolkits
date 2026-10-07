import { defineToolkit, defineTool } from '../../core/define.js';
import { TEAMS_ICON } from './icon.js';
import { teamsTools } from './tools/index.js';

export default defineToolkit({
  id: 'teams',
  displayName: 'Teams',
  shortDescription:
    'Microsoft Teams via Microsoft Graph: teams and channels, channel and chat messages, meetings, attendance, and presence.',
  category: 'Collaboration & Communication',
  icon: TEAMS_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'teamsToken',
    provider: {
      slug: 'teams',
      env: { clientId: 'TEAMS_CLIENT_ID', clientSecret: 'TEAMS_CLIENT_SECRET' },
      authorizeUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      scopes: [
        'openid',
        'profile',
        'offline_access',
        'User.Read',
        'Team.ReadBasic.All',
        'Channel.ReadBasic.All',
        'ChannelMessage.Read.All',
        'ChannelMessage.Send',
        'Chat.ReadWrite',
        'TeamSettings.ReadWrite.All',
        'OnlineMeetings.ReadWrite',
        'Presence.ReadWrite',
      ],
      exchangeStyle: 'form',
      extraAuthParams: { prompt: 'consent' },
      connectDescription:
        'Connect Teams with your Microsoft work account to manage teams, channels, messages, chats, online meetings, and presence.',
      callbackPath: '/api/auth/teams/callback',
      stateCookie: 'teams_oauth_state',
    },
  },
  allowedHosts: ['graph.microsoft.com'],
  tools: teamsTools.map((entry) =>
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
    since: '0.0.15',
    homepage: 'https://www.microsoft.com/microsoft-teams',
    docsUrl: 'https://learn.microsoft.com/en-us/graph/api/resources/teams-api-overview',
    apiDocsUrl: 'https://learn.microsoft.com/en-us/graph/api/resources/teams-api-overview',
  },
});
