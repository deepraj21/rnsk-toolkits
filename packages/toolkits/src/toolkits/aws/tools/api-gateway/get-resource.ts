import { tool } from 'ai';
import { z } from 'zod';
import { GetResourceCommand } from '@aws-sdk/client-api-gateway';
import { createApiGatewayClient } from '../client.js';

export const awsGetResource = tool({
  description: 'Lists information about a Resource resource. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    restApiId: z.string().describe('The string identifier of the associated RestApi'),
    resourceId: z.string().describe('The identifier for the Resource resource'),
    embed: z.array(z.string()).optional().describe('A query parameter to retrieve the resource methods'),
  }),
  execute: async ({ awsCredentials, region, restApiId, resourceId, embed }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createApiGatewayClient(awsCredentials, region);

      const command = new GetResourceCommand({
          restApiId: restApiId,
          resourceId: resourceId,
          embed: embed,
      });
      const response = await client.send(command);
      return {
                  id: response.id,
                  parentId: response.parentId,
                  pathPart: response.pathPart,
                  path: response.path,
                  resourceMethods: response.resourceMethods,
              };
    } catch (err) {
      return { error: 'Failed to lists information about a Resource resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
