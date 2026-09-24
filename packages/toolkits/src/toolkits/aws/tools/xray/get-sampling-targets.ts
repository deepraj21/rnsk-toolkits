import { tool } from 'ai';
import { z } from 'zod';
import { GetSamplingTargetsCommand } from '@aws-sdk/client-xray';
import { createXRayClient } from '../client.js';

export const awsGetSamplingTargets = tool({
  description: 'Retrieves a document that describes the current sampling targets for the sampling rules. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    samplingStatisticsDocuments: z.array(z.record(z.any())).describe('Array of sampling statistics documents'),
  }),
  execute: async ({ awsCredentials, region, samplingStatisticsDocuments }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createXRayClient(awsCredentials, region);

      const command = new GetSamplingTargetsCommand({
          SamplingStatisticsDocuments: samplingStatisticsDocuments,
      } as any);
      const response = await client.send(command);
      return {
                  samplingTargetDocuments: response.SamplingTargetDocuments || [],
                  lastRuleModification: response.LastRuleModification,
                  unprocessedStatistics: response.UnprocessedStatistics || [],
              };
    } catch (err) {
      return { error: 'Failed to retrieves a document that describes the current sampling targets for the sampling rules', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
