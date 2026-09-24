import { tool } from 'ai';
import { z } from 'zod';
import { BatchUpdateFindingsCommand } from '@aws-sdk/client-securityhub';
import { createSecurityHubClient } from '../client.js';

export const awsBatchUpdateFindings = tool({
  description: 'Update multiple findings in a single request. Use it to operate on multiple resources.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    findingIdentifiers: z.array(z.record(z.any())).describe('Array of finding identifiers to update'),
    note: z.record(z.any()).optional().describe('Note to add'),
    severity: z.enum(['INFORMATIONAL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional().describe('Update severity'),
    workflow: z.enum(['NEW', 'NOTIFIED', 'RESOLVED', 'SUPPRESSED']).optional().describe('Update workflow status'),
  }),
  execute: async ({ awsCredentials, region, findingIdentifiers, note, severity, workflow }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSecurityHubClient(awsCredentials, region);

      const command = new BatchUpdateFindingsCommand({
          FindingIdentifiers: findingIdentifiers,
          Note: note,
          Severity: severity,
          Workflow: workflow,
      } as any);
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to update multiple findings in a single request', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
