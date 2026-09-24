import { tool } from 'ai';
import { z } from 'zod';
import { DescribeKeyPairsCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsDescribeEc2KeyPairs = tool({
  description: 'Describe EC2 key pairs. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    keyNames: z.array(z.string()).optional().describe('Array of key pair names'),
    filters: z.record(z.any()).optional().describe('Optional filters'),
  }),
  execute: async ({ awsCredentials, region, keyNames, filters }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new DescribeKeyPairsCommand({
          KeyNames: keyNames,
          Filters: filters ? Object.entries(filters).map(([name, values]) => ({
              Name: name,
              Values: Array.isArray(values) ? values : [values],
          })) : undefined,
      });
      const response = await client.send(command);
      return { keyPairs: response.KeyPairs };
    } catch (err) {
      return { error: 'Failed to describe EC2 key pairs', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
