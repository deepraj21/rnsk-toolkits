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

export const hubspotAddAssetAssociation = tool({
  description:
    "Associates an existing asset ('FORM', 'OBJECT_LIST', or 'EXTERNAL_WEB_URL') with a specified HubSpot marketing campaign.",
  inputSchema: z.object({
    hubspotToken: tokenField,
    assetId: z
      .string()
      .describe(
        "The unique identifier of the asset to be associated with the campaign. This ID is specific to the assetType. For FORMs, use the form's numeric ID. For OBJECT_LIST, use the list ID (ILS ID). For EMAIL, use the email's content ID. For LANDING_PAGE or BLOG_POST, use the page/post ID. These IDs can be obtained from HubSpot's UI (in the asset's URL or details panel) or by using the corresponding list/search actions for that asset type.",
      ),
    assetType: z
      .string()
      .describe(
        "Type of asset to associate with the campaign. Commonly supported types include: 'FORM', 'OBJECT_LIST' (Static/Contact List), 'EXTERNAL_WEB_URL', 'EMAIL', 'LANDING_PAGE', 'BLOG_POST', 'CTA', 'WORKFLOW', 'SOCIAL_POST', 'WEBSITE_PAGE', 'SEQUENCE', 'MEETING_EVENT', 'PLAYBOOK', 'FEEDBACK_SURVEY', 'SALES_DOCUMENT'. HubSpot continues to expand asset type support over time.",
      ),
    campaignGuid: z
      .string()
      .describe(
        'The unique identifier (UUID) of the HubSpot campaign to which the asset will be associated.',
      ),
  }),
  execute: async ({ hubspotToken, assetId, assetType, campaignGuid }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPut(
      hubspotToken,
      `/marketing/v3/campaigns/${encodeURIComponent(String(campaignGuid))}/assets/${encodeURIComponent(String(assetType))}/${encodeURIComponent(String(assetId))}`,
    );
  },
});

export const hubspotCreateCampaign = tool({
  description: 'Creates a new HubSpot campaign.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    properties: z
      .record(z.any())
      .describe('Campaign properties including name and optional metadata.'),
  }),
  execute: async ({ hubspotToken, properties }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/marketing/v3/campaigns`, {
      body: { properties: properties },
    });
  },
});

export const hubspotCreateCampaigns = tool({
  description:
    'Creates multiple HubSpot campaigns by calling the single campaign creation endpoint for each campaign. Note: HubSpot does not provide a native batch create endpoint for campaigns. This action creates multiple campaigns by making individual API calls for each campaign in the batch.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(z.object({ name: z.string(), type: z.string().optional() }).catchall(z.any()))
      .describe('List of campaign objects to create.'),
  }),
  execute: async ({ hubspotToken, inputs }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/marketing/v3/campaigns/batch/create`, {
      body: { inputs: inputs },
    });
  },
});

export const hubspotDeleteCampaign = tool({
  description:
    'Permanently deletes a marketing campaign from HubSpot using its `campaignGuid`; returns a 204 No Content status even if the campaign does not exist.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    campaignGuid: z
      .string()
      .describe('The unique identifier (UUID) for the marketing campaign to be deleted.'),
  }),
  execute: async ({ hubspotToken, campaignGuid }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubDelete(
      hubspotToken,
      `/marketing/v3/campaigns/${encodeURIComponent(String(campaignGuid))}`,
    );
  },
});

