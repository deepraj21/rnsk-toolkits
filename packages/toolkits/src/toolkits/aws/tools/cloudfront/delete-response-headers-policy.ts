import { tool } from 'ai';
import { z } from 'zod';
import { DeleteResponseHeadersPolicyCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsDeleteCloudfrontResponseHeadersPolicy = tool({
  description: 'Delete a CloudFront response headers policy. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    id: z.string().describe('The response headers policy ID'),
    ifMatch: z.string().describe('The value of the ETag header'),
  }),
  execute: async ({ awsCredentials, region, id, ifMatch }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new DeleteResponseHeadersPolicyCommand({
          Id: id,
          IfMatch: ifMatch,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Response headers policy ${id} deleted successfully`,
              };
    } catch (err) {
      return { error: 'Failed to delete a CloudFront response headers policy', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
