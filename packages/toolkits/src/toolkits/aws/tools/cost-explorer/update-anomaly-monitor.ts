import { tool } from 'ai';
import { z } from 'zod';
import { UpdateAnomalyMonitorCommand } from '@aws-sdk/client-cost-explorer';
import { createCostExplorerClient } from '../client.js';

export const awsUpdateAnomalyMonitor = tool({
  description: 'Updates an existing cost anomaly monitor. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    monitorArn: z.string().describe('The ARN of the monitor'),
    monitorName: z.string().optional().describe('The name of the monitor'),
  }),
  execute: async ({ awsCredentials, region, monitorArn, monitorName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCostExplorerClient(awsCredentials, region);

      const command = new UpdateAnomalyMonitorCommand({
          MonitorArn: monitorArn,
          MonitorName: monitorName,
      });
      const response = await client.send(command);
      return {
                  monitorArn: response.MonitorArn,
              };
    } catch (err) {
      return { error: 'Failed to updates an existing cost anomaly monitor', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
