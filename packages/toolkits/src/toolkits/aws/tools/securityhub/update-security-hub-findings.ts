import { tool } from 'ai';
import { z } from 'zod';
import { UpdateFindingsCommand } from '@aws-sdk/client-securityhub';
import { createSecurityHubClient } from '../client.js';

export const awsUpdateSecurityHubFindings = tool({
  description: 'Update the status, severity, or other attributes of findings. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    filters: z.record(z.any()).describe('Filters to select findings to update'),
    note: z.record(z.any()).optional().describe('Note to add to the findings'),
    recordState: z.enum(['ACTIVE', 'ARCHIVED']).optional().describe('Update the record state'),
  }),
  execute: async ({ awsCredentials, region, filters, note, recordState }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSecurityHubClient(awsCredentials, region);

      const command = new UpdateFindingsCommand({
          Filters: filters,
          Note: note,
          RecordState: recordState,
      } as any);
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to update the status, severity, or other attributes of findings', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
