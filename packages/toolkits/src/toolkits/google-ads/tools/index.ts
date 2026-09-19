// @ts-nocheck
import { addOrRemoveToCustomerList } from './add-or-remove-to-customer-list.js';
import { createCalloutAsset } from './create-callout-asset.js';
import { createCustomerList } from './create-customer-list.js';
import { getCampaignById } from './get-campaign-by-id.js';
import { getCampaignByName } from './get-campaign-by-name.js';
import { getConversionActionTagSnippets } from './get-conversion-action-tag-snippets.js';
import { getCustomerLists } from './get-customer-lists.js';
import { getRmfReport } from './get-rmf-report.js';
import { listAccessibleCustomers } from './list-accessible-customers.js';
import { listSubAccounts } from './list-sub-accounts.js';
import { mutateAdGroupAds } from './mutate-ad-group-ads.js';
import { mutateAdGroupAssets } from './mutate-ad-group-assets.js';
import { mutateAdGroupBidModifiers } from './mutate-ad-group-bid-modifiers.js';
import { mutateAdGroupCriteria } from './mutate-ad-group-criteria.js';
import { mutateAdGroups } from './mutate-ad-groups.js';
import { mutateAssets } from './mutate-assets.js';
import { mutateBiddingStrategies } from './mutate-bidding-strategies.js';
import { mutateCampaignAssets } from './mutate-campaign-assets.js';
import { mutateCampaignBudgets } from './mutate-campaign-budgets.js';
import { mutateCampaignCriteria } from './mutate-campaign-criteria.js';
import { mutateCampaignLabels } from './mutate-campaign-labels.js';
import { mutateCampaigns } from './mutate-campaigns.js';
import { mutateCampaignsV2 } from './mutate-campaigns-v2.js';
import { mutateConversionActions } from './mutate-conversion-actions.js';
import { mutateCustomerAssets } from './mutate-customer-assets.js';
import { mutateLabels } from './mutate-labels.js';
import { mutatePortfolioBiddingStrategies } from './mutate-portfolio-bidding-strategies.js';
import { searchStreamGaql } from './search-stream-gaql.js';

export {
    addOrRemoveToCustomerList,
    createCalloutAsset,
    createCustomerList,
    getCampaignById,
    getCampaignByName,
    getConversionActionTagSnippets,
    getCustomerLists,
    getRmfReport,
    listAccessibleCustomers,
    listSubAccounts,
    mutateAdGroupAds,
    mutateAdGroupAssets,
    mutateAdGroupBidModifiers,
    mutateAdGroupCriteria,
    mutateAdGroups,
    mutateAssets,
    mutateBiddingStrategies,
    mutateCampaignAssets,
    mutateCampaignBudgets,
    mutateCampaignCriteria,
    mutateCampaignLabels,
    mutateCampaigns,
    mutateCampaignsV2,
    mutateConversionActions,
    mutateCustomerAssets,
    mutateLabels,
    mutatePortfolioBiddingStrategies,
    searchStreamGaql,
};

const auth = 'googleAdsToken' as const;

