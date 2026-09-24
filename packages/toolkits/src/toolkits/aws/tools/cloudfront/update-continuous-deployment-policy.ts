import { tool } from 'ai';
import { z } from 'zod';
import { UpdateContinuousDeploymentPolicyCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsUpdateCloudfrontContinuousDeploymentPolicy = tool({
  description: 'Update a CloudFront continuous deployment policy. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    continuousDeploymentPolicyConfig: z.record(z.any()).describe('Continuous deployment policy configuration'),
    id: z.string().describe('The continuous deployment policy ID'),
    ifMatch: z.string().describe('The value of the ETag header'),
  }),
  execute: async ({ awsCredentials, region, continuousDeploymentPolicyConfig, id, ifMatch }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new UpdateContinuousDeploymentPolicyCommand({
          ContinuousDeploymentPolicyConfig: continuousDeploymentPolicyConfig,
          Id: id,
          IfMatch: ifMatch,
      } as any);
      const response = await client.send(command);
      return {
                  continuousDeploymentPolicy: response.ContinuousDeploymentPolicy,
                  eTag: response.ETag,
              };
    } catch (err) {
      return { error: 'Failed to update a CloudFront continuous deployment policy', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
