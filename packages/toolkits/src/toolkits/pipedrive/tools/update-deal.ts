// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { pipedriveRequest, compact } from './client.js';

export const pipedriveUpdateDeal = tool({
  description:
    'Updates a Pipedrive deal (PATCH v2). Only provided fields change — omit everything you want to leave alone. Use it to move a deal between stages, change status/value/owner, or edit custom fields (40-char hash keys; null clears a value).',
  inputSchema: z.object({
    pipedriveApiToken: z.string().optional().describe('Pipedrive API token (injected by system)'),
    dealId: z.number().describe('Deal ID to update'),
    title: z.string().optional().describe('New deal title'),
    personId: z.number().optional().describe('New linked person ID'),
    orgId: z.number().optional().describe('New linked organization ID'),
    pipelineId: z.number().optional().describe('New pipeline ID'),
    stageId: z.number().optional().describe('New stage ID (move the deal in the pipeline)'),
    value: z.number().optional().describe('New deal value'),
    currency: z.string().optional().describe('Three-letter currency code'),
    status: z.enum(['open', 'won', 'lost']).optional().describe('New deal status'),
    ownerId: z.number().optional().describe('New owner user ID'),
    probability: z.number().min(0).max(100).optional().describe('Success probability percentage'),
    expectedCloseDate: z.string().optional().describe('Expected close date, ISO date "YYYY-MM-DD"'),
    lostReason: z.string().optional().describe('Lost reason (only when status is lost)'),
    visibleTo: z
      .number()
      .optional()
      .describe('Visibility: 1 = owner & followers, 3 = entire company'),
    labelIds: z.array(z.number()).optional().describe('Deal label IDs (replaces existing labels)'),
    customFields: z
      .record(z.any())
      .optional()
      .describe('Custom fields object keyed by 40-char hash — null clears a value'),
  }),
  execute: async ({
    pipedriveApiToken,
    dealId,
    title,
    personId,
    orgId,
    pipelineId,
    stageId,
    value,
    currency,
    status,
    ownerId,
    probability,
    expectedCloseDate,
    lostReason,
    visibleTo,
    labelIds,
    customFields,
  }) => {
    if (!pipedriveApiToken) {
      return { error: 'Pipedrive API key is required. Connect Pipedrive first.' };
    }
    const body = compact({
      title,
      person_id: personId,
      org_id: orgId,
      pipeline_id: pipelineId,
      stage_id: stageId,
      value,
      currency,
      status,
      owner_id: ownerId,
      probability,
      expected_close_date: expectedCloseDate,
      lost_reason: lostReason,
      visible_to: visibleTo,
      label_ids: labelIds,
      custom_fields: customFields,
    });

    if (Object.keys(body).length === 0) {
      return { error: 'No fields provided to update. Include at least one field to change.' };
    }

    const result = await pipedriveRequest(pipedriveApiToken, `/api/v2/deals/${dealId}`, {
      method: 'PATCH',
      body,
    });
    if (result.error) return result;
    return result.data;
  },
});
