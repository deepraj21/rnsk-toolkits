import { tool } from 'ai';
import { z } from 'zod';
import { ListDirectoryBucketsCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsListS3DirectoryBuckets = tool({
  description: 'List S3 directory buckets. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    continuationToken: z.string().optional().describe('Continuation token for pagination'),
    maxDirectoryBuckets: z.number().optional().describe('Maximum number of buckets to return'),
  }),
  execute: async ({ awsCredentials, region, continuationToken, maxDirectoryBuckets }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createS3Client(awsCredentials, region);

      const command = new ListDirectoryBucketsCommand({ ContinuationToken: continuationToken, MaxDirectoryBuckets: maxDirectoryBuckets });
      const response = await client.send(command);
      return { buckets: response.Buckets, continuationToken: response.ContinuationToken };
    } catch (err) {
      return { error: 'Failed to list S3 directory buckets', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
