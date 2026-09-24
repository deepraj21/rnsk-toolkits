import { tool } from 'ai';
import { z } from 'zod';
import { GetEventDataStoreCommand } from '@aws-sdk/client-cloudtrail';
import { createCloudTrailClient } from '../client.js';

export const awsGetEventDataStore = tool({
  description: 'Returns information about an event data store. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    eventDataStore: z.string().describe('The ARN or ID of the event data store'),
  }),
  execute: async ({ awsCredentials, region, eventDataStore }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudTrailClient(awsCredentials, region);

      const command = new GetEventDataStoreCommand({
          EventDataStore: eventDataStore,
      });
      const response = await client.send(command);
      return {
                  eventDataStoreArn: response.EventDataStoreArn,
                  name: response.Name,
                  status: response.Status,
                  advancedEventSelectors: response.AdvancedEventSelectors,
                  multiRegionEnabled: response.MultiRegionEnabled,
                  organizationEnabled: response.OrganizationEnabled,
                  retentionPeriod: response.RetentionPeriod,
                  terminationProtectionEnabled: response.TerminationProtectionEnabled,
                  createdTimestamp: response.CreatedTimestamp,
                  updatedTimestamp: response.UpdatedTimestamp,
              };
    } catch (err) {
      return { error: 'Failed to returns information about an event data store', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
