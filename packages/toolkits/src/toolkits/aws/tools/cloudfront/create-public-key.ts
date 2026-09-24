import { tool } from 'ai';
import { z } from 'zod';
import { CreatePublicKeyCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsCreateCloudfrontPublicKey = tool({
  description: 'Create a CloudFront public key. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    publicKeyConfig: z.record(z.any()).describe('Public key configuration'),
  }),
  execute: async ({ awsCredentials, region, publicKeyConfig }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new CreatePublicKeyCommand({
          PublicKeyConfig: publicKeyConfig,
      } as any);
      const response = await client.send(command);
      return {
                  publicKey: response.PublicKey,
                  location: response.Location,
                  eTag: response.ETag,
              };
    } catch (err) {
      return { error: 'Failed to create a CloudFront public key', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
