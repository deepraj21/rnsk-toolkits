import { tool } from 'ai';
import { z } from 'zod';
import { TagResourceCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsTagCloudfrontResource = tool({
  description: 'Add tags to a CloudFront resource. Use it to label the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resource: z.string().describe('The ARN of the resource'),
    tags: z.record(z.any()).describe('Tags to apply (key-value pairs)'),
  }),
  execute: async ({ awsCredentials, region, resource, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new TagResourceCommand({
          Resource: resource,
          Tags: tags,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Tags added successfully to resource ${resource}`,
              };
    } catch (err) {
      return { error: 'Failed to add tags to a CloudFront resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
