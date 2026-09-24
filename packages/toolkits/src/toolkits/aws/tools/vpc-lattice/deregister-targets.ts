import { tool } from 'ai';
import { z } from 'zod';
import { DeregisterTargetsCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsDeregisterVpcLatticeTargets = tool({
  description: 'Deregister targets from a VPC Lattice target group. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    targetGroupIdentifier: z.string().describe('The target group identifier'),
    targets: z.array(z.record(z.any())).describe('Targets to deregister'),
  }),
  execute: async ({ awsCredentials, region, targetGroupIdentifier, targets }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createVpcLatticeClient(awsCredentials, region);

      const command = new DeregisterTargetsCommand({
          targetGroupIdentifier: targetGroupIdentifier,
          targets: targets,
      } as any);
      const response = await client.send(command);
      return {
                  successful: response.successful,
                  unsuccessful: response.unsuccessful,
              };
    } catch (err) {
      return { error: 'Failed to deregister targets from a VPC Lattice target group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
