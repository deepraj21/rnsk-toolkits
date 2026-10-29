// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mailchimpRequest, subscriberHash } from './client.js';

export const mailchimpArchiveMember = tool({
  description:
    "Archives a member (contact) from a Mailchimp audience — removes them from the list but keeps them out of future campaigns. Use only when the user explicitly asks to remove or unsubscribe someone. To keep them on record but stop sending, set status to 'unsubscribed' instead.",
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
    const result = await mailchimpRequest(mailchimpApiKey, `/lists/${listId}/members/${hash}`, {
      method: 'DELETE',
    });
    if (result.error) return result;
    return { archived: true, listId, email };
  },
});
