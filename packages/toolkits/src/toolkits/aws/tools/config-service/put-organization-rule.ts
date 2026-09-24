import { tool } from 'ai';
import { z } from 'zod';
import { PutOrganizationConfigRuleCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsPutOrganizationConfigRule = tool({
  description: 'Adds or updates an organization Config rule. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    organizationConfigRuleName: z.string().describe('The name of the organization Config rule'),
    organizationManagedRuleMetadata: z.enum(['One_Hour', 'Three_Hours', 'Six_Hours', 'Twelve_Hours', 'TwentyFour_Hours']).optional().describe('organizationManagedRuleMetadata'),
    organizationCustomRuleMetadata: z.enum(['ConfigurationItemChangeNotification', 'OversizedConfigurationItemChangeNotification', 'ScheduledNotification']).optional().describe('organizationCustomRuleMetadata'),
    excludedAccounts: z.array(z.string()).optional().describe('List of excluded accounts'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply'),
  }),
  execute: async ({ awsCredentials, region, organizationConfigRuleName, organizationManagedRuleMetadata, organizationCustomRuleMetadata, excludedAccounts, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new PutOrganizationConfigRuleCommand({
          OrganizationConfigRuleName: organizationConfigRuleName,
          OrganizationManagedRuleMetadata: organizationManagedRuleMetadata,
          OrganizationCustomRuleMetadata: organizationCustomRuleMetadata,
          ExcludedAccounts: excludedAccounts,
      } as any);
      const response = await client.send(command);
      return {
                  organizationConfigRuleArn: response.OrganizationConfigRuleArn,
              };
    } catch (err) {
      return { error: 'Failed to adds or updates an organization Config rule', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
