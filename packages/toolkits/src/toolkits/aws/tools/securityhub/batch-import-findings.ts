import { tool } from 'ai';
import { z } from 'zod';
import { BatchImportFindingsCommand } from '@aws-sdk/client-securityhub';
import { createSecurityHubClient } from '../client.js';

export const awsBatchImportFindings = tool({
  description: 'Import custom findings into Security Hub. Use it to operate on multiple resources.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    findings: z.array(z.record(z.any())).describe('Array of finding objects to import (up to 100)'),
  }),
  execute: async ({ awsCredentials, region, findings }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSecurityHubClient(awsCredentials, region);

      const command = new BatchImportFindingsCommand({
          Findings: findings,
      } as any);
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to import custom findings into Security Hub', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
