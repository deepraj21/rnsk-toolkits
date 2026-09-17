import { defineToolkit, defineTool } from '../../core/define.js';
import { GCP_ICON } from './icon.js';
import { gcpTools } from './tools/index.js';

export default defineToolkit({
  id: 'gcp',
  displayName: 'Google Cloud',
  shortDescription: 'Manage Compute Engine instances and read Cloud Monitoring metrics.',
  category: 'Developer Tools & DevOps',
  icon: GCP_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'gcpCredentials',
    provider: {
      fields: ['projectId', 'serviceAccountKey'],
      connectDescription:
        'Connect a GCP service account (project ID + service account key JSON) with Compute Engine and Monitoring permissions.',
    },
  },
  tools: gcpTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: entry.scope,
    }),
  ),
  meta: { since: '0.0.6', homepage: 'https://cloud.google.com' },
});
