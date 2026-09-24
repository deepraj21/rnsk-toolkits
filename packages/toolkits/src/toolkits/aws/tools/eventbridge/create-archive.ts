import { tool } from 'ai';
import { z } from 'zod';
import { CreateArchiveCommand } from '@aws-sdk/client-eventbridge';
import { createEventBridgeClient } from '../client.js';

export const awsCreateEventbridgeArchive = tool({
  description: 'Create an EventBridge archive. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    archiveName: z.string().describe('Name of the archive'),
    eventSourceArn: z.string().describe('Event source ARN'),
    description: z.string().optional().describe('Archive description'),
    eventPattern: z.string().optional().describe('Event pattern (JSON string)'),
    retentionDays: z.number().optional().describe('Number of days to retain events'),
  }),
  execute: async ({ awsCredentials, region, archiveName, eventSourceArn, description, eventPattern, retentionDays }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEventBridgeClient(awsCredentials, region);

      const command = new CreateArchiveCommand({
          ArchiveName: archiveName,
          EventSourceArn: eventSourceArn,
          Description: description,
          EventPattern: eventPattern,
          RetentionDays: retentionDays,
      });
      const response = await client.send(command);
      return {
                  archiveArn: response.ArchiveArn,
                  state: response.State,
                  stateReason: response.StateReason,
                  creationTime: response.CreationTime,
              };
    } catch (err) {
      return { error: 'Failed to create an EventBridge archive', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
