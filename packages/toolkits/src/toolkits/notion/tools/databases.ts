// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { NOTION_VERSION_VIEWS, buildProperties, normalizeId, notionRequest, richText, toNotionError } from './client.js';

const tokenField = z.string().optional().describe('Token provided by the system; do not provide');
const propEntry = z.object({
    name: z.string().describe('Property name'),
    type: z.string().describe('Property type (title, rich_text, number, select, multi_select, date, people, files, checkbox, url, email, phone_number, relation, status)'),
    value: z.any().describe('Value: text | numeric string | option name | comma-separated names/ids | date start (..end) | true/false'),
});

export const notionCreateDatabase = tool({
    description: 'Create a new database under a parent page with a title and property schema.',
    inputSchema: z.object({
        parentId: z.string().describe('UUID of the parent page (databases cannot parent databases)'),
        title: z.string().describe('Database title'),
        properties: z.array(z.any()).optional().describe('Property schemas: [{name, type, options?...}] e.g. select options [{name, color}]'),
        notionToken: tokenField,
    }),
    execute: async ({ parentId, title, properties, notionToken }) => {
        try {
            const props: Record<string, any> = {};
            for (const p of properties ?? [{ name: 'Name', type: 'title' }]) {
                const schema: any = { [p.type]: p.type === 'select' || p.type === 'multi_select'
                    ? { options: (p.options ?? []).map((o: any) => (typeof o === 'string' ? { name: o } : o)) }
                    : p.type === 'relation' ? { database_id: p.database_id, type: p.relation_type ?? 'single_property' } : {} };
                props[p.name] = schema;
            }
            return await notionRequest(notionToken, '/databases', {
                method: 'POST',
                body: {
                    parent: { type: 'page_id', page_id: normalizeId(parentId) },
                    title: [{ text: { content: title } }],
                    properties: props,
                },
            });
        } catch (error) {
            return toNotionError(error, 'Notion create database failed');
        }
    },
});

export const notionUpdateDatabaseSchema = tool({
    description: 'Update a database title, description, or columns (rename, change type, remove). At least one change required.',
    inputSchema: z.object({
        databaseId: z.string().describe('UUID of the database'),
        title: z.string().optional().describe('New database title'),
        description: z.string().optional().describe('New database description'),
        properties: z.array(z.any()).optional().describe('Column updates: [{name, rename?, new_type?, remove?, database_id? (for relation)}]'),
        notionToken: tokenField,
    }),
    execute: async ({ databaseId, title, description, properties, notionToken }) => {
        try {
            const body: any = {};
            if (title) body.title = [{ text: { content: title } }];
            if (description !== undefined) body.description = [{ text: { content: description } }];
            if (properties) {
                const props: Record<string, any> = {};
                for (const p of properties) {
                    if (p.remove) { props[p.name] = null; continue; }
                    const schema: any = {};
                    if (p.new_type) {
                        schema[p.new_type] = p.new_type === 'relation' && p.database_id
                            ? { database_id: p.database_id }
                            : {};
                    }
                    if (p.rename) schema.name = p.rename;
                    props[p.name] = schema;
                }
                body.properties = props;
            }
            return await notionRequest(notionToken, `/databases/${normalizeId(databaseId)}`, {
                method: 'PATCH',
                body,
            });
        } catch (error) {
            return toNotionError(error, 'Notion update database schema failed');
        }
    },
});

export const notionInsertDatabaseRow = tool({
    description: 'Insert a row (page) into a database. Properties use simplified {name, type, value} entries converted to Notion format.',
    inputSchema: z.object({
        databaseId: z.string().describe('UUID of the database'),
        properties: z.array(propEntry).optional().describe('Property values'),
        childBlocks: z.array(z.any()).optional().describe('Initial content blocks for the row page'),
        icon: z.string().optional().describe('Emoji icon'),
        cover: z.string().optional().describe('Public cover image URL'),
        notionToken: tokenField,
    }),
    execute: async ({ databaseId, properties, childBlocks, icon, cover, notionToken }) => {
        try {
            const body: any = {
                parent: { database_id: normalizeId(databaseId) },
                properties: buildProperties(properties ?? []),
            };
            if (childBlocks) body.children = childBlocks;
            if (icon) body.icon = { type: 'emoji', emoji: icon };
            if (cover) body.cover = { type: 'external', external: { url: cover } };
            return await notionRequest(notionToken, '/pages', { method: 'POST', body });
        } catch (error) {
            return toNotionError(error, 'Notion insert database row failed');
        }
    },
});

