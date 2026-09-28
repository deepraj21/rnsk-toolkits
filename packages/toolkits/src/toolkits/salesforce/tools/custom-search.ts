// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { sfGet, sfPost, soqlEscape } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

function likeClauses(field: string, value: string): string {
  return `${field} LIKE '%${soqlEscape(value)}%'`;
}

export const salesforceParameterizedSearch = tool({
  description:
    'Search across Salesforce objects with simple GET requests (URL parameters) or complex POST requests (JSON body with per-object filtering). Use POST when you need per-object fields, where clauses or limits.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    q: z.string().describe('Search string across Salesforce objects.'),
    method: z
      .enum(['GET', 'POST'])
      .optional()
      .describe('HTTP method: GET for simple searches, POST for complex ones (default GET).'),
    in: z.string().optional().describe('Search scope: ALL, NAME, EMAIL, PHONE or SIDEBAR.'),
    where: z.string().optional().describe('Global SOQL WHERE filter without the WHERE keyword.'),
    fields: z.any().optional().describe('GET: comma-separated fields; POST: array of field names.'),
    sobjects: z
      .any()
      .optional()
      .describe('GET: comma-separated object names; POST: array of {name, fields, where} specs.'),
    overallLimit: z.number().int().optional().describe('Max total results across all objects.'),
    spellCorrection: z.boolean().optional().describe('Enable spell correction.'),
    defaultSearchScope: z.string().optional().describe('Default search scope when not specified.'),
  }),
  execute: async ({ salesforceCredentials, q, method, ...rest }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    if (method === 'POST') {
      const body: Record<string, unknown> = { q };
      for (const [k, v] of Object.entries(rest)) {
        if (v !== undefined) body[k] = v;
      }
      return sfPost(salesforceCredentials, '/parameterizedSearch', { body });
    }
    const query: Record<string, unknown> = { q };
    if (rest.in !== undefined) query.in = rest.in;
    if (rest.where !== undefined) query.where = rest.where;
    if (rest.fields !== undefined)
      query.fields = Array.isArray(rest.fields) ? rest.fields.join(',') : rest.fields;
    if (rest.sobjects !== undefined)
      query.sobjects = Array.isArray(rest.sobjects)
        ? rest.sobjects.map((s) => (typeof s === 'string' ? s : s.name)).join(',')
        : rest.sobjects;
    if (rest.overallLimit !== undefined) query.overallLimit = rest.overallLimit;
    if (rest.spellCorrection !== undefined) query.spellCorrection = rest.spellCorrection;
    if (rest.defaultSearchScope !== undefined) query.defaultSearchScope = rest.defaultSearchScope;
    return sfGet(salesforceCredentials, '/parameterizedSearch', { query });
  },
});

function searchTool(
  name: string,
  description: string,
  from: string,
  defaultFields: string,
  filters: { param: string; field: string; like?: boolean }[],
  ranges: { param: string; field: string; op: string }[] = [],
  soslBodyParam?: string,
) {
  const shape: Record<string, z.ZodTypeAny> = {
    salesforceCredentials: tokenField,
    fields: z.string().optional().describe('Comma-separated fields to retrieve.'),
    limit: z.number().int().min(1).max(2000).optional().describe('Max records (default 50).'),
  };
  for (const f of filters) {
    shape[f.param] =
      f.param === 'is_active' ||
      f.param === 'is_closed' ||
      f.param === 'is_won' ||
      f.param === 'is_private'
        ? z.boolean().optional().describe(`Filter by ${f.field}.`)
        : z.string().optional().describe(`Filter by ${f.field}.`);
  }
  for (const r of ranges) {
    shape[r.param] = (r.op === 'min' || r.op === 'max' ? z.number() : z.string())
      .optional()
      .describe(`Range bound on ${r.field}.`);
  }
  if (soslBodyParam) {
    shape[soslBodyParam] = z
      .string()
      .optional()
      .describe('Full-text search within note body (SOSL), combined with other filters.');
  }
  return tool({
    description,
    inputSchema: z.object(shape),
    execute: async (args: Record<string, unknown>) => {
      const creds = args.salesforceCredentials as string | undefined;
      if (!creds)
        return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
      const where: string[] = [];
      for (const f of filters) {
        const v = args[f.param];
        if (v === undefined || v === null || v === '') continue;
        if (typeof v === 'boolean') {
          where.push(`${f.field} = ${v ? 'true' : 'false'}`);
        } else if (f.like) {
          where.push(likeClauses(f.field, String(v)));
        } else {
          where.push(`${f.field} = '${soqlEscape(String(v))}'`);
        }
      }
      for (const r of ranges) {
        const v = args[r.param];
        if (v === undefined || v === null || v === '') continue;
        const op = r.op === 'from' ? '>=' : r.op === 'to' ? '<=' : r.op === 'min' ? '>=' : '<=';
        where.push(
          typeof v === 'number'
            ? `${r.field} ${op} ${v}`
            : `${r.field} ${op} '${soqlEscape(String(v))}'`,
        );
      }
      if (soslBodyParam && args[soslBodyParam]) {
        const sosl = (await sfGet(creds, '/search', {
          query: { q: `FIND {${String(args[soslBodyParam])}} IN ALL FIELDS RETURNING ${from}(Id)` },
        })) as { searchRecords?: { Id?: string }[] };
        if (sosl && (sosl as { error?: string }).error) return sosl;
        const ids = (sosl?.searchRecords ?? []).map((r) => r.Id).filter(Boolean);
        if (!ids.length) return { totalSize: 0, done: true, records: [] };
        where.push(`Id IN ('${ids.map((id) => soqlEscape(id as string)).join("','")}')`);
      }
      const q =
        `SELECT ${(args.fields as string) || defaultFields} FROM ${from}` +
        (where.length ? ` WHERE ${where.join(' AND ')}` : '') +
        ` LIMIT ${((args.limit as number) || 50) > 2000 ? 2000 : (args.limit as number) || 50}`;
      return sfGet(creds, '/query', { query: { q } });
    },
  });
}

