import { tool } from 'ai';
import { z } from 'zod';
import { GetApplicationRevisionCommand } from '@aws-sdk/client-codedeploy';
import { createCodeDeployClient } from '../client.js';

export const awsGetCodedeployApplicationRevision = tool({
  description: 'Get details about an application revision. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    applicationName: z.string().describe('The name of the application'),
    revision: z.enum(['S3', 'GitHub', 'String', 'AppSpecContent']).describe('Information about the revision'),
  }),
  execute: async ({ awsCredentials, region, applicationName, revision }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCodeDeployClient(awsCredentials, region);

      const command = new GetApplicationRevisionCommand({
          applicationName: applicationName,
          revision: revision,
      } as any);
      const response = await client.send(command);
      return {
                  applicationName: response.applicationName,
                  revision: response.revision,
                  revisionInfo: response.revisionInfo,
              };
    } catch (err) {
      return { error: 'Failed to get details about an application revision', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