export const notionUpdateDatabaseRow = tool({
    description: 'Update a database row (page) properties, icon, or cover by row ID. Set deleteRow to archive it.',
    inputSchema: z.object({
        rowId: z.string().describe('UUID of the row (page)'),
        properties: z.array(propEntry).optional().describe('Property values in {name, type, value} form'),
        icon: z.string().optional().describe('Emoji icon'),
        cover: z.string().optional().describe('Public cover image URL'),
        deleteRow: z.boolean().optional().describe('Archive the row instead of updating'),
        notionToken: tokenField,
    }),
    execute: async ({ rowId, properties, icon, cover, deleteRow, notionToken }) => {
        try {
            const body: any = {};
            if (properties) body.properties = buildProperties(properties);
            if (icon) body.icon = { type: 'emoji', emoji: icon };
            if (cover) body.cover = { type: 'external', external: { url: cover } };
            if (deleteRow) body.archived = true;
            return await notionRequest(notionToken, `/pages/${normalizeId(rowId)}`, {
                method: 'PATCH',
                body,
            });
        } catch (error) {
            return toNotionError(error, 'Notion update database row failed');
        }
    },
});

export const notionUpsertDatabaseRows = tool({
    description: 'Sync rows without duplicates: for each item, query the database with the match filter, update the first match or create a new row.',
    inputSchema: z.object({
        databaseId: z.string().optional().describe('UUID of the database (or per-item dataSourceId)'),
        dataSourceId: z.string().optional().describe('Data source UUID (for multi-source databases)'),
        items: z.array(z.any()).describe('Items: {match: filter, create: {properties, icon?, cover?}, update: {properties, icon?, cover?}} with properties as {name: NotionValue} or [{name,type,value}]'),
        notionToken: tokenField,
    }),
    execute: async ({ databaseId, dataSourceId, items, notionToken }) => {
        try {
            const coerce = (p: any) => (Array.isArray(p) ? buildProperties(p) : (p ?? {}));
            const results: any[] = [];
            for (const item of items) {
                let matchFilter = item.match;
                if (matchFilter?.property && matchFilter?.equals !== undefined) {
                    matchFilter = { property: matchFilter.property, rich_text: { equals: String(matchFilter.equals) } };
                }
                let found: any[] = [];
                if (databaseId) {
                    const q: any = await notionRequest(notionToken, `/databases/${normalizeId(databaseId)}/query`, {
                        method: 'POST',
                        body: { filter: matchFilter, page_size: 1 },
                    });
                    if (q?.error) { results.push({ match: item.match, error: q }); continue; }
                    found = q.results ?? [];
                }
                if (found.length > 0) {
                    const upd = item.update ?? {};
                    const res: any = await notionRequest(notionToken, `/pages/${found[0].id}`, {
                        method: 'PATCH',
                        body: {
                            properties: coerce(upd.properties),
                            ...(upd.icon ? { icon: { type: 'emoji', emoji: upd.icon } } : {}),
                            ...(upd.cover ? { cover: { type: 'external', external: { url: upd.cover } } } : {}),
                        },
                    });
                    results.push({ match: item.match, action: 'updated', page: res });
                } else {
                    const crt = item.create ?? {};
                    const parent = dataSourceId
                        ? { data_source_id: normalizeId(dataSourceId) }
                        : { database_id: normalizeId(databaseId) };
                    const res: any = await notionRequest(notionToken, '/pages', {
                        method: 'POST',
                        body: {
                            parent,
                            properties: coerce(crt.properties),
                            ...(crt.icon ? { icon: { type: 'emoji', emoji: crt.icon } } : {}),
                            ...(crt.cover ? { cover: { type: 'external', external: { url: crt.cover } } } : {}),
                        },
                    });
                    results.push({ match: item.match, action: 'created', page: res });
                }
            }
            return { results };
        } catch (error) {
            return toNotionError(error, 'Notion upsert database rows failed');
        }
    },
});

export const notionQueryDatabaseWithFilter = tool({
    description: 'Query a database with server-side property filters, sorts, and pagination.',
    inputSchema: z.object({
        databaseId: z.string().describe('UUID of the database'),
        filter: z.any().optional().describe('Notion filter object (single or and/or compound)'),
        sorts: z.array(z.any()).optional().describe('Sorts: {property, direction} or {timestamp, direction}'),
        pageSize: z.number().min(1).max(100).optional().describe('Rows per page (max 100)'),
        startCursor: z.string().optional().describe('next_cursor from a previous response'),
        notionToken: tokenField,
    }),
    execute: async ({ databaseId, filter, sorts, pageSize, startCursor, notionToken }) => {
        try {
            const normSorts = (sorts ?? []).map((s: any) => {
                if (s?.property_name) {
                    const name = s.property_name;
                    if (/^(created_time|last_edited_time)$/i.test(name)) return { timestamp: name.toLowerCase(), direction: s.ascending === false ? 'descending' : 'ascending' };
                    return { property: name, direction: s.ascending === false ? 'descending' : 'ascending' };
                }
                return s;
            });
            return await notionRequest(notionToken, `/databases/${normalizeId(databaseId)}/query`, {
                method: 'POST',
                body: { filter, sorts: normSorts.length > 0 ? normSorts : undefined, page_size: pageSize, start_cursor: startCursor },
            });
        } catch (error) {
            return toNotionError(error, 'Notion query database with filter failed');
        }
    },
});

