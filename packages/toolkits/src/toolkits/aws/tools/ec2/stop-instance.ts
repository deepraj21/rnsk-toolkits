import { tool } from 'ai';
import { z } from 'zod';
import { StopInstancesCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsStopEc2Instance = tool({
  description: 'Stop a running EC2 instance.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region the instance is in (default: us-east-1)'),
    instanceId: z.string().describe('The EC2 instance ID to stop'),
  }),
  execute: async ({ awsCredentials, region, instanceId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);
      const response = await client.send(new StopInstancesCommand({ InstanceIds: [instanceId] }));
      const status = response.StoppingInstances?.[0];
      return {
        instanceId,
        currentState: status?.CurrentState?.Name,
        previousState: status?.PreviousState?.Name,
      };
    } catch (err) {
      return { error: 'Failed to stop EC2 instance', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
