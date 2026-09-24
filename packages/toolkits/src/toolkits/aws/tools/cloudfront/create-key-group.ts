import { tool } from 'ai';
import { z } from 'zod';
import { CreateKeyGroupCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsCreateCloudfrontKeyGroup = tool({
  description: 'Create a CloudFront key group. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    keyGroupConfig: z.record(z.any()).describe('Key group configuration'),
  }),
  execute: async ({ awsCredentials, region, keyGroupConfig }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new CreateKeyGroupCommand({
          KeyGroupConfig: keyGroupConfig,
      } as any);
      const response = await client.send(command);
      return {
                  keyGroup: response.KeyGroup,
                  location: response.Location,
                  eTag: response.ETag,
              };
    } catch (err) {
      return { error: 'Failed to create a CloudFront key group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
