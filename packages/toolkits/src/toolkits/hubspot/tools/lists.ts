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

export const hubspotCreateList = tool({
  description:
    'Create a HubSpot CRM list with manual, snapshot, or dynamic membership rules. Snake-case fields are mapped to HubSpot list wire keys (object_type_id to objectTypeId, filter_branch to filterBranch).',
  inputSchema: z.object({
    hubspotToken: tokenField,
    name: z.string().describe('Portal-wide unique list name.'),
    filterBranch: z
      .record(z.any())
      .optional()
      .describe(
        'Recursive HubSpot filter branch for a DYNAMIC list. Use exact provider keys such as filterBranchType, filterBranches, filters, filterType, property, and operation. The full grammar is polymorphic and supports OR, AND, NOT_ALL, NOT_ANY, RESTRICTED, UNIFIED_EVENTS, and ASSOCIATION branches.',
      ),
    listFolderId: z
      .number()
      .int()
      .optional()
      .describe('Folder ID in which to place the list. Must be non-negative.'),
    objectTypeId: z
      .string()
      .describe('CRM object type ID whose records can become members, such as 0-1 for contacts.'),
    processingType: z
      .enum(['SNAPSHOT', 'MANUAL', 'DYNAMIC'])
      .describe('How HubSpot determines and refreshes list membership.'),
    listPermissions: z
      .record(z.any())
      .optional()
      .describe(
        'Permissions object using exact teamsWithEditAccess and usersWithEditAccess wire keys.',
      ),
    customProperties: z
      .record(z.any())
      .optional()
      .describe('Optional custom list properties keyed by exact HubSpot property name.'),
    membershipSettings: z
      .record(z.any())
      .optional()
      .describe(
        'Membership settings using exact includeUnassigned and membershipTeamId wire keys.',
      ),
  }),
  execute: async ({
    hubspotToken,
    name,
    objectTypeId,
    processingType,
    filterBranch,
    listFolderId,
    listPermissions,
    customProperties,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, '/crm/v3/lists/', {
      body: {
        name,
        objectTypeId,
        processingType,
        ...(filterBranch ? { filterBranch } : {}),
        ...(listFolderId !== undefined ? { listFolderId } : {}),
        ...(listPermissions ? { listPermissions } : {}),
        ...(customProperties ?? {}),
      },
    });
  },
});

export const hubspotGetCrmList = tool({
  description: 'Retrieves a HubSpot CRM list by its ILS list ID.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    listId: z.string().describe('ILS ID of the CRM list to retrieve.'),
    includeFilters: z
      .boolean()
      .optional()
      .describe("Whether to include the list's complete filter branch in the response."),
  }),
  execute: async ({ hubspotToken, listId, includeFilters }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(hubspotToken, `/crm/v3/lists/${encodeURIComponent(String(listId))}`, {
      query: pickDefined({ includeFilters }),
    });
  },
});

export const hubspotGetRecordListMemberships = tool({
  description:
    'Return the HubSpot lists that contain one CRM record. Best-effort mapping to the HubSpot record-memberships endpoint.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    recordId: z.string().describe('CRM record ID whose list memberships should be returned.'),
    objectTypeId: z
      .string()
      .describe('HubSpot object type ID for the record, such as 0-1 for contacts.'),
  }),
  execute: async ({ hubspotToken, recordId, objectTypeId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(
      hubspotToken,
      `/crm/v3/lists/${encodeURIComponent(String(objectTypeId))}/records/${encodeURIComponent(String(recordId))}/memberships`,
    );
  },
});

export const hubspotGetSegmentMembers = tool({
  description:
    'Tool to retrieve segment (list) members ordered by join timestamp. Use when you need to page through list membership data.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    after: z
      .string()
      .optional()
      .describe(
        'Cursor token to fetch records after the last returned record; sorts ascending. Overrides `before` if both provided.',
      ),
    limit: z
      .number()
      .int()
      .optional()
      .describe('Number of records to return; default 100; maximum 250.'),
    before: z
      .string()
      .optional()
      .describe(
        'Cursor token to fetch records before the previously returned records; sorts descending.',
      ),
    listId: z.string().describe('The ID of the list (segment) to retrieve members for.'),
  }),
  execute: async ({ hubspotToken, after, limit, before, listId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(hubspotToken, `/crm/v3/lists/${encodeURIComponent(String(listId))}/memberships`, {
      query: pickDefined({ after: after, limit: limit, before: before }),
    });
  },
});
