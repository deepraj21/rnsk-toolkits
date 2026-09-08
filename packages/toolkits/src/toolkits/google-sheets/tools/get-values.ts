// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

export const getValues = tool({
    description: 'Get values from a specific range in a Google Sheets spreadsheet.',
    inputSchema: z.object({
        googleSheetsToken: z.string().describe('The Google Sheets access token'),
        spreadsheetId: z.string().describe('The ID of the spreadsheet'),
        range: z.string().describe('The A1 notation of the values to retrieve (e.g., "Sheet1!A1:B10")'),
    }),
    execute: async ({ googleSheetsToken, spreadsheetId, range }) => {
        try {
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${googleSheetsToken}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to get values', details: error };
            }

            const data = await response.json();
            return data;
        } catch (error) {
            return {
                error: 'Error getting values',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
