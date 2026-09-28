// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { sfDelete, sfGet, sfHead, sfPatch, sfPost, sfPut, sfRaw, sfCsv } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const salesforceAddContactToCampaign = tool({
  description:
    'Adds a contact to a campaign by creating a CampaignMember record to track campaign engagement. Fails if the contact is already a member of the campaign; pre-check membership via SOQL before calling.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    status: z
      .string()
      .optional()
      .describe(
        "The status of the campaign member. Common values include 'Sent', 'Responded'. The available statuses depend on campaign configuration. Value must exactly match a configured CampaignMember Status for the campaign; arbitrary strings will fail",
      ),
    contactId: z.string().describe('The Salesforce ID of the contact to add to the campaign.'),
    campaignId: z.string().describe('The Salesforce ID of the campaign to add the contact to.'),
    customFields: z
      .record(z.any())
      .optional()
      .describe(
        "Dictionary of custom field API names and their values for CampaignMember. Custom field names typically end with '__c'.",
      ),
  }),
  execute: async ({ salesforceCredentials, status, contactId, campaignId, customFields }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const customSpread = customFields && typeof customFields === 'object' ? customFields : {};
    return sfPost(salesforceCredentials, `/sobjects/CampaignMember`, {
      body: { Status: status, ContactId: contactId, CampaignId: campaignId, ...customSpread },
    });
  },
});

export const salesforceAddLeadToCampaign = tool({
  description:
    'Adds a lead to a campaign by creating a CampaignMember record, allowing you to track campaign engagement. Both `campaign_id` and `lead_id` must be valid Salesforce IDs of active, existing records — names or emails cannot be substituted, and deleted or inactive records will cause the call to fail. This is a persistent CRM write; confirm the correct lead and campaign before calling.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    status: z
      .string()
      .optional()
      .describe(
        "The status of the campaign member. Common values include 'Sent', 'Responded'. The available statuses depend on campaign configuration. Value must exactly match one of the campaign's configured CampaignMember statuses; a mismatch will cause ",
      ),
    leadId: z.string().describe('The Salesforce ID of the lead to add to the campaign.'),
    campaignId: z.string().describe('The Salesforce ID of the campaign to add the lead to.'),
    customFields: z
      .record(z.any())
      .optional()
      .describe(
        "Dictionary of custom field API names and their values for CampaignMember. Custom field names typically end with '__c'.",
      ),
  }),
  execute: async ({ salesforceCredentials, status, leadId, campaignId, customFields }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const customSpread = customFields && typeof customFields === 'object' ? customFields : {};
    return sfPost(salesforceCredentials, `/sobjects/CampaignMember`, {
      body: { Status: status, LeadId: leadId, CampaignId: campaignId, ...customSpread },
    });
  },
});

export const salesforceCreateCampaign = tool({
  description:
    'Creates a new campaign in Salesforce. Only `name` is universally required, but org-level validation rules commonly enforce `type`, `status`, `start_date`, and `end_date` as well — omitting them may cause creation to fail.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    name: z.string().describe('Campaign name (required field in Salesforce).'),
    type: z.string().optional().describe('Type of campaign.'),
    status: z.string().optional().describe('Current status of the campaign.'),
    endDate: z.string().optional().describe('Campaign end date in YYYY-MM-DD format.'),
    isActive: z
      .boolean()
      .optional()
      .describe(
        'Whether the campaign is currently active. Depending on org configuration, setting to `true` may require valid `start_date`/`end_date` ranges; violations raise a non-retriable `CANNOT_INSERT_UPDATE_ACTIVATE_ENTITY` error.',
      ),
    parentId: z
      .string()
      .optional()
      .describe('ID of the parent campaign if this is a child campaign.'),
    startDate: z.string().optional().describe('Campaign start date in YYYY-MM-DD format.'),
    actualCost: z.number().optional().describe('Actual cost spent on the campaign.'),
    description: z.string().optional().describe('Detailed description of the campaign.'),
    numberSent: z.number().optional().describe('Number of individuals targeted by the campaign.'),
    budgetedCost: z.number().optional().describe('Budgeted cost for the campaign.'),
    customFields: z
      .record(z.any())
      .optional()
      .describe(
        "Dictionary of custom field names and their values. Custom field names should end with '__c' (e.g., 'Priority__c', 'Region__c'). Values can be strings, numbers, booleans, or dates depending on the field type.",
      ),
    expectedRevenue: z.number().optional().describe('Expected revenue from the campaign.'),
    expectedResponse: z.number().optional().describe('Expected response rate as a percentage.'),
  }),
  execute: async ({
    salesforceCredentials,
    name,
    type,
    status,
    endDate,
    isActive,
    parentId,
    startDate,
    actualCost,
    description,
    numberSent,
    budgetedCost,
    customFields,
    expectedRevenue,
    expectedResponse,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const customSpread = customFields && typeof customFields === 'object' ? customFields : {};
    return sfPost(salesforceCredentials, `/sobjects/Campaign`, {
      body: {
        name: name,
        type: type,
        status: status,
        EndDate: endDate,
        IsActive: isActive,
        ParentId: parentId,
        StartDate: startDate,
        ActualCost: actualCost,
        description: description,
        NumberSent: numberSent,
        BudgetedCost: budgetedCost,
        ...customSpread,
        ExpectedRevenue: expectedRevenue,
        ExpectedResponse: expectedResponse,
      },
    });
  },
});

