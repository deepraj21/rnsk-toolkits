import { tool } from 'ai';
import { z } from 'zod';
import { ListConnectionsCommand } from '@aws-sdk/client-eventbridge';
import { createEventBridgeClient } from '../client.js';

export const awsListEventbridgeConnections = tool({
  description: 'List EventBridge connections. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    namePrefix: z.string().optional().describe('Filter by name prefix'),
    connectionState: z.enum(['CREATING', 'UPDATING', 'DELETING', 'AUTHORIZED', 'DEAUTHORIZED', 'AUTHORIZING', 'DEAUTHORIZING']).optional().describe('Filter by connection state'),
    nextToken: z.string().optional().describe('Token for pagination'),
    limit: z.number().optional().describe('Maximum number of connections to return'),
  }),
  execute: async ({ awsCredentials, region, namePrefix, connectionState, nextToken, limit }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEventBridgeClient(awsCredentials, region);

      const command = new ListConnectionsCommand({
          NamePrefix: namePrefix,
          ConnectionState: connectionState as any,
          NextToken: nextToken,
          Limit: limit,
      });
      const response = await client.send(command);
      return {
                  connections: response.Connections || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to list EventBridge connections', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
