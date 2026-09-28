// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { sfDelete, sfGet, sfHead, sfPatch, sfPost, sfPut, sfRaw, sfCsv } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const salesforceAddOpportunityLineItem = tool({
  description:
    "Adds a product (line item) to an opportunity. The product must exist in a pricebook entry that's associated with the opportunity's pricebook.",
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    discount: z
      .number()
      .optional()
      .describe('Discount percentage (0-100). Cannot be used with TotalPrice.'),
    quantity: z.number().describe('The quantity of the product to add.'),
    unitPrice: z
      .number()
      .optional()
      .describe(
        'The sales price per unit. Provide either unit_price or total_price — Salesforce does NOT auto-fill the price from the pricebook entry on insert, and omitting both fails with FIELD_INTEGRITY_EXCEPTION.',
      ),
    description: z.string().optional().describe('Optional description for this line item.'),
    totalPrice: z
      .number()
      .optional()
      .describe('The total price for this line item. Cannot be used with UnitPrice or Discount.'),
    serviceDate: z
      .string()
      .optional()
      .describe('Service date for the product in YYYY-MM-DD format.'),
    customFields: z
      .record(z.any())
      .optional()
      .describe(
        "Dictionary of custom field API names and their values. Custom field names typically end with '__c'.",
      ),
    opportunityId: z.string().describe('The Salesforce ID of the opportunity to add a product to.'),
    pricebookEntryId: z
      .string()
      .describe(
        "The ID of the PricebookEntry that contains the product and price information. This links to a specific product in a specific pricebook. Entry must be active and match the opportunity's pricebook and currency; mismatches cause REQUIRED_FIELD",
      ),
  }),
  execute: async ({
    salesforceCredentials,
    discount,
    quantity,
    unitPrice,
    description,
    totalPrice,
    serviceDate,
    customFields,
    opportunityId,
    pricebookEntryId,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const customSpread = customFields && typeof customFields === 'object' ? customFields : {};
    return sfPost(salesforceCredentials, `/sobjects/OpportunityLineItem`, {
      body: {
        Discount: discount,
        Quantity: quantity,
        UnitPrice: unitPrice,
        Description: description,
        TotalPrice: totalPrice,
        ServiceDate: serviceDate,
        ...customSpread,
        OpportunityId: opportunityId,
        PricebookEntryId: pricebookEntryId,
      },
    });
  },
});

export const salesforceCreateOpportunity = tool({
  description: 'Creates a new opportunity in Salesforce with the specified information.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    name: z.string().describe('Opportunity name (required field in Salesforce).'),
    type: z.string().optional().describe('Type of opportunity.'),
    amount: z.number().optional().describe('Estimated total sale amount.'),
    nextStep: z.string().optional().describe('Description of next step in sales process.'),
    accountId: z
      .string()
      .optional()
      .describe(
        'ID of the Account this opportunity is associated with. Omitting leaves the opportunity orphaned and excluded from account-based reports.',
      ),
    closeDate: z
      .string()
      .describe('Expected close date in YYYY-MM-DD format (required field in Salesforce).'),
    contactId: z
      .string()
      .optional()
      .describe(
        'Deprecated: Salesforce Opportunity does not have a writable ContactId field. Contact-to-Opportunity associations must be managed through OpportunityContactRole. This parameter is accepted but ignored.',
      ),
    stageName: z
      .string()
      .describe('Current stage of the opportunity (required field in Salesforce).'),
    description: z.string().optional().describe('Text description of the opportunity.'),
    leadSource: z.string().optional().describe('Source of the opportunity.'),
    probability: z.number().optional().describe('Percentage probability of closing (0-100).'),
    customFields: z
      .record(z.any())
      .optional()
      .describe(
        "Dictionary of custom field API names and their values. Custom field names typically end with '__c' (e.g., 'Custom_Field__c'). Values are subject to org-level validation rules; invalid values raise FIELD_CUSTOM_VALIDATION_EXCEPTION.",
      ),
    pricebook2_id: z.string().optional().describe('ID of the price book for this opportunity.'),
  }),
  execute: async ({
    salesforceCredentials,
    name,
    type,
    amount,
    nextStep,
    accountId,
    closeDate,
    contactId,
    stageName,
    description,
    leadSource,
    probability,
    customFields,
    pricebook2_id,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const customSpread = customFields && typeof customFields === 'object' ? customFields : {};
    return sfPost(salesforceCredentials, `/sobjects/Opportunity`, {
      body: {
        name: name,
        type: type,
        amount: amount,
        NextStep: nextStep,
        AccountId: accountId,
        CloseDate: closeDate,
        ContactId: contactId,
        StageName: stageName,
        description: description,
        LeadSource: leadSource,
        probability: probability,
        ...customSpread,
        pricebook2_id: pricebook2_id,
      },
    });
  },
});

