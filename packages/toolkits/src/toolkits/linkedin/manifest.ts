import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { LINKEDIN_ICON } from './icon.js';
import { linkedinTools } from './tools/index.js';

export default defineToolkit({
  id: 'linkedin',
  displayName: 'LinkedIn',
  shortDescription:
    'Publish posts, shares, and video; comment and react; upload images and video; manage company pages, analytics, and ad targeting.',
  category: 'Social Media',
  icon: LINKEDIN_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'linkedinToken',
    provider: {
      slug: 'linkedin',
      env: { clientId: 'LINKEDIN_CLIENT_ID', clientSecret: 'LINKEDIN_CLIENT_SECRET' },
      authorizeUrl: 'https://www.linkedin.com/oauth/v2/authorization',
      tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
      scopes: [
        'openid',
        'profile',
        'email',
        'w_member_social',
        'r_liteprofile',
        'w_organization_social',
        'r_organization_social',
        'r_organization_admin',
        'rw_organization_admin',
        'r_ads',
        'rw_ads',
      ],
      exchangeStyle: 'form',
      connectDescription:
        'Connect LinkedIn with OAuth 2.0 (3-legged authorization code flow). Sign in with your LinkedIn account and approve posting, profile, organization, and advertising scopes. Every API call sends the access token as the Authorization: Bearer header.',
      callbackPath: '/api/auth/linkedin/callback',
      stateCookie: 'linkedin_oauth_state',
    },
  },
  allowedHosts: ['api.linkedin.com'],
  tools: linkedinTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: (entry as any).scope ?? inferToolScope(entry.name),
      keywords: (entry as { keywords?: string[] }).keywords ?? [],
    }),
  ),
  meta: {
    since: '0.0.14',
    homepage: 'https://www.linkedin.com',
    docsUrl: 'https://learn.microsoft.com/en-us/linkedin/',
    apiDocsUrl:
      'https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api',
  },
});
