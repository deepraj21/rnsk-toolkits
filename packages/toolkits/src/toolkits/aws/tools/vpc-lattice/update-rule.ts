import { tool } from 'ai';
import { z } from 'zod';
import { UpdateRuleCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsUpdateVpcLatticeRule = tool({
  description: 'Update a VPC Lattice rule. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    listenerIdentifier: z.string().describe('The listener identifier'),
    serviceIdentifier: z.string().describe('The service identifier'),
    ruleIdentifier: z.string().describe('The rule identifier'),
    priority: z.number().optional().describe('Priority'),
    match: z.record(z.any()).optional().describe('Match criteria'),
    action: z.record(z.any()).optional().describe('Action'),
  }),
  execute: async ({ awsCredentials, region, listenerIdentifier, serviceIdentifier, ruleIdentifier, priority, match, action }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createVpcLatticeClient(awsCredentials, region);

      const command = new UpdateRuleCommand({
          listenerIdentifier: listenerIdentifier,
          serviceIdentifier: serviceIdentifier,
          ruleIdentifier: ruleIdentifier,
          priority: priority,
          match: match,
          action: action,
      } as any);
      const response = await client.send(command);
      return {
                  action: response.action,
                  arn: response.arn,
                  id: response.id,
                  isDefault: response.isDefault,
                  match: response.match,
                  name: response.name,
                  priority: response.priority,
              };
    } catch (err) {
      return { error: 'Failed to update a VPC Lattice rule', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
