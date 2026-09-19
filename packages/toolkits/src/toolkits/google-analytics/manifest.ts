import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { GANALYTICS_ICON } from './icon.js';
import { googleAnalyticsTools } from './tools/index.js';

export default defineToolkit({
  id: 'google-analytics',
  displayName: 'Google Analytics',
  shortDescription: 'Run GA4 reports, manage audiences, properties, and Measurement Protocol events.',
  category: 'Analytics & Data',
  icon: GANALYTICS_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'googleAnalyticsToken',
    provider: {
      slug: 'google-analytics',
      env: { clientId: 'GOOGLE_ANALYTICS_CLIENT_ID', clientSecret: 'GOOGLE_ANALYTICS_CLIENT_SECRET' },
      authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: [
        'https://www.googleapis.com/auth/analytics.readonly',
        'https://www.googleapis.com/auth/analytics.edit',
      ],
      exchangeStyle: 'form',
      extraAuthParams: { access_type: 'offline', prompt: 'consent' },
      connectDescription: 'Connect Google Analytics for GA4 reports, audiences, properties, and admin.',
      callbackPath: '/api/auth/google-analytics/callback',
      stateCookie: 'google_analytics_oauth_state',
    },
  },
  allowedHosts: [
    'analyticsadmin.googleapis.com',
    'analyticsdata.googleapis.com',
    'www.google-analytics.com',
  ],
  tools: googleAnalyticsTools.map((entry) =>
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
    homepage: 'https://analytics.google.com',
    docsUrl: 'https://developers.google.com/analytics',
  },
});