export const salesforceCreateCampaignRecordViaPost = tool({
  description:
    "DEPRECATED: Creates a new campaign record in Salesforce; if 'ParentId' is provided, it must be a valid ID of an existing Campaign record, and if 'OwnerId' is provided, it must be a valid ID of an active User.",
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    id: z
      .string()
      .optional()
      .describe(
        'Unique identifier for the campaign record, usually system-generated upon creation.',
      ),
    name: z.string().describe('Required. Name of the campaign (limit 80 characters).'),
    type: z.string().optional().describe('Type of campaign (limit 40 characters).'),
    status: z.string().optional().describe('Current status of the campaign (limit 40 characters).'),
    endDate: z
      .string()
      .optional()
      .describe(
        'Ending date for the campaign (YYYY-MM-DD); responses received after this date are still counted.',
      ),
    ownerId: z
      .string()
      .optional()
      .describe('ID of the campaign owner. Defaults to the ID of the user making the API call.'),
    isActive: z
      .boolean()
      .optional()
      .describe('Indicates if the campaign is active. Label: Active.'),
    parentId: z
      .string()
      .optional()
      .describe('ID of the parent Campaign record for hierarchical grouping.'),
    isDeleted: z
      .boolean()
      .optional()
      .describe('Indicates if the campaign record has been deleted.'),
    startDate: z.string().optional().describe('Starting date for the campaign (YYYY-MM-DD).'),
    actualCost: z
      .number()
      .int()
      .optional()
      .describe("Actual cost of the campaign, in the organization's currency."),
    numberSent: z
      .number()
      .int()
      .optional()
      .describe('Total number of individuals targeted (e.g., emails sent). Label: Num Sent.'),
    createdById: z
      .string()
      .optional()
      .describe('Read-only. ID of the user who created this campaign record.'),
    createdDate: z.string().optional().describe('Read-only. Creation date and time (ISO 8601).'),
    description: z
      .string()
      .optional()
      .describe(
        'Detailed description of the campaign (limit 32KB; first 255 characters displayed in reports).',
      ),
    budgetedCost: z
      .number()
      .int()
      .optional()
      .describe("Budgeted cost for this campaign, in the organization's currency."),
    numberOfLeads: z
      .number()
      .int()
      .optional()
      .describe('Read-only. Total leads associated with this campaign. Label: Leads in Campaign.'),
    customFields: z
      .record(z.any())
      .optional()
      .describe(
        "Dictionary of custom field API names and their values. Custom field names typically end with '__c'.",
      ),
    lastViewedDate: z
      .string()
      .optional()
      .describe(
        "Read-only. Timestamp of current user's last view of this record/list view (ISO 8601). Null if only accessed (see LastReferencedDate) but not viewed.",
      ),
    systemModstamp: z
      .string()
      .optional()
      .describe(
        'Read-only. Last modification date and time by a user or automated process (ISO 8601).',
      ),
    expectedRevenue: z
      .number()
      .int()
      .optional()
      .describe("Expected revenue from this campaign, in the organization's currency."),
    attributes__url: z
      .string()
      .optional()
      .describe('Read-only. Relative URL to the campaign record.'),
    expectedResponse: z
      .number()
      .int()
      .optional()
      .describe('Percentage of responses expected from targeted individuals.'),
    lastActivityDate: z
      .string()
      .optional()
      .describe(
        'Read-only. Most recent activity date (event due date or closed task due date, YYYY-MM-DD).',
      ),
    lastModifiedById: z
      .string()
      .optional()
      .describe('Read-only. ID of the user who last modified this campaign record.'),
    lastModifiedDate: z
      .string()
      .optional()
      .describe('Read-only. Last modification date and time (ISO 8601).'),
    numberOfContacts: z
      .number()
      .int()
      .optional()
      .describe('Read-only. Total contacts associated with this campaign. Label: Total Contacts.'),
    attributes__type: z.string().optional().describe("sObject type, typically 'Campaign'."),
    numberOfResponses: z
      .number()
      .int()
      .optional()
      .describe(
        'Read-only. Contacts and unconverted leads with Member Status “Responded”. Label: Responses in Campaign.',
      ),
    lastReferencedDate: z
      .string()
      .optional()
      .describe(
        "Read-only. Timestamp of current user's last access to this record, a related record, or a list view (ISO 8601).",
      ),
    numberOfOpportunities: z
      .number()
      .int()
      .optional()
      .describe(
        'Read-only. Total opportunities associated with this campaign. Label: Opportunities in Campaign.',
      ),
    amountAllOpportunities: z
      .number()
      .int()
      .optional()
      .describe(
        "Read-only. Total monetary amount of all opportunities (including closed/won) in this campaign, in organization's currency. Label: Value Opportunities in Campaign.",
      ),
    amountWonOpportunities: z
      .number()
      .int()
      .optional()
      .describe(
        "Read-only. Total monetary amount of closed/won opportunities in this campaign, in organization's currency. Label: Value Won Opportunities in Campaign.",
      ),
    numberOfConvertedLeads: z
      .number()
      .int()
      .optional()
      .describe(
        'Read-only. Leads converted to an account and contact from this campaign. Label: Converted Leads.',
      ),
    numberOfWonOpportunities: z
      .number()
      .int()
      .optional()
      .describe(
        'Read-only. Closed or won opportunities from this campaign. Label: Won Opportunities in Campaign.',
      ),
    campaignMemberRecordTypeId: z
      .string()
      .optional()
      .describe(
        'Record type ID for associated CampaignMember records, determining their fields and layout.',
      ),
  }),
  execute: async ({
    salesforceCredentials,
    id,
    name,
    type,
    status,
    endDate,
    ownerId,
    isActive,
    parentId,
    isDeleted,
    startDate,
    actualCost,
    numberSent,
    createdById,
    createdDate,
    description,
    budgetedCost,
    numberOfLeads,
    customFields,
    lastViewedDate,
    systemModstamp,
    expectedRevenue,
    attributes__url,
    expectedResponse,
    lastActivityDate,
    lastModifiedById,
    lastModifiedDate,
    numberOfContacts,
    attributes__type,
    numberOfResponses,
    lastReferencedDate,
    numberOfOpportunities,
    amountAllOpportunities,
    amountWonOpportunities,
    numberOfConvertedLeads,
    numberOfWonOpportunities,
    campaignMemberRecordTypeId,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const customSpread = customFields && typeof customFields === 'object' ? customFields : {};
    return sfPost(salesforceCredentials, `/sobjects/Campaign`, {
      body: {
        Id: id,
        Name: name,
        Type: type,
        Status: status,
        EndDate: endDate,
        OwnerId: ownerId,
        IsActive: isActive,
        ParentId: parentId,
        IsDeleted: isDeleted,
        StartDate: startDate,
        ActualCost: actualCost,
        NumberSent: numberSent,
        CreatedById: createdById,
        CreatedDate: createdDate,
        Description: description,
        BudgetedCost: budgetedCost,
        NumberOfLeads: numberOfLeads,
        ...customSpread,
        LastViewedDate: lastViewedDate,
        SystemModstamp: systemModstamp,
        ExpectedRevenue: expectedRevenue,
        attributes__url: attributes__url,
        ExpectedResponse: expectedResponse,
        LastActivityDate: lastActivityDate,
        LastModifiedById: lastModifiedById,
        LastModifiedDate: lastModifiedDate,
        NumberOfContacts: numberOfContacts,
        attributes__type: attributes__type,
        NumberOfResponses: numberOfResponses,
        LastReferencedDate: lastReferencedDate,
        NumberOfOpportunities: numberOfOpportunities,
        AmountAllOpportunities: amountAllOpportunities,
        AmountWonOpportunities: amountWonOpportunities,
        NumberOfConvertedLeads: numberOfConvertedLeads,
        NumberOfWonOpportunities: numberOfWonOpportunities,
        CampaignMemberRecordTypeId: campaignMemberRecordTypeId,
      },
    });
  },
});

