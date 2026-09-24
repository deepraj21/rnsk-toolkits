import { tool } from 'ai';
import { z } from 'zod';
import { PutBucketReplicationCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsPutS3BucketReplication = tool({
  description: 'Set the replication configuration for an S3 bucket.. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    bucket: z.string().describe('The name of the S3 bucket'),
    replicationConfiguration: z.record(z.any()).describe('Replication configuration object'),
  }),
  execute: async ({ awsCredentials, region, bucket, replicationConfiguration }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createS3Client(awsCredentials, region);

      const command = new PutBucketReplicationCommand({ Bucket: bucket, ReplicationConfiguration: replicationConfiguration as any });
      await client.send(command);
      return { success: true };
    } catch (err) {
      return { error: 'Failed to set the replication configuration for an S3 bucket', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
