import { tool } from 'ai';
import { z } from 'zod';
import { UntagResourceCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsUntagCloudfrontResource = tool({
  description: 'Remove tags from a CloudFront resource. Use it to remove tags from the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resource: z.string().describe('The ARN of the resource'),
    tagKeys: z.array(z.string()).describe('List of tag keys to remove'),
  }),
  execute: async ({ awsCredentials, region, resource, tagKeys }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new UntagResourceCommand({
          Resource: resource,
          TagKeys: {
              Items: tagKeys,
          },
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Tags removed successfully from resource ${resource}`,
              };
    } catch (err) {
      return { error: 'Failed to remove tags from a CloudFront resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
