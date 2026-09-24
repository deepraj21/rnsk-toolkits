import { tool } from 'ai';
import { z } from 'zod';
import { RunInstancesCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsCreateEc2Instance = tool({
  description: 'Launch a new EC2 instance. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    imageId: z.string().describe('The AMI ID (e.g., ami-0c55b159cbfafe1f0)'),
    instanceType: z.string().describe('The instance type (e.g., t2.micro)'),
    keyName: z.string().optional().describe('The name of the key pair'),
    minCount: z.number().optional().describe('Minimum number of instances to launch'),
    maxCount: z.number().optional().describe('Maximum number of instances to launch'),
    securityGroupIds: z.array(z.string()).optional().describe('Security group IDs'),
    subnetId: z.string().optional().describe('Subnet ID'),
  }),
  execute: async ({ awsCredentials, region, imageId, instanceType, keyName, minCount, maxCount, securityGroupIds, subnetId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new RunInstancesCommand({
          ImageId: imageId,
          InstanceType: instanceType as any,
          MinCount: minCount || 1,
          MaxCount: maxCount || 1,
          KeyName: keyName,
          SecurityGroupIds: securityGroupIds,
          SubnetId: subnetId,
      });
      const response = await client.send(command);
      return {
                  success: true,
                  instances: response.Instances?.map((i: any) => ({
                      instanceId: i.InstanceId,
                      instanceType: i.InstanceType,
                      state: i.State?.Name,
                  })),
              };
    } catch (err) {
      return { error: 'Failed to launch a new EC2 instance', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
