import { tool } from 'ai';
import { z } from 'zod';
import { ListKeyGroupsCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsListCloudfrontKeyGroups = tool({
  description: 'List all CloudFront key groups. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    marker: z.string().optional().describe('Token for pagination'),
    maxItems: z.number().optional().describe('Maximum number of key groups to return'),
  }),
  execute: async ({ awsCredentials, region, marker, maxItems }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new ListKeyGroupsCommand({
          Marker: marker,
          MaxItems: maxItems,
      });
      const response = await client.send(command);
      return {
                  keyGroupList: response.KeyGroupList,
              };
    } catch (err) {
      return { error: 'Failed to list all CloudFront key groups', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
