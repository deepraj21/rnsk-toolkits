import { tool } from 'ai';
import { z } from 'zod';
import { GetInsightImpactGraphCommand } from '@aws-sdk/client-xray';
import { createXRayClient } from '../client.js';

export const awsGetInsightImpactGraph = tool({
  description: 'Retrieves a service graph structure filtered by the insight. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    insightId: z.string().describe('The insight unique identifier'),
    startTime: z.string().describe('Start time in ISO 8601 format'),
    endTime: z.string().describe('End time in ISO 8601 format'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, insightId, startTime, endTime, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createXRayClient(awsCredentials, region);

      const command = new GetInsightImpactGraphCommand({
          InsightId: insightId,
          StartTime: new Date(startTime),
          EndTime: new Date(endTime),
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  insightId: response.InsightId,
                  startTime: response.StartTime,
                  endTime: response.EndTime,
                  serviceGraphStartTime: response.ServiceGraphStartTime,
                  serviceGraphEndTime: response.ServiceGraphEndTime,
                  services: response.Services || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to retrieves a service graph structure filtered by the insight', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
