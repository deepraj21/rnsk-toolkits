import { tool } from 'ai';
import { z } from 'zod';
import { DescribeAttackCommand } from '@aws-sdk/client-shield';
import { createShieldClient } from '../client.js';

export const awsDescribeAttack = tool({
  description: 'Get detailed information about a specific DDoS attack. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    attackId: z.string().describe('Attack ID'),
  }),
  execute: async ({ awsCredentials, region, attackId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createShieldClient(awsCredentials, region);

      const command = new DescribeAttackCommand({
          AttackId: attackId,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to get detailed information about a specific DDoS attack', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
