import { tool } from 'ai';
import { z } from 'zod';
import { CreateAccessEntryCommand } from '@aws-sdk/client-eks';
import { createEksClient } from '../client.js';

export const awsCreateEksAccessEntry = tool({
  description: 'Create a new access entry. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    clusterName: z.string().describe('The name of the cluster'),
    principalArn: z.string().describe('The principal ARN'),
    kubernetesGroups: z.array(z.string()).optional().describe('Kubernetes groups'),
    tags: z.record(z.any()).optional().describe('Tags to apply'),
    username: z.string().optional().describe('Kubernetes username'),
    type: z.string().optional().describe('Access entry type (STANDARD, EC2_LINUX, EC2_WINDOWS, FARGATE_LINUX)'),
  }),
  execute: async ({ awsCredentials, region, clusterName, principalArn, kubernetesGroups, tags, username, type }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEksClient(awsCredentials, region);

      const command = new CreateAccessEntryCommand({
          clusterName: clusterName,
          principalArn: principalArn,
          kubernetesGroups: kubernetesGroups,
          tags: tags,
          username: username,
          type: type as any,
      } as any);
      const response = await client.send(command);
      return {
                  accessEntry: response.accessEntry,
              };
    } catch (err) {
      return { error: 'Failed to create a new access entry', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
