import { tool } from 'ai';
import { z } from 'zod';
import { UpdateFindingsFeedbackCommand } from '@aws-sdk/client-guardduty';
import { createGuardDutyClient } from '../client.js';

export const awsUpdateGuarddutyFindingsFeedback = tool({
  description: 'Mark findings as useful or not useful for machine learning. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    detectorId: z.string().describe('Detector ID'),
    findingIds: z.array(z.string()).describe('List of finding IDs to update'),
    feedback: z.enum(['USEFUL', 'NOT_USEFUL']).describe('Feedback for the findings'),
    comments: z.string().optional().describe('Additional comments about the feedback'),
  }),
  execute: async ({ awsCredentials, region, detectorId, findingIds, feedback, comments }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createGuardDutyClient(awsCredentials, region);

      const command = new UpdateFindingsFeedbackCommand({
          DetectorId: detectorId,
          FindingIds: findingIds,
          Feedback: feedback,
          Comments: comments,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to mark findings as useful or not useful for machine learning', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
