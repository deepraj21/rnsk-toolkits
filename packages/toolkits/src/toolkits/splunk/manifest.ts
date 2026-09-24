import { defineToolkit, defineTool } from '../../core/define.js';
import { SPLUNK_ICON } from './icon.js';
import { splunkTools } from './tools/index.js';

export default defineToolkit({
  id: 'splunk',
  displayName: 'Splunk',
  shortDescription: 'Run SPL searches, manage saved searches, indexes, HEC inputs, alerts and KV Store via the Splunk REST API.',
  category: 'Analytics & Data',
  icon: SPLUNK_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'splunkCredentials',
    provider: {
      fields: ['baseUrl', 'username', 'password'],
      connectDescription:
        'Connect Splunk Enterprise or Splunk Cloud with the management URL (e.g. https://splunk.example.com:8089) plus a username and password, exchanged for a session key via /services/auth/login. Alternatively supply a long-lived token (Settings > Tokens) as "token" in the credentials JSON to use Bearer auth and skip login.',
    },
  },
  tools: splunkTools.map((entry) =>
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
    homepage: 'https://www.splunk.com',
    docsUrl: 'https://help.splunk.com/en/splunk-enterprise/leverage-rest-apis/rest-api-reference/',
  },
});