export const salesforceCreateOpportunityRecord = tool({
  description:
    'DEPRECATED: Creates a new Opportunity record in Salesforce; `Name`, `StageName`, and `CloseDate` are mandatory, and ensure any referenced IDs (e.g., `AccountId`, `CampaignId`) are valid and corresponding Salesforce features are enabled if used.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    id: z
      .string()
      .optional()
      .describe(
        'System-generated unique identifier. Typically not provided during creation; providing it may be ignored or cause an error.',
      ),
    name: z
      .string()
      .describe('Descriptive name for the opportunity. Required. Limit: 120 characters.'),
    type: z
      .string()
      .optional()
      .describe(
        "Opportunity type (e.g., 'New Business', 'Existing Customer'). Values depend on Salesforce configuration.",
      ),
    isWon: z
      .boolean()
      .optional()
      .describe(
        'Read-only. Indicates if won, lost, or open. Auto-set by Salesforce based on StageName; cannot be set on creation.',
      ),
    amount: z
      .number()
      .int()
      .optional()
      .describe(
        'Estimated total sale amount. If products are involved, this may be auto-calculated, and direct updates might be ignored.',
      ),
    fiscal: z
      .string()
      .optional()
      .describe(
        "Fiscal period ('YYYY Q' format, e.g., '2024 1') based on CloseDate. Used if standard fiscal year settings not enabled. Often auto-derived.",
      ),
    ownerId: z
      .string()
      .optional()
      .describe(
        'ID of the User owning this opportunity. Defaults to creating user if unspecified (depending on settings). Ensure User ID is valid and active.',
      ),
    isClosed: z
      .boolean()
      .optional()
      .describe(
        'Read-only. Indicates if closed or open. Auto-set by Salesforce based on StageName; cannot be set on creation.',
      ),
    nextStep: z
      .string()
      .optional()
      .describe('Next actionable step towards closing. Limit: 255 characters.'),
    accountId: z
      .string()
      .optional()
      .describe('ID of the linked Account. Often crucial for creating a valid opportunity.'),
    closeDate: z.string().describe('Expected close date (YYYY-MM-DD). Required.'),
    contactId: z
      .string()
      .optional()
      .describe(
        'ID of the primary Contact. Set only during creation. Use OpportunityContactRole object to modify or add other contacts later.',
      ),
    isDeleted: z
      .boolean()
      .optional()
      .describe(
        'Indicates if the record is in the Recycle Bin. Generally used for querying, not set during creation.',
      ),
    isPrivate: z
      .boolean()
      .optional()
      .describe(
        'If true, this opportunity is private and only visible to the owner and users with appropriate sharing access.',
      ),
    pushCount: z
      .number()
      .int()
      .optional()
      .describe(
        'Read-only. Used internally by Salesforce for mobile sync updates. Not user-settable.',
      ),
    stageName: z
      .string()
      .describe(
        "Current stage (e.g., 'Prospecting', 'Closed Won'). Required. May update ForecastCategoryName, IsClosed, IsWon, and Probability. Query OpportunityStage object or refer to Salesforce setup for valid names.",
      ),
    campaignId: z
      .string()
      .optional()
      .describe(
        'ID of the influencing Campaign. Ensure Campaign feature is enabled and ID is valid.',
      ),
    fiscalYear: z
      .number()
      .int()
      .optional()
      .describe(
        "Fiscal year (e.g., 2024) of CloseDate. Often auto-derived from CloseDate based on org's fiscal year settings.",
      ),
    leadSource: z
      .string()
      .optional()
      .describe(
        "Lead or opportunity source (e.g., 'Web', 'Partner Referral'). Values depend on Salesforce configuration.",
      ),
    createdById: z
      .string()
      .optional()
      .describe('Read-only. ID of the user who created this record. Auto-set by Salesforce.'),
    createdDate: z
      .string()
      .optional()
      .describe('Read-only. Creation timestamp. Auto-set by Salesforce.'),
    description: z
      .string()
      .optional()
      .describe('Detailed text description. Limit: 32,000 characters.'),
    probability: z
      .number()
      .int()
      .optional()
      .describe(
        'Likelihood (percentage, e.g., 75 for 75%) of closing. Often implied by StageName but can be overridden.',
      ),
    pricebook2Id: z
      .string()
      .optional()
      .describe(
        'ID of the associated Price Book (Pricebook2). Generally required if adding products. Ensure products/price books are enabled and ID is valid.',
      ),
    fiscalQuarter: z
      .number()
      .int()
      .optional()
      .describe(
        "Fiscal quarter (1-4) of CloseDate. Often auto-derived from CloseDate based on org's fiscal year settings.",
      ),
    customFields: z
      .record(z.any())
      .optional()
      .describe(
        "Dictionary of custom field API names and their values. Custom field names typically end with '__c'.",
      ),
    hasOverdueTask: z
      .boolean()
      .optional()
      .describe('Read-only. Indicates if overdue Tasks exist. API v35.0+.'),
    lastViewedDate: z
      .string()
      .optional()
      .describe(
        'Read-only. Timestamp of when current user last viewed this record. Not settable on creation.',
      ),
    orderNumber__c: z.string().optional().describe('Custom field: Associated order number.'),
    systemModstamp: z
      .string()
      .optional()
      .describe('Read-only. Last system modification timestamp. Auto-set by Salesforce.'),
    expectedRevenue: z
      .number()
      .int()
      .optional()
      .describe('Read-only. Calculated as Amount * Probability. Cannot be set during creation.'),
    hasOpenActivity: z
      .boolean()
      .optional()
      .describe('Read-only. Indicates if open activities (Events or Tasks) exist. API v35.0+.'),
    attributes__url: z.string().optional().describe('Relative URL for this Opportunity record.'),
    forecastCategory: z
      .string()
      .optional()
      .describe(
        "Forecast category (e.g., 'Pipeline', 'Best Case'). Often implied by StageName. For API v12.0+, typically set via ForecastCategoryName. Values depend on Salesforce configuration.",
      ),
    lastActivityDate: z
      .string()
      .optional()
      .describe(
        'Read-only. Date of the most recent activity (Event or Task). Not settable on creation.',
      ),
    lastModifiedById: z
      .string()
      .optional()
      .describe('Read-only. ID of the user who last modified this record. Auto-set by Salesforce.'),
    lastModifiedDate: z
      .string()
      .optional()
      .describe('Read-only. Last modification timestamp. Auto-set by Salesforce.'),
    attributes__type: z
      .string()
      .optional()
      .describe("SObject type for this record, typically 'Opportunity'."),
    trackingNumber__c: z.string().optional().describe('Custom field: Associated tracking number.'),
    lastReferencedDate: z
      .string()
      .optional()
      .describe(
        'Read-only. Timestamp of when current user last accessed this record or a related one. Not settable on creation.',
      ),
    mainCompetitors__c: z
      .string()
      .optional()
      .describe('Custom field: Identified main competitors.'),
    lastStageChangeDate: z
      .string()
      .optional()
      .describe('Read-only. Timestamp of last StageName change. Auto-set by Salesforce.'),
    currentGenerators__c: z
      .string()
      .optional()
      .describe('Custom field: Information on current generators.'),
    forecastCategoryName: z
      .string()
      .optional()
      .describe(
        "Name of the forecast category (e.g., 'Pipeline'). API v12.0+. Often implied by StageName but can be overridden. Typically determines ForecastCategory.",
      ),
    hasOpportunityLineItem: z
      .boolean()
      .optional()
      .describe(
        'Read-only. Indicates if associated line items (products) exist. System-managed; ignored during creation.',
      ),
    totalOpportunityQuantity: z
      .number()
      .int()
      .optional()
      .describe(
        'Total quantity of items (e.g., units, licenses). Used in quantity-based forecasting.',
      ),
    lastAmountChangedHistoryId: z
      .string()
      .optional()
      .describe(
        'Read-only. ID of OpportunityHistory record tracking last Amount change (API v50.0+). Not settable on creation.',
      ),
    deliveryInstallationStatus__c: z
      .string()
      .optional()
      .describe('Custom field: Delivery or installation status.'),
    lastCloseDateChangedHistoryId: z
      .string()
      .optional()
      .describe(
        'Read-only. ID of OpportunityHistory record tracking last CloseDate change (API v50.0+). Not settable on creation.',
      ),
  }),
  execute: async ({
    salesforceCredentials,
    id,
    name,
    type,
    isWon,
    amount,
    fiscal,
    ownerId,
    isClosed,
    nextStep,
    accountId,
    closeDate,
    contactId,
    isDeleted,
    isPrivate,
    pushCount,
    stageName,
    campaignId,
    fiscalYear,
    leadSource,
    createdById,
    createdDate,
    description,
    probability,
    pricebook2Id,
    fiscalQuarter,
    customFields,
    hasOverdueTask,
    lastViewedDate,
    orderNumber__c,
    systemModstamp,
    expectedRevenue,
    hasOpenActivity,
    attributes__url,
    forecastCategory,
    lastActivityDate,
    lastModifiedById,
    lastModifiedDate,
    attributes__type,
    trackingNumber__c,
    lastReferencedDate,
    mainCompetitors__c,
    lastStageChangeDate,
    currentGenerators__c,
    forecastCategoryName,
    hasOpportunityLineItem,
    totalOpportunityQuantity,
    lastAmountChangedHistoryId,
    deliveryInstallationStatus__c,
    lastCloseDateChangedHistoryId,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const customSpread = customFields && typeof customFields === 'object' ? customFields : {};
    return sfPost(salesforceCredentials, `/sobjects/Opportunity`, {
      body: {
        Id: id,
        Name: name,
        Type: type,
        IsWon: isWon,
        Amount: amount,
        Fiscal: fiscal,
        OwnerId: ownerId,
        IsClosed: isClosed,
        NextStep: nextStep,
        AccountId: accountId,
        CloseDate: closeDate,
        ContactId: contactId,
        IsDeleted: isDeleted,
        IsPrivate: isPrivate,
        PushCount: pushCount,
        StageName: stageName,
        CampaignId: campaignId,
        FiscalYear: fiscalYear,
        LeadSource: leadSource,
        CreatedById: createdById,
        CreatedDate: createdDate,
        Description: description,
        Probability: probability,
        Pricebook2Id: pricebook2Id,
        FiscalQuarter: fiscalQuarter,
        ...customSpread,
        HasOverdueTask: hasOverdueTask,
        LastViewedDate: lastViewedDate,
        OrderNumber__c: orderNumber__c,
        SystemModstamp: systemModstamp,
        ExpectedRevenue: expectedRevenue,
        HasOpenActivity: hasOpenActivity,
        attributes__url: attributes__url,
        ForecastCategory: forecastCategory,
        LastActivityDate: lastActivityDate,
        LastModifiedById: lastModifiedById,
        LastModifiedDate: lastModifiedDate,
        attributes__type: attributes__type,
        TrackingNumber__c: trackingNumber__c,
        LastReferencedDate: lastReferencedDate,
        MainCompetitors__c: mainCompetitors__c,
        LastStageChangeDate: lastStageChangeDate,
        CurrentGenerators__c: currentGenerators__c,
        ForecastCategoryName: forecastCategoryName,
        HasOpportunityLineItem: hasOpportunityLineItem,
        TotalOpportunityQuantity: totalOpportunityQuantity,
        LastAmountChangedHistoryId: lastAmountChangedHistoryId,
        DeliveryInstallationStatus__c: deliveryInstallationStatus__c,
        LastCloseDateChangedHistoryId: lastCloseDateChangedHistoryId,
      },
    });
  },
});

