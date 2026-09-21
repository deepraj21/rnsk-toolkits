import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { SNOWFLAKE_ICON } from './icon.js';
import { snowflakeTools } from './tools/index.js';

export default defineToolkit({
  id: 'snowflake',
  displayName: 'Snowflake',
  shortDescription: 'Execute SQL, browse catalog objects, and check service status.',
  category: 'Developer Tools & DevOps',
  icon: SNOWFLAKE_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'snowflakeCredentials',
    provider: {
      fields: ['accountHost', 'token'],
      connectDescription:
        'Connect Snowflake with your account host (e.g. org-account, a full host, or https URL) and an access token. The token is sent as Authorization: Bearer on the SQL API v2. Use an OAuth access token from your Snowflake OAuth integration (recommended), a programmatic access token (PAT), or a key-pair JWT. OAuth authorize/token URLs are account-specific, so paste a token rather than an OAuth client flow. Status-page tools are public and need no credentials.',
    },
  },
  tools: snowflakeTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: (entry as any).scope ?? inferToolScope(entry.name),
    }),
  ),
  meta: {
    since: '0.0.10',
    homepage: 'https://www.snowflake.com',
    docsUrl: 'https://docs.snowflake.com/en/developer-guide/sql-api/intro',
  },
});
