import { tool } from 'ai';
import { z } from 'zod';
import { DisassociateAccessPolicyCommand } from '@aws-sdk/client-eks';
import { createEksClient } from '../client.js';

export const awsDisassociateEksAccessPolicy = tool({
  description: 'Disassociate an access policy from an access entry. Use it to disconnect resources.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    clusterName: z.string().describe('The name of the cluster'),
    principalArn: z.string().describe('The principal ARN'),
    policyArn: z.string().describe('The policy ARN'),
  }),
  execute: async ({ awsCredentials, region, clusterName, principalArn, policyArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEksClient(awsCredentials, region);

      const command = new DisassociateAccessPolicyCommand({
          clusterName: clusterName,
          principalArn: principalArn,
          policyArn: policyArn,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Access policy ${policyArn} disassociated successfully from access entry ${principalArn}`,
              };
    } catch (err) {
      return { error: 'Failed to disassociate an access policy from an access entry', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
