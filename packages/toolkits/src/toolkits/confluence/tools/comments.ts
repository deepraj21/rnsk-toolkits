// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { conf } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const cloudField = z.string().optional().describe('Optional Confluence Cloud site ID. If omitted, your first accessible site is used automatically.');
const limitField = z.number().int().min(1).max(250).optional().describe('Max items to return.');
const cursorField = z.string().optional().describe('Opaque pagination cursor from a previous response _links.next.');
const bodyFormatField = z.enum(['storage', 'atlas_doc_format']).optional().describe('Comment body format.');

const commentBody = z
    .object({
        value: z.string().describe('Comment content in storage format (XHTML), e.g. "<p>Looks good</p>".'),
        representation: z.string().optional().describe("Representation, defaults to 'storage'."),
    })
    .describe('Comment body.');

export const confluenceCreateFooterComment = tool({
    description: 'Add a page-level comment (or a reply) without editing the body. Provide exactly one target: page, blog post, attachment, custom content, or a parent comment for replies.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        body: commentBody,
        pageId: z.string().optional().describe('Page ID to comment on.'),
        blogPostId: z.string().optional().describe('Blog post ID to comment on.'),
        attachmentId: z.string().optional().describe('Attachment ID to comment on.'),
        customContentId: z.string().optional().describe('Custom content ID to comment on.'),
        parentCommentId: z.string().optional().describe('Parent comment ID — set this (alone) to reply.'),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, body, pageId, blogPostId, attachmentId, customContentId, parentCommentId }) => {
        if (!pageId && !blogPostId && !attachmentId && !customContentId && !parentCommentId) {
            return { error: 'Provide one of pageId, blogPostId, attachmentId, customContentId, or parentCommentId.' };
        }
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: '/api/v2/footer-comments',
            method: 'POST',
            body: {
                pageId,
                blogPostId,
                attachmentId,
                customContentId,
                parentCommentId,
                body: { value: body.value, representation: body.representation ?? 'storage' },
            },
        });
    },
});

export const confluenceCreateInlineComment = tool({
    description: 'Comment on highlighted page/blog text, or reply to an inline comment. Top-level comments require the exact text selection details.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        body: commentBody,
        pageId: z.string().optional().describe('Page ID for a top-level inline comment.'),
        blogPostId: z.string().optional().describe('Blog post ID for a top-level inline comment.'),
        parentCommentId: z.string().optional().describe('Parent comment ID — set this (alone) to reply.'),
        inlineCommentProperties: z
            .object({
                textSelection: z.string().describe('Exact text to highlight.'),
                textSelectionMatchCount: z.number().int().min(1).describe('Total matches on the page (must exceed the match index).'),
                textSelectionMatchIndex: z.number().int().min(0).describe('Zero-based index of the match to highlight.'),
            })
            .optional()
            .describe('Required for top-level inline comments (not replies). Use find-text-selections to compute match index/count.'),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, body, pageId, blogPostId, parentCommentId, inlineCommentProperties }) => {
        if (!pageId && !blogPostId && !parentCommentId) {
            return { error: 'Provide one of pageId, blogPostId, or parentCommentId.' };
        }
        if (!parentCommentId && !inlineCommentProperties) {
            return { error: 'Top-level inline comments require inlineCommentProperties with textSelection details.' };
        }
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: '/api/v2/inline-comments',
            method: 'POST',
            body: {
                pageId,
                blogPostId,
                parentCommentId,
                body: { value: body.value, representation: body.representation ?? 'storage' },
                inlineCommentProperties,
            },
        });
    },
});

export const confluenceGetPageFooterComments = tool({
    description: 'List root-level (footer) comments on a page for collecting review feedback.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        id: z.string().describe('Page ID.'),
        sort: z.string().optional().describe("Sort: 'created-date', '-created-date', 'modified-date', '-modified-date'."),
        limit: z.number().int().min(1).max(250).optional().describe('Max comments (default 50).'),
        cursor: cursorField,
        status: z.union([z.string(), z.array(z.string())]).optional().describe("Status filter, e.g. 'current'."),
        bodyFormat: bodyFormatField,
    }),
    execute: async ({ confluenceToken, confluenceCloudId, id, sort, limit, cursor, status, bodyFormat }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/pages/${encodeURIComponent(id)}/footer-comments`,
            query: { sort, limit, cursor, status, 'body-format': bodyFormat },
        });
    },
});

export const confluenceGetPageInlineComments = tool({
    description: 'List inline (text-anchored) comments on a page with resolution-status filtering.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        id: z.string().describe('Page ID.'),
        sort: z.string().optional().describe("Sort: 'created-date', '-created-date', 'modified-date', '-modified-date'."),
        limit: limitField,
        cursor: cursorField,
        status: z.union([z.string(), z.array(z.string())]).optional().describe("Status filter, e.g. 'current'."),
        bodyFormat: bodyFormatField,
        resolutionStatus: z.union([z.string(), z.array(z.string())]).optional().describe("Resolution filter: 'open', 'resolved', etc."),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, id, sort, limit, cursor, status, bodyFormat, resolutionStatus }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/pages/${encodeURIComponent(id)}/inline-comments`,
            query: { sort, limit, cursor, status, 'body-format': bodyFormat, 'resolution-status': resolutionStatus },
        });
    },
});
