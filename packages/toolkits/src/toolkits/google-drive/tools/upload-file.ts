// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

export const uploadFile = tool({
    description: 'Upload a file to Google Drive using multipart upload.',
    inputSchema: z.object({
        googleDriveToken: z.string().describe('The Google Drive access token'),
        name: z.string().describe('File name'),
        mimeType: z.string().describe('MIME type of the file (e.g. text/plain, application/pdf)'),
        content: z.string().describe('Base64-encoded file content'),
        parentId: z.string().optional().describe('Parent folder ID (defaults to root)'),
    }),
    execute: async ({ googleDriveToken, name, mimeType, content, parentId }) => {
        try {
            const metadata: Record<string, unknown> = { name };
            if (parentId) {
                metadata.parents = [parentId];
            }

            const boundary = '-------rnsk_drive_upload';
            const metadataPart = JSON.stringify(metadata);
            const contentBuffer = Buffer.from(content, 'base64');

            const body = [
                `--${boundary}`,
                'Content-Type: application/json; charset=UTF-8',
                '',
                metadataPart,
                `--${boundary}`,
                `Content-Type: ${mimeType}`,
                '',
            ].join('\r\n');

            const bodyBuffer = Buffer.concat([
                Buffer.from(body, 'utf-8'),
                contentBuffer,
                Buffer.from(`\r\n--${boundary}--`, 'utf-8'),
            ]);

            const response = await fetch(
                'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink',
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${googleDriveToken}`,
                        'Content-Type': `multipart/related; boundary=${boundary}`,
                    },
                    body: bodyBuffer,
                },
            );

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to upload file', details: error };
            }

            return await response.json();
        } catch (error) {
            return {
                error: 'Error uploading file',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
