import { tool } from 'ai';
import { z } from 'zod';
import { ModifyMountTargetSecurityGroupsCommand } from '@aws-sdk/client-efs';
import { createEfsClient } from '../client.js';

export const awsModifyEfsMountTargetSecurityGroups = tool({
  description: 'Modify security groups for a mount target. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    mountTargetId: z.string().describe('The ID of the mount target'),
    securityGroups: z.array(z.string()).describe('List of security group IDs'),
  }),
  execute: async ({ awsCredentials, region, mountTargetId, securityGroups }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEfsClient(awsCredentials, region);

      const command = new ModifyMountTargetSecurityGroupsCommand({
          MountTargetId: mountTargetId,
          SecurityGroups: securityGroups,
      });
      await client.send(command);
      return {
                  message: 'Security groups updated successfully',
                  mountTargetId: mountTargetId,
              };
    } catch (err) {
      return { error: 'Failed to modify security groups for a mount target', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
