// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

export const clearValues = tool({
    description: 'Clear values from a specific range in a Google Sheets spreadsheet, leaving cell formatting intact.',
    inputSchema: z.object({
        googleSheetsToken: z.string().describe('The Google Sheets access token'),
        spreadsheetId: z.string().describe('The ID of the spreadsheet'),
        range: z.string().describe('The A1 notation of the values to clear (e.g., "Sheet1!A1:B10")'),
    }),
    execute: async ({ googleSheetsToken, spreadsheetId, range }) => {
        try {
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:clear`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${googleSheetsToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to clear values', details: error };
            }

            const data = await response.json();
            return {
                success: true,
                spreadsheetId: data.spreadsheetId,
                clearedRange: data.clearedRange,
            };
        } catch (error) {
            return {
                error: 'Error clearing values',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
