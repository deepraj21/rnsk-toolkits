import { tool } from 'ai';
import { z } from 'zod';
import { ListBucketsCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsListS3Buckets = tool({
  description: 'List all S3 buckets in your AWS account.. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
  }),
  execute: async ({ awsCredentials, region }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createS3Client(awsCredentials, region);

      const command = new ListBucketsCommand({});
      const response = await client.send(command);
      return {
                  buckets: response.Buckets?.map((b: any) => ({
                      name: b.Name,
                      creationDate: b.CreationDate,
                  })) || [],
              };
    } catch (err) {
      return { error: 'Failed to list all S3 buckets in your AWS account', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
