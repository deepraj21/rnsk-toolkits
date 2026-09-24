import { tool } from 'ai';
import { z } from 'zod';
import { RestoreObjectCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsRestoreS3Object = tool({
  description: 'Restore an archived S3 object from Glacier or Deep Archive. Use it to restore data.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    bucket: z.string().describe('The name of the S3 bucket'),
    key: z.string().describe('The key (path) of the object'),
    restoreRequest: z.record(z.any()).describe('Restore request configuration'),
    versionId: z.string().optional().describe('Version ID of the object'),
  }),
  execute: async ({ awsCredentials, region, bucket, key, restoreRequest, versionId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createS3Client(awsCredentials, region);

      const command = new RestoreObjectCommand({ Bucket: bucket, Key: key, RestoreRequest: restoreRequest, VersionId: versionId });
      const response = await client.send(command);
      return { success: true, restoreOutputPath: response.RestoreOutputPath };
    } catch (err) {
      return { error: 'Failed to restore an archived S3 object from Glacier or Deep Archive', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
