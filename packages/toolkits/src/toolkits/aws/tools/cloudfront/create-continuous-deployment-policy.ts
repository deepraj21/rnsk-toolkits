import { tool } from 'ai';
import { z } from 'zod';
import { CreateContinuousDeploymentPolicyCommand } from '@aws-sdk/client-cloudfront';
import { createCloudFrontClient } from '../client.js';

export const awsCreateCloudfrontContinuousDeploymentPolicy = tool({
  description: 'Create a CloudFront continuous deployment policy. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    continuousDeploymentPolicyConfig: z.record(z.any()).describe('Continuous deployment policy configuration'),
  }),
  execute: async ({ awsCredentials, region, continuousDeploymentPolicyConfig }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFrontClient(awsCredentials, region);

      const command = new CreateContinuousDeploymentPolicyCommand({
          ContinuousDeploymentPolicyConfig: continuousDeploymentPolicyConfig,
      } as any);
      const response = await client.send(command);
      return {
                  continuousDeploymentPolicy: response.ContinuousDeploymentPolicy,
                  location: response.Location,
                  eTag: response.ETag,
              };
    } catch (err) {
      return { error: 'Failed to create a CloudFront continuous deployment policy', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
