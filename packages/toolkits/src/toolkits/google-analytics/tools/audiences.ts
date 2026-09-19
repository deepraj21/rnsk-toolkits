// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import {
    ADMIN_V1ALPHA,
    ADMIN_V1BETA,
    DATA_V1ALPHA,
    gaGet,
    gaList,
    gaPost,
    gaRequest,
    googleAnalyticsTokenField,
    normalizeProperty,
    paginationSchema,
} from './client.js';

const audienceDimension = z.object({
    dimensionName: z.string().describe("Dimension API name, e.g. 'deviceId', 'userId', 'city', 'country'"),
});

const propertyField = z.string().describe("GA4 property 'properties/{id}' (bare numeric ID accepted)");

export const getAudience = tool({
    description: 'Gets a single audience configuration (membership criteria, filter clauses) by property + audience ID.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        propertyId: z.string().describe("Property ID ('123456789' or 'properties/123456789')"),
        audienceId: z.string().describe("Numeric audience ID, e.g. '11228260226'"),
    }),
    execute: async ({ googleAnalyticsToken, propertyId, audienceId }) => {
        try {
            return await gaGet(googleAnalyticsToken, ADMIN_V1BETA, `${normalizeProperty(propertyId)}/audiences/${audienceId}`);
        } catch (error) {
            return { error: 'Error getting audience', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const listAudiences = tool({
    description: 'Lists audience configurations on a property. Audiences created before 2020 may not be supported.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        parent: propertyField,
        ...paginationSchema,
    }),
    execute: async ({ googleAnalyticsToken, parent, pageSize, pageToken }) =>
        gaList(googleAnalyticsToken, ADMIN_V1BETA, normalizeProperty(parent), 'audiences', { pageSize, pageToken }, 'list audiences'),
});

export const createAudienceExport = tool({
    description: 'Exports a snapshot of users in an audience (async long-running operation). Poll getAudienceExport, then queryAudienceExport for rows.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        parent: propertyField,
        audience: z.string().describe("Audience 'properties/{id}/audiences/{audienceId}'"),
        dimensions: z.array(audienceDimension).optional().describe('Dimensions to include in the export rows'),
    }),
    execute: async ({ googleAnalyticsToken, parent, audience, dimensions }) => {
        const body: Record<string, unknown> = { audience };
        if (dimensions) body.dimensions = dimensions;
        return gaPost(googleAnalyticsToken, ADMIN_V1ALPHA, `${normalizeProperty(parent)}/audienceExports`, body, undefined, 'create audience export');
    },
});

export const getAudienceExport = tool({
    description: 'Gets audience-export metadata/state after creation.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        name: z.string().describe("Export 'properties/{id}/audienceExports/{exportId}'"),
    }),
    execute: async ({ googleAnalyticsToken, name }) => {
        try {
            return await gaGet(googleAnalyticsToken, ADMIN_V1ALPHA, name);
        } catch (error) {
            return { error: 'Error getting audience export', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const listAudienceExports = tool({
    description: 'Lists audience exports for a property to find and reuse existing exports.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        parent: propertyField,
        ...paginationSchema,
    }),
    execute: async ({ googleAnalyticsToken, parent, pageSize, pageToken }) =>
        gaList(googleAnalyticsToken, ADMIN_V1ALPHA, normalizeProperty(parent), 'audienceExports', { pageSize, pageToken }, 'list audience exports'),
});

export const queryAudienceExport = tool({
    description: 'Retrieves rows from an audience export. Use after the export operation completes.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        name: z.string().describe("Export 'properties/{id}/audienceExports/{exportId}'"),
        limit: z.number().min(1).optional(),
        offset: z.number().min(0).optional(),
    }),
    execute: async ({ googleAnalyticsToken, name, limit, offset }) => {
        const body: Record<string, unknown> = {};
        if (limit !== undefined) body.limit = limit;
        if (offset !== undefined) body.offset = offset;
        return gaPost(googleAnalyticsToken, DATA_V1ALPHA, `${name}:query`, body, undefined, 'query audience export');
    },
});

