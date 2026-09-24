import { tool } from 'ai';
import { z } from 'zod';
import { UpdateKeyGroupCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsUpdateCloudfrontKeyGroup = tool({
  description: 'Update a CloudFront key group. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    keyGroupConfig: z.record(z.any()).describe('Key group configuration'),
    id: z.string().describe('The key group ID'),
    ifMatch: z.string().describe('The value of the ETag header'),
  }),
  execute: async ({ awsCredentials, region, keyGroupConfig, id, ifMatch }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new UpdateKeyGroupCommand({
          KeyGroupConfig: keyGroupConfig,
          Id: id,
          IfMatch: ifMatch,
      } as any);
      const response = await client.send(command);
      return {
                  keyGroup: response.KeyGroup,
                  eTag: response.ETag,
              };
    } catch (err) {
      return { error: 'Failed to update a CloudFront key group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
