// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { blocksToMarkdown, markdownToBlocks, normalizeId, notionRequest, richText, toNotionError } from './client.js';

const tokenField = z.string().optional().describe('Token provided by the system; do not provide');

export const notionArchivePage = tool({
    description: 'Archive (trash) or restore a Notion page. Set archive false to unarchive.',
    inputSchema: z.object({
        pageId: z.string().describe('UUID of the page'),
        archive: z.boolean().optional().describe('True to archive, false to restore (default true)'),
        notionToken: tokenField,
    }),
    execute: async ({ pageId, archive = true, notionToken }) => {
        try {
            return await notionRequest(notionToken, `/pages/${normalizeId(pageId)}`, {
                method: 'PATCH',
                body: { archived: archive },
            });
        } catch (error) {
            return toNotionError(error, 'Notion archive page failed');
        }
    },
});

export const notionFetchRow = tool({
    description: 'Retrieve a database row (page) with its properties and metadata by page ID.',
    inputSchema: z.object({
        pageId: z.string().describe('UUID of the row (page)'),
        notionToken: tokenField,
    }),
    execute: async ({ pageId, notionToken }) => {
        try {
            return await notionRequest(notionToken, `/pages/${normalizeId(pageId)}`);
        } catch (error) {
            return toNotionError(error, 'Notion fetch row failed');
        }
    },
});

export const notionMovePage = tool({
    description: 'Move a page to a new parent page or into a database (via its data_source_id). Uses the official move endpoint.',
    inputSchema: z.object({
        pageId: z.string().describe('UUID of the page to move'),
        parent: z.any().describe("New parent: {type:'page_id', page_id} or {type:'data_source_id', data_source_id}"),
        notionToken: tokenField,
    }),
    execute: async ({ pageId, parent, notionToken }) => {
        try {
            return await notionRequest(notionToken, `/pages/${normalizeId(pageId)}/move`, {
                method: 'POST',
                body: { parent },
            });
        } catch (error) {
            return toNotionError(error, 'Notion move page failed');
        }
    },
});

async function listAllChildren(notionToken: string, id: string): Promise<any[]> {
    const all: any[] = [];
    let cursor: string | undefined;
    do {
        const res: any = await notionRequest(notionToken, `/blocks/${id}/children`, {
            query: { page_size: 100, start_cursor: cursor },
        });
        if (res?.error) throw new Error(JSON.stringify(res.details ?? res));
        all.push(...(res.results ?? []));
        cursor = res.has_more ? res.next_cursor : undefined;
    } while (cursor);
    return all;
}

function stripIds(blocks: any[]): any[] {
    return blocks.map((b) => {
        const { id, created_time, last_edited_time, created_by, last_edited_by, has_children, parent, ...rest } = b;
        if (b.has_children && Array.isArray((b as any).children)) {
            const t = rest[b.type];
            if (t && typeof t === 'object') t.children = stripIds((b as any).children);
            else rest.children = stripIds((b as any).children);
        }
        return rest;
    });
}

async function copyChildrenRecursive(notionToken: string, sourceId: string, destId: string, title?: string) {
    const kids = await listAllChildren(notionToken, sourceId);
    for (const k of kids) {
        if (k.has_children) {
            const nested = await listAllChildren(notionToken, k.id);
            (k as any).children = nested;
            for (const n of nested) {
                if (n.has_children) (n as any).children = await listAllChildren(notionToken, n.id);
            }
        }
    }
    const clean = stripIds(kids);
    for (let i = 0; i < clean.length; i += 100) {
        const res: any = await notionRequest(notionToken, `/blocks/${destId}/children`, {
            method: 'PATCH',
            body: { children: clean.slice(i, i + 100) },
        });
        if (res?.error) throw new Error(JSON.stringify(res.details ?? res));
    }
    return kids.length;
}

