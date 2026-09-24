import { tool } from 'ai';
import { z } from 'zod';
import { UpdateFunctionCodeCommand } from '@aws-sdk/client-lambda';
import { createLambdaClient } from '../client.js';

export const awsUpdateLambdaFunctionCode = tool({
  description: 'Update the code of a Lambda function.. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    functionName: z.string().describe('The name of the Lambda function'),
    zipFile: z.string().optional().describe('Base64-encoded zip file content'),
    s3Bucket: z.string().optional().describe('S3 bucket name containing the deployment package'),
    s3Key: z.string().optional().describe('S3 key of the deployment package'),
    s3ObjectVersion: z.string().optional().describe('S3 object version (optional)'),
    publish: z.boolean().optional().describe('Whether to publish a new version after update'),
  }),
  execute: async ({ awsCredentials, region, functionName, zipFile, s3Bucket, s3Key, s3ObjectVersion, publish }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createLambdaClient(awsCredentials, region);

      const command = new UpdateFunctionCodeCommand({
          FunctionName: functionName,
          ZipFile: zipFile ? Buffer.from(zipFile, 'base64') : undefined,
          S3Bucket: s3Bucket,
          S3Key: s3Key,
          S3ObjectVersion: s3ObjectVersion,
          Publish: publish,
      });
      const response = await client.send(command);
      return {
                  functionName: response.FunctionName,
                  functionArn: response.FunctionArn,
                  runtime: response.Runtime,
                  role: response.Role,
                  handler: response.Handler,
                  codeSize: response.CodeSize,
                  description: response.Description,
                  timeout: response.Timeout,
                  memorySize: response.MemorySize,
                  lastModified: response.LastModified,
                  codeSha256: response.CodeSha256,
                  version: response.Version,
                  state: response.State,
                  lastUpdateStatus: response.LastUpdateStatus,
              };
    } catch (err) {
      return { error: 'Failed to update the code of a Lambda function', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
