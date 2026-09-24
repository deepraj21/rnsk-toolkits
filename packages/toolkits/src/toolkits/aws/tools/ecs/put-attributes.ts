import { tool } from 'ai';
import { z } from 'zod';
import { PutAttributesCommand } from '@aws-sdk/client-ecs';
import { createEcsClient } from '../client.js';

export const awsPutEcsAttributes = tool({
  description: 'Create or update attributes. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    cluster: z.string().optional().describe('The name of the cluster'),
    attributes: z.array(z.record(z.any())).describe('List of attributes to put'),
  }),
  execute: async ({ awsCredentials, region, cluster, attributes }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcsClient(awsCredentials, region);

      const command = new PutAttributesCommand({
          cluster: cluster,
          attributes: attributes,
      } as any);
      const response = await client.send(command);
      return {
                  attributes: response.attributes || [],
              };
    } catch (err) {
      return { error: 'Failed to create or update attributes', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
