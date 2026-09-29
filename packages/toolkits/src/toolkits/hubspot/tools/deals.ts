// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import {
  engagementBody,
  flatProps,
  hubDelete,
  hubGet,
  hubMultipart,
  hubPatch,
  hubPost,
  hubPut,
  mapKeys,
  pickDefined,
  searchBody,
  stripKeys,
  unflattenDeep,
} from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const hubspotArchiveDeals = tool({
  description: 'Archives multiple HubSpot deals by their IDs.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(z.object({ id: z.string() }).catchall(z.any()))
      .describe('List of deal objects to be archived.'),
  }),
  execute: async ({ hubspotToken, inputs }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/deals/batch/archive`, {
      body: { inputs: inputs },
    });
  },
});

export const hubspotCreateDeal = tool({
  description: 'Creates a new HubSpot deal.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    amount: z.string().optional().describe('Total monetary value of the deal.'),
    hsAcv: z.string().optional().describe('Annual Contract Value (ACV) (HubSpot-calculated).'),
    hsArr: z.string().optional().describe('Annual Recurring Revenue (ARR) (HubSpot-calculated).'),
    hsMrr: z.string().optional().describe('Monthly Recurring Revenue (MRR) (HubSpot-calculated).'),
    hsTcv: z.string().optional().describe('Total Contract Value (TCV) (HubSpot-calculated).'),
    dealname: z.string().optional().describe('Descriptive name or title of the deal.'),
    dealtype: z
      .string()
      .optional()
      .describe("Type of deal (e.g., 'newbusiness', 'existingbusiness')."),
    pipeline: z.string().optional().describe('ID of the sales pipeline for this deal (required).'),
    closedate: z
      .string()
      .optional()
      .describe(
        'Date (YYYY-MM-DD) or datetime (ISO 8601) when the deal closed or is expected to close.',
      ),
    dealstage: z
      .string()
      .optional()
      .describe(
        "Valid pipeline stage ID for the deal. IMPORTANT: Stage IDs must be actual values from your HubSpot pipeline configuration - random values, phone numbers, or placeholder text will be rejected by the API with INVALID_OPTION errors. Stage IDs can be either string-based (e.g., 'closedwon', 'closedlost') or numeric strings (e.g., '2317386479') depending on your pipeline setup. You MUST retrieve valid stage IDs using the Pipelines API (GET /crm/v3/pipelines/deals) or from HubSpot Settings > Objects > Deals > Pipelines before setting this field.",
      ),
    createdate: z
      .string()
      .optional()
      .describe('Date/time deal was created (read-only, HubSpot-set).'),
    description: z.string().optional().describe('Detailed text description of the deal.'),
    hsCampaign: z
      .string()
      .optional()
      .describe('GUID of the HubSpot campaign that generated this deal.'),
    hsPriority: z.string().optional().describe("Priority level (e.g., 'high', 'medium', 'low')."),
    associations: z
      .array(
        z
          .object({
            to: z.record(z.any()).optional(),
            types: z.array(z.record(z.any())),
            to__id: z.string().optional(),
          })
          .catchall(z.any()),
      )
      .optional()
      .describe(
        'Associations to create between the new deal and other CRM objects (e.g., contact, company).',
      ),
    hsIsClosed: z
      .string()
      .optional()
      .describe(
        "Indicates if deal is closed ('true'/'false'; read-only, from deal stage properties).",
      ),
    hsNextStep: z.string().optional().describe('Next planned step for this deal.'),
    hsObjectId: z
      .string()
      .optional()
      .describe('Unique ID of the deal object (read-only, HubSpot-assigned).'),
    daysToClose: z
      .string()
      .optional()
      .describe('Days between creation and close (read-only, HubSpot-calculated).'),
    hsCreatedate: z
      .string()
      .optional()
      .describe('Specific date/time deal record created (ISO 8601, read-only, HubSpot-set).'),
    hsAllTeamIds: z
      .string()
      .optional()
      .describe(
        "Semicolon-separated list of all associated team IDs (owner's primary, additional teams; typically read-only).",
      ),
    hsAllOwnerIds: z
      .string()
      .optional()
      .describe('Semicolon-separated list of all owner IDs (primary, co-owners).'),
    hsClosedAmount: z
      .string()
      .optional()
      .describe('Actual amount when deal closed (HubSpot-calculated).'),
    hubspotOwnerId: z
      .string()
      .optional()
      .describe('ID of the HubSpot user owning the deal; may be auto-assigned if unspecified.'),
    closedWonReason: z.string().optional().describe('Reason why the deal was won.'),
    customProperties: z
      .record(z.any())
      .optional()
      .describe(
        "Custom properties for the deal. Keys are internal property names (as defined in your HubSpot account), values are the property values to set. CRITICAL: Enum/dropdown properties have STRICT validation - you MUST use exact values from your HubSpot configuration or the API will reject with INVALID_OPTION error. To find valid values: go to HubSpot Settings > Properties > Deals > [Property Name] > Edit > Field Type Options. Requirements by type: (1) Enum/dropdown: case-sensitive exact match required (check your HubSpot property settings for valid options); (2) Number: numeric strings only, no units (e.g., '12' not '12 months'); (3) Date: ISO 8601 format (e.g., '2024-01-15'); (4) Checkbox: 'true' or 'false'. Properties are account-specific and may not exist in all HubSpot portals. Example: `{'project_type': 'migration', 'priority_level': 'high'}`.",
      ),
    closedLostReason: z.string().optional().describe('Reason why the deal was lost.'),
    dealCurrencyCode: z
      .string()
      .optional()
      .describe(
        "Currency code for deal amount. IMPORTANT: Only currency codes enabled in your HubSpot portal settings are valid. If omitted, defaults to your portal's home currency. To find valid currency codes: go to Settings > Account defaults > Currencies to see your enabled currencies. Common codes include 'USD' and 'EUR', but availability depends on your portal configuration.",
      ),
    hsForecastAmount: z
      .string()
      .optional()
      .describe("Forecasted amount ('Amount' * 'hs_deal_stage_probability'; HubSpot-calculated)."),
    hsAnalyticsSource: z
      .string()
      .optional()
      .describe(
        "Original deal source per HubSpot analytics (e.g., 'Organic Search'; typically read-only).",
      ),
    hsLastmodifieddate: z
      .string()
      .optional()
      .describe('Date/time deal last modified (ISO 8601, read-only, HubSpot-updated).'),
    hsProjectedAmount: z
      .string()
      .optional()
      .describe('Projected deal amount (manually set or calculated).'),
    amountInHomeCurrency: z
      .string()
      .optional()
      .describe("Deal's value in company's home currency (read-only, HubSpot-calculated)."),
    hsForecastProbability: z
      .string()
      .optional()
      .describe("Sales forecasting probability; may differ from 'hs_deal_stage_probability'."),
    hsDealStageProbability: z
      .string()
      .optional()
      .describe(
        'Win probability (decimal, e.g., 0.5) based on current stage; typically stage-defined.',
      ),
    hsAllAccessibleTeamIds: z
      .string()
      .optional()
      .describe('Semicolon-separated list of team IDs with access (typically read-only).'),
    engagementsLastMeetingBooked: z
      .string()
      .optional()
      .describe('Date/time of last booked meeting for this deal (typically read-only).'),
    hsAllAssignedBusinessUnitIds: z
      .string()
      .optional()
      .describe(
        'Semicolon-separated list of assigned business unit IDs (for Business Units add-on).',
      ),
    hsClosedAmountInHomeCurrency: z
      .string()
      .optional()
      .describe('Closed amount in home currency (HubSpot-calculated).'),
    hsProjectedAmountInHomeCurrency: z
      .string()
      .optional()
      .describe('Projected amount in home currency (HubSpot-calculated).'),
    engagementsLastMeetingBookedMedium: z
      .string()
      .optional()
      .describe("Medium (e.g., 'Meetings') of last booked meeting (typically read-only)."),
    engagementsLastMeetingBookedSource: z
      .string()
      .optional()
      .describe("Source (e.g., 'Calendar') of last booked meeting (typically read-only)."),
    engagementsLastMeetingBookedCampaign: z
      .string()
      .optional()
      .describe('Campaign ID for the last booked meeting (typically read-only).'),
  }),
  execute: async (input) => {
    const { hubspotToken } = input;
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/deals`, {
      body: flatProps(input, {
        amount: 'amount',
        hsAcv: 'hs_acv',
        hsArr: 'hs_arr',
        hsMrr: 'hs_mrr',
        hsTcv: 'hs_tcv',
        dealname: 'dealname',
        dealtype: 'dealtype',
        pipeline: 'pipeline',
        closedate: 'closedate',
        dealstage: 'dealstage',
        createdate: 'createdate',
        description: 'description',
        hsCampaign: 'hs_campaign',
        hsPriority: 'hs_priority',
        hsIsClosed: 'hs_is_closed',
        hsNextStep: 'hs_next_step',
        hsObjectId: 'hs_object_id',
        daysToClose: 'days_to_close',
        hsCreatedate: 'hs_createdate',
        hsAllTeamIds: 'hs_all_team_ids',
        hsAllOwnerIds: 'hs_all_owner_ids',
        hsClosedAmount: 'hs_closed_amount',
        hubspotOwnerId: 'hubspot_owner_id',
        closedWonReason: 'closed_won_reason',
        closedLostReason: 'closed_lost_reason',
        dealCurrencyCode: 'deal_currency_code',
        hsForecastAmount: 'hs_forecast_amount',
        hsAnalyticsSource: 'hs_analytics_source',
        hsLastmodifieddate: 'hs_lastmodifieddate',
        hsProjectedAmount: 'hs_projected_amount',
        amountInHomeCurrency: 'amount_in_home_currency',
        hsForecastProbability: 'hs_forecast_probability',
        hsDealStageProbability: 'hs_deal_stage_probability',
        hsAllAccessibleTeamIds: 'hs_all_accessible_team_ids',
        engagementsLastMeetingBooked: 'engagements_last_meeting_booked',
        hsAllAssignedBusinessUnitIds: 'hs_all_assigned_business_unit_ids',
        hsClosedAmountInHomeCurrency: 'hs_closed_amount_in_home_currency',
        hsProjectedAmountInHomeCurrency: 'hs_projected_amount_in_home_currency',
        engagementsLastMeetingBookedMedium: 'engagements_last_meeting_booked_medium',
        engagementsLastMeetingBookedSource: 'engagements_last_meeting_booked_source',
        engagementsLastMeetingBookedCampaign: 'engagements_last_meeting_booked_campaign',
      }),
    });
  },
});

