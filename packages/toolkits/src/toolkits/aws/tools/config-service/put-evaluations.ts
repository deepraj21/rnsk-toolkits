import { tool } from 'ai';
import { z } from 'zod';
import { PutEvaluationsCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsPutEvaluations = tool({
  description: 'Used by an AWS Lambda function to deliver evaluation results to Config. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    evaluations: z.enum(['COMPLIANT', 'NON_COMPLIANT', 'NOT_APPLICABLE', 'INSUFFICIENT_DATA']).describe('List of evaluation results'),
    resultToken: z.string().describe('An encrypted token that associates an evaluation with an Config rule'),
    testMode: z.boolean().optional().describe('Use this parameter to specify whether Config stores the evaluation'),
  }),
  execute: async ({ awsCredentials, region, evaluations, resultToken, testMode }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new PutEvaluationsCommand({
          Evaluations: evaluations,
          ResultToken: resultToken,
          TestMode: testMode,
      } as any);
      const response = await client.send(command);
      return {
                  failedEvaluations: response.FailedEvaluations || [],
              };
    } catch (err) {
      return { error: 'Failed to used by an AWS Lambda function to deliver evaluation results to Config', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
