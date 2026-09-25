// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { conf, parseJsonValue, resolveSpaceId } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const cloudField = z.string().optional().describe('Optional Confluence Cloud site ID. If omitted, your first accessible site is used automatically.');
const limitField = z.number().int().min(1).max(250).optional().describe('Max items to return.');
const cursorField = z.string().optional().describe('Opaque pagination cursor from a previous response _links.next.');

export const confluenceCreateBlogpost = tool({
    description: 'Publish a blog post (or draft) in a space. Returns the post ID plus base/webui links for the URL.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        title: z.string().describe('Blog post headline.'),
        spaceId: z.string().describe('Space numeric ID or key (keys are resolved automatically).'),
        status: z.enum(['current', 'draft']).describe("'current' publishes immediately, 'draft' saves privately."),
        body: z
            .object({
                value: z.string().describe('Post content in storage format (XHTML).'),
                representation: z.string().optional().describe("Representation, defaults to 'storage'."),
            })
            .describe('Post body.'),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, title, spaceId, status, body }) => {
        const sid = await resolveSpaceId(confluenceToken, confluenceCloudId, spaceId);
        if (!sid) return { error: `Could not resolve space '${spaceId}' to a numeric space ID.` };
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: '/api/v2/blogposts',
            method: 'POST',
            body: {
                title,
                spaceId: sid,
                status,
                body: { storage: { value: body.value, representation: body.representation ?? 'storage' } },
            },
        });
    },
});

export const confluenceGetBlogpostById = tool({
    description: 'Get a blog post by ID with metadata and storage-format body.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        id: z.string().describe('Blog post ID.'),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, id }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/blogposts/${encodeURIComponent(id)}`,
            query: { 'body-format': 'storage' },
        });
    },
});

export const confluenceGetBlogPosts = tool({
    description: 'List blog posts with pagination. Use for browsing recent posts across the site.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        limit: limitField,
        cursor: cursorField,
    }),
    execute: async ({ confluenceToken, confluenceCloudId, limit, cursor }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: '/api/v2/blogposts',
            query: { limit, cursor },
        });
    },
});

export const confluenceUpdateBlogpost = tool({
    description: 'Update a blog post title and/or body. Provide version number = current + 1 (fetch the post first).',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        id: z.string().describe('Blog post ID.'),
        title: z.string().describe('New title (keep the existing one for body-only edits).'),
        spaceId: z.string().describe('Space numeric ID or key containing the post.'),
        body: z
            .object({
                storage: z.object({ value: z.string().describe('Full updated content in storage format (XHTML).') }).describe('Storage body.'),
            })
            .describe('New post body.'),
        status: z.enum(['current', 'draft']).optional().describe('Post status after update.'),
        version: z
            .object({
                number: z.number().int().min(1).describe('New version number (current + 1).'),
                message: z.string().optional().describe('Version comment.'),
                minorEdit: z.boolean().optional().describe('Mark as minor edit.'),
            })
            .describe('Version info.'),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, id, title, spaceId, body, status, version }) => {
        const sid = await resolveSpaceId(confluenceToken, confluenceCloudId, spaceId);
        if (!sid) return { error: `Could not resolve space '${spaceId}' to a numeric space ID.` };
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/blogposts/${encodeURIComponent(id)}`,
            method: 'PUT',
            body: { title, spaceId: sid, body, status, version },
        });
    },
});

export const confluenceDeleteBlogpost = tool({
    description: 'Move a blog post to trash (or purge permanently). In migration workflows, confirm targets exist first.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        id: z.string().describe('Blog post ID.'),
        purge: z.boolean().optional().describe('Permanently delete instead of trashing. Irreversible.'),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, id, purge }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/blogposts/${encodeURIComponent(id)}`,
            method: 'DELETE',
            query: { purge },
        });
    },
});

export const confluenceGetBlogpostLabels = tool({
    description: 'List labels on a blog post. Paginate with cursor when more than 25 exist.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        id: z.string().describe('Blog post ID.'),
        limit: limitField,
        cursor: cursorField,
    }),
    execute: async ({ confluenceToken, confluenceCloudId, id, limit, cursor }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/blogposts/${encodeURIComponent(id)}/labels`,
            query: { limit, cursor },
        });
    },
});

export const confluenceGetBlogpostLikeCount = tool({
    description: 'Get the total like count of a blog post.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        id: z.string().describe('Blog post ID.'),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, id }) => {
        const data = await conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/blogposts/${encodeURIComponent(id)}/likes/count`,
        });
        if (data?.error) return data;
        const count = typeof data?.count === 'number' ? data.count : (data?.size ?? data?.results?.length);
        return { count, ...((data && typeof data === 'object' && !Array.isArray(data)) ? data : {}) };
    },
});

