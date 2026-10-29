// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mailchimpRequest } from './client.js';

export const mailchimpGetAudience = tool({
  description:
    'Gets one Mailchimp audience (list) by id: name, subscriber counts (total/subscribed/unsubscribed/cleaned), stats, and campaign defaults.',
  inputSchema: z.object({
    mailchimpApiKey: z
      .string()
      .optional()
      .describe('Mailchimp API key including data-center suffix (injected by system)'),
    listId: z.string().describe('Mailchimp audience (list) id, e.g. "a1b2c3d4e5"'),
  }),
  execute: async ({ mailchimpApiKey, listId }) => {
    const result = await mailchimpRequest(mailchimpApiKey, `/lists/${listId}`);
    if (result.error) return result;
    return result.data;
  },
});
