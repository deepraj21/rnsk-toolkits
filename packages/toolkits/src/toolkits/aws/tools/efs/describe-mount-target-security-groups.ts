import { tool } from 'ai';
import { z } from 'zod';
import { DescribeMountTargetSecurityGroupsCommand } from '@aws-sdk/client-efs';
import { createEfsClient } from '../client.js';

export const awsDescribeEfsMountTargetSecurityGroups = tool({
  description: 'Get security groups for a mount target. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    mountTargetId: z.string().describe('The ID of the mount target'),
  }),
  execute: async ({ awsCredentials, region, mountTargetId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEfsClient(awsCredentials, region);

      const command = new DescribeMountTargetSecurityGroupsCommand({
          MountTargetId: mountTargetId,
      });
      const response = await client.send(command);
      return {
                  securityGroups: response.SecurityGroups || [],
              };
    } catch (err) {
      return { error: 'Failed to get security groups for a mount target', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