export const googleAdsTools = [
    {
        name: 'googleAdsAddOrRemoveToCustomerList',
        description: 'Adds or removes contacts from a customer list (UserList audience). Use for customer-match membership updates.',
        tool: addOrRemoveToCustomerList,
        requiredAuth: auth,
        scope: 'write' as const,
    },
    {
        name: 'googleAdsCreateCalloutAsset',
        description: 'Creates an immutable callout asset. Associate it with mutateCustomerAssets (CALLOUT) afterwards.',
        tool: createCalloutAsset,
        requiredAuth: auth,
        scope: 'write' as const,
    },
    {
        name: 'googleAdsCreateCustomerList',
        description: 'Creates a customer list (UserList audience/remarketing list). Use to start a new audience segment.',
        tool: createCustomerList,
        requiredAuth: auth,
        scope: 'write' as const,
    },
    {
        name: 'googleAdsGetCampaignById',
        description: 'Returns campaign details by numeric ID. Use when the campaign ID is known.',
        tool: getCampaignById,
        requiredAuth: auth,
        scope: 'read' as const,
    },
    {
        name: 'googleAdsGetCampaignByName',
        description: 'Retrieves a campaign by exact name. Use when only the campaign name is known.',
        tool: getCampaignByName,
        requiredAuth: auth,
        scope: 'read' as const,
    },
    {
        name: 'googleAdsGetConversionActionTagSnippets',
        description: 'Retrieves website/call tag snippets for a conversion action. Use after creating one, before installing tags.',
        tool: getConversionActionTagSnippets,
        requiredAuth: auth,
        scope: 'read' as const,
    },
    {
        name: 'googleAdsGetCustomerLists',
        description: 'Lists customer lists (audience segments). Use to discover list IDs before membership updates.',
        tool: getCustomerLists,
        requiredAuth: auth,
        scope: 'read' as const,
    },
    {
        name: 'googleAdsGetRmfReport',
        description: 'Runs a bounded report template (customer, campaign, ad, keyword, search term, bidding strategy). Use for standard performance reports.',
        tool: getRmfReport,
        requiredAuth: auth,
        scope: 'read' as const,
    },
    {
        name: 'googleAdsListAccessibleCustomers',
        description: 'Lists customer resource names accessible to the OAuth user. Use to discover which accounts are reachable.',
        tool: listAccessibleCustomers,
        requiredAuth: auth,
        scope: 'read' as const,
    },
    {
        name: 'googleAdsListSubAccounts',
        description: 'Lists child accounts under a manager (MCC) account. Use to pick which child account to target.',
        tool: listSubAccounts,
        requiredAuth: auth,
        scope: 'read' as const,
    },
    {
        name: 'googleAdsMutateAdGroupAds',
        description: 'Creates, updates, or removes ad group ads including responsive search ads.',
        tool: mutateAdGroupAds,
        requiredAuth: auth,
        scope: 'write' as const,
    },
    {
        name: 'googleAdsMutateAdGroupAssets',
        description: 'Links assets to ad groups (sitelinks, callouts, snippets, images). Use after creating assets.',
        tool: mutateAdGroupAssets,
        requiredAuth: auth,
        scope: 'write' as const,
    },
    {
        name: 'googleAdsMutateAdGroupBidModifiers',
        description: 'Creates, updates, or removes ad group bid modifiers (device, hotel criteria).',
        tool: mutateAdGroupBidModifiers,
        requiredAuth: auth,
        scope: 'write' as const,
    },
    {
        name: 'googleAdsMutateAdGroupCriteria',
        description: 'Manages ad group criteria (keywords, audiences, demographics, placements, topics, webpages, listing groups). Removes are irreversible.',
        tool: mutateAdGroupCriteria,
        requiredAuth: auth,
        scope: 'write' as const,
    },
    {
        name: 'googleAdsMutateAdGroups',
        description: 'Creates, updates, or removes ad groups in batch. Removes are irreversible.',
        tool: mutateAdGroups,
        requiredAuth: auth,
        scope: 'write' as const,
    },
    {
        name: 'googleAdsMutateAssets',
        description: 'Creates or updates assets (sitelinks, snippets, text, lead forms, promotions, calls, prices, media).',
        tool: mutateAssets,
        requiredAuth: auth,
        scope: 'write' as const,
    },
    {
        name: 'googleAdsMutateBiddingStrategies',
        description: 'Creates, updates, or removes portfolio bidding strategies (Target CPA/ROAS/Spend, Maximize Conversions/Value, Impression Share).',
        tool: mutateBiddingStrategies,
        requiredAuth: auth,
        scope: 'write' as const,
    },
    {
        name: 'googleAdsMutateCampaignAssets',
        description: 'Links assets to campaigns. Use after creating assets.',
        tool: mutateCampaignAssets,
        requiredAuth: auth,
        scope: 'write' as const,
    },
    {
        name: 'googleAdsMutateCampaignBudgets',
        description: 'Creates, updates, or removes campaign budgets. Use before creating campaigns.',
        tool: mutateCampaignBudgets,
        requiredAuth: auth,
        scope: 'write' as const,
    },
    {
        name: 'googleAdsMutateCampaignCriteria',
        description: 'Manages campaign-level targeting (locations, languages, negative keywords, devices, schedules, audiences, IP exclusions).',
        tool: mutateCampaignCriteria,
        requiredAuth: auth,
        scope: 'write' as const,
    },
    {
        name: 'googleAdsMutateCampaignLabels',
        description: 'Creates or removes campaign-label relationships for organizing and reporting.',
        tool: mutateCampaignLabels,
        requiredAuth: auth,
        scope: 'write' as const,
    },
    {
        name: 'googleAdsMutateCampaigns',
        description: 'Creates, updates, or removes campaigns in batch. Removes are irreversible.',
        tool: mutateCampaigns,
        requiredAuth: auth,
        scope: 'write' as const,
    },
    {
        name: 'googleAdsMutateCampaignsV2',
        description: 'Creates, updates, or removes search/display campaigns with typed bidding strategies.',
        tool: mutateCampaignsV2,
        requiredAuth: auth,
        scope: 'write' as const,
    },
    {
        name: 'googleAdsMutateConversionActions',
        description: 'Creates, updates, or removes conversion actions for conversion tracking.',
        tool: mutateConversionActions,
        requiredAuth: auth,
        scope: 'write' as const,
    },
    {
        name: 'googleAdsMutateCustomerAssets',
        description: 'Creates or removes customer-level asset associations. Removal is irreversible.',
        tool: mutateCustomerAssets,
        requiredAuth: auth,
        scope: 'write' as const,
    },
    {
        name: 'googleAdsMutateLabels',
        description: 'Creates, updates, or removes labels. Pair with campaign label mutations.',
        tool: mutateLabels,
        requiredAuth: auth,
        scope: 'write' as const,
    },
    {
        name: 'googleAdsMutatePortfolioBiddingStrategies',
        description: 'Creates, edits, or removes typed Target CPA / Target ROAS portfolio strategies.',
        tool: mutatePortfolioBiddingStrategies,
        requiredAuth: auth,
        scope: 'write' as const,
    },
    {
        name: 'googleAdsSearchStreamGaql',
        description: 'Executes an arbitrary GAQL query and aggregates streamed batches. Use for custom reports and lookups.',
        tool: searchStreamGaql,
        requiredAuth: auth,
        scope: 'read' as const,
    },
];
