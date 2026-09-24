import { tool } from 'ai';
import { z } from 'zod';
import { DeleteOrganizationConfigRuleCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsDeleteOrganizationConfigRule = tool({
  description: 'Deletes the specified organization Config rule. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    organizationConfigRuleName: z.string().describe('The name of the organization Config rule to delete'),
  }),
  execute: async ({ awsCredentials, region, organizationConfigRuleName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new DeleteOrganizationConfigRuleCommand({
          OrganizationConfigRuleName: organizationConfigRuleName,
      });
      await client.send(command);
      return {
                  message: 'Organization Config rule deleted successfully',
                  organizationConfigRuleName: organizationConfigRuleName,
              };
    } catch (err) {
      return { error: 'Failed to deletes the specified organization Config rule', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
