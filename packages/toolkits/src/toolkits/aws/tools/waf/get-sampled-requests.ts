import { tool } from 'ai';
import { z } from 'zod';
import { GetSampledRequestsCommand } from '@aws-sdk/client-wafv2';
import { createWafClient } from '../client.js';

export const awsGetSampledRequests = tool({
  description: 'Get sample requests that matched a rule. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    webAclArn: z.string().describe('ARN of the Web ACL'),
    ruleMetricName: z.string().describe('Metric name for the rule'),
    scope: z.enum(['REGIONAL', 'CLOUDFRONT']).describe('Scope'),
    timeWindow: z.record(z.any()).describe('Time window for samples'),
    maxItems: z.number().describe('Maximum number of samples to return (1-500)'),
  }),
  execute: async ({ awsCredentials, region, webAclArn, ruleMetricName, scope, timeWindow, maxItems }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createWafClient(awsCredentials, region);

      const command = new GetSampledRequestsCommand({
          WebAclArn: webAclArn,
          RuleMetricName: ruleMetricName,
          Scope: scope,
          TimeWindow: timeWindow,
          MaxItems: maxItems,
      } as any);
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to get sample requests that matched a rule', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
