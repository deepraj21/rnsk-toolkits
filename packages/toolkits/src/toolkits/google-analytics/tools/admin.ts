// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import {
    ADMIN_V1BETA,
    gaGet,
    gaList,
    gaPost,
    gaRequest,
    googleAnalyticsTokenField,
    normalizeProperty,
    paginationSchema,
} from './client.js';

export const getAccount = tool({
    description: 'Gets a single account by resource name. Confirm the name (accounts/{id}) via listAccountsV1Beta first.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        name: z.string().describe("Account 'accounts/{id}'"),
    }),
    execute: async ({ googleAnalyticsToken, name }) => {
        try {
            return await gaGet(googleAnalyticsToken, ADMIN_V1BETA, name);
        } catch (error) {
            return { error: 'Error getting account', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const listAccountsV1Beta = tool({
    description: 'Lists all accounts accessible to the caller (v1beta). Soft-deleted accounts are excluded unless showDeleted is set.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        ...paginationSchema,
        showDeleted: z.boolean().optional().describe('Include soft-deleted accounts'),
    }),
    execute: async ({ googleAnalyticsToken, pageSize, pageToken, showDeleted }) => {
        try {
            const result = await gaRequest(googleAnalyticsToken, ADMIN_V1BETA, '/accounts', {
                pageSize, pageToken, showDeleted,
            });
            if (!result.ok) return { error: 'Failed to list accounts', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error listing accounts', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const listAccountSummaries = tool({
    description: 'Lists high-level summaries of all accessible accounts and their properties without fetching full details.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        ...paginationSchema,
    }),
    execute: async ({ googleAnalyticsToken, pageSize, pageToken }) => {
        try {
            const result = await gaRequest(googleAnalyticsToken, ADMIN_V1BETA, '/accountSummaries', { pageSize, pageToken });
            if (!result.ok) return { error: 'Failed to list account summaries', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error listing account summaries', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const provisionAccountTicket = tool({
    description: 'Provisions an account ticket for creating a new account. Returns a ticket the user accepts via Terms of Service at redirectUri.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        account: z.object({
            displayName: z.string().describe('Human-readable account name'),
            regionCode: z.string().describe("Business country as CLDR region code, e.g. 'US'"),
        }).describe('Account details to create'),
        redirectUri: z.string().describe('Redirect URI (registered in Cloud Console) after ToS acceptance'),
    }),
    execute: async ({ googleAnalyticsToken, account, redirectUri }) =>
        gaPost(googleAnalyticsToken, ADMIN_V1BETA, 'accounts:provisionAccountTicket', { account, redirectUri }, undefined, 'provision account ticket'),
});

export const getProperty = tool({
    description: 'Gets a single GA4 property (display name, time zone, currency, settings) by resource name.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        name: z.string().describe("Property 'properties/{id}'"),
    }),
    execute: async ({ googleAnalyticsToken, name }) => {
        try {
            return await gaGet(googleAnalyticsToken, ADMIN_V1BETA, name);
        } catch (error) {
            return { error: 'Error getting property', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const listPropertiesFiltered = tool({
    description: "Lists GA4 properties by filter ('parent:accounts/123', 'ancestor:accounts/123', or 'firebase_project:...'). Preferred over the deprecated unfiltered list.",
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        filter: z.string().describe("Filter, e.g. 'parent:accounts/123' or 'ancestor:accounts/123'"),
        ...paginationSchema,
        showDeleted: z.boolean().optional().describe('Include soft-deleted properties'),
    }),
    execute: async ({ googleAnalyticsToken, filter, pageSize, pageToken, showDeleted }) => {
        try {
            const result = await gaRequest(googleAnalyticsToken, ADMIN_V1BETA, '/properties', {
                filter, pageSize, pageToken, showDeleted,
            });
            if (!result.ok) return { error: 'Failed to list properties', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error listing properties', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const updateProperty = tool({
    description: 'Updates a property (displayName, timeZone, currencyCode). Only updateMask fields change — use snake_case names or "*" for full replace.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        name: z.string().describe("Property 'properties/{id}'"),
        updateMask: z.string().describe("Fields to update, e.g. 'display_name,time_zone' or '*'"),
        displayName: z.string().max(100).optional(),
        timeZone: z.string().optional().describe("IANA time zone, e.g. 'America/Los_Angeles'"),
        currencyCode: z.string().optional().describe("ISO 4217 code, e.g. 'USD'"),
        industryCategory: z.string().optional(),
        propertyType: z.enum(['PROPERTY_TYPE_UNSPECIFIED', 'PROPERTY_TYPE_ORDINARY', 'PROPERTY_TYPE_SUBPROPERTY', 'PROPERTY_TYPE_ROLLUP']).optional(),
        parent: z.string().optional().describe("Logical parent 'accounts/{id}' or 'properties/{id}'"),
    }),
    execute: async ({ googleAnalyticsToken, name, updateMask, ...fields }) => {
        try {
            const body: Record<string, unknown> = { name };
            const keyMap: Record<string, string> = {
                displayName: 'displayName', timeZone: 'timeZone', currencyCode: 'currencyCode',
                industryCategory: 'industryCategory', propertyType: 'propertyType', parent: 'parent',
            };
            for (const [k, v] of Object.entries(fields)) {
                if (v !== undefined && keyMap[k]) body[keyMap[k]] = v;
            }
            const result = await gaRequest(googleAnalyticsToken, ADMIN_V1BETA, `/${name}`, {
                method: 'PATCH', query: { updateMask }, body,
            });
            if (!result.ok) return { error: 'Failed to update property', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error updating property', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const createRollupProperty = tool({
    description: 'Creates a roll-up property aggregating multiple GA4 source properties into one view.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        account: z.string().describe("Parent account 'accounts/{id}'"),
        displayName: z.string().describe('Display name for the roll-up property'),
        timeZone: z.string().describe("IANA time zone, e.g. 'America/Los_Angeles'"),
        sourceProperties: z.array(z.string()).optional().describe("Source properties, e.g. ['properties/123']"),
    }),
    execute: async ({ googleAnalyticsToken, account, displayName, timeZone, sourceProperties }) => {
        const body: Record<string, unknown> = { account, displayName, timeZone };
        if (sourceProperties) body.sourceProperties = sourceProperties;
        return gaPost(googleAnalyticsToken, ADMIN_V1BETA, 'properties:createRollupProperty', body, undefined, 'create roll-up property');
    },
});

export const getPropertyQuotasSnapshot = tool({
    description: 'Gets property quota usage by category (core, funnel, realtime snapshots). Data can lag real consumption — treat as approximate.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        property: z.string().describe("Property 'properties/{id}' (bare ID accepted)"),
    }),
    execute: async ({ googleAnalyticsToken, property }) => {
        try {
            const result = await gaRequest(googleAnalyticsToken, ADMIN_V1BETA, `/${normalizeProperty(property)}:getPropertyQuotasSnapshot`);
            if (!result.ok) return { error: 'Failed to get property quotas snapshot', details: result.error };
            return result.data;
        } catch (error) {
            return { error: 'Error getting property quotas snapshot', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const getAttributionSettings = tool({
    description: 'Gets attribution configuration (models, lookback windows, conversion export) for a property.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        name: z.string().describe("Attribution settings 'properties/{id}/attributionSettings'"),
    }),
    execute: async ({ googleAnalyticsToken, name }) => {
        try {
            return await gaGet(googleAnalyticsToken, ADMIN_V1BETA, name);
        } catch (error) {
            return { error: 'Error getting attribution settings', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const getDataRetentionSettings = tool({
    description: 'Gets event-level and user-level data retention durations and reset settings for a property.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        name: z.string().describe("Retention settings 'properties/{id}/dataRetentionSettings'"),
    }),
    execute: async ({ googleAnalyticsToken, name }) => {
        try {
            return await gaGet(googleAnalyticsToken, ADMIN_V1BETA, name);
        } catch (error) {
            return { error: 'Error getting data retention settings', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const getDataSharingSettings = tool({
    description: 'Gets data-sharing configuration for an account (support, sales, product sharing flags).',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        name: z.string().describe("Sharing settings 'accounts/{id}/dataSharingSettings'"),
    }),
    execute: async ({ googleAnalyticsToken, name }) => {
        try {
            return await gaGet(googleAnalyticsToken, ADMIN_V1BETA, name);
        } catch (error) {
            return { error: 'Error getting data sharing settings', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const getGoogleSignalsSettings = tool({
    description: 'Gets Google Signals configuration (enabled state, consent status) for a property.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        name: z.string().describe("Signals settings 'properties/{id}/googleSignalsSettings'"),
    }),
    execute: async ({ googleAnalyticsToken, name }) => {
        try {
            return await gaGet(googleAnalyticsToken, ADMIN_V1BETA, name);
        } catch (error) {
            return { error: 'Error getting Google Signals settings', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
