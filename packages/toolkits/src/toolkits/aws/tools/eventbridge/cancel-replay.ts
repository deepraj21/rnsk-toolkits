import { tool } from 'ai';
import { z } from 'zod';
import { CancelReplayCommand } from '@aws-sdk/client-eventbridge';
import { createEventBridgeClient } from '../client.js';

export const awsCancelEventbridgeReplay = tool({
  description: 'Cancel an EventBridge replay. Use it to cancel a running operation.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    replayName: z.string().describe('Name of the replay'),
  }),
  execute: async ({ awsCredentials, region, replayName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEventBridgeClient(awsCredentials, region);

      const command = new CancelReplayCommand({
          ReplayName: replayName,
      });
      const response = await client.send(command);
      return {
                  replayArn: response.ReplayArn,
                  state: response.State,
                  stateReason: response.StateReason,
              };
    } catch (err) {
      return { error: 'Failed to cancel an EventBridge replay', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