export const salesforceSearchAccounts = searchTool(
  'salesforceSearchAccounts',
  'Search Salesforce accounts by name, industry, type, phone, website or billing address. Provide at least one filter; use Get account for full details of a known record.',
  'Account',
  'Id,Name,Industry,Phone,Website,BillingStreet,BillingCity,BillingState,BillingCountry,NumberOfEmployees',
  [
    { param: 'name', field: 'Name', like: true },
    { param: 'industry', field: 'Industry' },
    { param: 'type', field: 'Type' },
    { param: 'phone', field: 'Phone', like: true },
    { param: 'website', field: 'Website', like: true },
    { param: 'billing_city', field: 'BillingCity', like: true },
    { param: 'billing_state', field: 'BillingState', like: true },
    { param: 'billing_country', field: 'BillingCountry', like: true },
  ],
);

export const salesforceSearchContacts = searchTool(
  'salesforceSearchContacts',
  'Search Salesforce contacts (not leads) by name, email, phone, account or title. Partial matches are fuzzy — confirm the 18-character Id before using results in write operations.',
  'Contact',
  'Id,Name,FirstName,LastName,Email,Phone,MobilePhone,Title,AccountId,Account.Name',
  [
    { param: 'name', field: 'Name', like: true },
    { param: 'email', field: 'Email', like: true },
    { param: 'phone', field: 'Phone', like: true },
    { param: 'account_name', field: 'Account.Name', like: true },
    { param: 'title', field: 'Title', like: true },
  ],
);

export const salesforceSearchLeads = searchTool(
  'salesforceSearchLeads',
  'Search Salesforce leads by name, email, phone, company, title, status or lead source. Provide at least one criterion; confirm Email or Company before downstream use.',
  'Lead',
  'Id,Name,FirstName,LastName,Email,Phone,Title,Company,Status,LeadSource,CreatedDate',
  [
    { param: 'name', field: 'Name', like: true },
    { param: 'email', field: 'Email', like: true },
    { param: 'phone', field: 'Phone', like: true },
    { param: 'company', field: 'Company', like: true },
    { param: 'title', field: 'Title', like: true },
    { param: 'status', field: 'Status' },
    { param: 'lead_source', field: 'LeadSource' },
  ],
);

export const salesforceSearchCampaigns = searchTool(
  'salesforceSearchCampaigns',
  'Search Salesforce campaigns by name, type, status, active flag or start-date range. Requires the Campaign object to be enabled in the org.',
  'Campaign',
  'Id,Name,Type,Status,StartDate,EndDate,IsActive,Description,BudgetedCost,ActualCost,NumberOfContacts,NumberOfLeads',
  [
    { param: 'name', field: 'Name', like: true },
    { param: 'type', field: 'Type' },
    { param: 'status', field: 'Status' },
    { param: 'is_active', field: 'IsActive' },
  ],
  [
    { param: 'start_date_from', field: 'StartDate', op: 'from' },
    { param: 'start_date_to', field: 'StartDate', op: 'to' },
  ],
);

