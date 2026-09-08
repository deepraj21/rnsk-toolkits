import { tool } from 'ai';
import { z } from 'zod';

const factorial = (n: number): number => {
    if (n < 0) return 0;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
};

export const calculateCombinatorics = tool({
    description: 'Calculates permutations (nPr) and combinations (nCr).',
    inputSchema: z.object({
        n: z.number().int().nonnegative().describe('Total number of items'),
        r: z.number().int().nonnegative().describe('Number of items to choose'),
        type: z.enum(['permutation', 'combination']).describe('Type of calculation (nPr or nCr)'),
    }),
    execute: async ({ n, r, type }) => {
        if (r > n) {
            return { error: 'r cannot be greater than n.' };
        }

        if (type === 'permutation') {
            const result = factorial(n) / factorial(n - r);
            return { operation: `${n}P${r}`, result };
        } else {
            const result = factorial(n) / (factorial(r) * factorial(n - r));
            return { operation: `${n}C${r}`, result };
        }
    },
});