export const hubspotCreateDealFromNl = tool({
  description:
    'Creates a new deal in HubSpot from a natural language description. Fetches the deal property schema and pipeline stages at runtime, uses an LLM to generate the correct property payload, and creates the deal. Uses the natural-language text as the deal name unless it parses as JSON properties; provide pipeline and associations explicitly.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    nlQuery: z
      .string()
      .describe(
        "Natural language description of the deal to create. Example: 'New deal: Enterprise License for Acme Corp, amount $50,000, closing next month'.",
      ),
    pipeline: z
      .string()
      .optional()
      .describe(
        "Optional pipeline ID override. If not specified, the LLM will infer from the NL query or default to 'default'.",
      ),
    associations: z
      .array(z.record(z.any()))
      .optional()
      .describe(
        'Optional associations to create between the new deal and other CRM objects (e.g., contacts, companies). Pass-through field, not LLM-generated.',
      ),
  }),
  execute: async ({ hubspotToken, nlQuery, pipeline, associations }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    let properties = {};
    const text = String(nlQuery || '');
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) properties = parsed;
      else properties = { dealname: text.slice(0, 280) };
    } catch {
      properties = { dealname: text.slice(0, 280) };
    }
    if (!properties.dealname)
      return {
        error: 'Could not determine a deal name from nl_query.',
        message: 'Describe the deal or pass JSON properties.',
      };
    if (pipeline && !properties.pipeline) properties.pipeline = pipeline;
    return hubPost(hubspotToken, '/crm/v3/objects/deals', {
      body: { properties, ...(associations ? { associations } : {}) },
    });
  },
});

