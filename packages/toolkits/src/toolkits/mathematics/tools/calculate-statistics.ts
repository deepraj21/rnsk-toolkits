import { tool } from 'ai';
import { z } from 'zod';

export const calculateStatistics = tool({
    description: 'Calculates descriptive statistics for a provided list of numbers, including mean, median, mode, variance, and standard deviation.',
    inputSchema: z.object({
        numbers: z.array(z.number()).min(1).describe('The list of numbers to analyze'),
    }),
    execute: async ({ numbers }) => {
        const count = numbers.length;
        const sorted = [...numbers].sort((a, b) => a - b);

        // Mean
        const sum = numbers.reduce((a, b) => a + b, 0);
        const mean = sum / count;

        // Median
        const mid = Math.floor(count / 2);
        const median = count % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

        // Mode
        const counts: Record<number, number> = {};
        let maxCount = 0;
        let modes: number[] = [];
        for (const num of numbers) {
            counts[num] = (counts[num] || 0) + 1;
            if (counts[num] > maxCount) {
                maxCount = counts[num];
                modes = [num];
            } else if (counts[num] === maxCount) {
                modes.push(num);
            }
        }
        const mode = modes.length === count ? 'No unique mode' : modes.join(', ');

        // Variance & Standard Deviation
        const squareDiffs = numbers.map(value => Math.pow(value - mean, 2));
        const variance = squareDiffs.reduce((a, b) => a + b, 0) / count;
        const stdDev = Math.sqrt(variance);

        const min = Math.min(...numbers);
        const max = Math.max(...numbers);

        return {
            count,
            sum,
            mean,
            median,
            mode,
            variance,
            standardDeviation: stdDev,
            min,
            max,
            range: max - min
        };
    },
});
