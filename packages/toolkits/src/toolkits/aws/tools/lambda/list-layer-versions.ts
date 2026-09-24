import { tool } from 'ai';
import { z } from 'zod';
import { ListLayerVersionsCommand } from '@aws-sdk/client-lambda';
import { createLambdaClient } from '../client.js';

export const awsListLambdaLayerVersions = tool({
  description: 'List versions of a Lambda layer. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    layerName: z.string().describe('The name of the layer'),
    compatibleRuntime: z.string().optional().describe('Filter by compatible runtime (optional)'),
    marker: z.string().optional().describe('Pagination token'),
    maxItems: z.number().optional().describe('Maximum number of versions to return'),
  }),
  execute: async ({ awsCredentials, region, layerName, compatibleRuntime, marker, maxItems }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createLambdaClient(awsCredentials, region);

      const command = new ListLayerVersionsCommand({
          LayerName: layerName,
          CompatibleRuntime: compatibleRuntime as any,
          Marker: marker,
          MaxItems: maxItems,
      });
      const response = await client.send(command);
      return {
                  layerVersions: response.LayerVersions?.map((lv: any) => ({
                      layerVersionArn: lv.LayerVersionArn,
                      version: lv.Version,
                      description: lv.Description,
                      createdDate: lv.CreatedDate,
                      compatibleRuntimes: lv.CompatibleRuntimes,
                      licenseInfo: lv.LicenseInfo,
                      compatibleArchitectures: lv.CompatibleArchitectures,
                  })) || [],
                  nextMarker: response.NextMarker,
              };
    } catch (err) {
      return { error: 'Failed to list versions of a Lambda layer', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
