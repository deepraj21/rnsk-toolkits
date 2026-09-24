import { tool } from 'ai';
import { z } from 'zod';
import { UpdateEventSourceMappingCommand } from '@aws-sdk/client-lambda';
import { createLambdaClient } from '../client.js';

export const awsUpdateLambdaEventSourceMapping = tool({
  description: 'Update an event source mapping configuration. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    uuid: z.string().describe('UUID of the event source mapping'),
    functionName: z.string().optional().describe('The name of the Lambda function'),
    enabled: z.boolean().optional().describe('Whether the mapping is enabled'),
    batchSize: z.number().optional().describe('Batch size for processing'),
  }),
  execute: async ({ awsCredentials, region, uuid, functionName, enabled, batchSize }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createLambdaClient(awsCredentials, region);

      const command = new UpdateEventSourceMappingCommand({
          UUID: uuid,
          FunctionName: functionName,
          Enabled: enabled,
          BatchSize: batchSize,
      });
      const response = await client.send(command);
      return {
                  uuid: response.UUID,
                  eventSourceArn: response.EventSourceArn,
                  functionArn: response.FunctionArn,
                  state: response.State,
                  stateTransitionReason: response.StateTransitionReason,
                  lastModified: response.LastModified,
                  batchSize: response.BatchSize,
              };
    } catch (err) {
      return { error: 'Failed to update an event source mapping configuration', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
