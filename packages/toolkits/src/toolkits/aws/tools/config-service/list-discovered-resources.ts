import { tool } from 'ai';
import { z } from 'zod';
import { ListDiscoveredResourcesCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsListDiscoveredResources = tool({
  description: 'Accepts a resource type and returns a list of resource identifiers. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    resourceType: z.string().describe('The type of resources to list'),
    resourceIds: z.array(z.string()).optional().describe('List of resource IDs'),
    resourceName: z.string().optional().describe('The name of the resource'),
    limit: z.number().optional().describe('Maximum number of results to return'),
    includeDeletedResources: z.boolean().optional().describe('Include deleted resources'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, resourceType, resourceIds, resourceName, limit, includeDeletedResources, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new ListDiscoveredResourcesCommand({
          resourceType: resourceType,
          resourceIds: resourceIds,
          resourceName: resourceName,
          limit: limit,
          includeDeletedResources: includeDeletedResources,
          nextToken: nextToken,
      } as any);
      const response = await client.send(command);
      return {
                  resourceIdentifiers: response.resourceIdentifiers || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to accepts a resource type and returns a list of resource identifiers', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
