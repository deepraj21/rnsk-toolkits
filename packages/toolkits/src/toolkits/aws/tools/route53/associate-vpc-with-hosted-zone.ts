import { tool } from 'ai';
import { z } from 'zod';
import { AssociateVPCWithHostedZoneCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsAssociateRoute53VpcWithHostedZone = tool({
  description: 'Associate a VPC with a hosted zone. Use it to connect resources.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    hostedZoneId: z.string().describe('The hosted zone ID'),
    vpc: z.record(z.any()).describe('VPC configuration (VPCRegion, VPCId)'),
    comment: z.string().optional().describe('Comment about the association'),
  }),
  execute: async ({ awsCredentials, region, hostedZoneId, vpc, comment }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRoute53Client(awsCredentials, region);

      const command = new AssociateVPCWithHostedZoneCommand({
          HostedZoneId: hostedZoneId,
          VPC: vpc,
          Comment: comment,
      });
      const response = await client.send(command);
      return {
                  changeInfo: response.ChangeInfo,
              };
    } catch (err) {
      return { error: 'Failed to associate a VPC with a hosted zone', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
