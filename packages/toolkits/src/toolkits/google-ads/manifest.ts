import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { GADS_ICON } from './icon.js';
import { googleAdsTools } from './tools/index.js';

export default defineToolkit({
  id: 'google-ads',
  displayName: 'Google Ads',
  shortDescription: 'Manage campaigns, ad groups, ads, budgets, audiences, and reports in Google Ads.',
  category: 'Advertising & Marketing',
  icon: GADS_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'googleAdsToken',
    provider: {
      slug: 'google-ads',
      env: { clientId: 'GOOGLE_ADS_CLIENT_ID', clientSecret: 'GOOGLE_ADS_CLIENT_SECRET' },
      authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: ['https://www.googleapis.com/auth/adwords'],
      exchangeStyle: 'form',
      extraAuthParams: { access_type: 'offline', prompt: 'consent' },
      connectDescription: 'Connect Google Ads to manage campaigns, audiences, and reports.',
      callbackPath: '/api/auth/google-ads/callback',
      stateCookie: 'google_ads_oauth_state',
    },
  },
  allowedHosts: ['googleads.googleapis.com'],
  tools: googleAdsTools.map((entry) =>
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
    homepage: 'https://ads.google.com',
    docsUrl: 'https://developers.google.com/google-ads/api/docs/start',
  },
});
