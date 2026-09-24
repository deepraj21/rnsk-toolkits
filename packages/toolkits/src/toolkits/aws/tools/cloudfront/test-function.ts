import { tool } from 'ai';
import { z } from 'zod';
import { TestFunctionCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsTestCloudfrontFunction = tool({
  description: 'Test a CloudFront function. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('The function name'),
    ifMatch: z.string().describe('The value of the ETag header'),
    stage: z.enum(['DEVELOPMENT', 'LIVE']).describe('Function stage'),
    eventObject: z.string().describe('Event object (JSON string)'),
  }),
  execute: async ({ awsCredentials, region, name, ifMatch, stage, eventObject }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new TestFunctionCommand({
          Name: name,
          IfMatch: ifMatch,
          Stage: stage as any,
          EventObject: Buffer.from(eventObject),
      });
      const response = await client.send(command);
      return {
                  testResult: response.TestResult,
              };
    } catch (err) {
      return { error: 'Failed to test a CloudFront function', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
