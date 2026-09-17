import { tool } from 'ai';
import { z } from 'zod';
import { createMonitoringClient, getProjectId } from '../client.js';

export const gcpGetMonitoringMetrics = tool({
  description:
    'Retrieve Cloud Monitoring time series data for a metric filter (e.g. compute.googleapis.com/instance/cpu/utilization). Use this to check resource health or usage trends.',
  inputSchema: z.object({
    gcpCredentials: z.string().optional().describe('Injected by system; do not provide'),
    filter: z
      .string()
      .describe('Monitoring filter, e.g. \'metric.type="compute.googleapis.com/instance/cpu/utilization"\''),
    startTime: z.string().optional().describe('Start time in ISO 8601 format (default: 1 hour ago)'),
    endTime: z.string().optional().describe('End time in ISO 8601 format (default: now)'),
  }),
  execute: async ({ gcpCredentials, filter, startTime, endTime }) => {
    if (!gcpCredentials) {
      return { error: 'GCP credentials are required. Connect GCP first.' };
    }
    try {
      const client = createMonitoringClient(gcpCredentials);
      const projectId = getProjectId(gcpCredentials);
      const [timeSeries] = await client.listTimeSeries({
        name: `projects/${projectId}`,
        filter,
        interval: {
          startTime: {
            seconds: startTime ? Math.floor(new Date(startTime).getTime() / 1000) : Math.floor(Date.now() / 1000) - 3600,
          },
          endTime: {
            seconds: endTime ? Math.floor(new Date(endTime).getTime() / 1000) : Math.floor(Date.now() / 1000),
          },
        },
        view: 'FULL',
      });
      return {
        timeSeries: (timeSeries ?? []).map((series) => ({
          metric: series.metric,
          resource: series.resource,
          points: (series.points ?? []).map((point) => ({
            value: point.value,
            interval: point.interval,
          })),
        })),
      };
    } catch (err) {
      return {
        error: 'Failed to get Cloud Monitoring metrics',
        message: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  },
});
