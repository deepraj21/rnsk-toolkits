import { tool } from 'ai';
import { z } from 'zod';
import { DeleteConformancePackCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsDeleteConformancePack = tool({
  description: 'Deletes the specified conformance pack. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    conformancePackName: z.string().describe('The name of the conformance pack to delete'),
  }),
  execute: async ({ awsCredentials, region, conformancePackName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new DeleteConformancePackCommand({
          ConformancePackName: conformancePackName,
      });
      await client.send(command);
      return {
                  message: 'Conformance pack deleted successfully',
                  conformancePackName: conformancePackName,
              };
    } catch (err) {
      return { error: 'Failed to deletes the specified conformance pack', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
