import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { SENTRY_ICON } from './icon.js';
import { sentryTools } from './tools/index.js';

export default defineToolkit({
  id: 'sentry',
  displayName: 'Sentry',
  shortDescription: 'Error tracking, issues, events, releases, alerts, crons, replays and dashboards.',
  category: 'Developer Tools & DevOps',
  icon: SENTRY_ICON,
  auth: {
    type: 'oauth2',
    tokenField: 'sentryToken',
    provider: {
      slug: 'sentry',
      env: { clientId: 'SENTRY_CLIENT_ID', clientSecret: 'SENTRY_CLIENT_SECRET' },
      authorizeUrl: 'https://sentry.io/oauth/authorize/',
      tokenUrl: 'https://sentry.io/oauth/token/',
      scopes: [
        'org:read',
        'org:write',
        'org:admin',
        'project:read',
        'project:write',
        'project:admin',
        'project:releases',
        'team:read',
        'team:write',
        'team:admin',
        'member:read',
        'member:write',
        'member:admin',
        'event:read',
        'event:write',
        'event:admin',
      ],
      scopeSeparator: ' ',
      exchangeStyle: 'form',
      connectDescription:
        'Connect Sentry via OAuth to manage organizations, projects, issues, events, releases, alerts, monitors, replays and dashboards. The token is sent as Authorization: Bearer to sentry.io/api/0.',
      callbackPath: '/api/auth/sentry/callback',
      stateCookie: 'sentry_oauth_state',
    },
  },
  allowedHosts: ['sentry.io'],
  tools: sentryTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: (entry as any).requiredAuth,
      scope: (entry as any).scope ?? inferToolScope(entry.name),
    }),
  ),
  meta: {
    since: '0.0.12',
    homepage: 'https://sentry.io',
    docsUrl: 'https://docs.sentry.io/api/',
    apiDocsUrl: 'https://docs.sentry.io/api/',
  },
});
