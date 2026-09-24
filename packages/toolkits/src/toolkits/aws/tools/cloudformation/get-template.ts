import { tool } from 'ai';
import { z } from 'zod';
import { GetTemplateCommand } from '@aws-sdk/client-cloudformation';
import { createCloudFormationClient } from '../client.js';

export const awsGetCloudformationTemplate = tool({
  description: 'Get the template for a CloudFormation stack. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    stackName: z.string().describe('The name of the stack'),
    changeSetName: z.string().optional().describe('Name of the change set (optional)'),
    templateStage: z.string().optional().describe('Template stage: Original or Processed'),
  }),
  execute: async ({ awsCredentials, region, stackName, changeSetName, templateStage }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudFormationClient(awsCredentials, region);

      const command = new GetTemplateCommand({
          StackName: stackName,
          ChangeSetName: changeSetName,
          TemplateStage: templateStage as any,
      });
      const response = await client.send(command);
      return { templateBody: response.TemplateBody, stagesAvailable: response.StagesAvailable };
    } catch (err) {
      return { error: 'Failed to get the template for a CloudFormation stack', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
