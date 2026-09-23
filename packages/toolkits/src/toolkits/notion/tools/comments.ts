// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { normalizeId, notionRequest, richText, toNotionError } from './client.js';

const tokenField = z.string().optional().describe('Token provided by the system; do not provide');

function commentRichText(comment: any): any[] {
    if (typeof comment === 'string') return richText(comment);
    if (Array.isArray(comment)) return comment;
    const annotations: any = {};
    for (const k of ['bold', 'italic', 'code', 'strikethrough', 'underline']) {
        if (comment[k]) annotations[k] = true;
    }
    if (comment.color && comment.color !== 'default') annotations.color = comment.color;
    const rt: any = {
        type: 'text',
        text: { content: comment.content ?? comment.text ?? '' },
        annotations,
    };
    if (comment.link) rt.text.link = { url: comment.link };
    return [rt];
}

export const notionCreateComment = tool({
    description: 'Add a comment to a page or to an existing discussion thread (discussionId). One of parentPageId or discussionId is required.',
    inputSchema: z.object({
        comment: z.any().describe('Comment text or {content, bold, italic, code, link, color, ...} object'),
        parentPageId: z.string().optional().describe('UUID of the page to comment on'),
        discussionId: z.string().optional().describe('UUID of an existing discussion thread to reply in'),
        notionToken: tokenField,
    }),
    execute: async ({ comment, parentPageId, discussionId, notionToken }) => {
        try {
            const body: any = { rich_text: commentRichText(comment) };
            if (discussionId) body.discussion_id = discussionId;
            else if (parentPageId) body.parent = { page_id: normalizeId(parentPageId) };
            else return { error: 'Provide parentPageId or discussionId' };
            return await notionRequest(notionToken, '/comments', { method: 'POST', body });
        } catch (error) {
            return toNotionError(error, 'Notion create comment failed');
        }
    },
});

export const notionFetchComments = tool({
    description: 'List unresolved comments on a page or block (pages are blocks; pass either ID).',
    inputSchema: z.object({
        pageId: z.string().optional().describe('UUID of the page'),
        blockId: z.string().optional().describe('UUID of the block'),
        pageSize: z.number().min(1).max(100).optional().describe('Comments per page (max 100)'),
        startCursor: z.string().optional().describe('next_cursor from a previous response'),
        notionToken: tokenField,
    }),
    execute: async ({ pageId, blockId, pageSize, startCursor, notionToken }) => {
        try {
            const id = pageId ?? blockId;
            if (!id) return { error: 'Provide pageId or blockId' };
            return await notionRequest(notionToken, '/comments', {
                query: { block_id: normalizeId(id), page_size: pageSize, start_cursor: startCursor },
            });
        } catch (error) {
            return toNotionError(error, 'Notion fetch comments failed');
        }
    },
});

export const notionRetrieveComment = tool({
    description: 'Retrieve a single comment by its comment ID.',
    inputSchema: z.object({
        commentId: z.string().describe('UUID of the comment'),
        notionToken: tokenField,
    }),
    execute: async ({ commentId, notionToken }) => {
        try {
            return await notionRequest(notionToken, `/comments/${commentId}`);
        } catch (error) {
            return toNotionError(error, 'Notion retrieve comment failed');
        }
    },
});
