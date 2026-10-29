// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mailchimpRequest } from './client.js';

export const mailchimpCreateCampaign = tool({
  description:
    "Creates a Mailchimp campaign (type 'regular' by default) targeting an audience or segment. Sets subject, from name, reply-to, and title. The created campaign starts in 'save' status — set its content, then send or schedule it.",
  inputSchema: z.object({
    mailchimpApiKey: z
      .string()
      .optional()
      .describe('Mailchimp API key including data-center suffix (injected by system)'),
    listId: z.string().describe('Mailchimp audience (list) id to send to'),
    subjectLine: z.string().describe('Email subject line'),
    title: z.string().describe('Internal campaign title'),
    fromName: z.string().describe('Sender name shown in the inbox'),
    replyTo: z.string().email().describe('Reply-to email address'),
    fromEmail: z
      .string()
      .optional()
      .describe('Sender email address (must be verified; defaults to account sender)'),
    type: z
      .enum(['regular', 'plain_text', 'rss'])
      .optional()
      .describe("Campaign type (default 'regular')"),
    segmentOptions: z
      .record(z.any())
      .optional()
      .describe(
        'Optional segment targeting, e.g. {"match":"any","conditions":[{"condition_type":"EmailAddress","field":"EMAIL","op":"contains","value":"@example.com"}]}',
      ),
  }),
  execute: async ({
    mailchimpApiKey,
    listId,
    subjectLine,
    title,
    fromName,
    replyTo,
    fromEmail,
    type,
    segmentOptions,
  }) => {
    const settings = {
      subject_line: subjectLine,
      title,
      from_name: fromName,
      reply_to: replyTo,
    };
    if (fromEmail !== undefined) settings.from_email = fromEmail;

    const recipients = { list_id: listId };
    if (segmentOptions !== undefined) recipients.segment_opts = segmentOptions;

    const body = {
      type: type ?? 'regular',
      recipients,
      settings,
    };

    const result = await mailchimpRequest(mailchimpApiKey, '/campaigns', {
      method: 'POST',
      body,
    });
    if (result.error) return result;
    return result.data;
  },
});
