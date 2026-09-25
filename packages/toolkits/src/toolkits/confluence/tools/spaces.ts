// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { conf, parseJsonValue, resolveSpaceId, sleep } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const cloudField = z.string().optional().describe('Optional Confluence Cloud site ID. If omitted, your first accessible site is used automatically.');
const limitField = z.number().int().min(1).max(250).optional().describe('Max items to return.');
const cursorField = z.string().optional().describe('Opaque pagination cursor from a previous response _links.next.');

const spaceDescription = z
    .object({
        plain: z
            .object({
                value: z.string().describe('Plain-text description.'),
                representation: z.literal('plain').optional().describe("Must be 'plain'."),
            })
            .describe('Plain description wrapper.'),
    })
    .optional()
    .describe('Space description. Must include plain.representation to avoid a 400 error.');

export const confluenceCreateSpace = tool({
    description: 'Create a new global or personal space for a knowledge area. Key must be unique alphanumeric.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        key: z.string().describe('Unique space key, alphanumeric only (e.g. DOCS).'),
        name: z.string().describe('Human-readable space name.'),
        type: z.enum(['global', 'personal']).optional().describe('Space type.'),
        description: spaceDescription,
        metadata: z.string().optional().describe('Extra space metadata as a JSON string.'),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, key, name, type, description, metadata }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: '/api/v2/spaces',
            method: 'POST',
            body: {
                key,
                name,
                type,
                description: description ? { plain: { value: description.plain.value, representation: 'plain' } } : undefined,
                metadata: parseJsonValue(metadata),
            },
        });
    },
});

export const confluenceCreatePrivateSpace = tool({
    description: 'Create a private space visible only to its creator. Use for isolated personal workspaces.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        key: z.string().describe('Unique space key, alphanumeric only (e.g. PERS1).'),
        name: z.string().describe('Space name.'),
        description: spaceDescription,
    }),
    execute: async ({ confluenceToken, confluenceCloudId, key, name, description }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: '/api/v2/spaces',
            method: 'POST',
            body: {
                key,
                name,
                createPrivateSpace: true,
                description: description ? { plain: { value: description.plain.value, representation: 'plain' } } : undefined,
            },
        });
    },
});

export const confluenceGetSpaceById = tool({
    description: 'Get a space by numeric ID with key, name, type, status and homepage. Use IDs (not names) downstream — names are not unique.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        id: z.string().describe('Numeric space ID (not the key — use spaces list to resolve).'),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, id }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/spaces/${encodeURIComponent(id)}`,
        });
    },
});

export const confluenceGetSpaces = tool({
    description: 'List spaces with filters (keys, type, status, labels). Permission-scoped; missing spaces may be restricted, not absent.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        spaceKey: z.union([z.string(), z.array(z.string())]).optional().describe('Exact space key(s).'),
        type: z.enum(['global', 'personal']).optional().describe('Space type filter.'),
        status: z.enum(['current', 'archived']).optional().describe('Space status filter.'),
        label: z.union([z.string(), z.array(z.string())]).optional().describe('Spaces must carry at least one of these labels.'),
        expand: z.array(z.string()).optional().describe("Extra details, e.g. ['description', 'icon']."),
        limit: z.number().int().min(1).max(200).optional().describe('Max spaces per page.'),
        cursor: cursorField,
    }),
    execute: async ({ confluenceToken, confluenceCloudId, spaceKey, type, status, label, expand, limit, cursor }) => {
        const keys = spaceKey === undefined ? undefined : Array.isArray(spaceKey) ? spaceKey : [spaceKey];
        const labels = label === undefined ? undefined : Array.isArray(label) ? label : [label];
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: '/api/v2/spaces',
            query: {
                keys,
                type,
                status,
                labels,
                'description-format': expand?.includes('description') ? 'plain' : undefined,
                'include-icon': expand?.includes('icon') ? true : undefined,
                limit,
                cursor,
            },
        });
    },
});

export const confluenceListSpaces = tool({
    description: 'List spaces visible to you with simple pagination. Use to discover space keys and numeric IDs.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        limit: z.number().int().min(1).max(250).optional().describe('Max spaces per page.'),
        cursor: cursorField,
    }),
    execute: async ({ confluenceToken, confluenceCloudId, limit, cursor }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: '/api/v2/spaces',
            query: { limit, cursor },
        });
    },
});

