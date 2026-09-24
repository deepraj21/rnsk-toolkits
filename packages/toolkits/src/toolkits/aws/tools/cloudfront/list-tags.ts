import { tool } from 'ai';
import { z } from 'zod';
import { ListTagsForResourceCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsListCloudfrontTags = tool({
  description: 'List tags for a CloudFront resource. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resource: z.string().describe('The ARN of the resource'),
  }),
  execute: async ({ awsCredentials, region, resource }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new ListTagsForResourceCommand({
          Resource: resource,
      });
      const response = await client.send(command);
      return {
                  tags: response.Tags,
              };
    } catch (err) {
      return { error: 'Failed to list tags for a CloudFront resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