export const salesforceDeleteCampaign = tool({
  description: 'Permanently deletes a campaign from Salesforce. This action cannot be undone.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    campaignId: z.string().describe('The Salesforce ID of the campaign to delete.'),
  }),
  execute: async ({ salesforceCredentials, campaignId }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfDelete(salesforceCredentials, `/sobjects/Campaign/${campaignId}`);
  },
});

export const salesforceGetCampaign = tool({
  description:
    'Retrieves a specific campaign by ID from Salesforce, returning all available fields.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    campaignId: z.string().describe('The Salesforce ID of the campaign to retrieve.'),
  }),
  execute: async ({ salesforceCredentials, campaignId }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/sobjects/Campaign/${campaignId}`);
  },
});

export const salesforceListCampaigns = tool({
  description:
    'Lists campaigns from Salesforce using SOQL query, allowing flexible filtering, sorting, and field selection. Results returned under `response_data.records`; use `Id` (not `Name`) to identify campaigns in downstream operations.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    query: z
      .string()
      .optional()
      .describe(
        'SOQL query to fetch campaigns. Use standard SOQL syntax to filter, sort, and limit results. To disambiguate similarly named campaigns, filter on `Type`, `Status`, `StartDate`, or `EndDate`.',
      ),
  }),
  execute: async ({ salesforceCredentials, query }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    if (query === undefined)
      query =
        'SELECT Id, Name, Type, Status, StartDate, EndDate, BudgetedCost, ActualCost, ExpectedRevenue, IsActive, ParentId FROM Campaign';
    return sfGet(salesforceCredentials, `/query`, { query: { q: query } });
  },
});

export const salesforceRemoveCampaignObjectById = tool({
  description:
    'DEPRECATED: Permanently deletes a specific Campaign SObject in Salesforce using its unique ID.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    id: z
      .string()
      .describe(
        'The unique Salesforce identifier (typically 18-character) of the Campaign SObject to be deleted.',
      ),
  }),
  execute: async ({ salesforceCredentials, id }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfDelete(salesforceCredentials, `/sobjects/Campaign/${id}`);
  },
});

export const salesforceRetrieveCampaignDataWithErrorHandling = tool({
  description:
    'DEPRECATED: Retrieves comprehensive information and metadata for the Salesforce Campaign sObject, provided it is enabled and accessible in the organization, and features robust error handling.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
  }),
  execute: async ({ salesforceCredentials }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/sobjects/Campaign`);
  },
});

