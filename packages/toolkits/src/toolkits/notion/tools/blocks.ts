// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { extractIdFromUrl, normalizeId, notionRequest, richText, toNotionError } from './client.js';

const tokenField = z.string().optional().describe('Token provided by the system; do not provide');
const afterField = z.string().optional().describe('UUID of an existing child block to insert after (default: append at end)');

async function appendChildren(notionToken: string, blockId: string, children: any[], after?: string) {
    const body: any = { children };
    if (after) body.after = after;
    return notionRequest(notionToken, `/blocks/${normalizeId(blockId)}/children`, { method: 'PATCH', body });
}

export const notionDeleteBlock = tool({
    description: 'Delete (archive) a Notion block, page, or database by ID. Archived items can be restored later.',
    inputSchema: z.object({
        blockId: z.string().describe('UUID of the block, page, or database to delete'),
        notionToken: tokenField,
    }),
    execute: async ({ blockId, notionToken }) => {
        try {
            return await notionRequest(notionToken, `/blocks/${normalizeId(blockId)}`, { method: 'DELETE' });
        } catch (error) {
            return toNotionError(error, 'Notion delete block failed');
        }
    },
});

export const notionUpdateBlock = tool({
    description: 'Update the text content of an existing Notion block. Auto-detects the block type unless blockType is given. Max 2000 chars.',
    inputSchema: z.object({
        blockId: z.string().describe('UUID of the block to update'),
        content: z.string().describe('New text content (replaces existing, max 2000 chars)'),
        blockType: z.string().optional().describe('Block type (paragraph, heading_1/2/3, to_do, code, quote, etc.). Auto-detected when omitted.'),
        language: z.string().optional().describe('Programming language when updating a code block'),
        notionToken: tokenField,
    }),
    execute: async ({ blockId, content, blockType, language, notionToken }) => {
        try {
            let type = blockType;
            if (!type) {
                const meta: any = await notionRequest(notionToken, `/blocks/${normalizeId(blockId)}`);
                if (meta?.error) return meta;
                type = meta.type;
            }
            const patch: any = {};
            if (type === 'code') {
                patch.code = { rich_text: richText(content) };
                if (language) patch.code.language = language;
            } else if (type === 'equation') {
                patch.equation = { expression: content };
            } else if (type === 'bookmark' || type === 'embed' || type === 'link_preview') {
                patch[type] = { url: content };
            } else {
                patch[type] = { rich_text: richText(content) };
            }
            return await notionRequest(notionToken, `/blocks/${normalizeId(blockId)}`, {
                method: 'PATCH',
                body: patch,
            });
        } catch (error) {
            return toNotionError(error, 'Notion update block failed');
        }
    },
});

export const notionFetchBlockContents = tool({
    description: 'List direct child blocks of a Notion page or block with pagination. Use child IDs for deeper traversal.',
    inputSchema: z.object({
        blockId: z.string().describe('UUID of the parent page or block'),
        pageSize: z.number().min(1).max(100).optional().describe('Children per page (max 100)'),
        startCursor: z.string().optional().describe('next_cursor from a previous response'),
        notionToken: tokenField,
    }),
    execute: async ({ blockId, pageSize, startCursor, notionToken }) => {
        try {
            return await notionRequest(notionToken, `/blocks/${normalizeId(blockId)}/children`, {
                query: { page_size: pageSize, start_cursor: startCursor },
            });
        } catch (error) {
            return toNotionError(error, 'Notion fetch block contents failed');
        }
    },
});

export const notionFetchBlockMetadata = tool({
    description: 'Retrieve metadata (type, properties, timestamps) for a single Notion block or page. No child content.',
    inputSchema: z.object({
        blockId: z.string().describe('UUID of the block or page'),
        notionToken: tokenField,
    }),
    execute: async ({ blockId, notionToken }) => {
        try {
            return await notionRequest(notionToken, `/blocks/${normalizeId(blockId)}`);
        } catch (error) {
            return toNotionError(error, 'Notion fetch block metadata failed');
        }
    },
});

