// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { pipedriveRequest } from './client.js';

export const pipedriveGetDeal = tool({
  description:
    'Gets one Pipedrive deal by ID: title, value, status, stage, pipeline, person/organization links, owner, expected close date, and custom fields.',
  inputSchema: z.object({
    pipedriveApiToken: z.string().optional().describe('Pipedrive API token (injected by system)'),
    dealId: z.number().describe('Deal ID'),
    includeFields: z
      .array(z.string())
      .optional()
      .describe('Extra fields to include, e.g. ["notes_count","products_count"]'),
    customFields: z
      .array(z.string())
      .optional()
      .describe('Custom field keys (40-char hashes) to include, max 15'),
    includeOptionLabels: z
      .boolean()
      .optional()
      .describe('Return option custom fields as {id,label} objects'),
  }),
  execute: async ({
    pipedriveApiToken,
    dealId,
    includeFields,
    customFields,
    includeOptionLabels,
  }) => {
    const result = await pipedriveRequest(pipedriveApiToken, `/api/v2/deals/${dealId}`, {
      query: {
        include_fields: includeFields,
        custom_fields: customFields,
        include_option_labels: includeOptionLabels,
      },
    });
    if (result.error) return result;
    return result.data;
  },
});
