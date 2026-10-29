// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { pipedriveRequest } from './client.js';

export const pipedriveGetPerson = tool({
  description:
    'Gets one Pipedrive person by ID: name, emails, phones, organization link, owner, and custom fields.',
  inputSchema: z.object({
    pipedriveApiToken: z.string().optional().describe('Pipedrive API token (injected by system)'),
    personId: z.number().describe('Person ID'),
    includeFields: z.array(z.string()).optional().describe('Extra fields to include'),
    customFields: z
      .array(z.string())
      .optional()
      .describe('Custom field keys (40-char hashes) to include, max 15'),
    includeLabels: z.boolean().optional().describe('Include label objects as {id,label}'),
  }),
  execute: async ({ pipedriveApiToken, personId, includeFields, customFields, includeLabels }) => {
    const result = await pipedriveRequest(pipedriveApiToken, `/api/v2/persons/${personId}`, {
      query: {
        include_fields: includeFields,
        custom_fields: customFields,
        include_labels: includeLabels,
      },
    });
    if (result.error) return result;
    return result.data;
  },
});
