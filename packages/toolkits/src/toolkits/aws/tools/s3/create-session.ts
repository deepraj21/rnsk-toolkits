import { tool } from 'ai';
import { z } from 'zod';
import { CreateSessionCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsCreateS3Session = tool({
  description: 'Create a session for S3 operations. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    sessionMode: z.string().describe('Session mode (ReadWrite or ReadOnly)'),
    bucket: z.string().describe('The name of the S3 bucket'),
  }),
  execute: async ({ awsCredentials, region, sessionMode, bucket }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createS3Client(awsCredentials, region);

      const command = new CreateSessionCommand({ SessionMode: sessionMode as any, Bucket: bucket });
      const response = await client.send(command);
      return { sessionCredentials: response.Credentials };
    } catch (err) {
      return { error: 'Failed to create a session for S3 operations', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
