// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mailchimpRequest } from './client.js';

export const mailchimpGetCampaignReport = tool({
  description:
    'Gets the performance report for a sent Mailchimp campaign: open rate, click rate, unsubscribes, bounces, and list size. Only available once the campaign has been sent.',
  inputSchema: z.object({
    mailchimpApiKey: z
      .string()
      .optional()
      .describe('Mailchimp API key including data-center suffix (injected by system)'),
    campaignId: z.string().describe('Mailchimp campaign id (must have been sent)'),
  }),
  execute: async ({ mailchimpApiKey, campaignId }) => {
    const result = await mailchimpRequest(mailchimpApiKey, `/reports/${campaignId}`);
    if (result.error) return result;

    const r = result.data ?? {};
    return {
      campaignId,
      subjectLine: r.subject_line,
      sendTime: r.send_time,
      emailsSent: r.emails_sent,
      totalOpens: r.opens?.unique_opens ?? r.unique_opens,
      openRate: r.open_rate,
      uniqueClicks: r.clicks?.unique_clicks ?? r.unique_clicks,
      clickRate: r.click_rate,
      unsubscribes: r.unsubscribed,
      bounces: {
        hard: r.hard_bounces,
        soft: r.soft_bounces,
      },
      listStats: r.list_id ? { listId: r.list_id } : undefined,
      raw: r,
    };
  },
});
