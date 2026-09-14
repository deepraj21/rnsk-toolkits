// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

const GOOGLE_EXPORT_MIME: Record<string, string> = {
    'application/vnd.google-apps.document': 'text/plain',
    'application/vnd.google-apps.spreadsheet': 'text/csv',
    'application/vnd.google-apps.presentation': 'text/plain',
};

export const downloadFile = tool({
    description: 'Download file content from Google Drive. Google-native files are exported to a readable format.',
    inputSchema: z.object({
        googleDriveToken: z.string().describe('The Google Drive access token'),
        fileId: z.string().describe('The ID of the file to download'),
        exportMimeType: z.string().optional().describe('Export MIME type for Google-native files (auto-detected if omitted)'),
    }),
    execute: async ({ googleDriveToken, fileId, exportMimeType }) => {
        try {
            const metaUrl = new URL(`https://www.googleapis.com/drive/v3/files/${fileId}`);
            metaUrl.searchParams.set('fields', 'id,name,mimeType');

            const metaResponse = await fetch(metaUrl.toString(), {
                headers: { Authorization: `Bearer ${googleDriveToken}` },
            });

            if (!metaResponse.ok) {
                const error = await metaResponse.json();
                return { error: 'Failed to get file metadata', details: error };
            }

            const meta = await metaResponse.json();
            const mimeType = meta.mimeType as string;
            const isGoogleNative = mimeType?.startsWith('application/vnd.google-apps.');

            let downloadUrl: string;
            if (isGoogleNative) {
                const exportType = exportMimeType ?? GOOGLE_EXPORT_MIME[mimeType] ?? 'text/plain';
                downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${encodeURIComponent(exportType)}`;
            } else {
                downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
            }

            const response = await fetch(downloadUrl, {
                headers: { Authorization: `Bearer ${googleDriveToken}` },
            });

            if (!response.ok) {
                const error = await response.text();
                return { error: 'Failed to download file', details: error };
            }

            const content = await response.text();
            return {
                id: meta.id,
                name: meta.name,
                mimeType: isGoogleNative ? (exportMimeType ?? GOOGLE_EXPORT_MIME[mimeType] ?? 'text/plain') : mimeType,
                content,
            };
        } catch (error) {
            return {
                error: 'Error downloading file',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
