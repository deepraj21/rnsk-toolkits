import { defineToolkit, defineTool } from '../../core/define.js';
import { HARNESS_ICON } from './icon.js';
import { harnessTools } from './tools/index.js';

export default defineToolkit({
  id: 'harness',
  displayName: 'Harness',
  shortDescription: 'Pipelines, executions, services, environments, connectors, secrets, triggers, feature flags, SLOs and CI builds via the Harness REST API.',
  category: 'Developer Tools & DevOps',
  icon: HARNESS_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'harnessCredentials',
    provider: {
      fields: ['apiKey', 'baseUrl'],
      connectDescription:
        'Connect Harness with an API key token (user profile > My API Keys > Token; service account tokens work too) sent as the x-api-key header. Base URL defaults to https://app.harness.io (EU: https://app.eu.harness.io; override for self-managed). Every call also needs your account identifier, found in any Harness URL (/account/ACCOUNT_ID/...).',
    },
  },
  tools: harnessTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: entry.scope,
    }),
  ),
  meta: {
    since: '0.0.12',
    homepage: 'https://www.harness.io',
    docsUrl: 'https://developer.harness.io/docs/platform/automation/api/api-quickstart',
    apiDocsUrl: 'https://apidocs.harness.io',
  },
});
