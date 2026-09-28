import { defineToolkit, defineTool } from '../../core/define.js';
import { TERRAFORM_ICON } from './icon.js';
import { terraformTools } from './tools/index.js';

export default defineToolkit({
  id: 'terraform',
  displayName: 'Terraform',
  shortDescription:
    'HCP Terraform workspaces, runs, state, variables, teams, policies, registry, and integrations via the Terraform Cloud API.',
  category: 'Developer Tools & DevOps',
  icon: TERRAFORM_ICON,
  auth: {
    type: 'bearer_token',
    tokenField: 'terraformToken',
    provider: {
      connectDescription:
        'Connect Terraform with an HCP Terraform API token. Create a user token from User Settings > Tokens, or a team/organization token for automation. All calls send it as Authorization: Bearer <token>. Note: organization tokens cannot queue or apply runs — use a user or team token for run workflows.',
    },
  },
  allowedHosts: ['app.terraform.io'],
  tools: terraformTools.map((entry) =>
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
    since: '0.0.13',
    homepage: 'https://www.terraform.io',
    docsUrl: 'https://developer.hashicorp.com/terraform/cloud-docs/api-docs',
    apiDocsUrl: 'https://developer.hashicorp.com/terraform/cloud-docs/api-docs',
  },
});
