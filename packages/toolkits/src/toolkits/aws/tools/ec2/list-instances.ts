import { tool } from 'ai';
import { z } from 'zod';
import { DescribeInstancesCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsListEc2Instances = tool({
  description:
    'List EC2 instances in the connected AWS account, optionally filtered by instance state. Returns instance ID, type, state, IPs, and tags.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    stateFilter: z
      .enum(['pending', 'running', 'shutting-down', 'terminated', 'stopping', 'stopped'])
      .optional()
      .describe('Only return instances in this state'),
    maxResults: z.number().min(5).max(1000).optional().describe('Maximum number of instances to return'),
  }),
  execute: async ({ awsCredentials, region, stateFilter, maxResults }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);
      const response = await client.send(
        new DescribeInstancesCommand({
          Filters: stateFilter ? [{ Name: 'instance-state-name', Values: [stateFilter] }] : undefined,
          MaxResults: maxResults,
        }),
      );
      const instances = (response.Reservations ?? []).flatMap((reservation) =>
        (reservation.Instances ?? []).map((instance) => ({
          instanceId: instance.InstanceId,
          instanceType: instance.InstanceType,
          state: instance.State?.Name,
          privateIpAddress: instance.PrivateIpAddress,
          publicIpAddress: instance.PublicIpAddress,
          launchTime: instance.LaunchTime,
          tags: (instance.Tags ?? []).reduce<Record<string, string>>((acc, tag) => {
            if (tag.Key && tag.Value) acc[tag.Key] = tag.Value;
            return acc;
          }, {}),
        })),
      );
      return { count: instances.length, instances };
    } catch (err) {
      return { error: 'Failed to list EC2 instances', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
