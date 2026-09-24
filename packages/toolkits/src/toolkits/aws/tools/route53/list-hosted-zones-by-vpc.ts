import { tool } from 'ai';
import { z } from 'zod';
import { ListHostedZonesByVPCCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsListRoute53HostedZonesByVpc = tool({
  description: 'List hosted zones associated with a VPC. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    vpcId: z.string().describe('The VPC ID'),
    vpcRegion: z.string().describe('The VPC region'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, vpcId, vpcRegion, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRoute53Client(awsCredentials, region);

      const command = new ListHostedZonesByVPCCommand({
          VPCId: vpcId,
          VPCRegion: vpcRegion as any,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  hostedZoneSummaries: response.HostedZoneSummaries,
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to list hosted zones associated with a VPC', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