export const hubspotCreateDeals = tool({
  description:
    'Creates multiple deals in HubSpot CRM; ensure any associated object IDs, deal stages, and pipeline IDs specified are valid and exist within the HubSpot account.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(
        z
          .object({
            properties: z.record(z.any()),
            associations: z.array(z.record(z.any())).optional(),
          })
          .catchall(z.any()),
      )
      .describe(
        'List of deal objects to create, each defining its properties and associations with other CRM objects.',
      ),
  }),
  execute: async ({ hubspotToken, inputs }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/deals/batch/create`, {
      body: { inputs: inputs },
    });
  },
});

export const hubspotDeleteDealGdpr = tool({
  description:
    "Archives a HubSpot deal by its ID. Note: HubSpot's GDPR permanent deletion API only supports contacts, not deals. This action archives the deal (moves to recycling bin for 90 days) as the closest available functionality. HubSpot does not support GDPR permanent delete for deals, so this archives the deal.",
  inputSchema: z.object({
    hubspotToken: tokenField,
    dealId: z
      .string()
      .describe(
        'The unique HubSpot Deal ID of the deal to archive. Archived deals are moved to the recycling bin and recoverable for 90 days.',
      ),
  }),
  execute: async ({ hubspotToken, dealId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubDelete(hubspotToken, `/crm/v3/objects/deals/${encodeURIComponent(String(dealId))}`);
  },
});

export const hubspotGetDeal = tool({
  description: 'Retrieves a HubSpot deal by its ID.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    dealId: z.string().describe('Unique HubSpot identifier for the deal to retrieve.'),
    archived: z
      .boolean()
      .optional()
      .describe('Set to true to include only archived deals; defaults to false (active deals).'),
    properties: z
      .array(z.string())
      .optional()
      .describe(
        'Deal property names to include in the response; if omitted, all available properties are returned.',
      ),
    associations: z
      .array(z.string())
      .optional()
      .describe(
        "Object types (e.g., 'contacts', 'companies') for which to retrieve associated IDs.",
      ),
    propertiesWithHistory: z
      .array(z.string())
      .optional()
      .describe(
        'Property names for which to include current and historical values in the response.',
      ),
  }),
  execute: async ({
    hubspotToken,
    dealId,
    archived,
    properties,
    associations,
    propertiesWithHistory,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(hubspotToken, `/crm/v3/objects/deals/${encodeURIComponent(String(dealId))}`, {
      query: pickDefined({
        archived: archived,
        properties: properties,
        associations: associations,
        propertiesWithHistory: propertiesWithHistory,
      }),
    });
  },
});

export const hubspotGetDeals = tool({
  description: 'Retrieves multiple HubSpot deals by their IDs in a single batch request.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(z.object({ id: z.string() }).catchall(z.any()))
      .describe('List of deal identifiers to retrieve.'),
    archived: z.boolean().optional().describe('Filter by archived status.'),
    idProperty: z
      .string()
      .optional()
      .describe('Alternate unique identifier property to use for retrieving deals.'),
    properties: z
      .array(z.string())
      .optional()
      .describe(
        'Deal property names to include in the response. If not specified, only default properties will be returned. Common properties include: dealname, amount, dealstage, pipeline, closedate, hubspot_owner_id.',
      ),
    propertiesWithHistory: z
      .array(z.string())
      .optional()
      .describe(
        'Deal property names for which to retrieve historical values. Leave empty if historical data is not needed.',
      ),
  }),
  execute: async ({
    hubspotToken,
    inputs,
    archived,
    idProperty,
    properties,
    propertiesWithHistory,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/deals/batch/read`, {
      body: pickDefined({
        inputs: inputs,
        archived: archived,
        idProperty: idProperty,
        properties: properties,
        propertiesWithHistory: propertiesWithHistory,
      }),
    });
  },
});

