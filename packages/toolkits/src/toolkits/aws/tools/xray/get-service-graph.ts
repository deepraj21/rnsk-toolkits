import { tool } from 'ai';
import { z } from 'zod';
import { GetServiceGraphCommand } from '@aws-sdk/client-xray';
import { createXRayClient } from '../client.js';

export const awsGetServiceGraph = tool({
  description: 'Retrieves a document that describes services that process incoming requests, and downstream services that they call as a result. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    startTime: z.string().describe('Start time in ISO 8601 format'),
    endTime: z.string().describe('End time in ISO 8601 format'),
    groupName: z.string().optional().describe('Name of a group based on which you want to filter the service graph'),
    groupARN: z.string().optional().describe('ARN of a group based on which you want to filter the service graph'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, startTime, endTime, groupName, groupARN, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createXRayClient(awsCredentials, region);

      const command = new GetServiceGraphCommand({
          StartTime: new Date(startTime),
          EndTime: new Date(endTime),
          GroupName: groupName,
          GroupARN: groupARN,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  startTime: response.StartTime,
                  endTime: response.EndTime,
                  services: response.Services || [],
                  containsOldGroupVersions: response.ContainsOldGroupVersions,
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to retrieves a document that describes services that process incoming requests, and downstream services that they call as a result', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
