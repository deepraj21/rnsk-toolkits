import { tool } from 'ai';
import { z } from 'zod';
import { CreateEventSourceMappingCommand } from '@aws-sdk/client-lambda';
import { createLambdaClient } from '../client.js';

export const awsCreateLambdaEventSourceMapping = tool({
  description: 'Create an event source mapping for a Lambda function. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    functionName: z.string().describe('The name of the Lambda function'),
    eventSourceArn: z.string().describe('Event source ARN (e.g., DynamoDB stream, Kinesis stream)'),
    enabled: z.boolean().optional().describe('Whether the mapping is enabled'),
    batchSize: z.number().optional().describe('Batch size for processing'),
    startingPosition: z.string().optional().describe('Starting position (LATEST, TRIM_HORIZON, AT_TIMESTAMP)'),
    startingPositionTimestamp: z.number().optional().describe('Timestamp for AT_TIMESTAMP (optional)'),
  }),
  execute: async ({ awsCredentials, region, functionName, eventSourceArn, enabled, batchSize, startingPosition, startingPositionTimestamp }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createLambdaClient(awsCredentials, region);

      const command = new CreateEventSourceMappingCommand({
          FunctionName: functionName,
          EventSourceArn: eventSourceArn,
          Enabled: enabled,
          BatchSize: batchSize,
          StartingPosition: startingPosition as any,
          StartingPositionTimestamp: startingPositionTimestamp ? new Date(startingPositionTimestamp) : undefined,
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
      return { error: 'Failed to create an event source mapping for a Lambda function', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
