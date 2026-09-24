import { tool } from 'ai';
import { z } from 'zod';
import { DeleteAnomalyMonitorCommand } from '@aws-sdk/client-cost-explorer';
import { createCostExplorerClient } from '../client.js';

export const awsDeleteAnomalyMonitor = tool({
  description: 'Deletes a cost anomaly monitor. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    monitorArn: z.string().describe('The ARN of the monitor'),
  }),
  execute: async ({ awsCredentials, region, monitorArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCostExplorerClient(awsCredentials, region);

      const command = new DeleteAnomalyMonitorCommand({
          MonitorArn: monitorArn,
      });
      await client.send(command);
      return {
                  success: true,
              };
    } catch (err) {
      return { error: 'Failed to deletes a cost anomaly monitor', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
