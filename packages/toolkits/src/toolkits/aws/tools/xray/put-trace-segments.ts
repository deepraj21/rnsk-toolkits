import { tool } from 'ai';
import { z } from 'zod';
import { PutTraceSegmentsCommand } from '@aws-sdk/client-xray';
import { createXRayClient } from '../client.js';

export const awsPutTraceSegments = tool({
  description: 'Uploads segment documents to AWS X-Ray. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    traceSegmentDocuments: z.array(z.string()).describe('Array of trace segment documents (JSON strings)'),
  }),
  execute: async ({ awsCredentials, region, traceSegmentDocuments }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createXRayClient(awsCredentials, region);

      const command = new PutTraceSegmentsCommand({
          TraceSegmentDocuments: traceSegmentDocuments,
      });
      const response = await client.send(command);
      return {
                  unprocessedTraceSegments: response.UnprocessedTraceSegments || [],
              };
    } catch (err) {
      return { error: 'Failed to uploads segment documents to AWS X-Ray', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
