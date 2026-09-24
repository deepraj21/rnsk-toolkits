import { tool } from 'ai';
import { z } from 'zod';
import { ValidateTemplateCommand } from '@aws-sdk/client-cloudformation';
import { createCloudFormationClient } from '../client.js';

export const awsValidateCloudformationTemplate = tool({
  description: 'Validate a CloudFormation template. Use it to validate a template or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    templateBody: z.string().optional().describe('Template body'),
    templateURL: z.string().optional().describe('URL to template file'),
  }),
  execute: async ({ awsCredentials, region, templateBody, templateURL }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFormationClient(awsCredentials, region);

      const command = new ValidateTemplateCommand({
          TemplateBody: templateBody,
          TemplateURL: templateURL,
      });
      const response = await client.send(command);
      return { validated: true, description: response.Description, parameters: response.Parameters, capabilities: response.Capabilities };
    } catch (err) {
      return { error: 'Failed to validate a CloudFormation template', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
