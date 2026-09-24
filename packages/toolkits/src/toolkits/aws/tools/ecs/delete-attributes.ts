import { tool } from 'ai';
import { z } from 'zod';
import { DeleteAttributesCommand } from '@aws-sdk/client-ecs';
import { createEcsClient } from '../client.js';

export const awsDeleteEcsAttributes = tool({
  description: 'Delete attributes. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    cluster: z.string().optional().describe('The name of the cluster'),
    attributes: z.array(z.record(z.any())).describe('List of attributes to delete'),
  }),
  execute: async ({ awsCredentials, region, cluster, attributes }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcsClient(awsCredentials, region);

      const command = new DeleteAttributesCommand({
          cluster: cluster,
          attributes: attributes,
      } as any);
      const response = await client.send(command);
      return {
                  attributes: response.attributes || [],
              };
    } catch (err) {
      return { error: 'Failed to delete attributes', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
