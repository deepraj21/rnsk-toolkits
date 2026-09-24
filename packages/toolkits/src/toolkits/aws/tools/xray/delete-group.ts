import { tool } from 'ai';
import { z } from 'zod';
import { DeleteGroupCommand } from '@aws-sdk/client-xray';
import { createXRayClient } from '../client.js';

export const awsDeleteGroup = tool({
  description: 'Deletes a group resource. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    groupName: z.string().optional().describe('The case-sensitive name of the group'),
    groupARN: z.string().optional().describe('The ARN of the group'),
  }),
  execute: async ({ awsCredentials, region, groupName, groupARN }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createXRayClient(awsCredentials, region);

      const command = new DeleteGroupCommand({
          GroupName: groupName,
          GroupARN: groupARN,
      });
      const response = await client.send(command);
      return {
                  success: true,
              };
    } catch (err) {
      return { error: 'Failed to deletes a group resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
