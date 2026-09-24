import { tool } from 'ai';
import { z } from 'zod';
import { DeleteAlarmsCommand } from '@aws-sdk/client-cloudwatch';
import { createCloudWatchClient } from '../client.js';

export const awsDeleteCloudwatchAlarms = tool({
  description: 'Delete one or more CloudWatch alarms. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    alarmNames: z.array(z.string()).describe('Array of alarm names to delete'),
  }),
  execute: async ({ awsCredentials, region, alarmNames }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudWatchClient(awsCredentials, region);

      const command = new DeleteAlarmsCommand({
          AlarmNames: alarmNames,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Alarms deleted successfully: ${alarmNames.join(', ')}`,
              };
    } catch (err) {
      return { error: 'Failed to delete one or more CloudWatch alarms', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
