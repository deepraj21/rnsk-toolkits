import { tool } from 'ai';
import { z } from 'zod';
import { DescribeTrailsCommand } from '@aws-sdk/client-cloudtrail';
import { createCloudTrailClient } from '../client.js';

export const awsDescribeTrails = tool({
  description: 'Retrieves settings for one or more trails. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    trailNameList: z.array(z.string()).optional().describe('List of trail names'),
    includeShadowTrails: z.boolean().optional().describe('Whether to include shadow trails'),
  }),
  execute: async ({ awsCredentials, region, trailNameList, includeShadowTrails }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudTrailClient(awsCredentials, region);

      const command = new DescribeTrailsCommand({
          trailNameList: trailNameList,
          includeShadowTrails: includeShadowTrails,
      });
      const response = await client.send(command);
      return {
                  trailList: response.trailList || [],
              };
    } catch (err) {
      return { error: 'Failed to retrieves settings for one or more trails', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
