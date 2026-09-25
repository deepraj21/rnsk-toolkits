// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { conf, parseJsonValue } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const cloudField = z.string().optional().describe('Optional Confluence Cloud site ID. If omitted, your first accessible site is used automatically.');
const limitField = z.number().int().min(1).max(200).optional().describe('Max items to return.');
const cursorField = z.string().optional().describe('Opaque pagination cursor from a previous response _links.next.');

async function updateProperty(token, cloudId, base, value) {
    const segments = base.split('/');
    const current = await conf(token, { cloudId, path: base });
    if (current?.error) return current;
    return conf(token, {
        cloudId,
        path: base,
        method: 'PUT',
        body: { value: parseJsonValue(value), version: { number: (current?.version?.number ?? 0) + 1 } },
    });
}

export const confluenceGetPageContentProperties = tool({
    description: 'List custom metadata properties on a page. Use property IDs from here for update/delete.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        pageId: z.string().describe('Page ID.'),
        limit: limitField,
        cursor: cursorField,
    }),
    execute: async ({ confluenceToken, confluenceCloudId, pageId, limit, cursor }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/pages/${encodeURIComponent(pageId)}/properties`,
            query: { limit, cursor },
        });
    },
});

export const confluenceCreatePageProperty = tool({
    description: 'Add a custom metadata key-value property to a page.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        pageId: z.string().describe('Page ID.'),
        key: z.string().describe('Unique property key.'),
        value: z.string().describe('Value as a JSON string (any JSON type).'),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, pageId, key, value }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/pages/${encodeURIComponent(pageId)}/properties`,
            method: 'POST',
            body: { key, value: parseJsonValue(value) },
        });
    },
});

export const confluenceUpdatePageContentProperty = tool({
    description: 'Update a page property value. Version auto-increments from the current property.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        pageId: z.string().describe('Page ID.'),
        propertyId: z.string().describe('Numeric property ID (not the key).'),
        value: z.string().describe('New value as a JSON string (replaces the old one).'),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, pageId, propertyId, value }) => {
        return updateProperty(
            confluenceToken,
            confluenceCloudId,
            `/api/v2/pages/${encodeURIComponent(pageId)}/properties/${encodeURIComponent(propertyId)}`,
            value,
        );
    },
});

export const confluenceDeletePageContentProperty = tool({
    description: 'Delete a custom metadata property from a page for cleanup or auditing.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        pageId: z.string().describe('Page ID.'),
        propertyId: z.string().describe('Numeric property ID (not the key).'),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, pageId, propertyId }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/pages/${encodeURIComponent(pageId)}/properties/${encodeURIComponent(propertyId)}`,
            method: 'DELETE',
        });
    },
});

export const confluenceCreateWhiteboardProperty = tool({
    description: 'Attach custom metadata to a whiteboard.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        whiteboardId: z.string().describe('Whiteboard ID.'),
        key: z.string().describe('Property key.'),
        value: z.string().describe('Value as a JSON string.'),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, whiteboardId, key, value }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/whiteboards/${encodeURIComponent(whiteboardId)}/properties`,
            method: 'POST',
            body: { key, value: parseJsonValue(value) },
        });
    },
});

export const confluenceUpdateWhiteboardContentProperty = tool({
    description: 'Update a whiteboard property value. Version auto-increments from the current property.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        whiteboardId: z.string().describe('Whiteboard ID.'),
        propertyId: z.string().describe('Numeric property ID (a key string is rejected).'),
        value: z.string().describe('New value as a JSON string.'),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, whiteboardId, propertyId, value }) => {
        return updateProperty(
            confluenceToken,
            confluenceCloudId,
            `/api/v2/whiteboards/${encodeURIComponent(whiteboardId)}/properties/${encodeURIComponent(propertyId)}`,
            value,
        );
    },
});

export const confluenceDeleteWhiteboardContentProperty = tool({
    description: 'Delete a custom metadata property from a whiteboard.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        whiteboardId: z.string().describe('Whiteboard ID.'),
        propertyId: z.string().describe('Numeric property ID (a key string is rejected).'),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, whiteboardId, propertyId }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/whiteboards/${encodeURIComponent(whiteboardId)}/properties/${encodeURIComponent(propertyId)}`,
            method: 'DELETE',
        });
    },
});
