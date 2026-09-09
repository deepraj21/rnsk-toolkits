// @ts-nocheck
import { listSpreadsheets } from './list-spreadsheets.js';
import { getSpreadsheet } from './get-spreadsheet.js';
import { getValues } from './get-values.js';
import { appendValues } from './append-values.js';
import { updateValues } from './update-values.js';
import { clearValues } from './clear-values.js';
import { createSpreadsheet } from './create-spreadsheet.js';

export {
    listSpreadsheets,
    getSpreadsheet,
    getValues,
    appendValues,
    updateValues,
    clearValues,
    createSpreadsheet,
};

export const googleSheetsTools = [
    {
        name: 'googleSheetsListSpreadsheets',
        description: 'List or search for Google Sheets spreadsheets in the user\'s Drive.',
        tool: listSpreadsheets,
        requiredAuth: 'googleSheetsToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'googleSheetsGetSpreadsheet',
        description: 'Get details and metadata of a specific Google Sheets spreadsheet by ID.',
        tool: getSpreadsheet,
        requiredAuth: 'googleSheetsToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'googleSheetsGetValues',
        description: 'Get values from a specific range in a Google Sheets spreadsheet.',
        tool: getValues,
        requiredAuth: 'googleSheetsToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'googleSheetsAppendValues',
        description: 'Append rows of values to a Google Sheets spreadsheet range (e.g., adding new rows at the bottom of a table).',
        tool: appendValues,
        requiredAuth: 'googleSheetsToken' as const,
        scope: 'write' as const,
    },
    {
        name: 'googleSheetsUpdateValues',
        description: 'Update or overwrite values in a specific range of a Google Sheets spreadsheet.',
        tool: updateValues,
        requiredAuth: 'googleSheetsToken' as const,
        scope: 'write' as const,
    },
    {
        name: 'googleSheetsClearValues',
        description: 'Clear values from a specific range in a Google Sheets spreadsheet, leaving cell formatting intact.',
        tool: clearValues,
        requiredAuth: 'googleSheetsToken' as const,
        scope: 'delete' as const,
    },
    {
        name: 'googleSheetsCreateSpreadsheet',
        description: 'Create a new Google Sheets spreadsheet with a specified title and optional sheet tabs.',
        tool: createSpreadsheet,
        requiredAuth: 'googleSheetsToken' as const,
        scope: 'write' as const,
    },
];
