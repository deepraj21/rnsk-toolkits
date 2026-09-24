import { tool } from 'ai';
import { z } from 'zod';
import { PutObjectLegalHoldCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsPutS3ObjectLegalHold = tool({
  description: 'Set legal hold status for an S3 object. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    bucket: z.string().describe('The name of the S3 bucket'),
    key: z.string().describe('The key (path) of the object'),
    legalHold: z.record(z.any()).describe('Legal hold configuration'),
    versionId: z.string().optional().describe('Version ID of the object'),
  }),
  execute: async ({ awsCredentials, region, bucket, key, legalHold, versionId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createS3Client(awsCredentials, region);

      const command = new PutObjectLegalHoldCommand({ Bucket: bucket, Key: key, LegalHold: legalHold, VersionId: versionId });
      await client.send(command);
      return { success: true };
    } catch (err) {
      return { error: 'Failed to set legal hold status for an S3 object', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
