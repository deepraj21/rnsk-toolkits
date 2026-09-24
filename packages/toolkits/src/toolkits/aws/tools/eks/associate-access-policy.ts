import { tool } from 'ai';
import { z } from 'zod';
import { AssociateAccessPolicyCommand } from '@aws-sdk/client-eks';
import { createEksClient } from '../client.js';

export const awsAssociateEksAccessPolicy = tool({
  description: 'Associate an access policy with an access entry. Use it to connect resources.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    clusterName: z.string().describe('The name of the cluster'),
    principalArn: z.string().describe('The principal ARN'),
    policyArn: z.string().describe('The policy ARN'),
    accessScope: z.record(z.any()).describe('Access scope'),
  }),
  execute: async ({ awsCredentials, region, clusterName, principalArn, policyArn, accessScope }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createEksClient(awsCredentials, region);

      const command = new AssociateAccessPolicyCommand({
          clusterName: clusterName,
          principalArn: principalArn,
          policyArn: policyArn,
          accessScope: accessScope,
      });
      const response = await client.send(command);
      return {
                  associatedAccessPolicy: response.associatedAccessPolicy,
              };
    } catch (err) {
      return { error: 'Failed to associate an access policy with an access entry', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
