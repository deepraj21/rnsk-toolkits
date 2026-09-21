// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { accountIdField, nerdgraph, newRelicApiKeyField } from './client.js';

const nrqlQueryInput = z.object({
    accountId: z.number().int().positive().describe('Account ID to query data from'),
    query: z.string().describe("NRQL query, e.g. 'SELECT count(*) FROM Transaction TIMESERIES'"),
});

const widgetConfiguration = z.object({
    line: z.object({ nrqlQueries: z.array(nrqlQueryInput).min(1) }).optional(),
    area: z.object({ nrqlQueries: z.array(nrqlQueryInput).min(1) }).optional(),
    bar: z.object({ nrqlQueries: z.array(nrqlQueryInput).min(1) }).optional(),
    pie: z.object({ nrqlQueries: z.array(nrqlQueryInput).min(1) }).optional(),
    table: z.object({ nrqlQueries: z.array(nrqlQueryInput).min(1) }).optional(),
    billboard: z.object({ nrqlQueries: z.array(nrqlQueryInput).min(1) }).optional(),
    markdown: z.object({ text: z.string().describe('Markdown content') }).optional(),
}).describe('Exactly one visualization key (line/area/bar/pie/table/billboard/markdown)');

const widgetLayout = z.object({
    column: z.number().int().min(1).max(12).describe('Start column (1-12)'),
    row: z.number().int().min(1).describe('Start row (1+)'),
    width: z.number().int().min(1).max(12).describe('Width in columns (1-12)'),
    height: z.number().int().min(1).describe('Height in rows (1+)'),
});

const createWidget = z.object({
    title: z.string().describe('Widget title on the dashboard'),
    configuration: widgetConfiguration,
    layout: widgetLayout.describe('Grid position and size'),
});

const createPage = z.object({
    name: z.string().describe('Page name'),
    description: z.string().optional(),
    widgets: z.array(createWidget).min(1),
});

const DASHBOARD_ERRORS = 'errors { description type }';

export const createDashboard = tool({
    description: 'Creates a dashboard with pages and NRQL/markdown widgets. At least one page with one widget is required.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdField('Account ID for the dashboard'),
        name: z.string().describe('Dashboard name, unique within the account'),
        pages: z.array(createPage).min(1),
        description: z.string().optional(),
        permissions: z.enum(['PRIVATE', 'PUBLIC_READ_ONLY', 'PUBLIC_READ_WRITE']).optional().describe('Access control (default PRIVATE)'),
    }),
    execute: async ({ newRelicApiKey, accountId, ...dashboard }) =>
        nerdgraph(
            newRelicApiKey,
            `mutation($accountId: Int!, $dashboard: DashboardInput!) { dashboardCreate(accountId: $accountId, dashboard: $dashboard) { entityResult { guid name } ${DASHBOARD_ERRORS} } }`,
            { accountId, dashboard: { permissions: 'PRIVATE', ...dashboard } },
            'create dashboard',
        ),
});

export const updateDashboard = tool({
    description:
        'Updates a dashboard (name, permissions, pages, widgets). Include page GUIDs and widget IDs to preserve them — omitted ones are removed.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        guid: z.string().describe('Dashboard entity GUID to update'),
        name: z.string().describe('Updated dashboard name'),
        permissions: z.enum(['PRIVATE', 'PUBLIC_READ_ONLY', 'PUBLIC_READ_WRITE']).describe('Updated access control'),
        pages: z.array(z.object({
            guid: z.string().optional().describe('Page GUID (required to keep an existing page)'),
            name: z.string(),
            description: z.string().optional(),
            widgets: z.array(z.object({
                id: z.string().optional().describe('Widget ID (required to keep an existing widget)'),
                title: z.string(),
                visualization: z.string().describe("Viz ID, e.g. 'viz.line', 'viz.markdown'"),
                rawConfiguration: z.record(z.any()).describe("Viz config: markdown {text} or NRQL {nrqlQueries:[{accountId,query}]}"),
                layout: z.record(z.number()).optional().describe('{column,row,width,height}'),
                linkedEntityGuids: z.array(z.string()).max(1).optional(),
            })),
        })).describe('Full replacement page list'),
        description: z.string().optional().describe('Updated description (omit to retain)'),
    }),
    execute: async ({ newRelicApiKey, guid, ...dashboard }) =>
        nerdgraph(
            newRelicApiKey,
            `mutation($guid: EntityGuid!, $dashboard: DashboardUpdateInput!) { dashboardUpdate(guid: $guid, dashboard: $dashboard) { entityResult { guid name } ${DASHBOARD_ERRORS} } }`,
            { guid, dashboard },
            'update dashboard',
        ),
});

export const deleteDashboard = tool({
    description: 'Permanently deletes a dashboard by entity GUID. Recoverable via undeleteDashboard (tags are not recovered).',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        guid: z.string().describe('Dashboard entity GUID to delete'),
    }),
    execute: async ({ newRelicApiKey, guid }) =>
        nerdgraph(
            newRelicApiKey,
            `mutation($guid: EntityGuid!) { dashboardDelete(guid: $guid) { status ${DASHBOARD_ERRORS} } }`,
            { guid },
            'delete dashboard',
        ),
});

export const undeleteDashboard = tool({
    description: 'Recovers a logically deleted dashboard by GUID. Custom tags cannot be recovered.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        guid: z.string().describe('Deleted dashboard entity GUID to recover'),
    }),
    execute: async ({ newRelicApiKey, guid }) =>
        nerdgraph(
            newRelicApiKey,
            `mutation($guid: EntityGuid!) { dashboardUndelete(guid: $guid) { ${DASHBOARD_ERRORS} } }`,
            { guid },
            'undelete dashboard',
        ),
});

