import { tool } from 'ai';
import { z } from 'zod';

export const calculatePercentage = tool({
    description: 'Performs common percentage calculations including percentage change, percentage of a total, and finding a value from a percentage.',
    inputSchema: z.discriminatedUnion('type', [
        z.object({
            type: z.literal('change'),
            original: z.number().describe('Original value'),
            new: z.number().describe('New value'),
        }),
        z.object({
            type: z.literal('of_total'),
            value: z.number().describe('The part value'),
            total: z.number().describe('The total value'),
        }),
        z.object({
            type: z.literal('value_from_percent'),
            percentage: z.number().describe('Percentage (e.g., 20 for 20%)'),
            total: z.number().describe('The total value'),
        }),
    ]),
    execute: async (input) => {
        switch (input.type) {
            case 'change': {
                const { original, new: newValue } = input;
                if (original === 0) return { error: 'Original value cannot be zero for percentage change.' };
                const change = ((newValue - original) / original) * 100;
                return {
                    type: 'percentage-change',
                    original,
                    new: newValue,
                    percentageChange: change,
                    result: `${change.toFixed(2)}%`
                };
            }
            case 'of_total': {
                const { value, total } = input;
                if (total === 0) return { error: 'Total value cannot be zero.' };
                const percentage = (value / total) * 100;
                return {
                    type: 'percentage-of-total',
                    value,
                    total,
                    percentage,
                    result: `${percentage.toFixed(2)}%`
                };
            }
            case 'value_from_percent': {
                const { percentage, total } = input;
                const value = (percentage / 100) * total;
                return {
                    type: 'value-from-percentage',
                    percentage,
                    total,
                    value,
                    result: value
                };
            }
        }
    },
});
