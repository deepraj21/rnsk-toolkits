import { tool } from 'ai';
import { z } from 'zod';
import { PutOrganizationConformancePackCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsPutOrganizationConformancePack = tool({
  description: 'Deploys conformance packs across member accounts in an AWS Organization. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    organizationConformancePackName: z.string().describe('The name of the organization conformance pack'),
    templateS3Uri: z.string().optional().describe('The S3 URI of the conformance pack template'),
    templateBody: z.string().optional().describe('The conformance pack template body'),
    deliveryS3Bucket: z.string().optional().describe('The S3 bucket for delivery of the conformance pack'),
    deliveryS3KeyPrefix: z.string().optional().describe('The S3 key prefix for delivery of the conformance pack'),
    conformancePackInputParameters: z.array(z.record(z.any())).optional().describe('Conformance pack input parameters'),
    excludedAccounts: z.array(z.string()).optional().describe('List of excluded accounts'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply'),
  }),
  execute: async ({ awsCredentials, region, organizationConformancePackName, templateS3Uri, templateBody, deliveryS3Bucket, deliveryS3KeyPrefix, conformancePackInputParameters, excludedAccounts, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new PutOrganizationConformancePackCommand({
          OrganizationConformancePackName: organizationConformancePackName,
          TemplateS3Uri: templateS3Uri,
          TemplateBody: templateBody,
          DeliveryS3Bucket: deliveryS3Bucket,
          DeliveryS3KeyPrefix: deliveryS3KeyPrefix,
          ConformancePackInputParameters: conformancePackInputParameters,
          ExcludedAccounts: excludedAccounts,
      } as any);
      const response = await client.send(command);
      return {
                  organizationConformancePackArn: response.OrganizationConformancePackArn,
              };
    } catch (err) {
      return { error: 'Failed to deploys conformance packs across member accounts in an AWS Organization', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
