import { tool } from 'ai';
import { z } from 'zod';
import { GetTraceGraphCommand } from '@aws-sdk/client-xray';
import { createXRayClient } from '../client.js';

export const awsGetTraceGraph = tool({
  description: 'Retrieves a service graph for one or more specific trace IDs. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    traceIds: z.array(z.string()).describe('Array of trace IDs'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, traceIds, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createXRayClient(awsCredentials, region);

      const command = new GetTraceGraphCommand({
          TraceIds: traceIds,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  services: response.Services || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to retrieves a service graph for one or more specific trace IDs', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
