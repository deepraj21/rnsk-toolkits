import { tool } from 'ai';
import { z } from 'zod';
import { ListEventSourceMappingsCommand } from '@aws-sdk/client-lambda';
import { createLambdaClient } from '../client.js';

export const awsListLambdaEventSourceMappings = tool({
  description: 'List event source mappings for a Lambda function. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    functionName: z.string().optional().describe('The name of the Lambda function (optional)'),
    eventSourceArn: z.string().optional().describe('Event source ARN (optional)'),
    marker: z.string().optional().describe('Pagination token'),
    maxItems: z.number().optional().describe('Maximum number of mappings to return'),
  }),
  execute: async ({ awsCredentials, region, functionName, eventSourceArn, marker, maxItems }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createLambdaClient(awsCredentials, region);

      const command = new ListEventSourceMappingsCommand({
          FunctionName: functionName,
          EventSourceArn: eventSourceArn,
          Marker: marker,
          MaxItems: maxItems,
      });
      const response = await client.send(command);
      return {
                  eventSourceMappings: response.EventSourceMappings?.map((m: any) => ({
                      uuid: m.UUID,
                      eventSourceArn: m.EventSourceArn,
                      functionArn: m.FunctionArn,
                      state: m.State,
                      stateTransitionReason: m.StateTransitionReason,
                      lastModified: m.LastModified,
                      batchSize: m.BatchSize,
                      maximumBatchingWindowInSeconds: m.MaximumBatchingWindowInSeconds,
                      parallelizationFactor: m.ParallelizationFactor,
                      eventSourcePosition: m.EventSourcePosition,
                      startingPositionTimestamp: m.StartingPositionTimestamp,
                  })) || [],
                  nextMarker: response.NextMarker,
              };
    } catch (err) {
      return { error: 'Failed to list event source mappings for a Lambda function', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
