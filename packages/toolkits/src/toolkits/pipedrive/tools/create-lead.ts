// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { pipedriveRequest, compact } from './client.js';

export const pipedriveCreateLead = tool({
  description:
    'Creates a Pipedrive lead (an unqualified sales opportunity). Requires a title and at least one link: a personId or an organizationId (create the person/org first if needed). Optionally set value {amount, currency}, owner, labels, and expected close date. Returns the new lead with its ID.',
  inputSchema: z.object({
    pipedriveApiToken: z.string().optional().describe('Pipedrive API token (injected by system)'),
    title: z.string().describe('Lead title, e.g. "Acme — inbound demo request"'),
    personId: z
      .number()
      .optional()
      .describe('Person ID this lead is linked to (required unless organizationId is given)'),
    organizationId: z
      .number()
      .optional()
      .describe('Organization ID this lead is linked to (required unless personId is given)'),
    ownerId: z
      .number()
      .optional()
      .describe('User ID that will own the lead (defaults to the API user)'),
    labelIds: z.array(z.number()).optional().describe('Lead label IDs to assign'),
    value: z
      .object({ amount: z.number(), currency: z.string() })
      .optional()
      .describe(
        'Potential value, e.g. {"amount":200,"currency":"EUR"} — both fields required together',
      ),
    expectedCloseDate: z.string().optional().describe('Expected close date, ISO date "YYYY-MM-DD"'),
    visibleTo: z
      .number()
      .optional()
      .describe('Visibility: 1 = owner & followers, 3 = entire company'),
    originId: z.string().optional().describe('External ID distinguishing where the lead came from'),
  }),
  execute: async ({
    pipedriveApiToken,
    title,
    personId,
    organizationId,
    ownerId,
    labelIds,
    value,
    expectedCloseDate,
    visibleTo,
    originId,
  }) => {
    if (!pipedriveApiToken) {
      return { error: 'Pipedrive API key is required. Connect Pipedrive first.' };
    }
    if (personId === undefined && organizationId === undefined) {
      return {
        error:
          'A lead needs something to link to. Provide personId or organizationId (create the person/organization first if it does not exist yet).',
      };
    }

    const body = compact({
      title,
      person_id: personId,
      organization_id: organizationId,
      owner_id: ownerId,
      label_ids: labelIds,
      value,
      expected_close_date: expectedCloseDate,
      visible_to: visibleTo === undefined ? undefined : String(visibleTo),
      origin_id: originId,
    });

    const result = await pipedriveRequest(pipedriveApiToken, '/api/v1/leads', {
      method: 'POST',
      body,
    });
    if (result.error) return result;
    return result.data;
  },
});
