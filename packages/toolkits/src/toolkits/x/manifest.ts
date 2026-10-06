import { defineToolkit, defineTool } from '../../core/define.js';
import { X_ICON } from './icon.js';
import { xTools } from './tools/index.js';

export default defineToolkit({
  id: 'x',
  displayName: 'X (Twitter)',
  shortDescription:
    'Posts, users, likes, reposts, bookmarks, lists, spaces, DMs, media uploads, and analytics via the X API v2.',
  category: 'Social Media',
  icon: X_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'xToken',
    provider: {
      slug: 'x',
      env: { clientId: 'X_CLIENT_ID', clientSecret: 'X_CLIENT_SECRET' },
      authorizeUrl: 'https://x.com/i/oauth2/authorize',
      tokenUrl: 'https://api.x.com/2/oauth2/token',
      scopes: [
        'tweet.read',
        'tweet.write',
        'tweet.moderate.write',
        'users.read',
        'follows.read',
        'follows.write',
        'like.read',
        'like.write',
        'bookmark.read',
        'bookmark.write',
        'list.read',
        'list.write',
        'mute.read',
        'mute.write',
        'block.read',
        'space.read',
        'offline.access',
        'dm.read',
        'dm.write',
        'media.write',
      ],
      exchangeStyle: 'basic',
      connectDescription:
        'Connect X to post, search, manage likes, reposts, bookmarks, lists, spaces, DMs, and media. All calls send the OAuth 2.0 access token as Authorization: Bearer <token> to api.x.com. Include offline.access to keep a refresh token (access tokens expire after 2 hours).',
      callbackPath: '/api/auth/x/callback',
      stateCookie: 'x_oauth_state',
    },
  },
  allowedHosts: ['api.x.com', 'api.twitter.com'],
  tools: xTools.map((entry) =>
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
    since: '0.0.13',
    homepage: 'https://x.com',
    docsUrl: 'https://docs.x.com/x-api/introduction',
    apiDocsUrl: 'https://api.x.com/2/openapi.json',
  },
});