export const salesforceRetrieveSpecificCampaignObjectDetails = tool({
  description:
    'DEPRECATED: Retrieves details for a specific Salesforce Campaign object by its ID, optionally limiting to specified fields; the Campaign object must exist.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    id: z
      .string()
      .describe(
        "The unique identifier (ID) of the Salesforce Campaign object to retrieve. Example: '001R0000005hDFYIA2'.",
      ),
    fields: z
      .string()
      .optional()
      .describe(
        "Optional comma-delimited list of field API names for the Campaign object whose values you want to retrieve (e.g., 'name,description,numberofemployees,industry'). Field names are case-sensitive and should match Salesforce API names. If unspe",
      ),
  }),
  execute: async ({ salesforceCredentials, id, fields }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/sobjects/Campaign/${id}`, { query: { fields: fields } });
  },
});

export const salesforceUpdateCampaign = tool({
  description:
    'Updates an existing campaign in Salesforce with the specified changes. Only provided fields will be updated.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    name: z.string().optional().describe('Updated campaign name. Leave empty to keep unchanged.'),
    type: z.string().optional().describe('Updated campaign type. Leave empty to keep unchanged.'),
    status: z
      .string()
      .optional()
      .describe('Updated campaign status. Leave empty to keep unchanged.'),
    endDate: z
      .string()
      .optional()
      .describe('Updated end date in YYYY-MM-DD format. Leave empty to keep unchanged.'),
    isActive: z
      .boolean()
      .optional()
      .describe('Updated active status. Leave as None to keep unchanged.'),
    parentId: z
      .string()
      .optional()
      .describe('Updated parent campaign ID. Leave empty to keep unchanged.'),
    startDate: z
      .string()
      .optional()
      .describe('Updated start date in YYYY-MM-DD format. Leave empty to keep unchanged.'),
    actualCost: z
      .number()
      .optional()
      .describe('Updated actual cost. Leave unset to keep unchanged.'),
    campaignId: z.string().describe('The Salesforce ID of the campaign to update.'),
    description: z
      .string()
      .optional()
      .describe('Updated description. Leave empty to keep unchanged.'),
    numberSent: z
      .number()
      .optional()
      .describe('Updated number sent. Leave unset to keep unchanged.'),
    budgetedCost: z
      .number()
      .optional()
      .describe('Updated budgeted cost. Leave unset to keep unchanged.'),
    customFields: z
      .record(z.any())
      .optional()
      .describe(
        'Custom fields to update on the campaign. Use API field names (ending in __c). Leave empty if not updating custom fields.',
      ),
    expectedRevenue: z
      .number()
      .optional()
      .describe('Updated expected revenue. Leave unset to keep unchanged.'),
    expectedResponse: z
      .number()
      .optional()
      .describe('Updated expected response rate. Leave unset to keep unchanged.'),
  }),
  execute: async ({
    salesforceCredentials,
    name,
    type,
    status,
    endDate,
    isActive,
    parentId,
    startDate,
    actualCost,
    campaignId,
    description,
    numberSent,
    budgetedCost,
    customFields,
    expectedRevenue,
    expectedResponse,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const customSpread = customFields && typeof customFields === 'object' ? customFields : {};
    const sfRawBody = {
      name: name,
      type: type,
      status: status,
      EndDate: endDate,
      IsActive: isActive,
      ParentId: parentId,
      StartDate: startDate,
      ActualCost: actualCost,
      description: description,
      NumberSent: numberSent,
      BudgetedCost: budgetedCost,
      ...customSpread,
      ExpectedRevenue: expectedRevenue,
      ExpectedResponse: expectedResponse,
    };
    const sfBody = Object.fromEntries(
      Object.entries(sfRawBody).filter(([, v]) => v !== undefined && v !== null && v !== ''),
    );
    return sfPatch(salesforceCredentials, `/sobjects/Campaign/${campaignId}`, { body: sfBody });
  },
});

export const salesforceUpdateCampaignByIdWithJson = tool({
  description:
    'DEPRECATED: Updates specific fields of an existing Campaign in Salesforce, identified by its unique `id`, which must already exist.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    id: z
      .string()
      .describe('Unique identifier of the Campaign to update (e.g., 001R0000005hDFYIA2).'),
    name: z.string().optional().describe('Name of the campaign (max 80 characters).'),
    type: z.string().optional().describe('Type of campaign (limit 40 characters).'),
    status: z.string().optional().describe('Status of the campaign (limit 40 characters).'),
    endDate: z
      .string()
      .optional()
      .describe(
        'Campaign end date (YYYY-MM-DD); responses received after this date are still counted.',
      ),
    ownerId: z
      .string()
      .optional()
      .describe('ID of the campaign owner; defaults to the API caller if not specified.'),
    isActive: z
      .boolean()
      .optional()
      .describe('Indicates if the campaign is active. Label: Active.'),
    parentId: z.string().optional().describe('ID of the parent Campaign if part of a hierarchy.'),
    isDeleted: z
      .boolean()
      .optional()
      .describe('Read-only. Indicates if the record has been deleted.'),
    startDate: z.string().optional().describe('Campaign start date (YYYY-MM-DD).'),
    actualCost: z.number().int().optional().describe('Actual cost of the campaign.'),
    numberSent: z
      .number()
      .int()
      .optional()
      .describe('Number of individuals targeted (e.g., emails sent). Label: Num Sent.'),
    createdById: z.string().optional().describe('Read-only. ID of the creator.'),
    createdDate: z.string().optional().describe('Read-only. Creation date and time.'),
    description: z
      .string()
      .optional()
      .describe('Campaign description (limit 32KB; first 255 chars displayed in reports).'),
    budgetedCost: z.number().int().optional().describe('Budgeted cost for the campaign.'),
    numberOfLeads: z
      .number()
      .int()
      .optional()
      .describe('Read-only. Total leads in the campaign. Label: Leads in Campaign.'),
    customFields: z
      .record(z.any())
      .optional()
      .describe(
        "Dictionary of custom field API names and their values. Custom field names typically end with '__c'.",
      ),
    lastViewedDate: z
      .string()
      .optional()
      .describe("Read-only. Timestamp of the current user's last view."),
    systemModstamp: z
      .string()
      .optional()
      .describe('Read-only. Timestamp of the last system modification.'),
    expectedRevenue: z.number().int().optional().describe('Expected revenue from the campaign.'),
    attributes__url: z.string().optional().describe('Read-only. API URL for this Campaign object.'),
    expectedResponse: z
      .number()
      .int()
      .optional()
      .describe('Expected response rate percentage (e.g., 10 for 10%).'),
    lastActivityDate: z
      .string()
      .optional()
      .describe('Read-only. Date of the last activity (event or closed task).'),
    lastModifiedById: z.string().optional().describe('Read-only. ID of the last modifier.'),
    lastModifiedDate: z.string().optional().describe('Read-only. Last modification date and time.'),
    numberOfContacts: z
      .number()
      .int()
      .optional()
      .describe('Read-only. Total contacts in the campaign. Label: Total Contacts.'),
    attributes__type: z
      .string()
      .optional()
      .describe("Read-only. Salesforce object type, typically 'Campaign'."),
    numberOfResponses: z
      .number()
      .int()
      .optional()
      .describe("Read-only. Number of 'Responded' members. Label: Responses in Campaign."),
    lastReferencedDate: z
      .string()
      .optional()
      .describe("Read-only. Timestamp of the current user's last reference."),
    numberOfOpportunities: z
      .number()
      .int()
      .optional()
      .describe(
        'Read-only. Total opportunities in the campaign. Label: Opportunities in Campaign.',
      ),
    amountAllOpportunities: z
      .number()
      .int()
      .optional()
      .describe(
        'Read-only. Total value of all opportunities. Label: Value Opportunities in Campaign.',
      ),
    amountWonOpportunities: z
      .number()
      .int()
      .optional()
      .describe(
        'Read-only. Total value of won opportunities. Label: Value Won Opportunities in Campaign.',
      ),
    numberOfConvertedLeads: z
      .number()
      .int()
      .optional()
      .describe('Read-only. Number of converted leads. Label: Converted Leads.'),
    numberOfWonOpportunities: z
      .number()
      .int()
      .optional()
      .describe('Read-only. Number of won opportunities. Label: Won Opportunities in Campaign.'),
    campaignMemberRecordTypeId: z
      .string()
      .optional()
      .describe('Record type ID for CampaignMember records, used to differentiate member types.'),
  }),
  execute: async ({
    salesforceCredentials,
    id,
    name,
    type,
    status,
    endDate,
    ownerId,
    isActive,
    parentId,
    isDeleted,
    startDate,
    actualCost,
    numberSent,
    createdById,
    createdDate,
    description,
    budgetedCost,
    numberOfLeads,
    customFields,
    lastViewedDate,
    systemModstamp,
    expectedRevenue,
    attributes__url,
    expectedResponse,
    lastActivityDate,
    lastModifiedById,
    lastModifiedDate,
    numberOfContacts,
    attributes__type,
    numberOfResponses,
    lastReferencedDate,
    numberOfOpportunities,
    amountAllOpportunities,
    amountWonOpportunities,
    numberOfConvertedLeads,
    numberOfWonOpportunities,
    campaignMemberRecordTypeId,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const customSpread = customFields && typeof customFields === 'object' ? customFields : {};
    return sfPatch(salesforceCredentials, `/sobjects/Campaign/${id}`, {
      body: {
        Name: name,
        Type: type,
        Status: status,
        EndDate: endDate,
        OwnerId: ownerId,
        IsActive: isActive,
        ParentId: parentId,
        IsDeleted: isDeleted,
        StartDate: startDate,
        ActualCost: actualCost,
        NumberSent: numberSent,
        CreatedById: createdById,
        CreatedDate: createdDate,
        Description: description,
        BudgetedCost: budgetedCost,
        NumberOfLeads: numberOfLeads,
        ...customSpread,
        LastViewedDate: lastViewedDate,
        SystemModstamp: systemModstamp,
        ExpectedRevenue: expectedRevenue,
        attributes__url: attributes__url,
        ExpectedResponse: expectedResponse,
        LastActivityDate: lastActivityDate,
        LastModifiedById: lastModifiedById,
        LastModifiedDate: lastModifiedDate,
        NumberOfContacts: numberOfContacts,
        attributes__type: attributes__type,
        NumberOfResponses: numberOfResponses,
        LastReferencedDate: lastReferencedDate,
        NumberOfOpportunities: numberOfOpportunities,
        AmountAllOpportunities: amountAllOpportunities,
        AmountWonOpportunities: amountWonOpportunities,
        NumberOfConvertedLeads: numberOfConvertedLeads,
        NumberOfWonOpportunities: numberOfWonOpportunities,
        CampaignMemberRecordTypeId: campaignMemberRecordTypeId,
      },
    });
  },
});
