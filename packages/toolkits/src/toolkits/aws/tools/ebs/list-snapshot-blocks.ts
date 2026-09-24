import { tool } from 'ai';
import { z } from 'zod';
import { ListSnapshotBlocksCommand } from '@aws-sdk/client-ebs';
import { createEbsClient } from '../client.js';

export const awsListEbsSnapshotBlocks = tool({
  description: 'List all blocks in a snapshot. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    snapshotId: z.string().describe('The ID of the snapshot'),
    maxResults: z.number().optional().describe('Maximum number of blocks to return'),
    nextToken: z.string().optional().describe('Token for pagination'),
    startingBlockIndex: z.number().optional().describe('The block index to start listing from'),
  }),
  execute: async ({ awsCredentials, region, snapshotId, maxResults, nextToken, startingBlockIndex }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEbsClient(awsCredentials, region);

      const command = new ListSnapshotBlocksCommand({
          SnapshotId: snapshotId,
          MaxResults: maxResults,
          NextToken: nextToken,
          StartingBlockIndex: startingBlockIndex,
      });
      const response = await client.send(command);
      return {
                  blocks: response.Blocks?.map((block: any) => ({
                      blockIndex: block.BlockIndex,
                      blockToken: block.BlockToken,
                  })) || [],
                  expiryTime: response.ExpiryTime,
                  volumeSize: response.VolumeSize,
                  blockSize: response.BlockSize,
                  nextToken: response.NextToken,
              };
    } catch (err) {
      return { error: 'Failed to list all blocks in a snapshot', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
