import { tool } from 'ai';
import { z } from 'zod';
import { LookupEventsCommand } from '@aws-sdk/client-cloudtrail';
import { createCloudTrailClient } from '../client.js';

export const awsLookupEvents = tool({
  description: 'Looks up management events or CloudTrail Insights events that are captured by CloudTrail. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    lookupAttributes: z.array(z.record(z.any())).optional().describe('Attribute key (EventId, EventName, Username, ResourceType, ResourceName)'),
    startTime: z.string().optional().describe('Start time in ISO 8601 format'),
    endTime: z.string().optional().describe('End time in ISO 8601 format'),
    eventCategory: z.string().optional().describe('Event category'),
    maxResults: z.number().optional().describe('Maximum number of results to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, lookupAttributes, startTime, endTime, eventCategory, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudTrailClient(awsCredentials, region);

      const command = new LookupEventsCommand({
          LookupAttributes: lookupAttributes,
          StartTime: startTime ? new Date(startTime) : undefined,
          EndTime: endTime ? new Date(endTime) : undefined,
          EventCategory: eventCategory,
          MaxResults: maxResults,
          NextToken: nextToken,
      } as any);
      const response = await client.send(command);
      return {
                  events: response.Events || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to looks up management events or CloudTrail Insights events that are captured by CloudTrail', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
