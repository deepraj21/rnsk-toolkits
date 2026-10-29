// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mailchimpRequest } from './client.js';

export const mailchimpSendCampaign = tool({
  description:
    "Sends a Mailchimp campaign immediately to its audience. The campaign must be in 'save' status with content set. Use scheduleCampaign instead to pick a future send time. This delivers real email — confirm before sending.",
  inputSchema: z.object({
    mailchimpApiKey: z
      .string()
      .optional()
      .describe('Mailchimp API key including data-center suffix (injected by system)'),
    campaignId: z.string().describe('Mailchimp campaign id to send now'),
  }),
  execute: async ({ mailchimpApiKey, campaignId }) => {
    const result = await mailchimpRequest(
      mailchimpApiKey,
      `/campaigns/${campaignId}/actions/send`,
      { method: 'POST', body: {} },
    );
    if (result.error) return result;
    return { sent: true, campaignId };
  },
});
