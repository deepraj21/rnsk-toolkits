import { tool } from 'ai';
import { z } from 'zod';
import { StartInstancesCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsStartEc2Instance = tool({
  description: 'Start a stopped EC2 instance.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region the instance is in (default: us-east-1)'),
    instanceId: z.string().describe('The EC2 instance ID to start'),
  }),
  execute: async ({ awsCredentials, region, instanceId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);
      const response = await client.send(new StartInstancesCommand({ InstanceIds: [instanceId] }));
      const status = response.StartingInstances?.[0];
      return {
        instanceId,
        currentState: status?.CurrentState?.Name,
        previousState: status?.PreviousState?.Name,
      };
    } catch (err) {
      return { error: 'Failed to start EC2 instance', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
