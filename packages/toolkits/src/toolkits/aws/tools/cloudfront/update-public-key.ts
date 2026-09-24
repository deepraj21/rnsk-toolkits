import { tool } from 'ai';
import { z } from 'zod';
import { UpdatePublicKeyCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsUpdateCloudfrontPublicKey = tool({
  description: 'Update a CloudFront public key. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    publicKeyConfig: z.record(z.any()).describe('Public key configuration'),
    id: z.string().describe('The public key ID'),
    ifMatch: z.string().describe('The value of the ETag header'),
  }),
  execute: async ({ awsCredentials, region, publicKeyConfig, id, ifMatch }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new UpdatePublicKeyCommand({
          PublicKeyConfig: publicKeyConfig,
          Id: id,
          IfMatch: ifMatch,
      } as any);
      const response = await client.send(command);
      return {
                  publicKey: response.PublicKey,
                  eTag: response.ETag,
              };
    } catch (err) {
      return { error: 'Failed to update a CloudFront public key', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
