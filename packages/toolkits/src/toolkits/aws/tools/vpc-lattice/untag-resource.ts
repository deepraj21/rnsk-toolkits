import { tool } from 'ai';
import { z } from 'zod';
import { UntagResourceCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsUntagVpcLatticeResource = tool({
  description: 'Remove tags from a VPC Lattice resource. Use it to remove tags from the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceArn: z.string().describe('The resource ARN'),
    tagKeys: z.array(z.string()).describe('Tag keys to remove'),
  }),
  execute: async ({ awsCredentials, region, resourceArn, tagKeys }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createVpcLatticeClient(awsCredentials, region);

      const command = new UntagResourceCommand({
          resourceArn: resourceArn,
          tagKeys: tagKeys,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Tags removed successfully from resource ${resourceArn}`,
              };
    } catch (err) {
      return { error: 'Failed to remove tags from a VPC Lattice resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
