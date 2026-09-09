// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

export const appendValues = tool({
    description: 'Append rows of values to a Google Sheets spreadsheet range (e.g., adding new rows at the bottom of a table).',
    inputSchema: z.object({
        googleSheetsToken: z.string().describe('The Google Sheets access token'),
        spreadsheetId: z.string().describe('The ID of the spreadsheet'),
        range: z.string().describe('The A1 notation of a range where values should be appended (e.g., "Sheet1!A:E")'),
        values: z.array(z.array(z.union([z.string(), z.number(), z.boolean(), z.null()]))).describe('A 2D array of row data to append (e.g., [["Alice", 30, true], ["Bob", 25, false]])'),
        valueInputOption: z.enum(['RAW', 'USER_ENTERED']).optional().default('USER_ENTERED').describe('How the input data should be interpreted. USER_ENTERED parses values like user typing into UI.'),
    }),
    execute: async ({ googleSheetsToken, spreadsheetId, range, values, valueInputOption = 'USER_ENTERED' }) => {
        try {
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=${valueInputOption}`;

            const response = await fetch(url, {
                method: 'POST',
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
                return { error: 'Failed to append values', details: error };
            }

            const data = await response.json();
            return {
                success: true,
                spreadsheetId: data.spreadsheetId,
                tableRange: data.tableRange,
                updatedRange: data.updates?.updatedRange,
                updatedRows: data.updates?.updatedRows,
                updatedColumns: data.updates?.updatedColumns,
                updatedCells: data.updates?.updatedCells,
            };
        } catch (error) {
            return {
                error: 'Error appending values',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
