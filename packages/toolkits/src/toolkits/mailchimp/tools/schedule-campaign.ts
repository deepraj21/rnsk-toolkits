// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mailchimpRequest } from './client.js';

export const mailchimpScheduleCampaign = tool({
  description:
    "Schedules a Mailchimp campaign to send at a future time (ISO-8601 with timezone, e.g. '2024-06-01T14:00:00+00:00'). The campaign must be in 'save' status with content set. Optionally stagger delivery across time zones.",
  inputSchema: z.object({
    mailchimpApiKey: z
      .string()
      .optional()
      .describe('Mailchimp API key including data-center suffix (injected by system)'),
    campaignId: z.string().describe('Mailchimp campaign id to schedule'),
    scheduleTime: z
      .string()
      .describe("Send time as ISO-8601 with offset, e.g. '2024-06-01T09:00:00-05:00'"),
    batchDelivery: z
      .boolean()
      .optional()
      .describe('Stagger delivery across time zones (default false)'),
  }),
  execute: async ({ mailchimpApiKey, campaignId, scheduleTime, batchDelivery }) => {
    const body = { schedule_time: scheduleTime };
    if (batchDelivery !== undefined) body.batch_delivery = batchDelivery;

    const result = await mailchimpRequest(
      mailchimpApiKey,
      `/campaigns/${campaignId}/actions/schedule`,
      { method: 'POST', body },
    );
    if (result.error) return result;
    return { scheduled: true, campaignId, scheduleTime };
  },
});
