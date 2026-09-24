import { tool } from 'ai';
import { z } from 'zod';
import { TagResourceCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsTagVpcLatticeResource = tool({
  description: 'Add tags to a VPC Lattice resource. Use it to label the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceArn: z.string().describe('The resource ARN'),
    tags: z.record(z.any()).describe('Tags to apply (key-value pairs)'),
  }),
  execute: async ({ awsCredentials, region, resourceArn, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createVpcLatticeClient(awsCredentials, region);

      const command = new TagResourceCommand({
          resourceArn: resourceArn,
          tags: tags,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Tags added successfully to resource ${resourceArn}`,
              };
    } catch (err) {
      return { error: 'Failed to add tags to a VPC Lattice resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
