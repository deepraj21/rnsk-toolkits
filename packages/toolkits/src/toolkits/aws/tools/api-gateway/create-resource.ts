import { tool } from 'ai';
import { z } from 'zod';
import { CreateResourceCommand } from '@aws-sdk/client-api-gateway';
import { createApiGatewayClient } from '../client.js';

export const awsCreateResource = tool({
  description: 'Creates a Resource resource. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    restApiId: z.string().describe('The string identifier of the associated RestApi'),
    parentId: z.string().describe('The parent resource\'s identifier'),
    pathPart: z.string().optional().describe('The last path segment for this Resource resource'),
  }),
  execute: async ({ awsCredentials, region, restApiId, parentId, pathPart }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createApiGatewayClient(awsCredentials, region);

      const command = new CreateResourceCommand({
          restApiId: restApiId,
          parentId: parentId,
          pathPart: pathPart,
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
      return { error: 'Failed to creates a Resource resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
