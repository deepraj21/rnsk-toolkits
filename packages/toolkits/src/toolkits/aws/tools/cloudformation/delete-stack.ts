import { tool } from 'ai';
import { z } from 'zod';
import { DeleteStackCommand } from '@aws-sdk/client-cloudformation';
import { createCloudFormationClient } from '../client.js';

export const awsDeleteCloudformationStack = tool({
  description: 'Delete a CloudFormation stack. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    stackName: z.string().describe('The name of the stack'),
    retainResources: z.array(z.string()).optional().describe('Logical IDs of resources to retain'),
  }),
  execute: async ({ awsCredentials, region, stackName, retainResources }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFormationClient(awsCredentials, region);

      const command = new DeleteStackCommand({
          StackName: stackName,
          RetainResources: retainResources,
      });
      await client.send(command);
      return { success: true };
    } catch (err) {
      return { error: 'Failed to delete a CloudFormation stack', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
