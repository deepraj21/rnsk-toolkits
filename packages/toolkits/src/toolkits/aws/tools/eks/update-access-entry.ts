import { tool } from 'ai';
import { z } from 'zod';
import { UpdateAccessEntryCommand } from '@aws-sdk/client-eks';
import { createEksClient } from '../client.js';

export const awsUpdateEksAccessEntry = tool({
  description: 'Update an access entry. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    clusterName: z.string().describe('The name of the cluster'),
    principalArn: z.string().describe('The principal ARN'),
    kubernetesGroups: z.array(z.string()).optional().describe('Kubernetes groups'),
    username: z.string().optional().describe('Kubernetes username'),
  }),
  execute: async ({ awsCredentials, region, clusterName, principalArn, kubernetesGroups, username }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEksClient(awsCredentials, region);

      const command = new UpdateAccessEntryCommand({
          clusterName: clusterName,
          principalArn: principalArn,
          kubernetesGroups: kubernetesGroups,
          username: username,
      });
      const response = await client.send(command);
      return {
                  accessEntry: response.accessEntry,
              };
    } catch (err) {
      return { error: 'Failed to update an access entry', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
