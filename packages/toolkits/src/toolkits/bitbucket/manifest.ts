import { defineToolkit, defineTool } from '../../core/define.js';
import { BITBUCKET_ICON } from './icon.js';
import { bitbucketTools } from './tools/index.js';

export default defineToolkit({
  id: 'bitbucket',
  displayName: 'Bitbucket',
  shortDescription: 'Repositories, pull requests, issues, commits, pipelines, and snippets.',
  category: 'Developer Tools & DevOps',
  icon: BITBUCKET_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'bitbucketToken',
    provider: {
      slug: 'bitbucket',
      env: { clientId: 'BITBUCKET_CLIENT_ID', clientSecret: 'BITBUCKET_CLIENT_SECRET' },
      authorizeUrl: 'https://bitbucket.org/site/oauth2/authorize',
      tokenUrl: 'https://bitbucket.org/site/oauth2/access_token',
      scopes: [
        'account',
        'email',
        'repository',
        'repository:write',
        'repository:admin',
        'pullrequest',
        'pullrequest:write',
        'issue',
        'issue:write',
        'wiki',
        'snippet',
        'snippet:write',
        'pipeline',
        'pipeline:write',
        'pipeline:variable',
      ],
      exchangeStyle: 'basic',
      connectDescription:
        'Connect Bitbucket to manage repositories, pull requests, issues, commits, pipelines, and snippets.',
      callbackPath: '/api/auth/bitbucket/callback',
      stateCookie: 'bitbucket_oauth_state',
    },
  },
  allowedHosts: ['api.bitbucket.org'],
  tools: bitbucketTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: entry.scope,
    }),
  ),
  meta: {
    since: '0.0.9',
    homepage: 'https://bitbucket.org',
    docsUrl: 'https://developer.atlassian.com/cloud/bitbucket/rest/',
    apiDocsUrl: 'https://developer.atlassian.com/cloud/bitbucket/rest/',
  },
});
