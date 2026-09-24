import { tool } from 'ai';
import { z } from 'zod';
import { ListChangedBlocksCommand } from '@aws-sdk/client-ebs';
import { createEbsClient } from '../client.js';

export const awsListEbsChangedBlocks = tool({
  description: 'List blocks that have changed between two snapshots. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    firstSnapshotId: z.string().describe('The ID of the first snapshot'),
    secondSnapshotId: z.string().describe('The ID of the second snapshot'),
    maxResults: z.number().optional().describe('Maximum number of blocks to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
    startingBlockIndex: z.number().optional().describe('The block index to start listing from'),
  }),
  execute: async ({ awsCredentials, region, firstSnapshotId, secondSnapshotId, maxResults, nextToken, startingBlockIndex }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEbsClient(awsCredentials, region);

      const command = new ListChangedBlocksCommand({
          FirstSnapshotId: firstSnapshotId,
          SecondSnapshotId: secondSnapshotId,
          MaxResults: maxResults,
          NextToken: nextToken,
          StartingBlockIndex: startingBlockIndex,
      });
      const response = await client.send(command);
      return {
                  changedBlocks: response.ChangedBlocks?.map((block: any) => ({
                      blockIndex: block.BlockIndex,
                      firstBlockToken: block.FirstBlockToken,
                      secondBlockToken: block.SecondBlockToken,
                  })) || [],
                  expiryTime: response.ExpiryTime,
                  volumeSize: response.VolumeSize,
                  blockSize: response.BlockSize,
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to list blocks that have changed between two snapshots', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
