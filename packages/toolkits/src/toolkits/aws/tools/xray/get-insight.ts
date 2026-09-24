import { tool } from 'ai';
import { z } from 'zod';
import { GetInsightCommand } from '@aws-sdk/client-xray';
import { createXRayClient } from '../client.js';

export const awsGetInsight = tool({
  description: 'Retrieves the summary information of an insight. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    insightId: z.string().describe('The insight unique identifier'),
  }),
  execute: async ({ awsCredentials, region, insightId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createXRayClient(awsCredentials, region);

      const command = new GetInsightCommand({
          InsightId: insightId,
      });
      const response = await client.send(command);
      return {
                  insight: response.Insight,
              };
    } catch (err) {
      return { error: 'Failed to retrieves the summary information of an insight', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