export const hubspotDeleteCampaignsBatch = tool({
  description:
    'Archives a batch of up to 50 marketing campaigns, hiding them from active views rather than permanently deleting them.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(z.object({ id: z.string() }).catchall(z.any()))
      .describe('A list of marketing campaign identifiers to be archived in batch.'),
  }),
  execute: async ({ hubspotToken, inputs }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/marketing/v3/campaigns/batch/archive`, {
      body: { inputs: inputs },
    });
  },
});

export const hubspotFetchRevenue = tool({
  description:
    'Fetches a revenue attribution report for a specified, existing marketing campaign, optionally using a specific attribution model and date range; if both start and end dates are given, `endDate` must not be earlier than `startDate`. Best-effort mapping to the HubSpot campaign revenue endpoint.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    endDate: z
      .string()
      .optional()
      .describe(
        'End date (YYYY-MM-DD) for filtering report data; defaults to the current date if omitted.',
      ),
    startDate: z
      .string()
      .optional()
      .describe(
        "Start date (YYYY-MM-DD) for filtering report data; defaults to '2006-01-01' if omitted.",
      ),
    campaignGuid: z.string().describe('The unique identifier (UUID) for the marketing campaign.'),
    attributionModel: z
      .string()
      .optional()
      .describe(
        "Attribution model for revenue calculation; defaults to 'LINEAR' if omitted. Allowed values: 'LINEAR', 'FIRST_INTERACTION', 'LAST_INTERACTION', 'FULL_PATH', 'U_SHAPED', 'W_SHAPED', 'TIME_DECAY', 'J_SHAPED', 'INVERSE_J_SHAPED'.",
      ),
  }),
  execute: async ({ hubspotToken, endDate, startDate, campaignGuid, attributionModel }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(
      hubspotToken,
      `/marketing/v3/campaigns/${encodeURIComponent(String(campaignGuid))}/revenue`,
      {
        query: pickDefined({
          endDate: endDate,
          startDate: startDate,
          attributionModel: attributionModel,
        }),
      },
    );
  },
});

export const hubspotGetCampaign = tool({
  description: 'Retrieves a HubSpot campaign by its ID.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    campaignId: z.string().describe('Unique HubSpot identifier for the campaign to retrieve.'),
  }),
  execute: async ({ hubspotToken, campaignId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(
      hubspotToken,
      `/marketing/v3/campaigns/${encodeURIComponent(String(campaignId))}`,
    );
  },
});

export const hubspotGetCampaignMetrics = tool({
  description:
    'Retrieves key attribution metrics for an existing marketing campaign, identified by its `campaignGuid`, within an optional date range. Best-effort mapping to the HubSpot campaign metrics endpoint.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    endDate: z
      .string()
      .optional()
      .describe(
        'The end date (YYYY-MM-DD) for filtering report data. Defaults to the current date if not specified.',
      ),
    startDate: z
      .string()
      .optional()
      .describe(
        'The start date (YYYY-MM-DD) for filtering report data. Defaults to 2006-01-01 if not specified.',
      ),
    campaignGuid: z
      .string()
      .describe(
        'The unique identifier (UUID) for the marketing campaign for which to retrieve metrics.',
      ),
  }),
  execute: async ({ hubspotToken, endDate, startDate, campaignGuid }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(
      hubspotToken,
      `/marketing/v3/campaigns/${encodeURIComponent(String(campaignGuid))}/metrics`,
      {
        query: pickDefined({ endDate: endDate, startDate: startDate }),
      },
    );
  },
});

export const hubspotGetCampaigns = tool({
  description: 'Retrieves multiple HubSpot campaigns.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    after: z.string().optional().describe('Pagination token from previous response.'),
    limit: z.number().int().optional().describe('Maximum number of campaigns to return.'),
  }),
  execute: async ({ hubspotToken, after, limit }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(hubspotToken, `/marketing/v3/campaigns`, {
      query: pickDefined({ after: after, limit: limit }),
    });
  },
});

export const hubspotGetContactIds = tool({
  description:
    'Fetches a list of contact IDs for a specific HubSpot campaign based on interaction type. Best-effort mapping to the HubSpot campaign-contacts endpoint.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    after: z
      .string()
      .optional()
      .describe(
        "A pagination cursor. Used to fetch the next set of results. Provide the 'after' value from a previous response to get subsequent pages. Example: NTI1Cg%3D%3D",
      ),
    limit: z
      .number()
      .int()
      .optional()
      .describe('The maximum number of contact IDs to return in a single request. Default is 100.'),
    endDate: z
      .string()
      .optional()
      .describe(
        'The end date for filtering report data, formatted as YYYY-MM-DD. If not provided, defaults to the current date.',
      ),
    startDate: z
      .string()
      .optional()
      .describe(
        'The start date for filtering report data, formatted as YYYY-MM-DD. If not provided, defaults to 2006-01-01.',
      ),
    contactType: z
      .string()
      .describe(
        "The type of contact interaction to filter by. Allowed values: 'contactFirstTouch' (contacts whose first interaction was with this campaign), 'contactLastTouch' (contacts whose last interaction before a key event was with this campaign), 'influencedContacts' (all contacts who interacted with assets of this campaign).",
      ),
    campaignGuid: z
      .string()
      .describe('The unique identifier (UUID) of the campaign for which to fetch contact IDs.'),
  }),
  execute: async ({
    hubspotToken,
    after,
    limit,
    endDate,
    startDate,
    contactType,
    campaignGuid,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(
      hubspotToken,
      `/marketing/v3/campaigns/${encodeURIComponent(String(campaignGuid))}/contacts/${encodeURIComponent(String(contactType))}`,
      {
        query: pickDefined({ after: after, limit: limit, endDate: endDate, startDate: startDate }),
      },
    );
  },
});

export const hubspotListAssets = tool({
  description:
    'Lists assets of a specific `assetType` for a given HubSpot marketing `campaignGuid`, optionally including performance metrics for a date range.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    after: z
      .string()
      .optional()
      .describe(
        "Pagination cursor from 'paging.next.after' of a previous response; results will begin after this cursor.",
      ),
    limit: z
      .string()
      .optional()
      .describe('Maximum number of assets to return per response (positive integer).'),
    endDate: z
      .string()
      .optional()
      .describe(
        'End date (YYYY-MM-DD, inclusive) for asset performance metrics. Metrics are not fetched if `startDate` or `endDate` is missing/invalid.',
      ),
    assetType: z
      .string()
      .describe(
        'The specific type of asset to retrieve (e.g., BLOG_POST, LANDING_PAGE); only one asset type per request.',
      ),
    startDate: z
      .string()
      .optional()
      .describe(
        'Start date (YYYY-MM-DD, inclusive) for asset performance metrics. Metrics are not fetched if `startDate` or `endDate` is missing/invalid.',
      ),
    campaignGuid: z
      .string()
      .describe(
        'Unique identifier (UUID) of an existing marketing campaign whose assets are to be listed.',
      ),
  }),
  execute: async ({ hubspotToken, after, limit, endDate, assetType, startDate, campaignGuid }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(
      hubspotToken,
      `/marketing/v3/campaigns/${encodeURIComponent(String(campaignGuid))}/assets`,
      {
        query: pickDefined({
          after: after,
          limit: limit,
          endDate: endDate,
          assetType: assetType,
          startDate: startDate,
        }),
      },
    );
  },
});

export const hubspotReadBudget = tool({
  description:
    "Fetches detailed budget (total, spent, remaining) and spend information for a marketing campaign, including an 'order' field for sequencing budget/spend items (0 is oldest). Best-effort mapping to the HubSpot campaign budget endpoint.",
  inputSchema: z.object({
    hubspotToken: tokenField,
    campaignGuid: z
      .string()
      .describe(
        'The unique identifier (UUID) of the marketing campaign for which to retrieve budget information.',
      ),
  }),
  execute: async ({ hubspotToken, campaignGuid }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(
      hubspotToken,
      `/marketing/v3/campaigns/${encodeURIComponent(String(campaignGuid))}/budget`,
    );
  },
});

export const hubspotRemoveAssetAssociation = tool({
  description:
    'Disassociates an asset from a HubSpot marketing campaign. Supports a wide range of asset types including forms, landing pages, emails, blog posts, workflows, static lists, and more.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    assetId: z.string().describe('The unique identifier of the asset.'),
    assetType: z
      .string()
      .describe(
        'The category/type of asset to disassociate from the campaign. Supported types include: AD_CAMPAIGN, BLOG_POST, CALL, CASE_STUDY, CTA, CTA_LEGACY, EXTERNAL_WEB_URL, FEEDBACK_SURVEY, FORM, FILE, KNOWLEDGE_BASE_ARTICLE, LANDING_PAGE, MARKETING_EMAIL, MARKETING_EVENT, MEETING_EVENT, PLAYBOOK, PODCAST_EPISODE, SALES_DOCUMENT, SALES_EMAIL, SEQUENCE, MARKETING_SMS, SOCIAL_POST, OBJECT_LIST (static lists), VIDEO, WEBSITE_PAGE, AUTOMATION_PLATFORM_FLOW (workflows), and others.',
      ),
    campaignGuid: z.string().describe('The unique identifier (UUID) of the HubSpot campaign.'),
  }),
  execute: async ({ hubspotToken, assetId, assetType, campaignGuid }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubDelete(
      hubspotToken,
      `/marketing/v3/campaigns/${encodeURIComponent(String(campaignGuid))}/assets/${encodeURIComponent(String(assetType))}/${encodeURIComponent(String(assetId))}`,
    );
  },
});

export const hubspotSearchCampaigns = tool({
  description: 'Searches for HubSpot campaigns.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    after: z.string().optional().describe('Pagination token from previous response.'),
    limit: z.number().int().optional().describe('Maximum number of campaigns to return.'),
    query: z.string().optional().describe('Text search query to find campaigns by name.'),
  }),
  execute: async ({ hubspotToken, query, after, limit }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(hubspotToken, '/marketing/v3/campaigns/search', {
      query: pickDefined({ q: query, after, limit }),
    });
  },
});

export const hubspotUpdateCampaign = tool({
  description:
    'Partially updates specific, writable properties of an existing HubSpot marketing campaign identified by `campaignGuid`; an empty string value in `properties` clears a property.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    properties: z
      .record(z.any())
      .describe(
        'Dictionary of campaign properties to update. Keys are internal property names (e.g., hs_name, hs_campaign_status, hs_start_date), values are their new string values. Values overwrite existing ones. Attempting to update read-only or non-existent properties will result in an error. To clear a property, set it to an empty string.',
      ),
    campaignGuid: z
      .string()
      .describe('Unique identifier (UUID) of the HubSpot marketing campaign to update.'),
  }),
  execute: async ({ hubspotToken, properties, campaignGuid }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPatch(
      hubspotToken,
      `/marketing/v3/campaigns/${encodeURIComponent(String(campaignGuid))}`,
      {
        body: pickDefined({ properties: properties }),
      },
    );
  },
});

export const hubspotUpdateCampaigns = tool({
  description:
    'Updates properties for up to 50 existing HubSpot marketing campaigns in a single batch operation.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    inputs: z
      .array(z.object({ id: z.string(), properties: z.record(z.any()) }).catchall(z.any()))
      .describe(
        "A list of campaign objects to update. Each object must include the campaign 'id' and a 'properties' dictionary.",
      ),
  }),
  execute: async ({ hubspotToken, inputs }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/marketing/v3/campaigns/batch/update`, {
      body: { inputs: inputs },
    });
  },
});
