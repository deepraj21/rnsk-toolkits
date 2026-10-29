// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mailchimpRequest } from './client.js';

export const mailchimpAddMember = tool({
  description:
    'Adds a new member (contact) to a Mailchimp audience. Requires email and status. Use status "subscribed" only when the person opted in, "pending" for double opt-in confirmation, or "transactional" for non-marketing contacts.',
  inputSchema: z.object({
    mailchimpApiKey: z
      .string()
      .optional()
      .describe('Mailchimp API key including data-center suffix (injected by system)'),
    listId: z.string().describe('Mailchimp audience (list) id'),
    email: z.string().email().describe("Member's email address"),
    status: z
      .enum(['subscribed', 'unsubscribed', 'pending', 'transactional'])
      .describe(
        'Subscription status: subscribed (opted in), pending (awaiting double opt-in), unsubscribed, or transactional',
      ),
    firstName: z.string().optional().describe('First name (merge field FNAME)'),
    lastName: z.string().optional().describe('Last name (merge field LNAME)'),
    mergeFields: z
      .record(z.any())
      .optional()
      .describe('Merge field values object, e.g. {"FNAME":"Ada","PHONE":"555-1234"}'),
    tags: z
      .array(z.string())
      .optional()
      .describe('Tags to apply on add, e.g. ["newsletter","beta"]'),
    language: z.string().optional().describe('Two-letter language code, e.g. "en"'),
    vip: z.boolean().optional().describe('Mark as a VIP contact'),
  }),
  execute: async ({
    mailchimpApiKey,
    listId,
    email,
    status,
    firstName,
    lastName,
    mergeFields,
    tags,
    language,
    vip,
  }) => {
    const merge = { ...(mergeFields ?? {}) };
    if (firstName !== undefined) merge.FNAME = firstName;
    if (lastName !== undefined) merge.LNAME = lastName;

    const body = { email_address: email, status };
    if (Object.keys(merge).length) body.merge_fields = merge;
    if (tags !== undefined) body.tags = tags;
    if (language !== undefined) body.language = language;
    if (vip !== undefined) body.vip = vip;

    const result = await mailchimpRequest(mailchimpApiKey, `/lists/${listId}/members`, {
      method: 'POST',
      body,
    });
    if (result.error) return result;
    return result.data;
  },
});
