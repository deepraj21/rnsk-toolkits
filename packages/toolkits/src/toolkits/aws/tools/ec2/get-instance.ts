import { tool } from 'ai';
import { z } from 'zod';
import { DescribeInstancesCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsGetEc2Instance = tool({
  description: 'Get detailed information about a specific EC2 instance by instance ID.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    instanceId: z.string().describe('The EC2 instance ID (e.g. i-0123456789abcdef0)'),
  }),
  execute: async ({ awsCredentials, region, instanceId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);
      const response = await client.send(new DescribeInstancesCommand({ InstanceIds: [instanceId] }));
      const instance = response.Reservations?.[0]?.Instances?.[0];
      if (!instance) {
        return { error: 'Instance not found', instanceId };
      }
      return {
        instanceId: instance.InstanceId,
        instanceType: instance.InstanceType,
        state: instance.State?.Name,
        privateIpAddress: instance.PrivateIpAddress,
        publicIpAddress: instance.PublicIpAddress,
        launchTime: instance.LaunchTime,
        availabilityZone: instance.Placement?.AvailabilityZone,
        vpcId: instance.VpcId,
        subnetId: instance.SubnetId,
        securityGroups: (instance.SecurityGroups ?? []).map((sg) => ({ id: sg.GroupId, name: sg.GroupName })),
        tags: (instance.Tags ?? []).reduce<Record<string, string>>((acc, tag) => {
          if (tag.Key && tag.Value) acc[tag.Key] = tag.Value;
          return acc;
        }, {}),
      };
    } catch (err) {
      return { error: 'Failed to get EC2 instance', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
