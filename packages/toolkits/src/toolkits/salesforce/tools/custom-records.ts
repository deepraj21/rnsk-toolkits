// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { sfDelete, sfGet, sfPatch, sfPost } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const customFields = z
  .record(z.any())
  .optional()
  .describe("Custom fields to set (API names ending in '__c' as keys).");

const SYSTEM_FIELDS = new Set([
  'Id',
  'IsDeleted',
  'CreatedDate',
  'CreatedById',
  'LastModifiedDate',
  'LastModifiedById',
  'SystemModstamp',
  'LastViewedDate',
  'LastReferencedDate',
  'MasterRecordId',
  'PhotoUrl',
  'Jigsaw',
  'JigsawContactId',
  'CleanStatus',
  'DandbCompanyId',
  'JigsawCompanyId',
  'IsConverted',
  'ConvertedDate',
  'ConvertedAccountId',
  'ConvertedContactId',
  'ConvertedOpportunityId',
  'IsUnreadByOwner',
  'HasOpenActivity',
  'HasOverdueTask',
  'ExpectedRevenue',
  'ForecastCategory',
  'LastActivityDate',
  'LastStageChangeDate',
  'HasOpportunityLineItem',
  'TotalOpportunityQuantity',
  'IsClosed',
  'IsWon',
  'Fiscal',
  'FiscalYear',
  'FiscalQuarter',
  'PushCount',
  'ContractId',
  'OrderId',
  'SyncedQuoteId',
  'PrimaryPartnerAccountId',
  'LastAmountChangedHistoryId',
  'LastCloseDateChangedHistoryId',
  'NumberOfLeads',
  'NumberOfContacts',
  'NumberOfResponses',
  'NumberOfOpportunities',
  'NumberOfConvertedLeads',
  'NumberOfWonOpportunities',
  'AmountAllOpportunities',
  'AmountWonOpportunities',
]);

function stripSystem(record: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(record)) {
    if (
      k === 'attributes' ||
      SYSTEM_FIELDS.has(k) ||
      (typeof v === 'object' && v !== null && !Array.isArray(v))
    )
      continue;
    out[k] = v;
  }
  return out;
}

export const salesforceCloneRecord = tool({
  description:
    'Clone any Salesforce record by reading it, stripping system fields and creating a copy. Optionally apply field updates (JSON string) to the clone.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    object_type: z
      .string()
      .describe('Object API name, e.g. Account, Contact, Lead, Opportunity, Case.'),
    record_id: z.string().describe('Id of the record to clone.'),
    field_updates: z
      .string()
      .optional()
      .describe('Optional JSON string of field updates for the clone, e.g. {"Name": "Copy"}.'),
  }),
  execute: async ({ salesforceCredentials, object_type, record_id, field_updates }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const source = await sfGet(salesforceCredentials, `/sobjects/${object_type}/${record_id}`);
    if (source && (source as { error?: string }).error) return source;
    let updates: Record<string, unknown> = {};
    if (field_updates) {
      try {
        updates = JSON.parse(field_updates) as Record<string, unknown>;
      } catch {
        return { error: 'field_updates must be a valid JSON string.' };
      }
    }
    return sfPost(salesforceCredentials, `/sobjects/${object_type}`, {
      body: { ...stripSystem(source as Record<string, unknown>), ...updates },
    });
  },
});

export const salesforceCloneOpportunityWithProducts = tool({
  description:
    'Clone an opportunity with optional overrides (name, close date, stage) and optionally copy its products (line items) to the clone.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    opportunity_id: z.string().describe('Id of the opportunity to clone.'),
    new_name: z
      .string()
      .optional()
      .describe('Name for the clone (defaults to "Clone of <original>").'),
    close_date: z.string().optional().describe('Close date override in YYYY-MM-DD format.'),
    stage_name: z.string().optional().describe('Stage override for the clone.'),
    clone_products: z.boolean().optional().describe('Copy line items too (default true).'),
  }),
  execute: async ({
    salesforceCredentials,
    opportunity_id,
    new_name,
    close_date,
    stage_name,
    clone_products,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const source = (await sfGet(
      salesforceCredentials,
      `/sobjects/Opportunity/${opportunity_id}`,
    )) as Record<string, unknown>;
    if (source && source.error) return source;
    const payload = stripSystem(source);
    payload.Name = new_name || `Clone of ${source.Name}`;
    if (close_date) payload.CloseDate = close_date;
    if (stage_name) payload.StageName = stage_name;
    const created = (await sfPost(salesforceCredentials, '/sobjects/Opportunity', {
      body: payload,
    })) as Record<string, unknown>;
    if (created && created.error) return created;
    const newId = created.id as string;
    let clonedProducts = 0;
    if (clone_products !== false) {
      const items = (await sfGet(salesforceCredentials, '/query', {
        query: {
          q: `SELECT PricebookEntryId, Quantity, UnitPrice, TotalPrice, Discount, Description, ServiceDate FROM OpportunityLineItem WHERE OpportunityId = '${opportunity_id}'`,
        },
      })) as { records?: Record<string, unknown>[]; error?: string };
      if (items && items.error)
        return {
          ...created,
          warning: 'Opportunity cloned but products could not be read.',
          productsError: items,
        };
      for (const item of items.records ?? []) {
        const { attributes, Id, ...fields } = item;
        const res = (await sfPost(salesforceCredentials, '/sobjects/OpportunityLineItem', {
          body: { ...stripSystem(fields), OpportunityId: newId },
        })) as { error?: string };
        if (res && res.error)
          return {
            ...created,
            warning: 'Opportunity cloned but some products failed to copy.',
            productsError: res,
          };
        clonedProducts += 1;
      }
    }
    return { ...created, clonedProducts };
  },
});

