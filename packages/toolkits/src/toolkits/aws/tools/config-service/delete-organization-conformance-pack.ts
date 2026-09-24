import { tool } from 'ai';
import { z } from 'zod';
import { DeleteOrganizationConformancePackCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsDeleteOrganizationConformancePack = tool({
  description: 'Deletes the specified organization conformance pack. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    organizationConformancePackName: z.string().describe('The name of the organization conformance pack to delete'),
  }),
  execute: async ({ awsCredentials, region, organizationConformancePackName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new DeleteOrganizationConformancePackCommand({
          OrganizationConformancePackName: organizationConformancePackName,
      });
      await client.send(command);
      return {
                  message: 'Organization conformance pack deleted successfully',
                  organizationConformancePackName: organizationConformancePackName,
              };
    } catch (err) {
      return { error: 'Failed to deletes the specified organization conformance pack', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
