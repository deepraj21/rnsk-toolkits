import { tool } from 'ai';
import { z } from 'zod';
import { WriteGetObjectResponseCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsWriteS3GetObjectResponse = tool({
  description: 'Write a response to a GetObject request (used with S3 Object Lambda)',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    requestRoute: z.string().describe('Route token for the request'),
    requestToken: z.string().describe('Request token for the request'),
    body: z.string().optional().describe('Response body content'),
    statusCode: z.number().optional().describe('HTTP status code'),
  }),
  execute: async ({ awsCredentials, region, requestRoute, requestToken, body, statusCode }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createS3Client(awsCredentials, region);

      const command = new WriteGetObjectResponseCommand({
          RequestRoute: requestRoute,
          RequestToken: requestToken,
          Body: body,
          StatusCode: statusCode,
      });
      await client.send(command);
      return { success: true };
    } catch (err) {
      return { error: 'Failed to write a response to a GetObject request (used with S3 Object Lambda)', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
