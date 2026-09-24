import { tool } from 'ai';
import { z } from 'zod';
import { ListLayersCommand } from '@aws-sdk/client-lambda';
import { createLambdaClient } from '../client.js';

export const awsListLambdaLayers = tool({
  description: 'List Lambda layers. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    compatibleRuntime: z.string().optional().describe('Filter by compatible runtime (optional)'),
    marker: z.string().optional().describe('Pagination token'),
    maxItems: z.number().optional().describe('Maximum number of layers to return'),
  }),
  execute: async ({ awsCredentials, region, compatibleRuntime, marker, maxItems }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createLambdaClient(awsCredentials, region);

      const command = new ListLayersCommand({
          CompatibleRuntime: compatibleRuntime as any,
          Marker: marker,
          MaxItems: maxItems,
      });
      const response = await client.send(command);
      return {
                  layers: response.Layers?.map((l: any) => ({
                      layerName: l.LayerName,
                      layerArn: l.LayerArn,
                      latestMatchingVersion: l.LatestMatchingVersion,
                  })) || [],
                  nextMarker: response.NextMarker,
              };
    } catch (err) {
      return { error: 'Failed to list Lambda layers', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
