// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mailchimpRequest } from './client.js';

export const mailchimpSetCampaignContent = tool({
  description:
    'Sets the HTML and/or plain-text content of a Mailchimp campaign. Provide an HTML body with Merge Tags like *|FNAME|* for personalization. Required before sending or scheduling a newly created campaign.',
  inputSchema: z.object({
    mailchimpApiKey: z
      .string()
      .optional()
      .describe('Mailchimp API key including data-center suffix (injected by system)'),
    campaignId: z.string().describe('Mailchimp campaign id'),
    html: z.string().optional().describe('HTML email body, e.g. "<p>Hi *|FNAME|*, welcome!</p>"'),
    plainText: z.string().optional().describe('Plain-text fallback body'),
    templateId: z.number().optional().describe('Saved template id to use instead of raw html'),
  }),
  execute: async ({ mailchimpApiKey, campaignId, html, plainText, templateId }) => {
    const body = {};
    if (html !== undefined) body.html = html;
    if (plainText !== undefined) body.plain_text = plainText;
    if (templateId !== undefined) body.template_id = templateId;

    const result = await mailchimpRequest(mailchimpApiKey, `/campaigns/${campaignId}/content`, {
      method: 'PUT',
      body,
    });
    if (result.error) return result;
    return result.data;
  },
});
