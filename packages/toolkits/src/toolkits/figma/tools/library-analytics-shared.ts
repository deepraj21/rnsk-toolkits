// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

export function libraryAnalyticsTool(
    label: string,
    resource: 'component' | 'style' | 'variable',
    metric: 'actions' | 'usages',
    groupBy: string[],
    withDates: boolean,
) {
    const schema: Record<string, z.ZodTypeAny> = {
        figmaToken: figmaTokenField,
        fileKey: z.string().describe('Published Enterprise library file key'),
        groupBy: z.enum(groupBy as [string, ...string[]]).describe('Grouping dimension; shapes the rows'),
        cursor: z.string().optional().describe('Pagination cursor; omit for first page'),
    };
    if (withDates) {
        schema.startDate = z.string().optional().describe('Range start YYYY-MM-DD (defaults to one year prior)');
        schema.endDate = z.string().optional().describe('Range end YYYY-MM-DD (defaults to latest week)');
    }
    return tool({
        description: `${label} for an Enterprise library. Requires library_analytics:read.`,
        inputSchema: z.object(schema),
        execute: async ({ figmaToken, fileKey, groupBy, cursor, startDate, endDate }: Record<string, string | undefined>) => {
            try {
                if (startDate && endDate && endDate < startDate) {
                    return { error: 'endDate must not be before startDate' };
                }
                const result = await figmaRequest(figmaToken, `/v1/files/${fileKey}/analytics/${resource}/${metric}`, {
                    query: { group_by: groupBy, cursor, start_date: startDate, end_date: endDate },
                });
                if (!result.ok) return { error: `Failed to get ${label}`, details: result.error };
                return result.data;
            } catch (error) {
                return {
                    error: `Error getting ${label}`,
                    message: error instanceof Error ? error.message : 'Unknown error',
                };
            }
        },
    });
}