export const createDashboardSnapshotUrl = tool({
    description: 'Generates a shareable snapshot URL (PDF) of a dashboard page at its current state for distribution/archiving.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        guid: z.string().describe('Dashboard page entity GUID to snapshot'),
    }),
    execute: async ({ newRelicApiKey, guid }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($guid: EntityGuid!) { dashboardCreateSnapshotUrl(guid: $guid) }',
            { guid },
            'create dashboard snapshot URL',
        ),
});

export const getDashboardEntity = tool({
    description: 'Reads full dashboard configuration (pages, widgets, owner, permissions) by entity GUID. Use before updates to capture IDs.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        guid: z.string().describe('Dashboard entity GUID to query'),
    }),
    execute: async ({ newRelicApiKey, guid }) =>
        nerdgraph(
            newRelicApiKey,
            `query($guid: EntityGuid!) { actor { entity(guid: $guid) { guid name ... on DashboardEntity { description permissions owner { email userId } pages { guid name description createdAt updatedAt widgets { id title visualization { id } rawConfiguration } } createdAt updatedAt } } } }`,
            { guid },
            'query dashboard entity',
        ),
});

export const addWidgetsToDashboardPage = tool({
    description: 'Adds visualization widgets (line/area/bar/pie/table/billboard/markdown) to an existing dashboard page by page GUID.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        guid: z.string().describe('Dashboard page entity GUID'),
        widgets: z.array(createWidget).min(1),
    }),
    execute: async ({ newRelicApiKey, guid, widgets }) =>
        nerdgraph(
            newRelicApiKey,
            `mutation($guid: EntityGuid!, $widgets: [DashboardAddWidgetsToPageWidgetInput!]!) { dashboardAddWidgetsToPage(guid: $guid, widgets: $widgets) { ${DASHBOARD_ERRORS} } }`,
            { guid, widgets },
            'add widgets to dashboard page',
        ),
});

export const updateDashboardPage = tool({
    description: 'Updates a dashboard page (name, description, widget set). Include every widget with its ID or it is removed.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        guid: z.string().describe('Dashboard page entity GUID to update'),
        page: z.object({
            name: z.string().describe('Page name'),
            description: z.string().optional(),
            widgets: z.array(z.object({
                id: z.string().describe('Widget ID (required to preserve identity)'),
                title: z.string(),
                visualization: z.object({ id: z.string().describe("Viz ID, e.g. 'viz.line'") }),
                layout: widgetLayout,
                rawConfiguration: z.object({
                    text: z.string().optional().describe('Markdown content'),
                    nrqlQueries: z.array(nrqlQueryInput).optional(),
                }).describe('NRQL queries and/or markdown text'),
            })).min(1).describe('Complete widget list with IDs'),
        }).describe('Updated page configuration'),
    }),
    execute: async ({ newRelicApiKey, guid, page }) =>
        nerdgraph(
            newRelicApiKey,
            `mutation($guid: EntityGuid!, $page: DashboardUpdatePageInput!) { dashboardUpdatePage(guid: $guid, page: $page) { ${DASHBOARD_ERRORS} } }`,
            { guid, page },
            'update dashboard page',
        ),
});

export const updateDashboardWidgetsInPage = tool({
    description: 'Updates existing widgets in a page (titles, layouts, queries). Each widget needs its ID.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        guid: z.string().describe('Dashboard page entity GUID'),
        widgets: z.array(z.object({
            id: z.string().describe('Widget ID to update'),
            title: z.string(),
            visualization: z.object({ id: z.string().describe("Viz ID, e.g. 'viz.markdown'") }),
            layout: widgetLayout,
            configuration: z.record(z.any()).describe("Content: markdown {text} and/or nrqlQueries [{accountId,query}]"),
            linkedEntityGuids: z.array(z.string()).optional().describe('Facet-link entity GUIDs'),
        })).min(1),
    }),
    execute: async ({ newRelicApiKey, guid, widgets }) =>
        nerdgraph(
            newRelicApiKey,
            `mutation($guid: EntityGuid!, $widgets: [DashboardUpdateWidgetsInPageWidgetInput!]!) { dashboardUpdateWidgetsInPage(guid: $guid, widgets: $widgets) { ${DASHBOARD_ERRORS} } }`,
            { guid, widgets },
            'update dashboard widgets in page',
        ),
});

export const updateDashboardLiveUrlCreationPolicies = tool({
    description: 'Enables/disables public live-URL creation for dashboards in up to 100 accounts. Requires Authentication Domain Manager role.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountIds: z.array(z.number().int()).min(1).max(100).describe('Account IDs to update (max 100)'),
        liveUrlCreationAllowed: z.boolean().describe('true to allow public live URLs, false to block'),
    }),
    execute: async ({ newRelicApiKey, accountIds, liveUrlCreationAllowed }) =>
        nerdgraph(
            newRelicApiKey,
            'mutation($accountIds: [Int!]!, $allowed: Boolean!) { dashboardUpdateLiveUrlCreationPolicies(accountIds: $accountIds, liveUrlCreationAllowed: $allowed) { liveUrlCreationPolicies { accountId liveUrlCreationAllowed } } }',
            { accountIds, allowed: liveUrlCreationAllowed },
            'update dashboard live URL creation policies',
        ),
});
