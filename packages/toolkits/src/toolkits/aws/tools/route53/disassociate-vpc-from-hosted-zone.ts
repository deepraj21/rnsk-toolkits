import { tool } from 'ai';
import { z } from 'zod';
import { DisassociateVPCFromHostedZoneCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsDisassociateRoute53VpcFromHostedZone = tool({
  description: 'Disassociate a VPC from a hosted zone. Use it to disconnect resources.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    hostedZoneId: z.string().describe('The hosted zone ID'),
    vpc: z.record(z.any()).describe('VPC configuration (VPCRegion, VPCId)'),
  }),
  execute: async ({ awsCredentials, region, hostedZoneId, vpc }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRoute53Client(awsCredentials, region);

      const command = new DisassociateVPCFromHostedZoneCommand({
          HostedZoneId: hostedZoneId,
          VPC: vpc,
      });
      const response = await client.send(command);
      return {
                  changeInfo: response.ChangeInfo,
              };
    } catch (err) {
      return { error: 'Failed to disassociate a VPC from a hosted zone', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
