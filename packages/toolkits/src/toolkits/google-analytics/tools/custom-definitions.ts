// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import {
    ADMIN_V1ALPHA,
    ADMIN_V1BETA,
    gaGet,
    gaList,
    gaPost,
    gaRequest,
    googleAnalyticsTokenField,
    normalizeProperty,
    paginationSchema,
} from './client.js';

const propertyField = z.string().describe("Property 'properties/{id}' (bare numeric ID accepted)");

export const createCustomDimension = tool({
    description: 'Creates a custom dimension (EVENT, USER, or ITEM scope) to track event parameters, user properties, or item parameters.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        parent: propertyField,
        displayName: z.string().max(82).describe('UI display name (alphanumeric + space/underscore, starts with a letter)'),
        parameterName: z.string().describe('Tagging parameter name (alphanumeric + underscore, starts with a letter)'),
        scope: z.enum(['EVENT', 'USER', 'ITEM']).describe('Immutable scope'),
        description: z.string().max(150).optional(),
        disallowAdsPersonalization: z.boolean().optional().describe('Set NPA flag (user scope only)'),
    }),
    execute: async ({ googleAnalyticsToken, parent, ...dimension }) =>
        gaPost(googleAnalyticsToken, ADMIN_V1BETA, `${normalizeProperty(parent)}/customDimensions`, dimension, undefined, 'create custom dimension'),
});

export const getCustomDimension = tool({
    description: 'Gets a single custom dimension (display name, scope, parameter name) by resource name.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        name: z.string().describe("Dimension 'properties/{id}/customDimensions/{dimensionId}'"),
    }),
    execute: async ({ googleAnalyticsToken, name }) => {
        try {
            return await gaGet(googleAnalyticsToken, ADMIN_V1BETA, name);
        } catch (error) {
            return { error: 'Error getting custom dimension', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});

export const listCustomDimensions = tool({
    description: 'Lists custom dimensions on a property.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        parent: propertyField,
        ...paginationSchema,
    }),
    execute: async ({ googleAnalyticsToken, parent, pageSize, pageToken }) =>
        gaList(googleAnalyticsToken, ADMIN_V1BETA, normalizeProperty(parent), 'customDimensions', { pageSize, pageToken }, 'list custom dimensions'),
});

export const archiveCustomDimension = tool({
    description: 'Archives a custom dimension (removes from active use without deleting). Archived dimensions cannot be used in new reports.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        name: z.string().describe("Dimension 'properties/{id}/customDimensions/{dimensionId}'"),
    }),
    execute: async ({ googleAnalyticsToken, name }) =>
        gaPost(googleAnalyticsToken, ADMIN_V1BETA, `${name}:archive`, {}, undefined, 'archive custom dimension'),
});

export const createCustomMetric = tool({
    description: 'Creates an event-scoped custom metric for tracking numeric event parameters. CURRENCY units require restrictedMetricType.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        parent: propertyField,
        displayName: z.string().max(82).describe('UI display name'),
        parameterName: z.string().describe('Tagging event-parameter name (max 40 chars)'),
        measurementUnit: z.enum(['STANDARD', 'CURRENCY', 'FEET', 'METERS', 'KILOMETERS', 'MILES', 'MILLISECONDS', 'SECONDS', 'MINUTES', 'HOURS']).describe('Value type'),
        scope: z.enum(['EVENT']).describe('Immutable scope (currently EVENT only)'),
        description: z.string().max(150).optional(),
        restrictedMetricType: z.array(z.enum(['COST_DATA', 'REVENUE_DATA'])).optional().describe('Required for CURRENCY metrics; empty otherwise'),
    }),
    execute: async ({ googleAnalyticsToken, parent, ...metric }) =>
        gaPost(googleAnalyticsToken, ADMIN_V1BETA, `${normalizeProperty(parent)}/customMetrics`, metric, undefined, 'create custom metric'),
});

export const listCustomMetrics = tool({
    description: 'Lists custom metrics on a property.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        parent: propertyField,
        ...paginationSchema,
    }),
    execute: async ({ googleAnalyticsToken, parent, pageSize, pageToken }) =>
        gaList(googleAnalyticsToken, ADMIN_V1BETA, normalizeProperty(parent), 'customMetrics', { pageSize, pageToken }, 'list custom metrics'),
});

export const listCalculatedMetrics = tool({
    description: 'Lists calculated metrics (formula-based metrics) on a property.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        parent: propertyField,
        ...paginationSchema,
    }),
    execute: async ({ googleAnalyticsToken, parent, pageSize, pageToken }) =>
        gaList(googleAnalyticsToken, ADMIN_V1BETA, normalizeProperty(parent), 'calculatedMetrics', { pageSize, pageToken }, 'list calculated metrics'),
});

export const createExpandedDataSet = tool({
    description: 'Creates an expanded data set combining dimensions + metrics into a custom dataset for unsampled exploration.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        parent: propertyField,
        expandedDataSet: z.object({
            displayName: z.string().describe('Human-readable name'),
            dimensionNames: z.array(z.string()).min(1).describe("Dimensions, e.g. ['date','region']"),
            metricNames: z.array(z.string()).min(1).describe("Metrics, e.g. ['sessions']"),
            description: z.string().optional(),
        }).describe('Expanded data set definition'),
    }),
    execute: async ({ googleAnalyticsToken, parent, expandedDataSet }) =>
        gaPost(googleAnalyticsToken, ADMIN_V1ALPHA, `${normalizeProperty(parent)}/expandedDataSets`, { expandedDataSet }, undefined, 'create expanded data set'),
});

export const listExpandedDataSets = tool({
    description: 'Lists expanded data sets on a property.',
    inputSchema: z.object({
        googleAnalyticsToken: googleAnalyticsTokenField,
        parent: propertyField,
        ...paginationSchema,
    }),
    execute: async ({ googleAnalyticsToken, parent, pageSize, pageToken }) =>
        gaList(googleAnalyticsToken, ADMIN_V1ALPHA, normalizeProperty(parent), 'expandedDataSets', { pageSize, pageToken }, 'list expanded data sets'),
});
