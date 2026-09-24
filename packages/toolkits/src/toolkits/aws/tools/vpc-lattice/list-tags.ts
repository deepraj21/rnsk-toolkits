import { tool } from 'ai';
import { z } from 'zod';
import { ListTagsForResourceCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsListVpcLatticeTags = tool({
  description: 'List tags for a VPC Lattice resource. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceArn: z.string().describe('The resource ARN'),
  }),
  execute: async ({ awsCredentials, region, resourceArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createVpcLatticeClient(awsCredentials, region);

      const command = new ListTagsForResourceCommand({
          resourceArn: resourceArn,
      });
      const response = await client.send(command);
      return {
                  tags: response.tags,
              };
    } catch (err) {
      return { error: 'Failed to list tags for a VPC Lattice resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
