import { tool } from 'ai';
import { z } from 'zod';
import { UpdateTargetGroupCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsUpdateVpcLatticeTargetGroup = tool({
  description: 'Update a VPC Lattice target group. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    targetGroupIdentifier: z.string().describe('The target group identifier'),
    healthCheck: z.record(z.any()).optional().describe('Health check configuration'),
  }),
  execute: async ({ awsCredentials, region, targetGroupIdentifier, healthCheck }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createVpcLatticeClient(awsCredentials, region);

      const command = new UpdateTargetGroupCommand({
          targetGroupIdentifier: targetGroupIdentifier,
          healthCheck: healthCheck,
      });
      const response = await client.send(command);
      return {
                  arn: response.arn,
                  config: response.config,
                  id: response.id,
                  name: response.name,
                  type: response.type,
              };
    } catch (err) {
      return { error: 'Failed to update a VPC Lattice target group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
