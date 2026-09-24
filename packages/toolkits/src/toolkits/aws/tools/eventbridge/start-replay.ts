import { tool } from 'ai';
import { z } from 'zod';
import { StartReplayCommand } from '@aws-sdk/client-eventbridge';
import { createEventBridgeClient } from '../client.js';

export const awsStartEventbridgeReplay = tool({
  description: 'Start an EventBridge replay. Use it to start a stopped resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    replayName: z.string().describe('Name of the replay'),
    description: z.string().optional().describe('Replay description'),
    eventSourceArn: z.string().describe('Event source ARN'),
    eventStartTime: z.string().describe('Start time (ISO 8601)'),
    eventEndTime: z.string().describe('End time (ISO 8601)'),
    destination: z.record(z.any()).describe('Replay destination'),
  }),
  execute: async ({ awsCredentials, region, replayName, description, eventSourceArn, eventStartTime, eventEndTime, destination }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEventBridgeClient(awsCredentials, region);

      const command = new StartReplayCommand({
          ReplayName: replayName,
          Description: description,
          EventSourceArn: eventSourceArn,
          EventStartTime: new Date(eventStartTime),
          EventEndTime: new Date(eventEndTime),
          Destination: destination,
      } as any);
      const response = await client.send(command);
      return {
                  replayArn: response.ReplayArn,
                  state: response.State,
                  stateReason: response.StateReason,
                  replayStartTime: response.ReplayStartTime,
              };
    } catch (err) {
      return { error: 'Failed to start an EventBridge replay', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
