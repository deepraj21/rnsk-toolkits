import { tool } from 'ai';
import { z } from 'zod';
import { CreateTargetGroupCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsCreateVpcLatticeTargetGroup = tool({
  description: 'Create a new VPC Lattice target group. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    type: z.enum(['IP', 'LAMBDA', 'INSTANCE', 'ALB']).describe('Target group type'),
    name: z.string().describe('The name of the target group'),
    config: z.record(z.any()).optional().describe('Target group configuration'),
    tags: z.record(z.any()).optional().describe('Tags to apply'),
  }),
  execute: async ({ awsCredentials, region, name, config, tags, type }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createVpcLatticeClient(awsCredentials, region);

      const command = new CreateTargetGroupCommand({
          name: name,
          type: type,
          config: config,
          tags: tags,
      } as any);
      const response = await client.send(command);
      return {
                  arn: response.arn,
                  config: response.config,
                  id: response.id,
                  name: response.name,
                  type: response.type,
              };
    } catch (err) {
      return { error: 'Failed to create a new VPC Lattice target group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
