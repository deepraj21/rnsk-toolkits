import { tool } from 'ai';
import { z } from 'zod';
import { MonitorInstancesCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsMonitorEc2Instance = tool({
  description: 'Enable detailed monitoring for an EC2 instance. Use it to toggle detailed monitoring.',
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

      const command = new MonitorInstancesCommand({ InstanceIds: [instanceId] });
      const response = await client.send(command);
      return { instanceMonitorings: response.InstanceMonitorings };
    } catch (err) {
      return { error: 'Failed to enable detailed monitoring for an EC2 instance', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