export const confluenceGetSpaceContents = tool({
    description: 'List pages or blog posts inside a space by space key. Combine base URL (_links.base) with item webui links for full URLs.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        spaceKey: z.string().describe('Space key (e.g. DOCS).'),
        type: z.enum(['page', 'blogpost']).optional().describe('Content type (default page). Attachments are not space-scopable — list per page instead.'),
        status: z.string().optional().describe('current, archived, deleted or trashed.'),
        limit: limitField,
        cursor: cursorField,
    }),
    execute: async ({ confluenceToken, confluenceCloudId, spaceKey, type, status, limit, cursor }) => {
        const sid = await resolveSpaceId(confluenceToken, confluenceCloudId, spaceKey);
        if (!sid) return { error: `Could not resolve space key '${spaceKey}'.` };
        const kind = type ?? 'page';
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/spaces/${encodeURIComponent(sid)}/${kind === 'blogpost' ? 'blogposts' : 'pages'}`,
            query: { status: status ? [status] : undefined, limit, cursor },
        });
    },
});

export const confluenceDeleteSpace = tool({
    description: 'Permanently delete a space by key. Async on the server — waits briefly then reports completed, in_progress (with task id) or failed.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        spaceKey: z.string().describe('Space key to delete (e.g. DEV). Double-check — deletion is permanent.'),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, spaceKey }) => {
        const res = await conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/rest/api/space/${encodeURIComponent(spaceKey)}`,
            method: 'DELETE',
        });
        if (res?.error) return res;
        for (let i = 0; i < 5; i++) {
            await sleep(3000);
            const check = await conf(confluenceToken, {
                cloudId: confluenceCloudId,
                path: '/api/v2/spaces',
                query: { keys: [spaceKey], limit: 1 },
            });
            if (check?.error) return { success: false, status: 'failed', message: check.error, details: check.details };
            if (!check?.results || check.results.length === 0) {
                return { success: true, status: 'completed', message: `Space '${spaceKey}' was deleted.` };
            }
        }
        return { success: false, status: 'in_progress', message: `Space '${spaceKey}' deletion is still running; verify later with spaces list.` };
    },
});

export const confluenceGetSpaceLabels = tool({
    description: 'List labels on a space by numeric space ID, with optional prefix/sort filters.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        id: z.string().describe('Numeric space ID (not the key).'),
        prefix: z.enum(['my', 'team', 'global', 'system']).optional().describe('Label prefix filter.'),
        sort: z.string().optional().describe("Sort, e.g. 'name' or '-name'."),
        limit: limitField,
        cursor: cursorField,
    }),
    execute: async ({ confluenceToken, confluenceCloudId, id, prefix, sort, limit, cursor }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/spaces/${encodeURIComponent(id)}/labels`,
            query: { prefix, sort, limit, cursor },
        });
    },
});

export const confluenceGetSpaceContentLabels = tool({
    description: 'List labels applied to content inside a space. Use for space-wide label discovery before per-page filtering.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        id: z.string().describe('Numeric space ID (not the key).'),
        prefix: z.string().optional().describe("Prefix filter, e.g. 'global'."),
        limit: limitField,
        cursor: cursorField,
    }),
    execute: async ({ confluenceToken, confluenceCloudId, id, prefix, limit, cursor }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/spaces/${encodeURIComponent(id)}/content/labels`,
            query: { prefix, limit, cursor },
        });
    },
});

export const confluenceGetSpaceProperties = tool({
    description: 'List custom metadata properties on a space, optionally filtered by key.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        id: z.string().describe('Numeric space ID.'),
        key: z.union([z.string(), z.array(z.string())]).optional().describe('Property key(s) to filter by.'),
        limit: z.number().int().min(1).max(200).optional().describe('Max properties per page.'),
        cursor: cursorField,
    }),
    execute: async ({ confluenceToken, confluenceCloudId, id, key, limit, cursor }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/spaces/${encodeURIComponent(id)}/properties`,
            query: { key, limit, cursor },
        });
    },
});

export const confluenceCreateSpaceProperty = tool({
    description: 'Add a custom metadata property to a space.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        spaceId: z.string().describe('Numeric space ID.'),
        key: z.string().describe('Unique property key.'),
        value: z.string().describe('Value as a JSON string, e.g. \'{"theme": "docs"}\'.'),
        version: z
            .object({
                number: z.number().int().min(1).describe('Version number (>= 1).'),
                message: z.string().optional().describe('Change message.'),
            })
            .optional()
            .describe('Optional version metadata.'),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, spaceId, key, value, version }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/spaces/${encodeURIComponent(spaceId)}/properties`,
            method: 'POST',
            body: { key, value: parseJsonValue(value), version },
        });
    },
});

export const confluenceUpdateSpaceProperty = tool({
    description: 'Update a space property value. Fetches the current version automatically (provide property ID from the properties list).',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        spaceId: z.string().describe('Numeric space ID.'),
        propertyId: z.string().describe('Numeric property ID (not the key).'),
        value: z.string().describe('New value as a JSON string.'),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, spaceId, propertyId, value }) => {
        const current = await conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/spaces/${encodeURIComponent(spaceId)}/properties/${encodeURIComponent(propertyId)}`,
        });
        if (current?.error) return current;
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/spaces/${encodeURIComponent(spaceId)}/properties/${encodeURIComponent(propertyId)}`,
            method: 'PUT',
            body: { value: parseJsonValue(value), version: { number: (current?.version?.number ?? 0) + 1 } },
        });
    },
});

export const confluenceDeleteSpaceProperty = tool({
    description: 'Delete a custom metadata property from a space.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        spaceIdOrKey: z.string().describe('Space numeric ID. Must be numeric, not a key.'),
        propertyId: z.string().describe('Numeric property ID (not the key).'),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, spaceIdOrKey, propertyId }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/spaces/${encodeURIComponent(spaceIdOrKey)}/properties/${encodeURIComponent(propertyId)}`,
            method: 'DELETE',
        });
    },
});
