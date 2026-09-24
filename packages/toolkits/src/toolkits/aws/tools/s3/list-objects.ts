import { tool } from 'ai';
import { z } from 'zod';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsListS3Objects = tool({
  description: 'List objects in an S3 bucket... Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    bucket: z.string().describe('The name of the S3 bucket'),
  }),
  execute: async ({ awsCredentials, region, bucket }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createS3Client(awsCredentials, region);

      const command = new ListObjectsV2Command({ Bucket: bucket });
      const response = await client.send(command);
      return {
                  objects: response.Contents?.map((o: any) => ({
                      key: o.Key,
                      size: o.Size,
                      lastModified: o.LastModified,
                  })) || [],
              };
    } catch (err) {
      return { error: 'Failed to list objects in an S3 bucket', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
