import { defineToolkit, defineTool } from '../../core/define.js';
import { CRON_JOB_ICON } from './icon.js';
import { cronJobTools } from './tools/index.js';

export default defineToolkit({
  id: 'cron-job',
  displayName: 'cron-job.org',
  shortDescription:
    'Create, update, delete, and monitor scheduled cron jobs plus folders via the cron-job.org API.',
  category: 'Developer Tools & DevOps',
  icon: CRON_JOB_ICON,
  auth: {
    type: 'bearer_token',
    tokenField: 'cronJobApiKey',
    provider: {
      connectDescription:
        'Connect cron-job.org with an API key. Generate one in the cron-job.org Console at Settings. All calls send it as Authorization: Bearer <token> to https://api.cron-job.org. Default limit is 100 requests per day (5,000 for sustaining members).',
    },
  },
  allowedHosts: ['api.cron-job.org'],
  tools: cronJobTools.map((entry) =>
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
    since: '0.0.14',
    homepage: 'https://cron-job.org',
    docsUrl: 'https://docs.cron-job.org/rest-api.html',
    apiDocsUrl: 'https://docs.cron-job.org/rest-api.html',
  },
});