export const notionDuplicatePage = tool({
    description: 'Duplicate a page with its properties and content under a parent page (or as a row in a database). Copies nested blocks.',
    inputSchema: z.object({
        pageId: z.string().describe('UUID of the source page'),
        parentId: z.string().describe('UUID of the destination parent page or database'),
        title: z.string().optional().describe('Title for the copy (default: "Copy of <original>")'),
        notionToken: tokenField,
    }),
    execute: async ({ pageId, parentId, title, notionToken }) => {
        try {
            const source: any = await notionRequest(notionToken, `/pages/${normalizeId(pageId)}`);
            if (source?.error) return source;
            const isDbParent = parentId.replace(/-/g, '').length === 32 && (await notionRequest(notionToken, `/databases/${normalizeId(parentId)}`));
            const parentIsDb = !(isDbParent as any)?.error;
            let newTitle = title;
            if (!newTitle) {
                const tprop = Object.values(source.properties ?? {}).find((p: any) => p?.type === 'title') as any;
                const orig = (tprop?.title ?? []).map((t: any) => t.plain_text).join('') || 'Untitled';
                newTitle = `Copy of ${orig}`;
            }
            let created: any;
            if (parentIsDb) {
                const db: any = isDbParent;
                const titleKey = Object.keys(db.properties ?? {}).find((k) => db.properties[k]?.type === 'title') ?? 'Name';
                created = await notionRequest(notionToken, '/pages', {
                    method: 'POST',
                    body: {
                        parent: { database_id: normalizeId(parentId) },
                        properties: { [titleKey]: { title: richText(newTitle) } },
                    },
                });
            } else {
                created = await notionRequest(notionToken, '/pages', {
                    method: 'POST',
                    body: {
                        parent: { page_id: normalizeId(parentId) },
                        properties: { title: [{ text: { content: newTitle } }] },
                    },
                });
            }
            if (created?.error) return created;
            const copied = await copyChildrenRecursive(notionToken, normalizeId(pageId), created.id);
            return { ...created, copied_blocks: copied };
        } catch (error) {
            return toNotionError(error, 'Notion duplicate page failed');
        }
    },
});

export const notionGetPageMarkdown = tool({
    description: 'Render a full page (title + all nested blocks) as Notion-flavored markdown. Fetches the block tree via the API and converts locally.',
    inputSchema: z.object({
        pageId: z.string().describe('UUID of the page'),
        includeTranscript: z.boolean().optional().describe('Reserved; transcripts are included when present in blocks'),
        notionToken: tokenField,
    }),
    execute: async ({ pageId, notionToken }) => {
        try {
            const id = normalizeId(pageId);
            const page: any = await notionRequest(notionToken, `/pages/${id}`);
            if (page?.error) return page;
            async function expand(blockId: string, depth: number): Promise<any[]> {
                const kids = await listAllChildren(notionToken, blockId);
                if (depth > 8) return kids;
                for (const k of kids) {
                    if (k.type === 'table') {
                        const rows = await listAllChildren(notionToken, k.id);
                        (k as any).table_rows = rows;
                    } else if (k.has_children) {
                        (k as any).children = await expand(k.id, depth + 1);
                    }
                }
                return kids;
            }
            const blocks = await expand(id, 0);
            const titleProp: any = Object.values(page.properties ?? {}).find((p: any) => p?.type === 'title');
            const title = (titleProp?.title ?? []).map((t: any) => t.plain_text).join('');
            const markdown = `# ${title || 'Untitled'}\n\n${blocksToMarkdown(blocks)}`;
            return { page_id: page.id, url: page.url, markdown };
        } catch (error) {
            return toNotionError(error, 'Notion get page markdown failed');
        }
    },
});

export const notionGetPageProperty = tool({
    description: 'Retrieve a single property value from a page by property ID or name, with pagination support.',
    inputSchema: z.object({
        pageId: z.string().describe('UUID of the page'),
        propertyId: z.string().describe('Property ID or name (title properties use ID "title")'),
        pageSize: z.number().min(1).max(100).optional().describe('Items per page for paginated properties'),
        startCursor: z.string().optional().describe('next_cursor from a previous response'),
        notionToken: tokenField,
    }),
    execute: async ({ pageId, propertyId, pageSize, startCursor, notionToken }) => {
        try {
            return await notionRequest(notionToken, `/pages/${normalizeId(pageId)}/properties/${encodeURIComponent(propertyId)}`, {
                query: { page_size: pageSize, start_cursor: startCursor },
            });
        } catch (error) {
            return toNotionError(error, 'Notion get page property failed');
        }
    },
});

