// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import {
    ADMIN_V1ALPHA,
    ADMIN_V1BETA,
    gaGet,
    gaList,
    googleAnalyticsTokenField,
    normalizeProperty,
    paginationSchema,
} from './client.js';

const propertyField = z.string().describe("Property 'properties/{id}' (bare numeric ID accepted)");

function makeListTool(
    toolName: string,
    description: string,
    resource: string,
    action: string,
    base: string = ADMIN_V1BETA,
    extraSchema: Record<string, z.ZodTypeAny> = {},
) {
    return tool({
        description,
        inputSchema: z.object({
            googleAnalyticsToken: googleAnalyticsTokenField,
            parent: propertyField,
            ...paginationSchema,
            ...extraSchema,
        }),
        execute: async ({ googleAnalyticsToken, parent, pageSize, pageToken, ...rest }: Record<string, any>) => {
            const extra: Record<string, string | number | boolean | undefined> = {};
            for (const [k, v] of Object.entries(rest)) if (v !== undefined) extra[k] = v as string;
            return gaList(googleAnalyticsToken, base, parent.startsWith('properties/') || parent.startsWith('accounts/') ? parent : normalizeProperty(parent), resource, { pageSize, pageToken, extra }, action);
        },
    });
}

export const listAdsenseLinks = makeListTool(
    'listAdsenseLinks',
    'Lists AdSense links on a property.',
    'adsenseLinks',
    'list AdSense links',
);

export const listBigqueryLinks = makeListTool(
    'listBigqueryLinks',
    'Lists BigQuery export links on a property.',
    'bigqueryLinks',
    'list BigQuery links',
);

export const listChannelGroups = makeListTool(
    'listChannelGroups',
    'Lists channel groups that categorize traffic sources in reports.',
    'channelGroups',
    'list channel groups',
);

export const listConversionEvents = makeListTool(
    'listConversionEvents',
    'Lists conversion events configured on a property.',
    'conversionEvents',
    'list conversion events',
);

export const listKeyEvents = makeListTool(
    'listKeyEvents',
    'Lists key events (successor of conversion events) on a property.',
    'keyEvents',
    'list key events',
);

export const getKeyEvent = tool({
    description: 'Gets a single key event by resource name. Read-only; create/update/delete require the Analytics UI.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        name: z.string().describe("Key event 'properties/{id}/keyEvents/{event}'"),
    }),
    execute: async ({ googleAnalyticsToken, name }) => {
        try {
            return await gaGet(googleAnalyticsToken, ADMIN_V1BETA, name);
        } catch (error) {
            return { error: 'Error getting key event', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const listDataStreams = makeListTool(
    'listDataStreams',
    'Lists data streams (web, iOS, Android) on a property.',
    'dataStreams',
    'list data streams',
);

export const listDv360AdLinks = makeListTool(
    'listDv360AdLinks',
    'Lists Display & Video 360 advertiser links on a property.',
    'displayVideo360AdvertiserLinks',
    'list DV360 advertiser links',
);

export const listDv360LinkProposals = makeListTool(
    'listDv360LinkProposals',
    'Lists Display & Video 360 link proposals on a property.',
    'displayVideo360AdvertiserLinkProposals',
    'list DV360 link proposals',
);

export const listEventCreateRules = makeListTool(
    'listEventCreateRules',
    'Lists event-create rules (derived events) on a property.',
    'eventCreateRules',
    'list event create rules',
);

export const listFirebaseLinks = makeListTool(
    'listFirebaseLinks',
    'Lists Firebase links on a property.',
    'firebaseLinks',
    'list Firebase links',
);

export const listGoogleAdsLinks = makeListTool(
    'listGoogleAdsLinks',
    'Lists Google Ads links on a property.',
    'googleAdsLinks',
    'list Google Ads links',
);

export const listMeasurementProtocolSecrets = makeListTool(
    'listMeasurementProtocolSecrets',
    'Lists Measurement Protocol secrets (api_secret values live under data streams — reuse them for sendEvents).',
    'measurementProtocolSecrets',
    'list Measurement Protocol secrets',
);

export const listSearchAds360Links = makeListTool(
    'listSearchAds360Links',
    'Lists Search Ads 360 links on a property.',
    'searchAds360Links',
    'list Search Ads 360 links',
);

export const listSkAdNetworkSchemas = makeListTool(
    'listSkAdNetworkSchemas',
    'Lists SKAdNetwork conversion-value schemas for an iOS data stream. At most one schema per property.',
    'skadnetworkConversionValueSchemas',
    'list SKAdNetwork schemas',
    ADMIN_V1ALPHA,
);

export const listSubpropertyEventFilters = makeListTool(
    'listSubpropertyEventFilters',
    'Lists subproperty event filters on a property.',
    'subpropertyEventFilters',
    'list subproperty event filters',
    ADMIN_V1ALPHA,
);

export const listSubpropertySyncConfigs = makeListTool(
    'listSubpropertySyncConfigs',
    'Lists subproperty sync configurations on a property.',
    'subpropertySyncConfigs',
    'list subproperty sync configs',
    ADMIN_V1ALPHA,
);

export const listReportingDataAnnotations = makeListTool(
    'listReportingDataAnnotations',
    'Lists reporting data annotations (notes on report data) on a property. Supports filter expressions.',
    'reportingDataAnnotations',
    'list reporting data annotations',
    ADMIN_V1ALPHA,
    { filter: z.string().optional().describe('Filter expression for annotations') },
);
