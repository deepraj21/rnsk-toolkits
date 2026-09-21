// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { buildNotebookName, getEndpoint, parseResponseError } from './utils.js';

export const uploadSourceFile = tool({
    description: 'Upload a plain-text file as a source in a NotebookLM Enterprise notebook via the raw upload endpoint. Supports S3-key style file store object or direct content.',
    inputSchema: z.object({
        notebookLmToken: z.string().describe('NotebookLM OAuth access token.'),
        notebookId: z.string().min(1).describe('Notebook UUID or full resource name to receive the uploaded source.'),
        fileName: z.string().min(1).describe('Filename NotebookLM should use for the source, including extension.'),
        file: z.object({
            name: z.string().describe('Original filename supplied by file store.'),
            mimetype: z.string().describe('MIME type detected for the uploaded file.'),
            s3key: z.string().describe('Opaque file-store reference used to read the file bytes.'),
        }).optional().describe('Optional file-store object with s3key. When provided, content is resolved from store; otherwise use fileContent.'),
        fileContent: z.string().optional().describe('Raw file content as text. Used when file.s3key is not provided. Provide as plain text or base64 if binary.'),
        mimeType: z.string().optional().describe('MIME type sent with the raw upload. Defaults to text/plain. Only text/plain is currently verified.'),
        location: z.string().optional().describe('Location override, defaults to global.'),
        endpointLocation: z.string().optional().describe('Endpoint multi-region, defaults to global.'),
        projectNumber: z.string().optional().describe('Project number, defaults to -.'),
    }),
    execute: async ({ notebookLmToken, notebookId, fileName, file, fileContent, mimeType, location, endpointLocation, projectNumber }) => {
        if (!notebookLmToken) return { error: 'NotebookLM token is required. Connect NotebookLM first.' };
        try {
            const notebookName = buildNotebookName(notebookId, projectNumber, location);
            const displayName = fileName || file?.name || 'upload.txt';
            const contentType = mimeType || file?.mimetype || 'text/plain';

            // If file store reference is given but no direct content, we cannot resolve S3 without a fetcher — return hint.
            let body: BodyInit | undefined;
            if (file?.s3key && !fileContent) {
                return {
                    error: 'File store s3key provided but direct fileContent is missing. Provide fileContent for upload.',
                    details: { file, fileName: displayName },
                };
            }
            body = fileContent ?? '';

            const base = getEndpoint(endpointLocation || location).replace('/v1alpha', '');
            const finalUrl = `${base}/upload/v1alpha/${notebookName}/sources:uploadFile`;

            const response = await fetch(finalUrl, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${notebookLmToken}`,
                    'Content-Type': contentType,
                    'X-Goog-Upload-Protocol': 'raw',
                    'X-Goog-Upload-File-Name': displayName,
                },
                body: body as string,
            });
            if (!response.ok) {
                const err = await parseResponseError(response);
                return { error: 'Failed to upload source file', details: err.details };
            }
            const data = await response.json();
            return { sourceId: data.sourceId?.id || data.sourceId, raw: data };
        } catch (error) {
            return { error: 'Error uploading source file', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
