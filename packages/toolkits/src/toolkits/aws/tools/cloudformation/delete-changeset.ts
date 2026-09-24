import { tool } from 'ai';
import { z } from 'zod';
import { DeleteChangeSetCommand } from '@aws-sdk/client-cloudformation';
import { createCloudFormationClient } from '../client.js';

export const awsDeleteCloudformationChangeset = tool({
  description: 'Delete a CloudFormation change set. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    stackName: z.string().describe('The name of the stack'),
    changeSetName: z.string().describe('Name of the change set'),
  }),
  execute: async ({ awsCredentials, region, stackName, changeSetName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFormationClient(awsCredentials, region);

      const command = new DeleteChangeSetCommand({
          StackName: stackName,
          ChangeSetName: changeSetName,
      });
      await client.send(command);
      return { success: true };
    } catch (err) {
      return { error: 'Failed to delete a CloudFormation change set', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