export const notionFetchAllBlockContents = tool({
    description: 'Fetch all child blocks of a page/block, following pagination. Set recursive to also expand nested children (bounded by maxDepth/maxBlocks). Accepts a block ID or page URL.',
    inputSchema: z.object({
        blockId: z.string().optional().describe('UUID of the parent page or block (either blockId or pageUrl required)'),
        pageUrl: z.string().optional().describe('Notion page URL to extract the ID from'),
        pageSize: z.number().min(1).max(100).optional().describe('Children per request (max 100, default 100)'),
        recursive: z.boolean().optional().describe('Fetch nested children of blocks with has_children'),
        maxDepth: z.number().min(1).max(50).optional().describe('Max recursion depth (default 10)'),
        maxBlocks: z.number().min(1).max(10000).optional().describe('Max total blocks when recursive (default 5000)'),
        notionToken: tokenField,
    }),
    execute: async ({ blockId, pageUrl, pageSize, recursive, maxDepth, maxBlocks, notionToken }) => {
        try {
            const root = blockId ? normalizeId(blockId) : extractIdFromUrl(pageUrl);
            const size = pageSize ?? 100;
            const depthLimit = maxDepth ?? 10;
            const blockLimit = maxBlocks ?? 5000;
            async function listAll(id: string): Promise<any[]> {
                const all: any[] = [];
                let cursor: string | undefined;
                do {
                    const res: any = await notionRequest(notionToken, `/blocks/${id}/children`, {
                        query: { page_size: size, start_cursor: cursor },
                    });
                    if (res?.error) throw new Error(JSON.stringify(res.details ?? res));
                    all.push(...(res.results ?? []));
                    cursor = res.has_more ? res.next_cursor : undefined;
                } while (cursor);
                return all;
            }
            async function expand(blocks: any[], depth: number): Promise<any[]> {
                if (!recursive || depth >= depthLimit) return blocks;
                const out: any[] = [];
                for (const b of blocks) {
                    out.push(b);
                    if (b.has_children && out.length < blockLimit) {
                        const kids = await listAll(b.id);
                        b.children = await expand(kids, depth + 1);
                    }
                    if (out.length >= blockLimit) break;
                }
                return out;
            }
            const top = await listAll(root);
            const results = await expand(top, 0);
            return { object: 'list', results, truncated: results.length >= blockLimit };
        } catch (error) {
            return toNotionError(error, 'Notion fetch all block contents failed');
        }
    },
});

function simplifiedToBlocks(items: any[]): any[] {
    return items.map((item) => {
        const b = item?.content_block ?? item;
        if (b?.type) return b;
        const prop = b?.block_property ?? 'paragraph';
        if (prop === 'divider') return { type: 'divider', divider: {} };
        if (prop === 'image' || prop === 'video' || prop === 'file') {
            return { type: prop, [prop]: { type: 'external', external: { url: b.link } } };
        }
        const annotations: any = {};
        if (b.bold) annotations.bold = true;
        if (b.italic) annotations.italic = true;
        if (b.code) annotations.code = true;
        if (b.strikethrough) annotations.strikethrough = true;
        if (b.underline) annotations.underline = true;
        if (b.color && b.color !== 'default') annotations.color = b.color;
        const rt: any = { type: 'text', text: { content: b.content ?? '' }, annotations };
        if (b.link) rt.text.link = { url: b.link };
        const key = prop === 'toggle' ? 'toggleable_heading' : prop;
        if (prop === 'toggle') return { type: 'heading_1', heading_1: { rich_text: [rt], is_toggleable: true } };
        return { type: prop, [key]: { rich_text: [rt] } };
    });
}

