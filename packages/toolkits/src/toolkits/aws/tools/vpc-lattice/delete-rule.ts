import { tool } from 'ai';
import { z } from 'zod';
import { DeleteRuleCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsDeleteVpcLatticeRule = tool({
  description: 'Delete a VPC Lattice rule. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    listenerIdentifier: z.string().describe('The listener identifier'),
    serviceIdentifier: z.string().describe('The service identifier'),
    ruleIdentifier: z.string().describe('The rule identifier'),
  }),
  execute: async ({ awsCredentials, region, listenerIdentifier, serviceIdentifier, ruleIdentifier }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createVpcLatticeClient(awsCredentials, region);

      const command = new DeleteRuleCommand({
          listenerIdentifier: listenerIdentifier,
          serviceIdentifier: serviceIdentifier,
          ruleIdentifier: ruleIdentifier,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Rule ${ruleIdentifier} deleted successfully`,
              };
    } catch (err) {
      return { error: 'Failed to delete a VPC Lattice rule', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
