// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import {
  engagementBody,
  flatProps,
  hubDelete,
  hubGet,
  hubMultipart,
  hubPatch,
  hubPost,
  hubPut,
  mapKeys,
  pickDefined,
  searchBody,
  stripKeys,
  unflattenDeep,
} from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const hubspotRetrieveOwnerByIdOrUserId = tool({
  description:
    'Retrieves a specific HubSpot CRM owner by their ID, with options to specify ID type (owner or user) and to include archived records.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    ownerId: z
      .number()
      .int()
      .describe(
        'Unique identifier of the owner. Its meaning (HubSpot owner ID or user ID) is determined by `idProperty`.',
      ),
    archived: z
      .boolean()
      .optional()
      .describe(
        'Set to `true` to retrieve only archived owners; otherwise, active (non-archived) owners are returned.',
      ),
    idProperty: z
      .enum(['id', 'userId'])
      .optional()
      .describe(
        'Determines if `ownerId` refers to the HubSpot owner ID (`id`) or the user ID (`userId`).',
      ),
  }),
  execute: async ({ hubspotToken, ownerId, archived, idProperty }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(hubspotToken, `/crm/v3/owners/${encodeURIComponent(String(ownerId))}`, {
      query: pickDefined({ archived: archived, idProperty: idProperty }),
    });
  },
});

export const hubspotRetrieveOwners = tool({
  description:
    'Retrieves a list of all owners in the HubSpot CRM, including their ID, first name, last name, email, and user ID.',
  inputSchema: z.object({
    hubspotToken: tokenField,
  }),
  execute: async ({ hubspotToken }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(hubspotToken, `/crm/v3/owners/`);
  },
});

export const hubspotRetrievePageOfCrmOwners = tool({
  description:
    'Retrieves a paginated list of CRM owners from HubSpot, optionally filtering by email or archived status.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    after: z
      .string()
      .optional()
      .describe('Pagination token from a previous response to fetch the next page.'),
    email: z.string().optional().describe('Filter by a specific email address.'),
    limit: z
      .number()
      .int()
      .optional()
      .describe(
        "Maximum number of CRM owners per page. Refer to HubSpot's API documentation for current limits.",
      ),
    archived: z
      .boolean()
      .optional()
      .describe('Set to `true` for archived owners, or `false` for active owners.'),
  }),
  execute: async ({ hubspotToken, after, email, limit, archived }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(hubspotToken, `/crm/v3/owners/`, {
      query: pickDefined({ after: after, email: email, limit: limit, archived: archived }),
    });
  },
});
