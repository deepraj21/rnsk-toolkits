// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { typeformRequest } from './client.js';

export const typeformListResponses = tool({
  description:
    'Lists a form’s responses (submissions) as a page with totals — filter by date range, specific/excluded response IDs, completion state, phrase search, or restrict the returned answers to certain fields. Very recent responses may lag; for filtering on answer values use typeformSearchResponses. Needs the responses:read scope.',
  inputSchema: z.object({
    typeformToken: z.string().optional().describe('Typeform access token (injected by system)'),
    formId: z.string().min(1).describe('Form ID to fetch responses for'),
    pageSize: z
      .number()
      .int()
      .min(1)
      .max(1000)
      .optional()
      .describe('Responses per page, 1-1000 (default 25)'),
    since: z
      .string()
      .optional()
      .describe(
        'Only responses submitted at/after this time — Unix seconds or ISO 8601 UTC (2024-05-20T14:00:59)',
      ),
    until: z
      .string()
      .optional()
      .describe('Only responses submitted at/before this time — Unix seconds or ISO 8601 UTC'),
    after: z
      .string()
      .optional()
      .describe('Cursor: return responses submitted after this response token (exclusive)'),
    before: z
      .string()
      .optional()
      .describe('Cursor: return responses submitted before this response token (exclusive)'),
    includedResponseIds: z
      .array(z.string())
      .optional()
      .describe('Only these response IDs (max 1000)'),
    excludedResponseIds: z.array(z.string()).optional().describe('Response IDs to exclude'),
    responseType: z
      .array(z.string())
      .optional()
      .describe('Response types to include: completed (default), partial, started'),
    sort: z
      .string()
      .optional()
      .describe(
        'Sort as "field,direction" — e.g. "submitted_at,asc" (default "submitted_at,desc")',
      ),
    query: z
      .string()
      .optional()
      .describe('Exact-phrase search across answer values, hidden fields, and variables'),
    fields: z
      .array(z.string())
      .optional()
      .describe('Only return answers for these field IDs (others come back null)'),
    answeredFields: z
      .array(z.string())
      .optional()
      .describe('Only return responses that answered at least one of these field IDs'),
  }),
  execute: async ({
    typeformToken,
    formId,
    pageSize,
    since,
    until,
    after,
    before,
    includedResponseIds,
    excludedResponseIds,
    responseType,
    sort,
    query,
    fields,
    answeredFields,
  }) => {
    if (!formId) return { error: 'formId is required.' };

    const result = await typeformRequest(
      typeformToken,
      `/forms/${encodeURIComponent(formId)}/responses`,
      {
        query: {
          page_size: pageSize,
          since,
          until,
          after,
          before,
          included_response_ids: includedResponseIds,
          excluded_response_ids: excludedResponseIds,
          response_type: responseType,
          sort,
          query,
          fields,
          answered_fields: answeredFields,
        },
      },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});