export const hubspotListDeals = tool({
  description: 'Retrieves a paginated list of HubSpot deals.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    after: z
      .string()
      .optional()
      .describe('Pagination token from previous response to fetch the subsequent page.'),
    limit: z
      .number()
      .int()
      .optional()
      .describe(
        'Maximum number of deals to return per page (default: 10). Maximum is 100 normally, but when propertiesWithHistory is requested, the maximum is 50.',
      ),
    archived: z
      .boolean()
      .optional()
      .describe('Filter by archived status: true for archived deals, false for active deals.'),
    properties: z
      .array(z.string())
      .optional()
      .describe('List of deal property names to include in the response.'),
    associations: z
      .array(z.string())
      .optional()
      .describe('List of object types for which to retrieve associated IDs.'),
    propertiesWithHistory: z
      .array(z.string())
      .optional()
      .describe('List of property names for which to retrieve historical values.'),
  }),
  execute: async ({
    hubspotToken,
    after,
    limit,
    archived,
    properties,
    associations,
    propertiesWithHistory,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(hubspotToken, `/crm/v3/objects/deals`, {
      query: pickDefined({
        after: after,
        limit: limit,
        archived: archived,
        properties: properties,
        associations: associations,
        propertiesWithHistory: propertiesWithHistory,
      }),
    });
  },
});

