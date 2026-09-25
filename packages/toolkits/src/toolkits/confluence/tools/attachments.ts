// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { conf, confBinary } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const cloudField = z.string().optional().describe('Optional Confluence Cloud site ID. If omitted, your first accessible site is used automatically.');
const limitField = z.number().int().min(1).max(200).optional().describe('Max items to return.');
const cursorField = z.string().optional().describe('Opaque pagination cursor from a previous response _links.next.');

const MAX_DOWNLOAD_BYTES = 4_000_000;

export const confluenceGetAttachments = tool({
    description: 'List attachments on a page with filenames, MIME types and versions. Paginate to avoid missing files.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        pageId: z.string().describe('Page ID.'),
        limit: limitField,
        cursor: cursorField,
        mediaType: z.string().optional().describe("MIME filter, e.g. 'image/png', 'application/pdf'."),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, pageId, limit, cursor, mediaType }) => {
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/pages/${encodeURIComponent(pageId)}/attachments`,
            query: { limit, cursor, mediaType },
        });
    },
});

export const confluenceDownloadAttachment = tool({
    description: 'Download a page attachment as base64 (max ~4MB). Use to share files with users lacking Confluence access.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        pageId: z.string().describe('Page ID containing the attachment.'),
        attachmentId: z.string().describe("Attachment ID (e.g. 'att65825' — prefix is stripped automatically)."),
    }),
    execute: async ({ confluenceToken, confluenceCloudId, pageId, attachmentId }) => {
        const numericId = String(attachmentId).replace(/^att/i, '');
        const meta = await conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/attachments/${encodeURIComponent(numericId)}`,
        });
        if (meta?.error) return meta;
        const fileSize = meta?.fileSize ?? meta?.extensions?.fileSize;
        if (typeof fileSize === 'number' && fileSize > MAX_DOWNLOAD_BYTES) {
            return {
                error: `Attachment is ${(fileSize / 1_000_000).toFixed(1)}MB, over the ~4MB inline download cap.`,
                id: meta?.id ?? numericId,
                title: meta?.title,
                mediaType: meta?.mediaType ?? meta?.extensions?.mediaType,
                fileSize,
                downloadLink: meta?.downloadLink ?? meta?._links?.download,
            };
        }
        const bin = await confBinary(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/rest/api/content/${encodeURIComponent(pageId)}/child/attachment/${encodeURIComponent(numericId)}/download`,
        });
        if (bin?.error) return bin;
        const bytes = bin.data;
        if (bytes.length > MAX_DOWNLOAD_BYTES) {
            return {
                error: 'Downloaded file exceeds the ~4MB inline cap.',
                id: meta?.id ?? numericId,
                title: meta?.title,
                mediaType: bin.contentType ?? meta?.mediaType,
                fileSize: bytes.length,
            };
        }
        return {
            id: meta?.id ?? numericId,
            title: meta?.title,
            mediaType: bin.contentType ?? meta?.mediaType ?? meta?.extensions?.mediaType,
            fileSize: bytes.length,
            contentBase64: bytes.toString('base64'),
        };
    },
});

export const confluenceGetAttachmentLabels = tool({
    description: 'List labels on an attachment for metadata review.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
        id: z.string().describe('Attachment ID.'),
        prefix: z.enum(['my', 'team', 'global', 'system']).optional().describe('Label prefix filter.'),
        sort: z.string().optional().describe("Sort, e.g. 'name' or '-name'."),
        limit: limitField,
        cursor: cursorField,
    }),
    execute: async ({ confluenceToken, confluenceCloudId, id, prefix, sort, limit, cursor }) => {
        const numericId = String(id).replace(/^att/i, '');
        return conf(confluenceToken, {
            cloudId: confluenceCloudId,
            path: `/api/v2/attachments/${encodeURIComponent(numericId)}/labels`,
            query: { prefix, sort, limit, cursor },
        });
    },
});
