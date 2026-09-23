// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { notionRequest, toNotionError } from './client.js';

const tokenField = z.string().optional().describe('Token provided by the system; do not provide');

export const notionCreateFileUpload = tool({
    description: 'Initiate a file upload: single_part (direct, default), multi_part (chunked, paid workspaces), or external_url (import from public URL).',
    inputSchema: z.object({
        mode: z.enum(['single_part', 'multi_part', 'external_url']).optional().describe('Upload mode (default single_part)'),
        filename: z.string().optional().describe('File name with extension (max 900 bytes)'),
        contentType: z.string().optional().describe('MIME type, e.g. image/png'),
        externalUrl: z.string().optional().describe('Public HTTPS URL (required for external_url mode)'),
        numberOfParts: z.number().min(1).optional().describe('Total parts (required for multi_part mode)'),
        notionToken: tokenField,
    }),
    execute: async ({ mode, filename, contentType, externalUrl, numberOfParts, notionToken }) => {
        try {
            const body: any = {};
            if (mode) body.mode = mode;
            if (filename) body.filename = filename;
            if (contentType) body.content_type = contentType;
            if (externalUrl) body.external_url = externalUrl;
            if (numberOfParts) body.number_of_parts = numberOfParts;
            return await notionRequest(notionToken, '/file_uploads', { method: 'POST', body });
        } catch (error) {
            return toNotionError(error, 'Notion create file upload failed');
        }
    },
});

export const notionListFileUploads = tool({
    description: 'List file uploads for this integration, most recent first, with pagination.',
    inputSchema: z.object({
        pageSize: z.number().min(1).max(100).optional().describe('Uploads per page (max 100)'),
        startCursor: z.string().optional().describe('next_cursor from a previous response'),
        notionToken: tokenField,
    }),
    execute: async ({ pageSize, startCursor, notionToken }) => {
        try {
            return await notionRequest(notionToken, '/file_uploads', {
                query: { page_size: pageSize, start_cursor: startCursor },
            });
        } catch (error) {
            return toNotionError(error, 'Notion list file uploads failed');
        }
    },
});

export const notionRetrieveFileUpload = tool({
    description: 'Retrieve a file upload object (status, URL, expiry) by its ID.',
    inputSchema: z.object({
        fileUploadId: z.string().describe('UUID of the file upload'),
        notionToken: tokenField,
    }),
    execute: async ({ fileUploadId, notionToken }) => {
        try {
            return await notionRequest(notionToken, `/file_uploads/${fileUploadId}`);
        } catch (error) {
            return toNotionError(error, 'Notion retrieve file upload failed');
        }
    },
});

export const notionSendFileUpload = tool({
    description: 'Send file bytes (base64) to a created file upload via multipart form data. For multi_part include partNumber; completion is attempted automatically.',
    inputSchema: z.object({
        fileUploadId: z.string().describe('UUID from create file upload'),
        fileName: z.string().describe('File name, e.g. document.pdf'),
        mimeType: z.string().describe('MIME type, e.g. application/pdf'),
        fileContentBase64: z.string().describe('Base64-encoded file content'),
        partNumber: z.number().min(1).optional().describe('Part index for multi_part uploads (omit for single_part)'),
        notionToken: tokenField,
    }),
    execute: async ({ fileUploadId, fileName, mimeType, fileContentBase64, partNumber, notionToken }) => {
        try {
            const bytes = Buffer.from(fileContentBase64, 'base64');
            const form = new FormData();
            form.append('file', new Blob([bytes], { type: mimeType }), fileName);
            if (partNumber !== undefined) form.append('part_number', String(partNumber));
            const sent: any = await notionRequest(notionToken, `/file_uploads/${fileUploadId}/send`, {
                method: 'POST',
                formData: form,
            });
            if (sent?.error) return sent;
            if (partNumber !== undefined) {
                const completed: any = await notionRequest(notionToken, `/file_uploads/${fileUploadId}/complete`, {
                    method: 'POST',
                });
                return { sent, completed: completed?.error ? { note: 'Complete after a single part is expected to fail until all parts are sent', ...completed } : completed };
            }
            return sent;
        } catch (error) {
            return toNotionError(error, 'Notion send file upload failed');
        }
    },
});
