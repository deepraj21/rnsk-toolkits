import { tool } from 'ai';
import { z } from 'zod';
import { DeleteStackInstancesCommand } from '@aws-sdk/client-cloudformation';
import { createCloudFormationClient } from '../client.js';

export const awsDeleteCloudformationStackInstances = tool({
  description: 'Delete stack instances from a stack set. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    stackSetName: z.string().describe('Name of the stack set'),
    accounts: z.array(z.string()).describe('Array of account IDs'),
    regions: z.array(z.string()).describe('Array of region names'),
    retainStacks: z.boolean().optional().describe('Whether to retain stacks'),
    operationPreferences: z.record(z.any()).optional().describe('Operation preferences'),
  }),
  execute: async ({ awsCredentials, region, stackSetName, accounts, regions, retainStacks, operationPreferences }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFormationClient(awsCredentials, region);

      const command = new DeleteStackInstancesCommand({
          StackSetName: stackSetName,
          Accounts: accounts,
          Regions: regions,
          RetainStacks: retainStacks,
          OperationPreferences: operationPreferences,
      });
      const response = await client.send(command);
      return { operationId: response.OperationId };
    } catch (err) {
      return { error: 'Failed to delete stack instances from a stack set', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
