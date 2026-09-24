import { tool } from 'ai';
import { z } from 'zod';
import { ListAttributesCommand } from '@aws-sdk/client-ecs';
import { createEcsClient } from '../client.js';

export const awsListEcsAttributes = tool({
  description: 'List attributes for a resource. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    cluster: z.string().optional().describe('The name of the cluster'),
    targetType: z.enum(['container-instance']).describe('Target type (container-instance)'),
    attributeName: z.string().optional().describe('Filter by attribute name'),
    attributeValue: z.string().optional().describe('Filter by attribute value'),
    maxResults: z.number().optional().describe('Maximum number of attributes to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, cluster, targetType, attributeName, attributeValue, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEcsClient(awsCredentials, region);

      const command = new ListAttributesCommand({
          cluster: cluster,
          targetType: targetType as any,
          attributeName: attributeName,
          attributeValue: attributeValue,
          maxResults: maxResults,
          nextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  attributes: response.attributes || [],
                  nextToken: response.nextToken,
              };
    } catch (err) {
      return { error: 'Failed to list attributes for a resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
