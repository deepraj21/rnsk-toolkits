import { tool } from 'ai';
import { z } from 'zod';
import { DetachNetworkInterfaceCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsDetachEc2NetworkInterface = tool({
  description: 'Detach a network interface from an instance. Use it to disconnect resources.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    attachmentId: z.string().describe('Attachment ID'),
    force: z.boolean().optional().describe('Force detachment'),
  }),
  execute: async ({ awsCredentials, region, attachmentId, force }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new DetachNetworkInterfaceCommand({
          AttachmentId: attachmentId,
          Force: force,
      });
      await client.send(command);
      return { success: true };
    } catch (err) {
      return { error: 'Failed to detach a network interface from an instance', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
