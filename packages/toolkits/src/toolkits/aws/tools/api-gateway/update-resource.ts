import { tool } from 'ai';
import { z } from 'zod';
import { UpdateResourceCommand } from '@aws-sdk/client-api-gateway';
import { createApiGatewayClient } from '../client.js';

export const awsUpdateResource = tool({
  description: 'Changes information about a Resource resource. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    restApiId: z.string().describe('The string identifier of the associated RestApi'),
    resourceId: z.string().describe('The identifier for the Resource resource'),
    patchOperations: z.array(z.record(z.any())).describe('A list of update operations (op, path, value, from) to apply'),
  }),
  execute: async ({ awsCredentials, region, restApiId, resourceId, patchOperations }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createApiGatewayClient(awsCredentials, region);

      const command = new UpdateResourceCommand({
          restApiId: restApiId,
          resourceId: resourceId,
          patchOperations: patchOperations,
      } as any);
      const response = await client.send(command);
      return {
                  id: response.id,
                  parentId: response.parentId,
                  pathPart: response.pathPart,
                  path: response.path,
                  resourceMethods: response.resourceMethods,
              };
    } catch (err) {
      return { error: 'Failed to changes information about a Resource resource', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
