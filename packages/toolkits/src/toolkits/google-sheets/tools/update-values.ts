// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

export const updateValues = tool({
    description: 'Update or overwrite values in a specific range of a Google Sheets spreadsheet.',
    inputSchema: z.object({
        googleSheetsToken: z.string().describe('The Google Sheets access token'),
        spreadsheetId: z.string().describe('The ID of the spreadsheet'),
        range: z.string().describe('The A1 notation of the range to update (e.g., "Sheet1!A1:B2")'),
        values: z.array(z.array(z.union([z.string(), z.number(), z.boolean(), z.null()]))).describe('A 2D array of values to write (e.g., [["Name", "Score"], ["Alice", 95]])'),
        valueInputOption: z.enum(['RAW', 'USER_ENTERED']).optional().default('USER_ENTERED').describe('How the input data should be interpreted. USER_ENTERED parses values like user typing into UI.'),
    }),
    execute: async ({ googleSheetsToken, spreadsheetId, range, values, valueInputOption = 'USER_ENTERED' }) => {
        try {
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=${valueInputOption}`;

            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${googleSheetsToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    range,
                    majorDimension: 'ROWS',
                    values,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to update values', details: error };
            }

            const data = await response.json();
            return {
                success: true,
                spreadsheetId: data.spreadsheetId,
                updatedRange: data.updatedRange,
                updatedRows: data.updatedRows,
                updatedColumns: data.updatedColumns,
                updatedCells: data.updatedCells,
            };
        } catch (error) {
            return {
                error: 'Error updating values',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
