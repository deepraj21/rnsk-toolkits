import { tool } from 'ai';
import { z } from 'zod';
import { CreateDetectorCommand } from '@aws-sdk/client-guardduty';
import { createGuardDutyClient } from '../client.js';

export const awsCreateGuarddutyDetector = tool({
  description: 'Create a GuardDuty detector to enable threat detection. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    enable: z.boolean().optional().describe('Enable the detector immediately'),
    findingPublishingFrequency: z.enum(['FIFTEEN_MINUTES', 'ONE_HOUR', 'SIX_HOURS']).optional().describe('Frequency of notifications about findings'),
    dataSources: z.record(z.any()).optional().describe('Configure data sources for the detector'),
    tags: z.record(z.any()).optional().describe('Tags for the detector'),
  }),
  execute: async ({ awsCredentials, region, enable, findingPublishingFrequency, dataSources, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createGuardDutyClient(awsCredentials, region);

      const command = new CreateDetectorCommand({
          Enable: enable ?? true,
          FindingPublishingFrequency: findingPublishingFrequency,
          DataSources: dataSources,
          Tags: tags,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to create a GuardDuty detector to enable threat detection', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
