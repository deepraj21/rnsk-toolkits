import { tool } from 'ai';
import { z } from 'zod';
import { GetTemplateSummaryCommand } from '@aws-sdk/client-cloudformation';
import { createCloudFormationClient } from '../client.js';

export const awsGetCloudformationTemplateSummary = tool({
  description: 'Get a summary of a CloudFormation template. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    templateBody: z.string().optional().describe('Template body'),
    templateURL: z.string().optional().describe('URL to template file'),
    stackName: z.string().optional().describe('Stack name (if using existing stack)'),
    stackSetName: z.string().optional().describe('Stack set name (if using existing stack set)'),
  }),
  execute: async ({ awsCredentials, region, templateBody, templateURL, stackName, stackSetName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFormationClient(awsCredentials, region);

      const command = new GetTemplateSummaryCommand({
          TemplateBody: templateBody,
          TemplateURL: templateURL,
          StackName: stackName,
          StackSetName: stackSetName,
      });
      const response = await client.send(command);
      return { summary: response };
    } catch (err) {
      return { error: 'Failed to get a summary of a CloudFormation template', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
