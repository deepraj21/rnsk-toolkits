import { tool } from 'ai';
import { z } from 'zod';
import { PutConformancePackCommand } from '@aws-sdk/client-config-service';
import { createConfigServiceClient } from '../client.js';

export const awsPutConformancePack = tool({
  description: 'Creates or updates a conformance pack. Use it to write data or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    conformancePackName: z.string().describe('The name of the conformance pack'),
    templateS3Uri: z.string().optional().describe('The S3 URI of the conformance pack template'),
    templateBody: z.string().optional().describe('The conformance pack template body'),
    deliveryS3Bucket: z.string().optional().describe('The S3 bucket for delivery of the conformance pack'),
    deliveryS3KeyPrefix: z.string().optional().describe('The S3 key prefix for delivery of the conformance pack'),
    conformancePackInputParameters: z.array(z.record(z.any())).optional().describe('Conformance pack input parameters'),
    tags: z.array(z.record(z.any())).optional().describe('Tags to apply'),
  }),
  execute: async ({ awsCredentials, region, conformancePackName, templateS3Uri, templateBody, deliveryS3Bucket, deliveryS3KeyPrefix, conformancePackInputParameters, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createConfigServiceClient(awsCredentials, region);

      const command = new PutConformancePackCommand({
          ConformancePackName: conformancePackName,
          TemplateS3Uri: templateS3Uri,
          TemplateBody: templateBody,
          DeliveryS3Bucket: deliveryS3Bucket,
          DeliveryS3KeyPrefix: deliveryS3KeyPrefix,
          ConformancePackInputParameters: conformancePackInputParameters,
      } as any);
      const response = await client.send(command);
      return {
                  conformancePackArn: response.ConformancePackArn,
              };
    } catch (err) {
      return { error: 'Failed to creates or updates a conformance pack', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
