// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mailchimpRequest, subscriberHash } from './client.js';

export const mailchimpUpdateMember = tool({
  description:
    'Updates a Mailchimp audience member by email: change subscription status, merge fields, tags, or VIP flag. Only provided fields change. Use this to upsert by email when the contact may already exist.',
  inputSchema: z.object({
    mailchimpApiKey: z
      .string()
      .optional()
      .describe('Mailchimp API key including data-center suffix (injected by system)'),
    listId: z.string().describe('Mailchimp audience (list) id'),
    email: z.string().email().describe("Member's email address (hashed to the subscriber_hash)"),
    status: z
      .enum(['subscribed', 'unsubscribed', 'pending', 'cleaned', 'transactional'])
      .optional()
      .describe('New subscription status'),
    firstName: z.string().optional().describe('New first name (merge field FNAME)'),
    lastName: z.string().optional().describe('New last name (merge field LNAME)'),
    mergeFields: z
      .record(z.any())
      .optional()
      .describe('Merge field values to set, e.g. {"PHONE":"555-1234"}'),
    tags: z.array(z.string()).optional().describe('Tags to set on the member (replaces tag list)'),
    language: z.string().optional().describe('Two-letter language code'),
    vip: z.boolean().optional().describe('Set or clear the VIP flag'),
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
    const hash = subscriberHash(email);
    const body = {};
    if (status !== undefined) body.status = status;
    const merge = { ...(mergeFields ?? {}) };
    if (firstName !== undefined) merge.FNAME = firstName;
    if (lastName !== undefined) merge.LNAME = lastName;
    if (Object.keys(merge).length) body.merge_fields = merge;
    if (tags !== undefined) body.tags = tags;
    if (language !== undefined) body.language = language;
    if (vip !== undefined) body.vip = vip;

    const result = await mailchimpRequest(mailchimpApiKey, `/lists/${listId}/members/${hash}`, {
      method: 'PATCH',
      body,
    });
    if (result.error) return result;
    return result.data;
  },
});
