import { tool } from 'ai';
import { z } from 'zod';
import { CreateInternetGatewayCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsCreateEc2InternetGateway = tool({
  description: 'Create an internet gateway. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    tagSpecifications: z.array(z.any()).optional().describe('Tags to apply'),
  }),
  execute: async ({ awsCredentials, region, tagSpecifications }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new CreateInternetGatewayCommand({
          TagSpecifications: tagSpecifications,
      });
      const response = await client.send(command);
      return { internetGateway: response.InternetGateway };
    } catch (err) {
      return { error: 'Failed to create an internet gateway', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
