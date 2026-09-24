import { tool } from 'ai';
import { z } from 'zod';
import { GetRuleCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsGetVpcLatticeRule = tool({
  description: 'Get information about a VPC Lattice rule. Use it to inspect current state before making changes.',
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

      const command = new GetRuleCommand({
          listenerIdentifier: listenerIdentifier,
          serviceIdentifier: serviceIdentifier,
          ruleIdentifier: ruleIdentifier,
      });
      const response = await client.send(command);
      return {
                  action: response.action,
                  arn: response.arn,
                  createdAt: response.createdAt,
                  id: response.id,
                  isDefault: response.isDefault,
                  lastUpdatedAt: response.lastUpdatedAt,
                  match: response.match,
                  name: response.name,
                  priority: response.priority,
              };
    } catch (err) {
      return { error: 'Failed to get information about a VPC Lattice rule', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
