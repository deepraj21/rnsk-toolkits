import { tool } from 'ai';
import { z } from 'zod';
import { DeleteAccessEntryCommand } from '@aws-sdk/client-eks';
import { createEksClient } from '../client.js';

export const awsDeleteEksAccessEntry = tool({
  description: 'Delete an access entry. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    clusterName: z.string().describe('The name of the cluster'),
    principalArn: z.string().describe('The principal ARN'),
  }),
  execute: async ({ awsCredentials, region, clusterName, principalArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEksClient(awsCredentials, region);

      const command = new DeleteAccessEntryCommand({
          clusterName: clusterName,
          principalArn: principalArn,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Access entry ${principalArn} deleted successfully from cluster ${clusterName}`,
              };
    } catch (err) {
      return { error: 'Failed to delete an access entry', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
