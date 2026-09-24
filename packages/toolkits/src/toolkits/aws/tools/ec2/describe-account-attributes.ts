import { tool } from 'ai';
import { z } from 'zod';
import { DescribeAccountAttributesCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsDescribeEc2AccountAttributes = tool({
  description: 'Describe EC2 account attributes. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    attributeNames: z.array(z.string()).optional().describe('Array of attribute names'),
  }),
  execute: async ({ awsCredentials, region, attributeNames }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new DescribeAccountAttributesCommand({
          AttributeNames: attributeNames as any,
      });
      const response = await client.send(command);
      return { accountAttributes: response.AccountAttributes };
    } catch (err) {
      return { error: 'Failed to describe EC2 account attributes', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
