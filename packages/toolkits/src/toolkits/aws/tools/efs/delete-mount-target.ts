import { tool } from 'ai';
import { z } from 'zod';
import { DeleteMountTargetCommand } from '@aws-sdk/client-efs';
import { createEfsClient } from '../client.js';

export const awsDeleteEfsMountTarget = tool({
  description: 'Delete a mount target. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    mountTargetId: z.string().describe('The ID of the mount target to delete'),
  }),
  execute: async ({ awsCredentials, region, mountTargetId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEfsClient(awsCredentials, region);

      const command = new DeleteMountTargetCommand({
          MountTargetId: mountTargetId,
      });
      await client.send(command);
      return {
                  message: 'Mount target deleted successfully',
                  mountTargetId: mountTargetId,
              };
    } catch (err) {
      return { error: 'Failed to delete a mount target', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
