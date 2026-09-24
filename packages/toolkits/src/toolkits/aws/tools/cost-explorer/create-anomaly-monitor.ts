import { tool } from 'ai';
import { z } from 'zod';
import { CreateAnomalyMonitorCommand } from '@aws-sdk/client-cost-explorer';
import { createCostExplorerClient } from '../client.js';

export const awsCreateAnomalyMonitor = tool({
  description: 'Creates a new cost anomaly detection monitor. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    monitorName: z.string().describe('The name of the monitor'),
    monitorType: z.enum(['DIMENSIONAL', 'CUSTOM']).describe('The type of monitor'),
    monitorSpecification: z.record(z.any()).optional().describe('The monitor specification'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply to the monitor'),
  }),
  execute: async ({ awsCredentials, region, monitorName, monitorType, monitorSpecification, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCostExplorerClient(awsCredentials, region);

      const command = new CreateAnomalyMonitorCommand({
          AnomalyMonitor: {
              MonitorName: monitorName,
              MonitorType: monitorType,
              MonitorSpecification: monitorSpecification,
          },
          ResourceTags: tags,
      } as any);
      const response = await client.send(command);
      return {
                  monitorArn: response.MonitorArn,
              };
    } catch (err) {
      return { error: 'Failed to creates a new cost anomaly detection monitor', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
