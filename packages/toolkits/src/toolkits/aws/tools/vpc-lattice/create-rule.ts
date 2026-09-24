import { tool } from 'ai';
import { z } from 'zod';
import { CreateRuleCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsCreateVpcLatticeRule = tool({
  description: 'Create a new VPC Lattice rule. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    listenerIdentifier: z.string().describe('The listener identifier'),
    serviceIdentifier: z.string().describe('The service identifier'),
    name: z.string().describe('The name of the rule'),
    priority: z.number().describe('Priority'),
    match: z.record(z.any()).describe('Match criteria'),
    action: z.record(z.any()).describe('Action'),
    tags: z.record(z.any()).optional().describe('Tags to apply'),
  }),
  execute: async ({ awsCredentials, region, listenerIdentifier, serviceIdentifier, name, priority, match, action, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createVpcLatticeClient(awsCredentials, region);

      const command = new CreateRuleCommand({
          listenerIdentifier: listenerIdentifier,
          serviceIdentifier: serviceIdentifier,
          name: name,
          priority: priority,
          match: match,
          action: action,
          tags: tags,
      } as any);
      const response = await client.send(command);
      return {
                  action: response.action,
                  arn: response.arn,
                  id: response.id,
                  match: response.match,
                  name: response.name,
                  priority: response.priority,
              };
    } catch (err) {
      return { error: 'Failed to create a new VPC Lattice rule', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
