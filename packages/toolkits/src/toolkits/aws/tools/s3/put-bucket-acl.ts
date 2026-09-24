import { tool } from 'ai';
import { z } from 'zod';
import { PutBucketAclCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsPutS3BucketAcl = tool({
  description: 'Set the ACL (Access Control List) for an S3 bucket.. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    bucket: z.string().describe('The name of the S3 bucket'),
    acl: z.string().optional().describe('Canned ACL (private, public-read, etc.)'),
    accessControlPolicy: z.record(z.any()).optional().describe('Full ACL policy object'),
  }),
  execute: async ({ awsCredentials, region, bucket, acl, accessControlPolicy }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createS3Client(awsCredentials, region);

      const command = new PutBucketAclCommand({ Bucket: bucket, ACL: acl as any, AccessControlPolicy: accessControlPolicy });
      await client.send(command);
      return { success: true };
    } catch (err) {
      return { error: 'Failed to set the ACL (Access Control List) for an S3 bucket', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
