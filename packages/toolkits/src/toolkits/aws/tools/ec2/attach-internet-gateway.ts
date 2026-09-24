import { tool } from 'ai';
import { z } from 'zod';
import { AttachInternetGatewayCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsAttachEc2InternetGateway = tool({
  description: 'Attach an internet gateway to a VPC. Use it to connect resources.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    internetGatewayId: z.string().describe('Internet gateway ID'),
    vpcId: z.string().describe('VPC ID'),
  }),
  execute: async ({ awsCredentials, region, internetGatewayId, vpcId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new AttachInternetGatewayCommand({
          InternetGatewayId: internetGatewayId,
          VpcId: vpcId,
      });
      await client.send(command);
      return { success: true };
    } catch (err) {
      return { error: 'Failed to attach an internet gateway to a VPC', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
