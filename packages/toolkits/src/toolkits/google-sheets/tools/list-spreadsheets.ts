// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

export const listSpreadsheets = tool({
    description: 'List or search for Google Sheets spreadsheets in the user\'s Drive.',
    inputSchema: z.object({
        googleSheetsToken: z.string().describe('The Google Sheets access token'),
        q: z.string().optional().describe('Search query for spreadsheets'),
        pageSize: z.number().optional().default(10).describe('Maximum number of spreadsheets to return'),
    }),
    execute: async ({ googleSheetsToken, q, pageSize }) => {
        try {
            const url = new URL('https://www.googleapis.com/drive/v3/files');
            let query = "mimeType='application/vnd.google-apps.spreadsheet'";
            if (q) {
                query += ` and name contains '${q}'`;
            }
            url.searchParams.append('q', query);
            url.searchParams.append('pageSize', pageSize.toString());
            url.searchParams.append('fields', 'files(id, name, modifiedTime)');

            const response = await fetch(url.toString(), {
                headers: {
                    Authorization: `Bearer ${googleSheetsToken}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to list spreadsheets', details: error };
            }

            const data = await response.json();
            return {
                spreadsheets: data.files || [],
            };
        } catch (error) {
            return {
                error: 'Error listing spreadsheets',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