export const salesforceRemoveFromCampaign = tool({
  description:
    'Remove a lead or contact from a campaign by deleting its CampaignMember record. Pass campaign_member_id directly, or member_id (lead/contact Id) to look it up first.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    campaign_id: z.string().describe('Id of the campaign to remove the member from.'),
    member_id: z.string().optional().describe('Lead or contact Id to remove.'),
    campaign_member_id: z
      .string()
      .optional()
      .describe('CampaignMember record Id to delete directly.'),
  }),
  execute: async ({ salesforceCredentials, campaign_id, member_id, campaign_member_id }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    if (campaign_member_id) {
      await sfDelete(salesforceCredentials, `/sobjects/CampaignMember/${campaign_member_id}`);
      return { success: true, campaignMemberId: campaign_member_id };
    }
    if (!member_id) return { error: 'Provide either campaign_member_id or member_id.' };
    const found = (await sfGet(salesforceCredentials, '/query', {
      query: {
        q: `SELECT Id FROM CampaignMember WHERE CampaignId = '${campaign_id}' AND (LeadId = '${member_id}' OR ContactId = '${member_id}') LIMIT 1`,
      },
    })) as { records?: { Id: string }[]; error?: string };
    if (found && found.error) return found;
    const row = (found.records ?? [])[0];
    if (!row)
      return {
        success: false,
        message: 'No campaign member found for this lead/contact in the campaign.',
      };
    await sfDelete(salesforceCredentials, `/sobjects/CampaignMember/${row.Id}`);
    return { success: true, campaignMemberId: row.Id };
  },
});

export const salesforceMassTransferOwnership = tool({
  description:
    'Transfer ownership of up to 200 records to a new owner in one call. Records are reassigned immediately with no rollback.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    object_type: z
      .string()
      .describe('Object API name, e.g. Account, Contact, Lead, Opportunity, Case.'),
    record_ids: z.array(z.string()).min(1).max(200).describe('Record Ids to transfer (max 200).'),
    new_owner_id: z.string().describe('User Id of the new owner.'),
    trigger_assignment_rules: z
      .boolean()
      .optional()
      .describe('Trigger assignment rules (mainly Leads and Cases).'),
  }),
  execute: async ({
    salesforceCredentials,
    object_type,
    record_ids,
    new_owner_id,
    trigger_assignment_rules,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const records = record_ids.map((id) => ({
      attributes: { type: object_type },
      Id: id,
      OwnerId: new_owner_id,
    }));
    const headers: Record<string, string> = {};
    if (trigger_assignment_rules) headers['Sforce-Auto-Assign'] = 'TRUE';
    return sfPatch(salesforceCredentials, '/composite/sobjects', {
      body: { allOrNone: false, records },
      headers,
    });
  },
});

export const salesforceCompleteTask = tool({
  description:
    'Mark a task as Completed, appending optional completion notes to its description. Returns the updated task id.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    task_id: z.string().describe('Id of the task to complete.'),
    completion_notes: z.string().optional().describe('Notes appended to the task description.'),
    custom_fields: customFields,
  }),
  execute: async ({ salesforceCredentials, task_id, completion_notes, custom_fields }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    let description: string | undefined;
    if (completion_notes) {
      const current = (await sfGet(salesforceCredentials, `/sobjects/Task/${task_id}`, {
        query: { fields: 'Description' },
      })) as { Description?: string; error?: string };
      if (current && current.error) return current;
      const prev = (current.Description || '').trim();
      description = prev ? `${prev}\n\n${completion_notes}` : completion_notes;
    }
    const body: Record<string, unknown> = { Status: 'Completed', ...(custom_fields ?? {}) };
    if (description !== undefined) body.Description = description;
    const res = await sfPatch(salesforceCredentials, `/sobjects/Task/${task_id}`, { body });
    if (res && (res as { error?: string }).error) return res;
    return { success: true, id: task_id };
  },
});

export const salesforceApplyLeadAssignmentRules = tool({
  description:
    'Apply active lead assignment rules to a lead, routing it to the right owner. Allow a brief propagation delay before reading back ownership.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    lead_id: z.string().describe('Id of the lead to route.'),
  }),
  execute: async ({ salesforceCredentials, lead_id }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const res = await sfPatch(salesforceCredentials, `/sobjects/Lead/${lead_id}`, {
      body: {},
      headers: { 'Sforce-Auto-Assign': 'TRUE' },
    });
    if (res && (res as { error?: string }).error) return res;
    return { success: true, id: lead_id };
  },
});
