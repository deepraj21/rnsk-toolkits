// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mailchimpRequest, subscriberHash } from './client.js';

export const mailchimpGetMember = tool({
  description:
    'Gets one Mailchimp audience member by email address (resolved to its subscriber_hash): subscription status, merge fields, tags, and engagement stats.',
  inputSchema: z.object({
    mailchimpApiKey: z
      .string()
      .optional()
      .describe('Mailchimp API key including data-center suffix (injected by system)'),
    listId: z.string().describe('Mailchimp audience (list) id'),
    email: z.string().email().describe("Member's email address (hashed to the subscriber_hash)"),
  }),
  execute: async ({ mailchimpApiKey, listId, email }) => {
    const hash = subscriberHash(email);
    const result = await mailchimpRequest(mailchimpApiKey, `/lists/${listId}/members/${hash}`);
    if (result.error) return result;
    return result.data;
  },
});