export const salesforceSearchOpportunities = searchTool(
  'salesforceSearchOpportunities',
  'Search Salesforce opportunities by name, account, stage, amount range, close-date range, won/closed flags or lead source. Verify the record Id before downstream use.',
  'Opportunity',
  'Id,Name,AccountId,Account.Name,StageName,Amount,CloseDate,IsClosed,IsWon,Probability,LeadSource,CreatedDate',
  [
    { param: 'name', field: 'Name', like: true },
    { param: 'account_name', field: 'Account.Name', like: true },
    { param: 'stage_name', field: 'StageName' },
    { param: 'lead_source', field: 'LeadSource' },
    { param: 'is_closed', field: 'IsClosed' },
    { param: 'is_won', field: 'IsWon' },
  ],
  [
    { param: 'amount_min', field: 'Amount', op: 'min' },
    { param: 'amount_max', field: 'Amount', op: 'max' },
    { param: 'close_date_from', field: 'CloseDate', op: 'from' },
    { param: 'close_date_to', field: 'CloseDate', op: 'to' },
  ],
);

export const salesforceSearchNotes = searchTool(
  'salesforceSearchNotes',
  'Search Salesforce notes by title, owner or creation-date range. Provide at least one filter; body full-text search is not supported here.',
  'Note',
  'Id,Title,Body,ParentId,Parent.Name,OwnerId,Owner.Name,IsPrivate,CreatedDate,LastModifiedDate',
  [
    { param: 'title', field: 'Title', like: true },
    { param: 'owner_name', field: 'Owner.Name', like: true },
    { param: 'is_private', field: 'IsPrivate' },
  ],
  [
    { param: 'created_date_from', field: 'CreatedDate', op: 'from' },
    { param: 'created_date_to', field: 'CreatedDate', op: 'to' },
  ],
  'body',
);

export const salesforceSearchTasks = searchTool(
  'salesforceSearchTasks',
  'Search Salesforce tasks by subject, status, priority, assignee, related account/contact or activity-date range. Provide at least one filter.',
  'Task',
  'Id,Subject,Status,Priority,ActivityDate,IsClosed,Description,OwnerId,Owner.Name,WhatId,What.Name,WhoId,Who.Name',
  [
    { param: 'subject', field: 'Subject', like: true },
    { param: 'status', field: 'Status' },
    { param: 'priority', field: 'Priority' },
    { param: 'assigned_to_name', field: 'Owner.Name', like: true },
    { param: 'account_name', field: 'Account.Name', like: true },
    { param: 'contact_name', field: 'Who.Name', like: true },
    { param: 'is_closed', field: 'IsClosed' },
  ],
);

export const salesforceListEmailTemplates = tool({
  description:
    'List Salesforce email templates with name search, type, folder, active-only and ordering filters.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    search_term: z.string().optional().describe('Partial template name match.'),
    template_type: z
      .string()
      .optional()
      .describe('Filter by type: text, custom, html, visualforce.'),
    folder_name: z.string().optional().describe('Filter by folder name.'),
    is_active_only: z.boolean().optional().describe('Only active templates (default true).'),
    include_body: z
      .boolean()
      .optional()
      .describe('Include Body/HtmlValue columns (larger responses).'),
    order_by: z.string().optional().describe('Sort field (default Name).'),
    order_direction: z.enum(['ASC', 'DESC']).optional().describe('Sort direction (default ASC).'),
    limit: z.number().int().min(1).max(2000).optional().describe('Max records (default 50).'),
  }),
  execute: async ({
    salesforceCredentials,
    search_term,
    template_type,
    folder_name,
    is_active_only,
    include_body,
    order_by,
    order_direction,
    limit,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const fields = [
      'Id',
      'Name',
      'Subject',
      'TemplateType',
      'IsActive',
      'FolderName',
      'Description',
      'DeveloperName',
    ];
    if (include_body) fields.push('Body', 'HtmlValue');
    const where: string[] = [];
    if (search_term) where.push(likeClauses('Name', search_term));
    if (template_type) where.push(`TemplateType = '${soqlEscape(template_type)}'`);
    if (folder_name) where.push(`FolderName = '${soqlEscape(folder_name)}'`);
    if (is_active_only !== false) where.push('IsActive = true');
    const q =
      `SELECT ${fields.join(', ')} FROM EmailTemplate` +
      (where.length ? ` WHERE ${where.join(' AND ')}` : '') +
      ` ORDER BY ${order_by || 'Name'} ${order_direction || 'ASC'}` +
      ` LIMIT ${Math.min(limit || 50, 2000)}`;
    return sfGet(salesforceCredentials, '/query', { query: { q } });
  },
});
