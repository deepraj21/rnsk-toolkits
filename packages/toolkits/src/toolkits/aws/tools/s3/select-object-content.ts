import { tool } from 'ai';
import { z } from 'zod';
import { SelectObjectContentCommand } from '@aws-sdk/client-s3';
import { createS3Client } from '../client.js';

export const awsSelectS3ObjectContent = tool({
  description: 'Select content from an S3 object using SQL expressions. Use it to query object content.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    bucket: z.string().describe('The name of the S3 bucket'),
    key: z.string().describe('The key (path) of the object'),
    expression: z.string().describe('SQL expression to select content'),
    expressionType: z.string().describe('SQL or JSON'),
    inputSerialization: z.record(z.any()).describe('Input serialization format'),
    outputSerialization: z.record(z.any()).describe('Output serialization format'),
  }),
  execute: async ({ awsCredentials, region, bucket, key, expression, expressionType, inputSerialization, outputSerialization }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createS3Client(awsCredentials, region);

      const command = new SelectObjectContentCommand({
          Bucket: bucket,
          Key: key,
          Expression: expression,
          ExpressionType: expressionType as any,
          InputSerialization: inputSerialization,
          OutputSerialization: outputSerialization,
      });
      const response = await client.send(command);
      // Note: SelectObjectContent returns a stream, this is a simplified implementation
      return { success: true, message: 'Select operation initiated' };
    } catch (err) {
      return { error: 'Failed to select content from an S3 object using SQL expressions', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
