import { tool } from 'ai';
import { z } from 'zod';
import { ListTargetsCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsGetVpcLatticeTargets = tool({
  description: 'Get targets for a VPC Lattice target group. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    targetGroupIdentifier: z.string().describe('The target group identifier'),
    targets: z.array(z.string()).optional().describe('Target IDs to filter by'),
  }),
  execute: async ({ awsCredentials, region, targetGroupIdentifier, targets }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createVpcLatticeClient(awsCredentials, region);

      const commandInput: any = {
          targetGroupIdentifier: targetGroupIdentifier,
      };
      if (targets && Array.isArray(targets) && targets.length > 0) {
          commandInput.targets = targets.map(id => ({ id }));
      }
      const command = new ListTargetsCommand(commandInput);
      const response = await client.send(command);
      return {
                  items: response.items,
              };
    } catch (err) {
      return { error: 'Failed to get targets for a VPC Lattice target group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