export const salesforceDeleteOpportunity = tool({
  description: 'Permanently deletes an opportunity from Salesforce. This action cannot be undone.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    opportunityId: z.string().describe('The Salesforce ID of the opportunity to delete.'),
  }),
  execute: async ({ salesforceCredentials, opportunityId }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfDelete(salesforceCredentials, `/sobjects/Opportunity/${opportunityId}`);
  },
});

export const salesforceGetOpportunity = tool({
  description:
    'Retrieves a specific opportunity by ID from Salesforce, returning all available fields.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    fields: z
      .string()
      .optional()
      .describe(
        'Comma-delimited string of Opportunity field API names to retrieve. If omitted, all fields are returned. Custom objects may use non-standard API names for common fields (e.g., primary contact); verify exact field API names and handle null va',
      ),
    opportunityId: z
      .string()
      .describe(
        "The Salesforce ID of the opportunity to retrieve. Must be a valid 15 or 18 character alphanumeric Salesforce ID (e.g., '006Wd000005FG3CIAW'). When multiple similarly named opportunities exist in search results, confirm the correct record by",
      ),
  }),
  execute: async ({ salesforceCredentials, fields, opportunityId }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/sobjects/Opportunity/${opportunityId}`, {
      query: { fields: fields },
    });
  },
});

export const salesforceListOpportunities = tool({
  description:
    'Lists opportunities from Salesforce using SOQL query, allowing flexible filtering, sorting, and field selection. Results are paginated up to ~2000 rows per batch; check `done`, `totalSize`, and `nextRecordsUrl` fields to detect and retrieve additional pages, or use a SOQL `LIMIT` clause to cap results. For complex queries rejected by this tool, use `SALESFORCE_RUN_SOQL_QUERY` instead.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    query: z
      .string()
      .optional()
      .describe(
        'SOQL query to fetch opportunities. Use standard SOQL syntax to filter, sort, and limit results.  Omitting a `WHERE` clause returns all opportunities including historical ones. Results have no default sort order; include `ORDER BY CloseDate ',
      ),
  }),
  execute: async ({ salesforceCredentials, query }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    if (query === undefined)
      query =
        'SELECT Id, Name, StageName, CloseDate, Amount, Probability, Type, LeadSource, AccountId FROM Opportunity';
    return sfGet(salesforceCredentials, `/query`, { query: { q: query } });
  },
});

