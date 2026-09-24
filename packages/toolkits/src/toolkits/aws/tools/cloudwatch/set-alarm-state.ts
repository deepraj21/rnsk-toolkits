import { tool } from 'ai';
import { z } from 'zod';
import { SetAlarmStateCommand } from '@aws-sdk/client-cloudwatch';
import { createCloudWatchClient } from '../client.js';

export const awsSetAlarmState = tool({
  description: 'Temporarily set the state of a CloudWatch alarm. Use it to change the state or configuration of the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    alarmName: z.string().describe('The name of the alarm'),
    stateValue: z.string().describe('State value (OK, ALARM, INSUFFICIENT_DATA)'),
    stateReason: z.string().describe('Reason for the state change'),
    stateReasonData: z.string().optional().describe('JSON string with reason data (optional)'),
  }),
  execute: async ({ awsCredentials, region, alarmName, stateValue, stateReason, stateReasonData }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudWatchClient(awsCredentials, region);

      const command = new SetAlarmStateCommand({
          AlarmName: alarmName,
          StateValue: stateValue as any,
          StateReason: stateReason,
          StateReasonData: stateReasonData,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Alarm ${alarmName} state set to ${stateValue}`,
              };
    } catch (err) {
      return { error: 'Failed to temporarily set the state of a CloudWatch alarm', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
