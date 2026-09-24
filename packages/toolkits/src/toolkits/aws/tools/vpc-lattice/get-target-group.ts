import { tool } from 'ai';
import { z } from 'zod';
import { GetTargetGroupCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsGetVpcLatticeTargetGroup = tool({
  description: 'Get information about a VPC Lattice target group. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    targetGroupIdentifier: z.string().describe('The target group identifier'),
  }),
  execute: async ({ awsCredentials, region, targetGroupIdentifier }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createVpcLatticeClient(awsCredentials, region);

      const command = new GetTargetGroupCommand({
          targetGroupIdentifier: targetGroupIdentifier,
      });
      const response = await client.send(command);
      return {
                  arn: response.arn,
                  config: response.config,
                  createdAt: response.createdAt,
                  failureCode: response.failureCode,
                  failureMessage: response.failureMessage,
                  id: response.id,
                  lastUpdatedAt: response.lastUpdatedAt,
                  name: response.name,
                  serviceArns: response.serviceArns,
                  type: response.type,
              };
    } catch (err) {
      return { error: 'Failed to get information about a VPC Lattice target group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
