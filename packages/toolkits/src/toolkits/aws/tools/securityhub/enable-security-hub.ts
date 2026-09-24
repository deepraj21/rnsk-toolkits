import { tool } from 'ai';
import { z } from 'zod';
import { EnableSecurityHubCommand } from '@aws-sdk/client-securityhub';
import { createSecurityHubClient } from '../client.js';

export const awsEnableSecurityHub = tool({
  description: 'Enable AWS Security Hub in the current region. Use it to enable a feature.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    tags: z.record(z.any()).optional().describe('Tags for Security Hub'),
    enableDefaultStandards: z.boolean().optional().describe('Enable default security standards (CIS, PCI-DSS)'),
    controlFindingGenerator: z.enum(['SECURITY_CONTROL', 'STANDARD_CONTROL']).optional().describe('Method for generating control findings'),
  }),
  execute: async ({ awsCredentials, region, tags, enableDefaultStandards, controlFindingGenerator }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSecurityHubClient(awsCredentials, region);

      const command = new EnableSecurityHubCommand({
          Tags: tags,
          EnableDefaultStandards: enableDefaultStandards,
          ControlFindingGenerator: controlFindingGenerator,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to enable AWS Security Hub in the current region', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
