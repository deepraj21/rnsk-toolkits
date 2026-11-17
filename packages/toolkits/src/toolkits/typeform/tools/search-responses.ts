// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { compact, typeformRequest } from './client.js';

export const typeformSearchResponses = tool({
  description:
    'Searches a form’s responses with structured filters combined with AND — filter on answer values (answers.<field_id>), timestamps, tags, hidden fields, metadata, or response IDs. Prefer this over typeformListResponses when you need to filter by what respondents answered. Needs the responses:read scope.',
  inputSchema: z.object({
    typeformToken: z.string().optional().describe('Typeform access token (injected by system)'),
    formId: z.string().min(1).describe('Form ID to search responses of'),
    filters: z
      .array(z.record(z.any()))
      .optional()
      .describe(
        'Filters, each { field, operator, value, negate? } — field: "response_id" | "timestamp" | "tags" | "answers.<field_id>" | "metadata.<key>" | "hidden.<key>"; operator: "equals" | "any_of" | "interval"; value: { text } | { number } | { boolean } | { text_list } | { interval: { start, end } } (Unix seconds)',
      ),
    filterGroup: z
      .record(z.any())
      .optional()
      .describe('Raw filter_group object ({ filters: [...] }) — overrides `filters` when given'),
    query: z
      .string()
      .optional()
      .describe('Exact-phrase search across answers, hidden fields, variables'),
    size: z
      .number()
      .int()
      .min(1)
      .max(1000)
      .optional()
      .describe('Max responses per page, 1-1000 (default 25)'),
    sort: z
      .array(z.string())
      .optional()
      .describe('Sort clauses, e.g. ["-submitted_at"] — cannot be combined with cursor params'),
    responseType: z
      .array(z.string())
      .optional()
      .describe('Response types to include: completed (default), partial, started'),
    fields: z.array(z.string()).optional().describe('Only return answers for these field IDs'),
    answeredFields: z
      .array(z.string())
      .optional()
      .describe('Only responses that answered one of these field IDs'),
    afterResponseId: z.string().optional().describe('Cursor: responses after this response ID'),
    beforeResponseId: z.string().optional().describe('Cursor: responses before this response ID'),
  }),
  execute: async ({
    typeformToken,
    formId,
    filters,
    filterGroup,
    query,
    size,
    sort,
    responseType,
    fields,
    answeredFields,
    afterResponseId,
    beforeResponseId,
  }) => {
    if (!formId) return { error: 'formId is required.' };
    if (!filterGroup && (!filters || !filters.length))
      return { error: 'filters (or filterGroup) is required.' };

    const body = compact({
      filter_group: filterGroup ?? (filters && filters.length ? { filters } : undefined),
      query,
      size,
      sort,
      response_type: responseType,
      fields,
      answered_fields: answeredFields,
      after_response_id: afterResponseId,
      before_response_id: beforeResponseId,
    });

    const result = await typeformRequest(
      typeformToken,
      `/forms/${encodeURIComponent(formId)}/responses/search`,
      { method: 'POST', body },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});