export const confluenceGetBlogpostOperations = tool({
    description: 'List permitted operations (edit, delete, …) on a blog post for the current user. Use to check allowed actions.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        id: z.string().describe('Blog post ID.'),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, id }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/blogposts/${encodeURIComponent(id)}/operations`,
        });
    },
});

export const confluenceGetBlogpostVersions = tool({
    description: 'List version history of a blog post.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        blogpostId: z.string().describe('Blog post ID.'),
        limit: limitField,
        cursor: cursorField,
    }),
    execute: async ({ confluenceToken, confluenceCloudId, blogpostId, limit, cursor }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/blogposts/${encodeURIComponent(blogpostId)}/versions`,
            query: { limit, cursor },
        });
    },
});

export const confluenceGetBlogpostVersionDetails = tool({
    description: 'Get metadata of a specific blog post version (author, timestamps, collaborators).',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        blogpostId: z.string().describe('Blog post ID.'),
        versionNumber: z.number().int().min(1).describe('Version number (starts at 1).'),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, blogpostId, versionNumber }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/blogposts/${encodeURIComponent(blogpostId)}/versions/${encodeURIComponent(String(versionNumber))}`,
        });
    },
});

export const confluenceGetBlogPostContentProperties = tool({
    description: 'List custom metadata properties on a blog post. Use property IDs from here for update/delete calls.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        blogpostId: z.string().describe('Blog post ID.'),
        limit: limitField,
        cursor: cursorField,
    }),
    execute: async ({ confluenceToken, confluenceCloudId, blogpostId, limit, cursor }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/blogposts/${encodeURIComponent(blogpostId)}/properties`,
            query: { limit, cursor },
        });
    },
});

export const confluenceCreateBlogpostProperty = tool({
    description: 'Add a custom metadata key-value property to a blog post.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        id: z.string().describe('Blog post ID.'),
        key: z.string().describe('Unique property key.'),
        value: z.string().describe('Property value as a JSON string, e.g. \'{"status": "published"}\'.'),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, id, key, value }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/blogposts/${encodeURIComponent(id)}/properties`,
            method: 'POST',
            body: { key, value: parseJsonValue(value) },
        });
    },
});

export const confluenceUpdateBlogpostProperty = tool({
    description: 'Update a blog post property value. Resolves the current version automatically.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        id: z.string().describe('Blog post ID.'),
        propertyId: z.string().describe('Numeric property ID (not the key — list properties to resolve).'),
        value: z.string().describe('New value as a JSON string.'),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, id, propertyId, value }) => {
        const current = await conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/blogposts/${encodeURIComponent(id)}/properties/${encodeURIComponent(propertyId)}`,
        });
        if (current?.error) return current;
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/blogposts/${encodeURIComponent(id)}/properties/${encodeURIComponent(propertyId)}`,
            method: 'PUT',
            body: { value: parseJsonValue(value), version: { number: (current?.version?.number ?? 0) + 1 } },
        });
    },
});

export const confluenceDeleteBlogpostProperty = tool({
    description: 'Delete a custom metadata property from a blog post.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        id: z.string().describe('Blog post ID.'),
        propertyId: z.string().describe('Numeric property ID (not the key).'),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, id, propertyId }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/blogposts/${encodeURIComponent(id)}/properties/${encodeURIComponent(propertyId)}`,
            method: 'DELETE',
        });
    },
});

export const confluenceGetBlogPostInlineComments = tool({
    description: 'List inline comments on a blog post with sort, status and resolution filters.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        id: z.string().describe('Blog post ID.'),
        sort: z.string().optional().describe("Sort order: 'created-date', '-created-date', 'modified-date', '-modified-date'."),
        limit: limitField,
        cursor: cursorField,
        bodyFormat: z.enum(['storage', 'atlas_doc_format']).optional().describe('Comment body format.'),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, id, sort, limit, cursor, bodyFormat }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/blogposts/${encodeURIComponent(id)}/inline-comments`,
            query: { sort, limit, cursor, 'body-format': bodyFormat },
        });
    },
});

export const confluenceGetBlogPostsForLabel = tool({
    description: 'List blog posts carrying a given label ID.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        id: z.string().describe('Label ID.'),
        limit: limitField,
        cursor: cursorField,
    }),
    execute: async ({ confluenceToken, confluenceCloudId, id, limit, cursor }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/labels/${encodeURIComponent(id)}/blogposts`,
            query: { limit, cursor },
        });
    },
});
