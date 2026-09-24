import { tool } from 'ai';
import { z } from 'zod';
import { DescribeStorageVirtualMachinesCommand } from '@aws-sdk/client-fsx';
import { createFsxClient } from '../client.js';

export const awsDescribeFsxStorageVirtualMachines = tool({
  description: 'Get details about storage virtual machines. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    storageVirtualMachineIds: z.array(z.string()).optional().describe('List of SVM IDs to describe'),
    filters: z.array(z.record(z.any())).optional().describe('Filters to apply'),
    maxResults: z.number().optional().describe('Maximum number of SVMs to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
  }),
  execute: async ({ awsCredentials, region, storageVirtualMachineIds, filters, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createFsxClient(awsCredentials, region);

      const command = new DescribeStorageVirtualMachinesCommand({
          StorageVirtualMachineIds: storageVirtualMachineIds,
          Filters: filters,
          MaxResults: maxResults,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return {
                  storageVirtualMachines: response.StorageVirtualMachines || [],
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to get details about storage virtual machines', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
