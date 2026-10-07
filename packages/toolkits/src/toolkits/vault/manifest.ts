import { defineToolkit, defineTool } from '../../core/define.js';
import { VAULT_ICON } from './icon.js';
import { vaultTools } from './tools/index.js';

export default defineToolkit({
  id: 'vault',
  displayName: 'HashiCorp Vault',
  shortDescription:
    'Secrets and policies: KV v2 read/write/list, mounts, seal/HA health, ACL policies, and token lifecycle via the Vault HTTP API.',
  category: 'Developer Tools & DevOps',
  icon: VAULT_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'vaultCredentials',
    provider: {
      fields: ['address', 'roleId', 'secretId', 'token', 'namespace'],
      connectDescription:
        'Connect Vault with JSON credentials. Prefer AppRole for automation: {"address":"https://vault.example.com:8200","roleId":"...","secretId":"..."} (short-lived tokens, narrow policies). Alternatively use a periodic token: {"address":"...","token":"..."}. Optional "namespace" for Enterprise. Tools send X-Vault-Token; AppRole is exchanged at POST /v1/auth/approle/login per request.',
    },
  },
  tools: vaultTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: entry.scope,
      keywords: entry.keywords ?? [],
    }),
  ),
  meta: {
    since: '0.0.16',
    homepage: 'https://www.vaultproject.io',
    docsUrl: 'https://developer.hashicorp.com/vault/api-docs',
    apiDocsUrl: 'https://developer.hashicorp.com/vault/api-docs',
  },
});
