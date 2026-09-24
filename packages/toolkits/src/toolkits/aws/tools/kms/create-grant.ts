import { tool } from 'ai';
import { z } from 'zod';
import { CreateGrantCommand } from '@aws-sdk/client-kms';
import { createKmsClient } from '../client.js';

export const awsCreateGrant = tool({
  description: 'Create a grant that allows a principal to use a KMS key. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    keyId: z.string().describe('Key ID or ARN'),
    granteePrincipal: z.string().describe('ARN of the principal that can use the grant'),
    operations: z.enum(['Decrypt', 'Encrypt', 'GenerateDataKey', 'GenerateDataKeyWithoutPlaintext', 'ReEncryptFrom', 'ReEncryptTo', 'Sign', 'Verify', 'GetPublicKey', 'CreateGrant', 'RetireGrant', 'DescribeKey', 'GenerateDataKeyPair', 'GenerateDataKeyPairWithoutPlaintext', 'GenerateMac', 'VerifyMac']).describe('List of operations the grant permits'),
    retiringPrincipal: z.string().optional().describe('ARN of principal that can retire the grant'),
    name: z.string().optional().describe('Friendly name for the grant'),
  }),
  execute: async ({ awsCredentials, region, keyId, granteePrincipal, operations, retiringPrincipal, name }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createKmsClient(awsCredentials, region);

      const command = new CreateGrantCommand({
          KeyId: keyId,
          GranteePrincipal: granteePrincipal,
          Operations: operations,
          RetiringPrincipal: retiringPrincipal,
          Name: name,
      } as any);
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to create a grant that allows a principal to use a KMS key', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
