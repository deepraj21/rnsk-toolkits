import { tool } from 'ai';
import { z } from 'zod';
import { DeleteTagsCommand } from '@aws-sdk/client-ec2';
import { createEc2Client } from '../client.js';

export const awsDeleteEc2Tags = tool({
  description: 'Delete tags from EC2 resources. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resources: z.array(z.string()).describe('Array of resource IDs'),
    tags: z.array(z.any()).optional().describe('Array of tag objects with Key and Value'),
  }),
  execute: async ({ awsCredentials, region, resources, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEc2Client(awsCredentials, region);

      const command = new DeleteTagsCommand({
          Resources: resources,
          Tags: tags,
      });
      await client.send(command);
      return { success: true };
    } catch (err) {
      return { error: 'Failed to delete tags from EC2 resources', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
