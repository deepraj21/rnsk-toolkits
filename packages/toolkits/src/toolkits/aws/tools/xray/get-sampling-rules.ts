import { tool } from 'ai';
import { z } from 'zod';
import { GetSamplingRulesCommand } from '@aws-sdk/client-xray';
import { createXRayClient } from '../client.js';

export const awsGetSamplingRules = tool({
  description: 'Retrieves all sampling rules. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createXRayClient(awsCredentials, region);

      const command = new GetSamplingRulesCommand({
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  samplingRuleRecords: response.SamplingRuleRecords || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to retrieves all sampling rules', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