export const notionAddMultiplePageContent = tool({
    description: 'Bulk-add content blocks to a page/block (max 100 per call). Accepts simplified {content, block_property} items or full Notion block objects. Supports after for positioning.',
    inputSchema: z.object({
        parentBlockId: z.string().describe('UUID of the parent page or block'),
        contentBlocks: z.array(z.any()).min(1).max(100).describe("Blocks: simplified {content, block_property} or full Notion {type, ...} objects"),
        after: afterField,
        notionToken: tokenField,
    }),
    execute: async ({ parentBlockId, contentBlocks, after, notionToken }) => {
        try {
            const first = contentBlocks[0];
            const children = first && typeof first === 'object' && 'parent_block_id' in first && !('content_block' in first)
                ? simplifiedToBlocks(contentBlocks.slice(1))
                : simplifiedToBlocks(contentBlocks);
            return await appendChildren(notionToken, parentBlockId, children, after);
        } catch (error) {
            return toNotionError(error, 'Notion add multiple page content failed');
        }
    },
});

export const notionAppendTextBlocks = tool({
    description: 'Append text blocks (paragraph, heading_1/2/3, bulleted_list_item, numbered_list_item) to a page or block.',
    inputSchema: z.object({
        blockId: z.string().describe('UUID of the parent page or block'),
        children: z.array(z.any()).describe('Full Notion text block objects'),
        after: afterField,
        notionToken: tokenField,
    }),
    execute: async ({ blockId, children, after, notionToken }) => {
        try {
            return await appendChildren(notionToken, blockId, children, after);
        } catch (error) {
            return toNotionError(error, 'Notion append text blocks failed');
        }
    },
});

export const notionAppendCodeBlocks = tool({
    description: 'Append code, quote, or equation blocks (snippets, citations, LaTeX formulas) to a page or block.',
    inputSchema: z.object({
        blockId: z.string().describe('UUID of the parent page or block'),
        children: z.array(z.any()).describe('Full Notion code/quote/equation block objects'),
        after: afterField,
        notionToken: tokenField,
    }),
    execute: async ({ blockId, children, after, notionToken }) => {
        try {
            return await appendChildren(notionToken, blockId, children, after);
        } catch (error) {
            return toNotionError(error, 'Notion append code blocks failed');
        }
    },
});

export const notionAppendTaskBlocks = tool({
    description: 'Append task blocks (to_do with checked state, toggleable headings, callout with icon) to a page or block.',
    inputSchema: z.object({
        blockId: z.string().describe('UUID of the parent page or block'),
        children: z.array(z.any()).describe('Full Notion to_do/toggle/callout block objects'),
        after: afterField,
        notionToken: tokenField,
    }),
    execute: async ({ blockId, children, after, notionToken }) => {
        try {
            return await appendChildren(notionToken, blockId, children, after);
        } catch (error) {
            return toNotionError(error, 'Notion append task blocks failed');
        }
    },
});

export const notionAppendMediaBlocks = tool({
    description: 'Append media blocks (image, video, audio, file, pdf, embed, bookmark) with external URLs to a page or block.',
    inputSchema: z.object({
        blockId: z.string().describe('UUID of the parent page or block'),
        children: z.array(z.any()).describe('Full Notion media block objects with external URLs'),
        after: afterField,
        notionToken: tokenField,
    }),
    execute: async ({ blockId, children, after, notionToken }) => {
        try {
            return await appendChildren(notionToken, blockId, children, after);
        } catch (error) {
            return toNotionError(error, 'Notion append media blocks failed');
        }
    },
});

export const notionAppendLayoutBlocks = tool({
    description: 'Append layout blocks (divider, table_of_contents, breadcrumb, column_list with columns) to a page or block.',
    inputSchema: z.object({
        blockId: z.string().describe('UUID of the parent page or block'),
        children: z.array(z.any()).describe('Full Notion layout block objects'),
        after: afterField,
        notionToken: tokenField,
    }),
    execute: async ({ blockId, children, after, notionToken }) => {
        try {
            return await appendChildren(notionToken, blockId, children, after);
        } catch (error) {
            return toNotionError(error, 'Notion append layout blocks failed');
        }
    },
});

