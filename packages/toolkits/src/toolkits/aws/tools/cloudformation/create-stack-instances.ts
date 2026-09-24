import { tool } from 'ai';
import { z } from 'zod';
import { CreateStackInstancesCommand } from '@aws-sdk/client-cloudformation';
import { createCloudFormationClient } from '../client.js';

export const awsCreateCloudformationStackInstances = tool({
  description: 'Create stack instances in a stack set. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    stackSetName: z.string().describe('Name of the stack set'),
    accounts: z.array(z.string()).describe('Array of account IDs'),
    regions: z.array(z.string()).describe('Array of region names'),
    parameterOverrides: z.array(z.record(z.any())).optional().describe('Parameter overrides'),
    operationPreferences: z.record(z.any()).optional().describe('Operation preferences'),
  }),
  execute: async ({ awsCredentials, region, stackSetName, accounts, regions, parameterOverrides, operationPreferences }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFormationClient(awsCredentials, region);

      const command = new CreateStackInstancesCommand({
          StackSetName: stackSetName,
          Accounts: accounts,
          Regions: regions,
          ParameterOverrides: parameterOverrides,
          OperationPreferences: operationPreferences,
      });
      const response = await client.send(command);
      return { operationId: response.OperationId };
    } catch (err) {
      return { error: 'Failed to create stack instances in a stack set', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