export const salesforceListPricebookEntries = tool({
  description:
    'Lists pricebook entries from Salesforce using SOQL query, allowing flexible filtering, sorting, and field selection. Use this to map product names to pricebook entry IDs needed for opportunity line items. When using returned IDs with SALESFORCE_ADD_OPPORTUNITY_LINE_ITEM, always filter with WHERE IsActive = true — inactive entries cause REQUIRED_FIELD_MISSING or INVALID_CROSS_REFERENCE_KEY errors.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    query: z
      .string()
      .optional()
      .describe(
        'SOQL query to fetch pricebook entries. Use standard SOQL syntax to filter, sort, and limit results.',
      ),
  }),
  execute: async ({ salesforceCredentials, query }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    if (query === undefined)
      query =
        'SELECT Id, Name, Product2Id, Pricebook2Id, UnitPrice, IsActive, ProductCode, Product2.Name FROM PricebookEntry';
    return sfGet(salesforceCredentials, `/query`, { query: { q: query } });
  },
});

export const salesforceListPricebooks = tool({
  description:
    'Lists pricebooks from Salesforce using SOQL query, allowing flexible filtering, sorting, and field selection. Use this to map pricebook names to IDs.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    query: z
      .string()
      .optional()
      .describe(
        'SOQL query to fetch pricebooks. Use standard SOQL syntax to filter, sort, and limit results.',
      ),
  }),
  execute: async ({ salesforceCredentials, query }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    if (query === undefined)
      query = 'SELECT Id, Name, IsActive, IsStandard, Description FROM Pricebook2';
    return sfGet(salesforceCredentials, `/query`, { query: { q: query } });
  },
});

