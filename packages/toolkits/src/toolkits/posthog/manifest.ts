import { defineToolkit, defineTool } from '../../core/define.js';
import { POSTHOG_ICON } from './icon.js';
import { posthogTools } from './tools/index.js';

export default defineToolkit({
  id: 'posthog',
  displayName: 'PostHog',
  shortDescription:
    'Product analytics, feature flags, experiments, surveys, and session replay — query events with SQL, manage cohorts, insights, and dashboards.',
  category: 'Analytics & Data',
  icon: POSTHOG_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'posthogCredentials',
    provider: {
      fields: ['baseUrl', 'apiToken'],
      connectDescription:
        'Connect PostHog with your instance URL (default https://us.posthog.com; EU Cloud: https://eu.posthog.com; self-hosted: your instance URL) plus a personal API key from Settings → Personal API keys (us.posthog.com/settings/user-api-keys). Create the key with the scopes your tools need (e.g. insight:read, feature_flag:write) or full access (*).',
    },
  },
  tools: posthogTools.map((entry) =>
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
    since: '0.0.19',
    homepage: 'https://posthog.com',
    docsUrl: 'https://posthog.com/docs/api',
  },
});
