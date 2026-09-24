import { tool } from 'ai';
import { z } from 'zod';
import { ListTargetGroupsCommand } from '@aws-sdk/client-vpc-lattice';
import { createVpcLatticeClient } from '../client.js';

export const awsListVpcLatticeTargetGroups = tool({
  description: 'List VPC Lattice target groups. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    maxResults: z.number().optional().describe('Maximum number of results'),
    nextToken: z.string().optional().describe('Token for pagination'),
    targetGroupType: z.enum(['IP', 'LAMBDA', 'INSTANCE', 'ALB']).optional().describe('Filter by target group type'),
    vpcIdentifier: z.string().optional().describe('Filter by VPC identifier'),
  }),
  execute: async ({ awsCredentials, region, maxResults, nextToken, targetGroupType, vpcIdentifier }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createVpcLatticeClient(awsCredentials, region);

      const command = new ListTargetGroupsCommand({
          maxResults: maxResults,
          nextToken: nextToken,
          targetGroupType: targetGroupType,
          vpcIdentifier: vpcIdentifier,
      });
      const response = await client.send(command);
      return {
                  items: response.items,
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to list VPC Lattice target groups', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
