import { tool } from 'ai';
import { z } from 'zod';
import { RebootInstancesCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsRebootEc2Instance = tool({
  description: 'Reboot an EC2 instance. Use it to restart a running instance.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    instanceId: z.string().describe('The ID of the EC2 instance'),
  }),
  execute: async ({ awsCredentials, region, instanceId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new RebootInstancesCommand({ InstanceIds: [instanceId] });
      await client.send(command);
      return { success: true };
    } catch (err) {
      return { error: 'Failed to reboot an EC2 instance', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
