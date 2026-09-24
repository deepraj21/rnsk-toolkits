import { tool } from 'ai';
import { z } from 'zod';
import { BatchGetTracesCommand } from '@aws-sdk/client-xray';
import { createXRayClient } from '../client.js';

export const awsBatchGetTraces = tool({
  description: 'Retrieves a list of traces specified by ID. Each trace is a collection of segment documents that originates from a single request. Use it to operate on multiple resources.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    traceIds: z.array(z.string()).describe('Array of trace IDs to retrieve'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, traceIds, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createXRayClient(awsCredentials, region);

      const command = new BatchGetTracesCommand({
          TraceIds: traceIds,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  traces: response.Traces || [],
                  unprocessedTraceIds: response.UnprocessedTraceIds || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to retrieves a list of traces specified by ID. Each trace is a collection of segment documents that originates from a single request', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
