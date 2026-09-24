import { tool } from 'ai';
import { z } from 'zod';
import { DeleteFunctionCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsDeleteCloudfrontFunction = tool({
  description: 'Delete a CloudFront function. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('The function name'),
    ifMatch: z.string().describe('The value of the ETag header'),
  }),
  execute: async ({ awsCredentials, region, name, ifMatch }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new DeleteFunctionCommand({
          Name: name,
          IfMatch: ifMatch,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Function ${name} deleted successfully`,
              };
    } catch (err) {
      return { error: 'Failed to delete a CloudFront function', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
