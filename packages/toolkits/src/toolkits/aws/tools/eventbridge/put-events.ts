import { tool } from 'ai';
import { z } from 'zod';
import { PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { createEventBridgeClient } from '../client.js';

export const awsPutEventbridgeEvents = tool({
  description: 'Send custom events to EventBridge. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    entries: z.array(z.record(z.any())).describe('Array of events to send (source, detailType, detail, resources, time, eventBusName)'),
  }),
  execute: async ({ awsCredentials, region, entries }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEventBridgeClient(awsCredentials, region);

      const command = new PutEventsCommand({
          Entries: entries.map((entry: any) => ({
              Source: entry.source,
              DetailType: entry.detailType,
              Detail: entry.detail,
              Resources: entry.resources,
              Time: entry.time ? new Date(entry.time) : undefined,
              EventBusName: entry.eventBusName,
              TraceHeader: entry.traceHeader,
          })),
      });
      const response = await client.send(command);
      return {
                  failedEntryCount: response.FailedEntryCount,
                  entries: response.Entries?.map((entry: any) => ({
                      eventId: entry.EventId,
                      errorCode: entry.ErrorCode,
                      errorMessage: entry.ErrorMessage,
                  })) || [],
              };
    } catch (err) {
      return { error: 'Failed to send custom events to EventBridge', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
