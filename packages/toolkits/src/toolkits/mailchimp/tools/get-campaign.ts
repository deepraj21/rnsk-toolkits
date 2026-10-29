// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mailchimpRequest } from './client.js';

export const mailchimpGetCampaign = tool({
  description:
    'Gets one Mailchimp campaign by id: recipients (audience/segment), settings (subject, from, reply-to), status, and send time.',
  inputSchema: z.object({
    mailchimpApiKey: z
      .string()
      .optional()
      .describe('Mailchimp API key including data-center suffix (injected by system)'),
    campaignId: z.string().describe('Mailchimp campaign id'),
  }),
  execute: async ({ mailchimpApiKey, campaignId }) => {
    const result = await mailchimpRequest(mailchimpApiKey, `/campaigns/${campaignId}`);
    if (result.error) return result;
    return result.data;
  },
});