export const notionCreateNotionPage = tool({
    description: 'Create a page under a parent page or database with a title, optional emoji icon/cover, and markdown content converted to blocks.',
    inputSchema: z.object({
        parentId: z.string().describe('UUID of the parent page or database'),
        title: z.string().describe('Page title'),
        markdown: z.string().optional().describe('Page content as markdown (headings, lists, todos, quotes, code fences)'),
        icon: z.string().optional().describe('Single emoji for the page icon'),
        cover: z.string().optional().describe('Public image URL for the page cover'),
        notionToken: tokenField,
    }),
    execute: async ({ parentId, title, markdown, icon, cover, notionToken }) => {
        try {
            const pid = normalizeId(parentId);
            const asDb: any = await notionRequest(notionToken, `/databases/${pid}`);
            const body: any = markdown ? { children: markdownToBlocks(markdown) } : {};
            if (icon) body.icon = { type: 'emoji', emoji: icon };
            if (cover) body.cover = { type: 'external', external: { url: cover } };
            if (!(asDb as any)?.error) {
                const db = asDb;
                const titleKey = Object.keys(db.properties ?? {}).find((k) => db.properties[k]?.type === 'title') ?? 'title';
                body.parent = { database_id: pid };
                body.properties = { [titleKey]: { title: richText(title) } };
            } else {
                body.parent = { page_id: pid };
                body.properties = { title: [{ text: { content: title } }] };
            }
            return await notionRequest(notionToken, '/pages', { method: 'POST', body });
        } catch (error) {
            return toNotionError(error, 'Notion create page failed');
        }
    },
});

export const notionInsertRowFromNL = tool({
    description: 'Create a database row from a natural-language description. Fetches the schema, maps "Key: value" pairs (or comma-separated values) to properties, and uses the remainder as the title.',
    inputSchema: z.object({
        databaseId: z.string().describe('UUID of the database'),
        nlQuery: z.string().describe('Natural language row description, e.g. "Review PR, priority High, due 2026-10-01"'),
        icon: z.string().optional().describe('Emoji icon for the row'),
        cover: z.string().optional().describe('Public cover image URL'),
        notionToken: tokenField,
    }),
    execute: async ({ databaseId, nlQuery, icon, cover, notionToken }) => {
        try {
            const db: any = await notionRequest(notionToken, `/databases/${normalizeId(databaseId)}`);
            if (db?.error) return db;
            const schema: Record<string, any> = db.properties ?? {};
            const titleKey = Object.keys(schema).find((k) => schema[k]?.type === 'title') ?? 'Name';
            const lower: Record<string, string> = {};
            for (const k of Object.keys(schema)) lower[k.toLowerCase()] = k;
            const properties: Record<string, any> = {};
            let remainder = nlQuery;
            const segments = nlQuery.split(/[,;]\s*/);
            const leftovers: string[] = [];
            for (const seg of segments) {
                const m = seg.match(/^([^:]+):\s*(.+)$/);
                if (m && lower[m[1].trim().toLowerCase()]) {
                    const key = lower[m[1].trim().toLowerCase()];
                    const t = schema[key].type;
                    const raw = m[2].trim();
                    if (t === 'title' || t === 'rich_text') properties[key] = { [t]: richText(raw) };
                    else if (t === 'number') properties[key] = { number: Number(raw) };
                    else if (t === 'select' || t === 'status') properties[key] = { [t]: { name: raw } };
                    else if (t === 'multi_select') properties[key] = { multi_select: raw.split(/\s+/).map((name) => ({ name })) };
                    else if (t === 'date') properties[key] = { date: { start: raw } };
                    else if (t === 'checkbox') properties[key] = { checkbox: /^(yes|true|done|1)$/i.test(raw) };
                    else if (t === 'url') properties[key] = { url: raw };
                    else if (t === 'email') properties[key] = { email: raw };
                    else if (t === 'phone_number') properties[key] = { phone_number: raw };
                    else leftovers.push(seg);
                    remainder = remainder.replace(seg, '');
                } else {
                    leftovers.push(seg);
                }
            }
            if (!properties[titleKey]) {
                const fallback = leftovers.length > 0 ? leftovers[0].replace(/^([^:]+):\s*/, '').trim() : nlQuery;
                properties[titleKey] = { title: richText(fallback || nlQuery) };
            }
            const body: any = { parent: { database_id: normalizeId(databaseId) }, properties };
            if (icon) body.icon = { type: 'emoji', emoji: icon };
            if (cover) body.cover = { type: 'external', external: { url: cover } };
            const created: any = await notionRequest(notionToken, '/pages', { method: 'POST', body });
            if (created?.error) return created;
            return { ...created, parsed_from_nl: Object.keys(properties) };
        } catch (error) {
            return toNotionError(error, 'Notion insert row from NL failed');
        }
    },
});
