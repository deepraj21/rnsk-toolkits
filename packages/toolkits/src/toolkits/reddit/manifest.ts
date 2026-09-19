import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { REDDIT_ICON } from './icon.js';
import { redditTools } from './tools/index.js';

export default defineToolkit({
  id: 'reddit',
  displayName: 'Reddit',
  shortDescription: 'Posts, comments, subreddits, users, and search.',
  category: 'Marketing & Social Media',
  icon: REDDIT_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'redditToken',
    provider: {
      slug: 'reddit',
      env: { clientId: 'REDDIT_CLIENT_ID', clientSecret: 'REDDIT_CLIENT_SECRET' },
      authorizeUrl: 'https://www.reddit.com/api/v1/authorize',
      tokenUrl: 'https://www.reddit.com/api/v1/access_token',
      scopes: [
        'identity',
        'read',
        'submit',
        'edit',
        'flair',
        'privatemessages',
        'mysubreddits',
        'subscribe',
        'vote',
        'save',
        'history',
      ],
      scopeSeparator: ' ',
      exchangeStyle: 'basic',
      extraAuthParams: { duration: 'permanent' },
      connectDescription: 'Connect Reddit to read posts and comments, publish content, and manage subreddits.',
      callbackPath: '/api/auth/reddit/callback',
      stateCookie: 'reddit_oauth_state',
    },
  },
  allowedHosts: ['oauth.reddit.com', 'www.reddit.com'],
  tools: redditTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: (entry as any).scope ?? inferToolScope(entry.name),
    }),
  ),
  meta: {
    since: '0.0.8',
    homepage: 'https://www.reddit.com',
    docsUrl: 'https://www.reddit.com/dev/api/',
    apiDocsUrl: 'https://www.reddit.com/dev/api/',
  },
});
