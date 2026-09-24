import { tool } from 'ai';
import { z } from 'zod';
import { CreateEventDataStoreCommand } from '@aws-sdk/client-cloudtrail';
import { createCloudTrailClient } from '../client.js';

export const awsCreateEventDataStore = tool({
  description: 'Creates a new event data store. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    name: z.string().describe('The name of the event data store'),
    advancedEventSelectors: z.array(z.record(z.any())).optional().describe('Advanced event selectors'),
    multiRegionEnabled: z.boolean().optional().describe('Whether to enable multi-region'),
    organizationEnabled: z.boolean().optional().describe('Whether to enable organization'),
    retentionPeriod: z.number().optional().describe('Retention period in days'),
    terminationProtectionEnabled: z.boolean().optional().describe('Whether to enable termination protection'),
    kmsKeyId: z.string().optional().describe('KMS key ID for encryption'),
    tagsList: z.array(z.record(z.any())).optional().describe('List of tags'),
  }),
  execute: async ({ awsCredentials, region, name, advancedEventSelectors, multiRegionEnabled, organizationEnabled, retentionPeriod, terminationProtectionEnabled, kmsKeyId, tagsList }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudTrailClient(awsCredentials, region);

      const command = new CreateEventDataStoreCommand({
          Name: name,
          AdvancedEventSelectors: advancedEventSelectors,
          MultiRegionEnabled: multiRegionEnabled,
          OrganizationEnabled: organizationEnabled,
          RetentionPeriod: retentionPeriod,
          TerminationProtectionEnabled: terminationProtectionEnabled,
          KmsKeyId: kmsKeyId,
          TagsList: tagsList,
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
      return { error: 'Failed to creates a new event data store', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
