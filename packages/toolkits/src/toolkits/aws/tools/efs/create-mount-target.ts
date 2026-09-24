import { tool } from 'ai';
import { z } from 'zod';
import { CreateMountTargetCommand } from '@aws-sdk/client-efs';
import { createEfsClient } from '../client.js';

export const awsCreateEfsMountTarget = tool({
  description: 'Create a mount target for an EFS file system. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    fileSystemId: z.string().describe('The ID of the file system'),
    subnetId: z.string().describe('The ID of the subnet to create the mount target in'),
    ipAddress: z.string().optional().describe('IP address to assign to the mount target'),
    securityGroups: z.array(z.string()).optional().describe('Security group IDs'),
  }),
  execute: async ({ awsCredentials, region, fileSystemId, subnetId, ipAddress, securityGroups }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEfsClient(awsCredentials, region);

      const command = new CreateMountTargetCommand({
          FileSystemId: fileSystemId,
          SubnetId: subnetId,
          IpAddress: ipAddress,
          SecurityGroups: securityGroups,
      });
      const response = await client.send(command);
      return {
                  mountTarget: response,
              };
    } catch (err) {
      return { error: 'Failed to create a mount target for an EFS file system', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
