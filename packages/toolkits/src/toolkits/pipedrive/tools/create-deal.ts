// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { pipedriveRequest, compact } from './client.js';

export const pipedriveCreateDeal = tool({
  description:
    'Creates a Pipedrive deal. Requires a title; optionally link a person, organization, pipeline/stage, set value/currency, status, owner, and expected close date. Custom fields are passed as an object keyed by their 40-character hash (set null to clear; multi-option fields use null to clear, not []). Returns the new deal with its ID.',
  inputSchema: z.object({
    pipedriveApiToken: z.string().optional().describe('Pipedrive API token (injected by system)'),
    title: z.string().describe('Deal title, e.g. "Acme — Annual subscription"'),
    personId: z.number().optional().describe('Person ID linked to the deal'),
    orgId: z.number().optional().describe('Organization ID linked to the deal'),
    pipelineId: z.number().optional().describe('Pipeline ID'),
    stageId: z.number().optional().describe('Stage ID within the pipeline'),
    value: z.number().optional().describe('Deal value (amount)'),
    currency: z.string().optional().describe('Three-letter currency code, e.g. "USD"'),
    status: z.enum(['open', 'won', 'lost']).optional().describe('Deal status (default open)'),
    ownerId: z.number().optional().describe('User ID that will own the deal'),
    probability: z.number().min(0).max(100).optional().describe('Success probability percentage'),
    expectedCloseDate: z.string().optional().describe('Expected close date, ISO date "YYYY-MM-DD"'),
    lostReason: z.string().optional().describe('Lost reason (only when status is lost)'),
    visibleTo: z
      .number()
      .optional()
      .describe('Visibility: 1 = owner & followers, 3 = entire company'),
    labelIds: z.array(z.number()).optional().describe('Deal label IDs to assign'),
    customFields: z
      .record(z.any())
      .optional()
      .describe(
        'Custom fields object keyed by 40-char hash, e.g. {"a1b2...":"Value"} — null clears',
      ),
  }),
  execute: async ({
    pipedriveApiToken,
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

    const result = await pipedriveRequest(pipedriveApiToken, '/api/v2/deals', {
      method: 'POST',
      body,
    });
    if (result.error) return result;
    return result.data;
  },
});
