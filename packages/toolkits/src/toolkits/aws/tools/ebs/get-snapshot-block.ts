import { tool } from 'ai';
import { z } from 'zod';
import { GetSnapshotBlockCommand } from '@aws-sdk/client-ebs';
import { createEbsClient } from '../client.js';

export const awsGetEbsSnapshotBlock = tool({
  description: 'Get a block of data from a snapshot. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    snapshotId: z.string().describe('The ID of the snapshot'),
    blockIndex: z.number().describe('The block index (0-based)'),
    blockToken: z.string().describe('The token obtained from ListSnapshotBlocks'),
  }),
  execute: async ({ awsCredentials, region, snapshotId, blockIndex, blockToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEbsClient(awsCredentials, region);

      const command = new GetSnapshotBlockCommand({
          SnapshotId: snapshotId,
          BlockIndex: blockIndex,
          BlockToken: blockToken,
      });
      const response = await client.send(command);
      
      // Convert stream to base64 string
      let blockData: string | null = null;
      if (response.BlockData) {
          // Handle the streaming blob payload
          const chunks: Uint8Array[] = [];
          const reader = response.BlockData.transformToWebStream().getReader();
          
          try {
              while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;
                  if (value) {
                      chunks.push(value);
                  }
              }
              
              // Combine all chunks into a single Uint8Array
              const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
              const combined = new Uint8Array(totalLength);
              let offset = 0;
              for (const chunk of chunks) {
                  combined.set(chunk, offset);
                  offset += chunk.length;
              }
              
              blockData = Buffer.from(combined).toString('base64');
          } catch (error) {
              // If stream reading fails, return null for blockData
              blockData = null;
          }
      }
      
      return {
                  dataLength: response.DataLength,
                  blockData: blockData,
                  checksum: response.Checksum,
                  checksumAlgorithm: response.ChecksumAlgorithm,
              };
    } catch (err) {
      return { error: 'Failed to get a block of data from a snapshot', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