export const salesforceRemoveOpportunityById = tool({
  description:
    "DEPRECATED: Permanently deletes an existing Salesforce Opportunity by its ID; if the Opportunity does not exist, a 'not found' (404) error occurs.",
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    id: z
      .string()
      .describe(
        "Unique identifier of the Salesforce Opportunity to be deleted, e.g., '001R0000005hDFYIA2'.",
      ),
  }),
  execute: async ({ salesforceCredentials, id }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfDelete(salesforceCredentials, `/sobjects/Opportunity/${id}`);
  },
});

export const salesforceRetrieveOpportunitiesData = tool({
  description:
    'Retrieves all available Opportunity records, representing potential revenue-generating deals, from Salesforce.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
  }),
  execute: async ({ salesforceCredentials }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/sobjects/Opportunity`);
  },
});

export const salesforceRetrieveOpportunityByIdWithOptionalFields = tool({
  description:
    'DEPRECATED: Retrieves a Salesforce Opportunity by its ID; the Opportunity ID must exist.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    id: z
      .string()
      .describe(
        'The unique Salesforce ID of the Opportunity record to retrieve. This is a required path parameter.',
      ),
    fields: z
      .string()
      .optional()
      .describe(
        'An optional, comma-delimited list of API names of the Opportunity fields to retrieve. If not specified, all accessible fields for the Opportunity object will be returned. This parameter is used as a query parameter in the GET request.',
      ),
  }),
  execute: async ({ salesforceCredentials, id, fields }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/sobjects/Opportunity/${id}`, {
      query: { fields: fields },
    });
  },
});

