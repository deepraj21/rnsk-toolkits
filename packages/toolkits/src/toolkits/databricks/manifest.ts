import { defineToolkit, defineTool } from '../../core/define.js';
import { DATABRICKS_ICON } from './icon.js';
import { databricksTools } from './tools/index.js';

export default defineToolkit({
  id: 'databricks',
  displayName: 'Databricks',
  shortDescription:
    'Run data and AI workloads: clusters, jobs, SQL warehouses and statements, Unity Catalog, pipelines, repos, secrets, users, tokens, models, and serving.',
  category: 'Data & Analytics',
  icon: DATABRICKS_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'databricksCredentials',
    provider: {
      fields: ['workspaceUrl', 'token'],
      connectDescription:
        'Connect Databricks with your workspace URL (e.g. https://my-workspace.cloud.databricks.com or https://adb-<id>.<n>.azuredatabricks.net) and a personal access token (User Settings > Access tokens) or OAuth M2M token. Calls send Authorization: Bearer <token> to {workspace}/api.',
    },
  },
  tools: databricksTools.map((entry) =>
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
    since: '0.0.15',
    homepage: 'https://www.databricks.com',
    docsUrl: 'https://docs.databricks.com/api/',
    apiDocsUrl: 'https://docs.databricks.com/api/workspace/',
  },
});
