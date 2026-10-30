// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { clerkRequest, shapeList } from './client.js';

export const clerkListUsers = tool({
  description:
    'Lists users of the Clerk instance with limit/offset (or starting_after cursor) pagination. Filter by email address, phone number, username, external ID, user IDs, organization, banned state, or a free-text query. Returns users with their identities, email addresses, and metadata.',
  inputSchema: z.object({
    clerkToken: z.string().optional().describe('Clerk secret key (injected by system)'),
    emailAddresses: z
      .array(z.string())
      .optional()
      .describe('Only users with these exact email addresses (up to 100)'),
    phoneNumbers: z
      .array(z.string())
      .optional()
      .describe('Only users with these exact phone numbers'),
    usernames: z.array(z.string()).optional().describe('Only users with these exact usernames'),
    externalIds: z
      .array(z.string())
      .optional()
      .describe('Only users with these external IDs (+/- prefix to include/exclude)'),
    userIds: z
      .array(z.string())
      .optional()
      .describe('Only these user IDs (e.g. ["user_1","+user_2"])'),
    organizationId: z
      .string()
      .optional()
      .describe('Only users who are members of this organization ID'),
    query: z
      .string()
      .optional()
      .describe('Match user ID exactly, or name/email/username partially'),
    banned: z.boolean().optional().describe('Filter to banned (true) or non-banned (false) users'),
    lastActiveAtSince: z
      .number()
      .optional()
      .describe('Only users active since this Unix timestamp (seconds)'),
    limit: z.number().min(1).max(500).optional().describe('Results per page (default 10)'),
    offset: z.number().min(0).optional().describe('Number of results to skip'),
    startingAfter: z
      .string()
      .optional()
      .describe('Cursor: return items after this user ID (preferred over large offsets)'),
    orderBy: z.string().optional().describe('Sort, e.g. "-created_at" for newest first'),
  }),
  execute: async ({
    clerkToken,
    emailAddresses,
    phoneNumbers,
    usernames,
    externalIds,
    userIds,
    organizationId,
    query,
    banned,
    lastActiveAtSince,
    limit,
    offset,
    startingAfter,
    orderBy,
  }) => {
    const result = await clerkRequest(clerkToken, '/users', {
      query: {
        email_address: emailAddresses,
        phone_number: phoneNumbers,
        username: usernames,
        external_id: externalIds,
        user_id: userIds,
        organization_id: organizationId,
        query,
        banned,
        last_active_at_since: lastActiveAtSince,
        limit,
        offset,
        starting_after: startingAfter,
        order_by: orderBy,
      },
    });
    if (result.error) return result;

    const { items, totalCount } = shapeList(result);
    return { users: items, ...(totalCount !== undefined ? { totalCount } : {}) };
  },
});