export const salesforceUpdateOpportunity = tool({
  description:
    'Updates an existing opportunity in Salesforce with the specified changes. Only provided fields will be updated. Returns HTTP 204 with empty body on success; call SALESFORCE_GET_OPPORTUNITY afterward to read updated values. Updates may fail with FIELD_CUSTOM_VALIDATION_EXCEPTION or REQUIRED_FIELD_MISSING — inspect the error message to identify the offending field.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    name: z
      .string()
      .optional()
      .describe('Updated opportunity name. Leave empty to keep unchanged.'),
    type: z
      .string()
      .optional()
      .describe('Updated opportunity type. Leave empty to keep unchanged.'),
    amount: z
      .number()
      .optional()
      .describe(
        'Updated amount. Leave unset to keep unchanged. Negative values are passed through to Salesforce as-is.',
      ),
    nextStep: z.string().optional().describe('Updated next step. Leave empty to keep unchanged.'),
    accountId: z.string().optional().describe('Updated Account ID. Leave empty to keep unchanged.'),
    closeDate: z
      .string()
      .optional()
      .describe('Updated close date in YYYY-MM-DD format. Leave empty to keep unchanged.'),
    stageName: z
      .string()
      .optional()
      .describe(
        "Updated stage. Leave empty to keep unchanged. Must exactly match a stage defined in the org's current sales process; use SALESFORCE_GET_ALL_FIELDS_FOR_OBJECT with object_name='Opportunity' to discover valid values.",
      ),
    description: z
      .string()
      .optional()
      .describe('Updated description. Leave empty to keep unchanged.'),
    leadSource: z
      .string()
      .optional()
      .describe('Updated lead source. Leave empty to keep unchanged.'),
    probability: z
      .number()
      .optional()
      .describe('Updated probability percentage (0-100). Leave unset to keep unchanged.'),
    customFields: z
      .record(z.any())
      .optional()
      .describe(
        "Dictionary of custom field API names and their values to update. Use the exact API name ending with '__c'. IMPORTANT for lookup/reference fields: Fields that reference other records (e.g., Contact__c, User__c, Account__c) require a valid 18",
      ),
    opportunityId: z
      .string()
      .describe(
        'The Salesforce ID of the opportunity to update. Multiple opportunities may share the same name — apply additional filters (stage, owner, account) or confirm with the user before updating to avoid modifying the wrong record. Use IDs from fre',
      ),
  }),
  execute: async ({
    salesforceCredentials,
    name,
    type,
    amount,
    nextStep,
    accountId,
    closeDate,
    stageName,
    description,
    leadSource,
    probability,
    customFields,
    opportunityId,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const customSpread = customFields && typeof customFields === 'object' ? customFields : {};
    const sfRawBody = {
      name: name,
      type: type,
      amount: amount,
      NextStep: nextStep,
      AccountId: accountId,
      CloseDate: closeDate,
      StageName: stageName,
      description: description,
      LeadSource: leadSource,
      probability: probability,
      ...customSpread,
    };
    const sfBody = Object.fromEntries(
      Object.entries(sfRawBody).filter(([, v]) => v !== undefined && v !== null && v !== ''),
    );
    return sfPatch(salesforceCredentials, `/sobjects/Opportunity/${opportunityId}`, {
      body: sfBody,
    });
  },
});

