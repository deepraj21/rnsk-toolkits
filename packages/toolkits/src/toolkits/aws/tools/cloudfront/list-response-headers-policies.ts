import { tool } from 'ai';
import { z } from 'zod';
import { ListResponseHeadersPoliciesCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsListCloudfrontResponseHeadersPolicies = tool({
  description: 'List all CloudFront response headers policies. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    type: z.string().optional().describe('Policy type filter (managed or custom)'),
    marker: z.string().optional().describe('Token for pagination'),
    maxItems: z.number().optional().describe('Maximum number of policies to return'),
  }),
  execute: async ({ awsCredentials, region, marker, maxItems, type }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new ListResponseHeadersPoliciesCommand({
          Type: type as any,
          Marker: marker,
          MaxItems: maxItems,
      });
      const response = await client.send(command);
      return {
                  responseHeadersPolicyList: response.ResponseHeadersPolicyList,
              };
    } catch (err) {
      return { error: 'Failed to list all CloudFront response headers policies', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
