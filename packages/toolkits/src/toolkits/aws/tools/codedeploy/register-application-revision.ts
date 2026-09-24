import { tool } from 'ai';
import { z } from 'zod';
import { RegisterApplicationRevisionCommand } from '@aws-sdk/client-codedeploy';
import { createCodeDeployClient } from '../client.js';

export const awsRegisterCodedeployApplicationRevision = tool({
  description: 'Register a new application revision. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    applicationName: z.string().describe('The name of the application'),
    description: z.string().optional().describe('A comment about the revision'),
    revision: z.enum(['S3', 'GitHub', 'String', 'AppSpecContent']).describe('Information about the revision'),
  }),
  execute: async ({ awsCredentials, region, applicationName, description, revision }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeDeployClient(awsCredentials, region);

      const command = new RegisterApplicationRevisionCommand({
          applicationName: applicationName,
          description: description,
          revision: revision,
      } as any);
      await client.send(command);
      return {
                  message: 'Application revision registered successfully',
                  applicationName: applicationName,
              };
    } catch (err) {
      return { error: 'Failed to register a new application revision', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
