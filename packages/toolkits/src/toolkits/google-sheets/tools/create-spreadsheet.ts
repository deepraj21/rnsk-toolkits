// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

export const createSpreadsheet = tool({
    description: 'Create a new Google Sheets spreadsheet with a specified title and optional sheet tabs.',
    inputSchema: z.object({
        googleSheetsToken: z.string().describe('The Google Sheets access token'),
        title: z.string().describe('The title of the new spreadsheet'),
        sheetTitles: z.array(z.string()).optional().describe('Optional list of initial sheet tab titles to create (e.g., ["Summary", "Data"])'),
    }),
    execute: async ({ googleSheetsToken, title, sheetTitles }) => {
        try {
            const url = 'https://sheets.googleapis.com/v4/spreadsheets';

            const payload: Record<string, any> = {
                properties: {
                    title,
                },
            };

            if (sheetTitles && sheetTitles.length > 0) {
                payload.sheets = sheetTitles.map((sheetTitle) => ({
                    properties: {
                        title: sheetTitle,
                    },
                }));
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${googleSheetsToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to create spreadsheet', details: error };
            }

            const data = await response.json();
            return {
                success: true,
                spreadsheetId: data.spreadsheetId,
                spreadsheetUrl: data.spreadsheetUrl,
                title: data.properties?.title,
                sheets: data.sheets?.map((s: any) => ({
                    sheetId: s.properties?.sheetId,
                    title: s.properties?.title,
                    index: s.properties?.index,
                })),
            };
        } catch (error) {
            return {
                error: 'Error creating spreadsheet',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
