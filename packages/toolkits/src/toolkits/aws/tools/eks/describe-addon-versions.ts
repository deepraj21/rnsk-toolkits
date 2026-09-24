import { tool } from 'ai';
import { z } from 'zod';
import { DescribeAddonVersionsCommand } from '@aws-sdk/client-eks';
import { createEksClient } from '../client.js';

export const awsDescribeEksAddonVersions = tool({
  description: 'Get available versions for an addon. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    addonName: z.string().optional().describe('The name of the addon'),
    kubernetesVersion: z.string().optional().describe('Kubernetes version'),
    maxResults: z.number().optional().describe('Maximum number of versions to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
    types: z.array(z.string()).optional().describe('Addon types to filter'),
    publishers: z.array(z.string()).optional().describe('Publishers to filter'),
    owners: z.array(z.string()).optional().describe('Owners to filter'),
  }),
  execute: async ({ awsCredentials, region, addonName, kubernetesVersion, maxResults, nextToken, types, publishers, owners }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEksClient(awsCredentials, region);

      const command = new DescribeAddonVersionsCommand({
          addonName: addonName,
          kubernetesVersion: kubernetesVersion,
          maxResults: maxResults,
          nextToken: nextToken,
          types: types,
          publishers: publishers,
          owners: owners,
      });
      const response = await client.send(command);
      return {
                  addons: response.addons || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to get available versions for an addon', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
