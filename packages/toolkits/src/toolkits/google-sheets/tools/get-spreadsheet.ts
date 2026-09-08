// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

export const getSpreadsheet = tool({
    description: 'Get details and metadata of a specific Google Sheets spreadsheet by ID.',
    inputSchema: z.object({
        googleSheetsToken: z.string().describe('The Google Sheets access token'),
        spreadsheetId: z.string().describe('The ID of the spreadsheet to retrieve'),
    }),
    execute: async ({ googleSheetsToken, spreadsheetId }) => {
        try {
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${googleSheetsToken}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to get spreadsheet', details: error };
            }

            const data = await response.json();
            return data;
        } catch (error) {
            return {
                error: 'Error getting spreadsheet',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