export const hubspotMergeDeals = tool({
  description: 'Merges two HubSpot deals into one.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    objectIdToMerge: z
      .string()
      .describe('The ID of the deal that will be merged into the primary deal.'),
    primaryObjectId: z.string().describe('The ID of the deal that will remain after the merge.'),
  }),
  execute: async ({ hubspotToken, objectIdToMerge, primaryObjectId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/deals/merge`, {
      body: pickDefined({ objectIdToMerge: objectIdToMerge, primaryObjectId: primaryObjectId }),
    });
  },
});

export const hubspotRemoveDeal = tool({
  description: 'Removes a HubSpot deal by its ID.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    dealId: z.string().describe('Unique HubSpot identifier for the deal to be removed.'),
  }),
  execute: async ({ hubspotToken, dealId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubDelete(hubspotToken, `/crm/v3/objects/deals/${encodeURIComponent(String(dealId))}`);
  },
});

export const hubspotSearchDeals = tool({
  description: 'Searches for HubSpot deals using flexible criteria and filters.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    after: z
      .string()
      .optional()
      .describe(
        "Pagination token from a previous response's `paging.next.after` to fetch the next page; omit for the first page. Note: HubSpot's search API has a hard limit of 10,000 total results - the 'after' value must be less than 10000.",
      ),
    limit: z.number().int().optional().describe('Maximum number of deal records to return.'),
    query: z
      .string()
      .optional()
      .describe(
        'String to search across default text properties in deals for records containing this string.',
      ),
    sorts: z
      .array(
        z
          .object({ direction: z.enum(['ASCENDING', 'DESCENDING']), propertyName: z.string() })
          .catchall(z.any()),
      )
      .optional()
      .describe(
        'Sort order for results. If multiple sort objects are provided, they are applied in the given order.',
      ),
    properties: z
      .array(z.string())
      .optional()
      .describe(
        'HubSpot deal property internal names to include in the response. Supports both standard and custom properties; a default set is returned if omitted.',
      ),
    filterGroups: z
      .array(z.object({ filters: z.array(z.record(z.any())) }).catchall(z.any()))
      .optional()
      .describe(
        'Filter groups to apply to the search. Filters within a group are ANDed; groups are ORed.',
      ),
    customProperties: z
      .array(z.string())
      .optional()
      .describe(
        'User-defined custom property internal names (not standard HubSpot properties) to include in the response.',
      ),
  }),
  execute: async ({
    hubspotToken,
    after,
    limit,
    query,
    sorts,
    properties,
    filterGroups,
    customProperties,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/deals/search`, {
      body: searchBody({ query, filterGroups, sorts, properties, limit, after, customProperties }),
    });
  },
});

export const hubspotUpdateDeal = tool({
  description: 'Updates properties for an existing HubSpot deal.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    dealId: z.string().describe('Unique HubSpot identifier for the deal to be updated.'),
    properties: z
      .record(z.any())
      .describe(
        "Deal properties to update. Must contain at least one property. Keys are internal HubSpot property names; use empty string to clear a property. IMPORTANT - Some properties require specific internal HubSpot IDs: (1) 'dealstage' and 'pipeline' require internal IDs (not human-readable labels). (2) 'hubspot_owner_id' requires a valid HubSpot user/owner ID. Common text/numeric properties: dealname (string), amount (decimal string), closedate (YYYY-MM-DD or ISO 8601), description (string), deal_currency_code (3-letter currency code like 'USD'). Enum/select properties have case-sensitive values - use exact values as defined in HubSpot. Use HUBSPOT_READ_A_CRM_PROPERTY_BY_NAME to retrieve valid enum options for any property.",
      ),
  }),
  execute: async ({ hubspotToken, dealId, properties }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPatch(hubspotToken, `/crm/v3/objects/deals/${encodeURIComponent(String(dealId))}`, {
      body: { properties: properties ?? {} },
    });
  },
});

export const hubspotUpdateDeals = tool({
  description: 'Updates multiple HubSpot deals in a single batch operation.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(
        z.object({ id: z.string(), properties: z.record(z.any()).optional() }).catchall(z.any()),
      )
      .describe('List of deal update operations.'),
  }),
  execute: async ({ hubspotToken, inputs }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/objects/deals/batch/update`, {
      body: pickDefined({ inputs: inputs }),
    });
  },
});
