// @ts-nocheck
import { listSpreadsheets } from './list-spreadsheets';
import { getSpreadsheet } from './get-spreadsheet';
import { getValues } from './get-values';

export { listSpreadsheets, getSpreadsheet, getValues };

export const googleSheetsTools = [
    {
        name: 'googleSheetsListSpreadsheets',
        description: 'List or search for Google Sheets spreadsheets in the user\'s Drive.',
        tool: listSpreadsheets,
        requiredAuth: 'googleSheetsToken' as const,
    },
    {
        name: 'googleSheetsGetSpreadsheet',
        description: 'Get details and metadata of a specific Google Sheets spreadsheet by ID.',
        tool: getSpreadsheet,
        requiredAuth: 'googleSheetsToken' as const,
    },
    {
        name: 'googleSheetsGetValues',
        description: 'Get values from a specific range in a Google Sheets spreadsheet.',
        tool: getValues,
        requiredAuth: 'googleSheetsToken' as const,
    },
];
