// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { pipedriveRequest, toContactEntries, compact } from './client.js';

export const pipedriveCreatePerson = tool({
  description:
    'Creates a Pipedrive person (contact). Requires a name; optionally add emails, phones, an organization link, owner, and custom fields. Returns the new person with its ID — use it for deals, activities, and notes.',
  inputSchema: z.object({
    pipedriveApiToken: z.string().optional().describe('Pipedrive API token (injected by system)'),
    name: z.string().describe("Person's full name, e.g. 'Ada Lovelace'"),
    emails: z
      .array(z.union([z.string(), z.record(z.any())]))
      .optional()
      .describe(
        'Emails as plain strings or objects {value, primary, label}; first becomes primary',
      ),
    phones: z
      .array(z.union([z.string(), z.record(z.any())]))
      .optional()
      .describe(
        'Phones as plain strings or objects {value, primary, label}; first becomes primary',
      ),
    orgId: z.number().optional().describe('Organization ID to link'),
    ownerId: z.number().optional().describe('User ID that will own the person'),
    visibleTo: z
      .number()
      .optional()
      .describe('Visibility: 1 = owner & followers, 3 = entire company'),
    labelIds: z.array(z.number()).optional().describe('Label IDs to assign'),
    customFields: z
      .record(z.any())
      .optional()
      .describe('Custom fields object keyed by 40-char hash — null clears a value'),
  }),
  execute: async ({
    pipedriveApiToken,
    name,
    emails,
    phones,
    orgId,
    ownerId,
    visibleTo,
    labelIds,
    customFields,
  }) => {
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

    const result = await pipedriveRequest(pipedriveApiToken, '/api/v2/persons', {
      method: 'POST',
      body,
    });
    if (result.error) return result;
    return result.data;
  },
});