export const notionAppendTableBlocks = tool({
    description: 'Append tables to a page: pass table_width, has_column_header, and rows of rich-text cells. Creates the table block plus its table_row children.',
    inputSchema: z.object({
        blockId: z.string().describe('UUID of the parent page or block'),
        tables: z.array(z.any()).describe('Table specs: {table_width, has_column_header?, rows: [{cells: [[rich_text...], ...]}]}'),
        after: afterField,
        notionToken: tokenField,
    }),
    execute: async ({ blockId, tables, after, notionToken }) => {
        try {
            const children = tables.map((t: any) => ({
                type: 'table',
                table: {
                    table_width: t.table_width,
                    has_column_header: t.has_column_header ?? false,
                    has_row_header: t.has_row_header ?? false,
                    children: (t.rows ?? []).map((r: any) => ({
                        type: 'table_row',
                        table_row: { cells: r.cells ?? r },
                    })),
                },
            }));
            return await appendChildren(notionToken, blockId, children, after);
        } catch (error) {
            return toNotionError(error, 'Notion append table blocks failed');
        }
    },
});

export const notionReplacePageContent = tool({
    description: 'Rebuild a page: list current children, optionally back them up to a new page, delete existing children, then append new blocks in batches. Supports dryRun preview.',
    inputSchema: z.object({
        pageId: z.string().describe('UUID of the page to rebuild'),
        newChildren: z.array(z.any()).describe('Full Notion block objects to append after clearing'),
        createBackup: z.boolean().optional().describe('Back up current children to a new child page first'),
        backupParent: z.string().optional().describe('Parent page UUID for the backup page (default: the page itself)'),
        backupTitleSuffix: z.string().optional().describe('Suffix for the backup page title'),
        archiveExistingChildren: z.boolean().optional().describe('Archive (default true) rather than fail on existing children'),
        dryRun: z.boolean().optional().describe('Preview what would be deleted/appended without changing anything'),
        notionToken: tokenField,
    }),
    execute: async ({ pageId, newChildren, createBackup, backupParent, backupTitleSuffix, archiveExistingChildren = true, dryRun, notionToken }) => {
        try {
            const id = normalizeId(pageId);
            const listed: any = await notionRequest(notionToken, `/blocks/${id}/children`, { query: { page_size: 100 } });
            if (listed?.error) return listed;
            const existing = listed.results ?? [];
            if (dryRun) {
                return { dry_run: true, would_delete: existing.map((b: any) => ({ id: b.id, type: b.type })), would_append: newChildren.length };
            }
            let backup: any = null;
            if (createBackup && existing.length > 0) {
                const created: any = await notionRequest(notionToken, '/pages', {
                    method: 'POST',
                    body: {
                        parent: { page_id: backupParent ? normalizeId(backupParent) : id },
                        properties: { title: [{ text: { content: `Backup${backupTitleSuffix ? ` ${backupTitleSuffix}` : ''}` } }] },
                    },
                });
                if (created?.error) return created;
                const chunks: any[][] = [];
                for (let i = 0; i < existing.length; i += 100) chunks.push(existing.slice(i, i + 100));
                for (const c of chunks) {
                    await notionRequest(notionToken, `/blocks/${created.id}/children`, { method: 'PATCH', body: { children: c.map((b: any) => ({ ...b, id: undefined })) } });
                }
                backup = { id: created.id, url: created.url };
            }
            if (archiveExistingChildren) {
                for (const b of existing) {
                    await notionRequest(notionToken, `/blocks/${b.id}`, { method: 'DELETE' });
                }
            }
            let appended: any = { results: [] };
            for (let i = 0; i < newChildren.length; i += 100) {
                appended = await notionRequest(notionToken, `/blocks/${id}/children`, {
                    method: 'PATCH',
                    body: { children: newChildren.slice(i, i + 100) },
                });
                if (appended?.error) return appended;
            }
            return { backup, deleted: existing.length, appended };
        } catch (error) {
            return toNotionError(error, 'Notion replace page content failed');
        }
    },
});