export const createAudienceList = tool({
    description: 'Creates an audience list snapshot (async operation). At least one dimension is required. Poll getAudienceList, then queryAudienceList.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        parent: propertyField,
        audience: z.string().describe("Audience 'properties/{id}/audiences/{audienceId}'"),
        dimensions: z.array(audienceDimension).min(1).describe('At least one dimension is required'),
        webhookNotification: z.record(z.any()).optional(),
    }),
    execute: async ({ googleAnalyticsToken, parent, audience, dimensions, webhookNotification }) => {
        const body: Record<string, unknown> = { audience, dimensions };
        if (webhookNotification) body.webhookNotification = webhookNotification;
        return gaPost(googleAnalyticsToken, ADMIN_V1ALPHA, `${normalizeProperty(parent)}/audienceLists`, body, undefined, 'create audience list');
    },
});

export const getAudienceList = tool({
    description: 'Gets audience-list metadata/state after creation.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        name: z.string().describe("Audience list 'properties/{id}/audienceLists/{listId}'"),
    }),
    execute: async ({ googleAnalyticsToken, name }) => {
        try {
            return await gaGet(googleAnalyticsToken, ADMIN_V1ALPHA, name);
        } catch (error) {
            return { error: 'Error getting audience list', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const listAudienceLists = tool({
    description: 'Lists audience lists for a property to find and reuse existing lists.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        parent: propertyField,
        ...paginationSchema,
    }),
    execute: async ({ googleAnalyticsToken, parent, pageSize, pageToken }) =>
        gaList(googleAnalyticsToken, ADMIN_V1ALPHA, normalizeProperty(parent), 'audienceLists', { pageSize, pageToken }, 'list audience lists'),
});

export const queryAudienceList = tool({
    description: 'Retrieves rows from an audience list. Use after the list operation completes.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        name: z.string().describe("Audience list 'properties/{id}/audienceLists/{listId}'"),
        limit: z.number().min(1).optional(),
        offset: z.number().min(0).optional(),
    }),
    execute: async ({ googleAnalyticsToken, name, limit, offset }) => {
        const body: Record<string, unknown> = {};
        if (limit !== undefined) body.limit = limit;
        if (offset !== undefined) body.offset = offset;
        return gaPost(googleAnalyticsToken, DATA_V1ALPHA, `${name}:query`, body, undefined, 'query audience list');
    },
});

export const createRecurringAudienceList = tool({
    description: 'Creates a recurring audience list that auto-generates fresh lists daily. Reduces quota-token consumption vs repeated one-off lists.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        parent: propertyField,
        audience: z.string().describe("Audience 'properties/{id}/audiences/{audienceId}'"),
        dimensions: z.array(audienceDimension).min(1).describe('At least one dimension is required'),
        activeDaysRemaining: z.number().min(1).optional().describe('Days the recurring list stays active'),
        webhookNotification: z.record(z.any()).optional(),
    }),
    execute: async ({ googleAnalyticsToken, parent, audience, dimensions, activeDaysRemaining, webhookNotification }) => {
        const body: Record<string, unknown> = { audience, dimensions };
        if (activeDaysRemaining !== undefined) body.activeDaysRemaining = activeDaysRemaining;
        if (webhookNotification) body.webhookNotification = webhookNotification;
        return gaPost(googleAnalyticsToken, ADMIN_V1ALPHA, `${normalizeProperty(parent)}/recurringAudienceLists`, body, undefined, 'create recurring audience list');
    },
});

export const getRecurringAudienceList = tool({
    description: 'Gets a recurring audience list, including the resource name of the most recent generated list.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        name: z.string().describe("Recurring list 'properties/{id}/recurringAudienceLists/{listId}'"),
    }),
    execute: async ({ googleAnalyticsToken, name }) => {
        try {
            return await gaGet(googleAnalyticsToken, ADMIN_V1ALPHA, name);
        } catch (error) {
            return { error: 'Error getting recurring audience list', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const listRecurringAudienceLists = tool({
    description: 'Lists recurring audience lists for a property.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        parent: propertyField,
        ...paginationSchema,
    }),
    execute: async ({ googleAnalyticsToken, parent, pageSize, pageToken }) =>
        gaList(googleAnalyticsToken, ADMIN_V1ALPHA, normalizeProperty(parent), 'recurringAudienceLists', { pageSize, pageToken }, 'list recurring audience lists'),
});
