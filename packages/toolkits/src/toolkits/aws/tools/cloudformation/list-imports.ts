import { tool } from 'ai';
import { z } from 'zod';
import { ListImportsCommand } from '@aws-sdk/client-cloudformation';
import { createCloudFormationClient } from '../client.js';

export const awsListCloudformationImports = tool({
  description: 'List CloudFormation imports for an export. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    exportName: z.string().describe('Name of the export'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, exportName, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFormationClient(awsCredentials, region);

      const command = new ListImportsCommand({
          ExportName: exportName,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return { imports: response.Imports, nextToken: response.NextToken };
    } catch (err) {
      return { error: 'Failed to list CloudFormation imports for an export', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