export const notionQueryDataSource = tool({
    description: 'Query a data source (2025-09-03 API) with filters, sorts, filter_properties, and pagination.',
    inputSchema: z.object({
        dataSourceId: z.string().describe('UUID of the data source'),
        filter: z.any().optional().describe('Filter object (single or and/or compound)'),
        sorts: z.array(z.any()).optional().describe('Sorts: {property, direction} or {timestamp, direction}'),
        filterProperties: z.array(z.string()).optional().describe('Property IDs to include in results'),
        pageSize: z.number().min(1).max(100).optional().describe('Rows per page (max 100)'),
        startCursor: z.string().optional().describe('next_cursor from a previous response'),
        notionToken: tokenField,
    }),
    execute: async ({ dataSourceId, filter, sorts, filterProperties, pageSize, startCursor, notionToken }) => {
        try {
            return await notionRequest(notionToken, `/data_sources/${normalizeId(dataSourceId)}/query`, {
                method: 'POST',
                version: NOTION_VERSION_VIEWS,
                body: { filter, sorts, filter_properties: filterProperties, page_size: pageSize, start_cursor: startCursor },
            });
        } catch (error) {
            return toNotionError(error, 'Notion query data source failed');
        }
    },
});

export const notionRetrieveDatabaseProperty = tool({
    description: 'Retrieve a single database column schema by property ID or name (resolved against the live database schema).',
    inputSchema: z.object({
        databaseId: z.string().describe('UUID of the database'),
        propertyId: z.string().describe('Property ID or name (URL-encoded IDs are decoded)'),
        notionToken: tokenField,
    }),
    execute: async ({ databaseId, propertyId, notionToken }) => {
        try {
            const db: any = await notionRequest(notionToken, `/databases/${normalizeId(databaseId)}`);
            if (db?.error) return db;
            const decoded = decodeURIComponent(propertyId);
            const props = db.properties ?? {};
            if (props[decoded]) return { id: props[decoded].id ?? decoded, name: decoded, ...props[decoded] };
            const byId = Object.entries(props).find(([, v]: any) => v?.id === decoded);
            if (byId) return { name: byId[0], ...(byId[1] as any) };
            return { error: 'Property not found', available: Object.keys(props) };
        } catch (error) {
            return toNotionError(error, 'Notion retrieve database property failed');
        }
    },
});

export const notionListDataSourceTemplates = tool({
    description: 'List page templates of a data source (used as New-dropdown templates for page creation).',
    inputSchema: z.object({
        dataSourceId: z.string().describe('UUID of the data source'),
        pageSize: z.number().min(1).max(100).optional().describe('Templates per page (max 100)'),
        startCursor: z.string().optional().describe('next_cursor from a previous response'),
        notionToken: tokenField,
    }),
    execute: async ({ dataSourceId, pageSize, startCursor, notionToken }) => {
        try {
            return await notionRequest(notionToken, `/data_sources/${normalizeId(dataSourceId)}/templates`, {
                version: NOTION_VERSION_VIEWS,
                query: { page_size: pageSize, start_cursor: startCursor },
            });
        } catch (error) {
            return toNotionError(error, 'Notion list data source templates failed');
        }
    },
});

export const notionFetchData = tool({
    description: 'Browse workspace items: search pages, databases, or both by title (empty query lists everything). Thin wrapper over search.',
    inputSchema: z.object({
        fetchType: z.enum(['pages', 'databases', 'all']).describe('Which object types to return'),
        query: z.string().optional().describe('Title search text (empty lists all accessible items)'),
        pageSize: z.number().min(1).max(100).optional().describe('Items per page (max 100, default 100)'),
        startCursor: z.string().optional().describe('next_cursor from a previous response'),
        notionToken: tokenField,
    }),
    execute: async ({ fetchType, query, pageSize, startCursor, notionToken }) => {
        try {
            const body: any = { query: query ?? '', page_size: pageSize ?? 100, start_cursor: startCursor };
            if (fetchType !== 'all') body.filter = { property: 'object', value: fetchType === 'pages' ? 'page' : 'database' };
            return await notionRequest(notionToken, '/search', { method: 'POST', body });
        } catch (error) {
            return toNotionError(error, 'Notion fetch data failed');
        }
    },
});
