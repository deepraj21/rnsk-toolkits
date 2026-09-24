import { tool } from 'ai';
import { z } from 'zod';
import { DeleteStackSetCommand } from '@aws-sdk/client-cloudformation';
import { createCloudFormationClient } from '../client.js';

export const awsDeleteCloudformationStackSet = tool({
  description: 'Delete a CloudFormation stack set. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    stackSetName: z.string().describe('Name of the stack set'),
  }),
  execute: async ({ awsCredentials, region, stackSetName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFormationClient(awsCredentials, region);

      const command = new DeleteStackSetCommand({
          StackSetName: stackSetName,
      });
      await client.send(command);
      return { success: true };
    } catch (err) {
      return { error: 'Failed to delete a CloudFormation stack set', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
