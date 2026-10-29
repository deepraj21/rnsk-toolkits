// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { pipedriveRequest, toContactEntries, compact } from './client.js';

export const pipedriveUpdatePerson = tool({
  description:
    'Updates a Pipedrive person (PATCH v2). Only provided fields change — rename, change emails/phones (replaces the given list), re-link organization, or edit custom fields.',
  inputSchema: z.object({
    pipedriveApiToken: z.string().optional().describe('Pipedrive API token (injected by system)'),
    personId: z.number().describe('Person ID to update'),
    name: z.string().optional().describe('New name'),
    emails: z
      .array(z.union([z.string(), z.record(z.any())]))
      .optional()
      .describe('Emails (replaces existing list) as strings or {value, primary, label} objects'),
    phones: z
      .array(z.union([z.string(), z.record(z.any())]))
      .optional()
      .describe('Phones (replaces existing list) as strings or {value, primary, label} objects'),
    orgId: z
      .number()
      .nullable()
      .optional()
      .describe('New linked organization ID (pass null to unlink)'),
    ownerId: z.number().optional().describe('New owner user ID'),
    visibleTo: z
      .number()
      .optional()
      .describe('Visibility: 1 = owner & followers, 3 = entire company'),
    labelIds: z.array(z.number()).optional().describe('Label IDs (replaces existing labels)'),
    customFields: z
      .record(z.any())
      .optional()
      .describe('Custom fields object keyed by 40-char hash — null clears a value'),
  }),
  execute: async ({
    pipedriveApiToken,
    personId,
    name,
    emails,
    phones,
    orgId,
    ownerId,
    visibleTo,
    labelIds,
    customFields,
  }) => {
    if (!pipedriveApiToken) {
      return { error: 'Pipedrive API key is required. Connect Pipedrive first.' };
    }
    const body = compact({
      name,
      emails: toContactEntries(emails),
      phones: toContactEntries(phones),
      org_id: orgId,
      owner_id: ownerId,
      visible_to: visibleTo,
      label_ids: labelIds,
      custom_fields: customFields,
    });

    if (Object.keys(body).length === 0) {
      return { error: 'No fields provided to update. Include at least one field to change.' };
    }

    const result = await pipedriveRequest(pipedriveApiToken, `/api/v2/persons/${personId}`, {
      method: 'PATCH',
      body,
    });
    if (result.error) return result;
    return result.data;
  },
});