export const salesforceUpdateOpportunityById = tool({
  description:
    'DEPRECATED: Updates specified fields of an existing Salesforce Opportunity by its ID; the Opportunity must exist, and some fields (like Name, StageName, CloseDate) may have specific Salesforce validation rules if being modified, while read-only fields update indirectly based on other changes.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    id: z
      .string()
      .describe('Unique Salesforce ID of the Opportunity to update (e.g., 006P0000004iVBDIA2).'),
    name: z.string().optional().describe('Name for this opportunity. Max 120 characters.'),
    type: z
      .string()
      .optional()
      .describe(
        "Type of opportunity (e.g., 'New Business', 'Existing Customer'). Label: Opportunity Type.",
      ),
    isWon: z
      .boolean()
      .optional()
      .describe('Read-only. Indicates if won. Controlled by StageName. Label: Won.'),
    amount: z
      .number()
      .int()
      .optional()
      .describe(
        'Estimated total sale amount. If the opportunity has products, this amount is the sum of the related products and direct updates to this field are ignored.',
      ),
    fiscal: z
      .string()
      .optional()
      .describe(
        "If fiscal years are not enabled: name of the fiscal quarter/period for CloseDate (Format: 'YYYY Q', e.g., '2023 1').",
      ),
    ownerId: z
      .string()
      .optional()
      .describe(
        "ID of the User owner. Updating may change previous owner's record access. Requires 'Transfer Record' permission (API v16.0+).",
      ),
    isClosed: z
      .boolean()
      .optional()
      .describe('Read-only. Indicates if closed. Controlled by StageName. Label: Closed.'),
    nextStep: z
      .string()
      .optional()
      .describe('Next task in closing the opportunity. Max 255 characters.'),
    accountId: z
      .string()
      .optional()
      .describe('ID of the associated Account, which must exist in Salesforce.'),
    closeDate: z.string().optional().describe('Expected close date in YYYY-MM-DD format.'),
    contactId: z
      .string()
      .optional()
      .describe(
        'Read-only. ID of primary Contact, derived from OpportunityContactRole. Set at creation via IsPrimary flag on OpportunityContactRole (API v46.0+).',
      ),
    isDeleted: z
      .boolean()
      .optional()
      .describe('Indicates if the object is in the Recycle Bin. Label: Deleted.'),
    isPrivate: z
      .boolean()
      .optional()
      .describe(
        'If true, the opportunity is private, visible only to the owner and administrators.',
      ),
    pushCount: z
      .number()
      .int()
      .optional()
      .describe(
        'Number of times this record has been synchronized with a mobile device. Used by Salesforce mobile applications.',
      ),
    stageName: z
      .string()
      .optional()
      .describe(
        "Current stage (e.g., 'Prospecting'). Updating automatically updates ForecastCategoryName, IsClosed, IsWon, and Probability. Query OpportunityStage object for available names.",
      ),
    campaignId: z
      .string()
      .optional()
      .describe(
        'ID of a related Campaign. Requires Campaigns feature enabled and read access to the Campaign object.',
      ),
    fiscalYear: z
      .number()
      .int()
      .optional()
      .describe(
        "Fiscal year of the CloseDate (e.g., 2024), based on organization's fiscal year settings.",
      ),
    leadSource: z
      .string()
      .optional()
      .describe("Source of this opportunity (e.g., 'Advertisement', 'Trade Show')."),
    createdById: z
      .string()
      .optional()
      .describe('Read-only. ID of the user who created this record.'),
    createdDate: z.string().optional().describe('Read-only. Creation timestamp (ISO 8601 UTC).'),
    description: z
      .string()
      .optional()
      .describe('Text description of the opportunity. Max 32,000 characters.'),
    probability: z
      .number()
      .int()
      .optional()
      .describe(
        'Estimated confidence percentage (0-100) in closing. Usually implied by StageName, but can be overridden. Round decimal probabilities to whole numbers.',
      ),
    pricebook2Id: z
      .string()
      .optional()
      .describe(
        'ID of the associated Pricebook2. Required to add line items if products are enabled. Cannot update if line items exist.',
      ),
    fiscalQuarter: z
      .number()
      .int()
      .optional()
      .describe(
        "Fiscal quarter (1-4) of the CloseDate, based on organization's fiscal year settings.",
      ),
    customFields: z
      .record(z.any())
      .optional()
      .describe(
        "Dictionary of custom field API names and their values. Custom field names typically end with '__c'.",
      ),
    hasOverdueTask: z
      .boolean()
      .optional()
      .describe('Read-only. True if opportunity has an overdue task (API v35.0+).'),
    lastViewedDate: z
      .string()
      .optional()
      .describe(
        'Read-only. Timestamp current user last viewed this record (ISO 8601 UTC). Null if only referenced (LastReferencedDate).',
      ),
    orderNumber__c: z.string().optional().describe('Order number associated with the opportunity.'),
    systemModstamp: z
      .string()
      .optional()
      .describe(
        'Read-only. Last system modification timestamp (ISO 8601 UTC), by user or automation.',
      ),
    expectedRevenue: z
      .number()
      .int()
      .optional()
      .describe(
        'Read-only. Calculated as Amount * Probability. Updated by changes to Amount or Probability.',
      ),
    hasOpenActivity: z
      .boolean()
      .optional()
      .describe('Read-only. True if opportunity has an open event or task (API v35.0+).'),
    attributes__url: z
      .string()
      .optional()
      .describe('Relative URL of the SObject record in Salesforce. Generally Salesforce-provided.'),
    forecastCategory: z
      .string()
      .optional()
      .describe(
        "Forecast category (e.g., 'Pipeline', 'BestCase'). Implied by StageName but can be overridden. In API v12.0+, value is set via ForecastCategoryName.",
      ),
    lastActivityDate: z
      .string()
      .optional()
      .describe('Read-only. Due date of most recent event or last closed task (YYYY-MM-DD).'),
    lastModifiedById: z
      .string()
      .optional()
      .describe('Read-only. ID of the user who last modified this record.'),
    lastModifiedDate: z
      .string()
      .optional()
      .describe('Read-only. Last modification timestamp (ISO 8601 UTC).'),
    attributes__type: z
      .string()
      .optional()
      .describe(
        "Type of the Salesforce SObject (e.g., 'Opportunity'). Generally Salesforce-provided.",
      ),
    trackingNumber__c: z
      .string()
      .optional()
      .describe('Tracking number related to the opportunity.'),
    lastReferencedDate: z
      .string()
      .optional()
      .describe(
        'Read-only. Timestamp current user last accessed this record or a related record (ISO 8601 UTC).',
      ),
    mainCompetitors__c: z.string().optional().describe('Main competitors for this opportunity.'),
    lastStageChangeDate: z
      .string()
      .optional()
      .describe('Read-only. Timestamp of last stage change (ISO 8601 UTC).'),
    currentGenerators__c: z
      .string()
      .optional()
      .describe('Information about current generators related to the opportunity.'),
    forecastCategoryName: z
      .string()
      .optional()
      .describe(
        "API v12.0+. Name of the forecast category (e.g., 'Pipeline'). Implied by StageName but can be overridden.",
      ),
    hasOpportunityLineItem: z
      .boolean()
      .optional()
      .describe(
        'Read-only. True if opportunity has line items (Products). Requires assigned Pricebook to add line items.',
      ),
    totalOpportunityQuantity: z
      .number()
      .int()
      .optional()
      .describe('Number of items in this opportunity. Used in quantity-based forecasting.'),
    lastAmountChangedHistoryId: z
      .string()
      .optional()
      .describe('Read-only. ID of OpportunityHistory record for last Amount update (API v50.0+).'),
    deliveryInstallationStatus__c: z
      .string()
      .optional()
      .describe('Delivery and installation status of the opportunity.'),
    lastCloseDateChangedHistoryId: z
      .string()
      .optional()
      .describe(
        'Read-only. ID of OpportunityHistory record for last CloseDate update (API v50.0+).',
      ),
  }),
  execute: async ({
    salesforceCredentials,
    id,
    name,
    type,
    isWon,
    amount,
    fiscal,
    ownerId,
    isClosed,
    nextStep,
    accountId,
    closeDate,
    contactId,
    isDeleted,
    isPrivate,
    pushCount,
    stageName,
    campaignId,
    fiscalYear,
    leadSource,
    createdById,
    createdDate,
    description,
    probability,
    pricebook2Id,
    fiscalQuarter,
    customFields,
    hasOverdueTask,
    lastViewedDate,
    orderNumber__c,
    systemModstamp,
    expectedRevenue,
    hasOpenActivity,
    attributes__url,
    forecastCategory,
    lastActivityDate,
    lastModifiedById,
    lastModifiedDate,
    attributes__type,
    trackingNumber__c,
    lastReferencedDate,
    mainCompetitors__c,
    lastStageChangeDate,
    currentGenerators__c,
    forecastCategoryName,
    hasOpportunityLineItem,
    totalOpportunityQuantity,
    lastAmountChangedHistoryId,
    deliveryInstallationStatus__c,
    lastCloseDateChangedHistoryId,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    const customSpread = customFields && typeof customFields === 'object' ? customFields : {};
    return sfPatch(salesforceCredentials, `/sobjects/Opportunity/${id}`, {
      body: {
        Name: name,
        Type: type,
        IsWon: isWon,
        Amount: amount,
        Fiscal: fiscal,
        OwnerId: ownerId,
        IsClosed: isClosed,
        NextStep: nextStep,
        AccountId: accountId,
        CloseDate: closeDate,
        ContactId: contactId,
        IsDeleted: isDeleted,
        IsPrivate: isPrivate,
        PushCount: pushCount,
        StageName: stageName,
        CampaignId: campaignId,
        FiscalYear: fiscalYear,
        LeadSource: leadSource,
        CreatedById: createdById,
        CreatedDate: createdDate,
        Description: description,
        Probability: probability,
        Pricebook2Id: pricebook2Id,
        FiscalQuarter: fiscalQuarter,
        ...customSpread,
        HasOverdueTask: hasOverdueTask,
        LastViewedDate: lastViewedDate,
        OrderNumber__c: orderNumber__c,
        SystemModstamp: systemModstamp,
        ExpectedRevenue: expectedRevenue,
        HasOpenActivity: hasOpenActivity,
        attributes__url: attributes__url,
        ForecastCategory: forecastCategory,
        LastActivityDate: lastActivityDate,
        LastModifiedById: lastModifiedById,
        LastModifiedDate: lastModifiedDate,
        attributes__type: attributes__type,
        TrackingNumber__c: trackingNumber__c,
        LastReferencedDate: lastReferencedDate,
        MainCompetitors__c: mainCompetitors__c,
        LastStageChangeDate: lastStageChangeDate,
        CurrentGenerators__c: currentGenerators__c,
        ForecastCategoryName: forecastCategoryName,
        HasOpportunityLineItem: hasOpportunityLineItem,
        TotalOpportunityQuantity: totalOpportunityQuantity,
        LastAmountChangedHistoryId: lastAmountChangedHistoryId,
        DeliveryInstallationStatus__c: deliveryInstallationStatus__c,
        LastCloseDateChangedHistoryId: lastCloseDateChangedHistoryId,
      },
    });
  },
});
