import { tool } from 'ai';
import { z } from 'zod';
import { UpdateEventDataStoreCommand } from '@aws-sdk/client-cloudtrail';
import { createCloudTrailClient } from '../client.js';

export const awsUpdateEventDataStore = tool({
  description: 'Updates an event data store. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    eventDataStore: z.string().describe('The ARN or ID of the event data store'),
    name: z.string().optional().describe('The updated name of the event data store'),
    advancedEventSelectors: z.array(z.record(z.any())).optional().describe('Advanced event selectors'),
    multiRegionEnabled: z.boolean().optional().describe('Whether to enable multi-region'),
    organizationEnabled: z.boolean().optional().describe('Whether to enable organization'),
    retentionPeriod: z.number().optional().describe('Retention period in days'),
    terminationProtectionEnabled: z.boolean().optional().describe('Whether to enable termination protection'),
    kmsKeyId: z.string().optional().describe('KMS key ID for encryption'),
  }),
  execute: async ({ awsCredentials, region, eventDataStore, name, advancedEventSelectors, multiRegionEnabled, organizationEnabled, retentionPeriod, terminationProtectionEnabled, kmsKeyId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudTrailClient(awsCredentials, region);

      const command = new UpdateEventDataStoreCommand({
          EventDataStore: eventDataStore,
          Name: name,
          AdvancedEventSelectors: advancedEventSelectors,
          MultiRegionEnabled: multiRegionEnabled,
          OrganizationEnabled: organizationEnabled,
          RetentionPeriod: retentionPeriod,
          TerminationProtectionEnabled: terminationProtectionEnabled,
          KmsKeyId: kmsKeyId,
      } as any);
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
      return { error: 'Failed to updates an event data store', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
