import { tool } from 'ai';
import { z } from 'zod';

export const calculateMatrixDeterminant = tool({
    description: 'Calculates the determinant of a 2x2 or 3x3 matrix.',
    inputSchema: z.discriminatedUnion('size', [
        z.object({
            size: z.literal(2),
            matrix: z.array(z.array(z.number())).length(2).describe('A 2x2 matrix as an array of arrays'),
        }),
        z.object({
            size: z.literal(3),
            matrix: z.array(z.array(z.number())).length(3).describe('A 3x3 matrix as an array of arrays'),
        }),
    ]),
    execute: async (input) => {
        const { matrix } = input;

        if (input.size === 2) {
            if (matrix[0].length !== 2 || matrix[1].length !== 2) {
                return { error: 'Invalid matrix dimensions for a 2x2 matrix.' };
            }
            return { determinant: matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0] };
        } else {
            if (matrix.some(row => row.length !== 3)) {
                return { error: 'Invalid matrix dimensions for a 3x3 matrix.' };
            }

            const a = matrix[0][0], b = matrix[0][1], c = matrix[0][2];
            const d = matrix[1][0], e = matrix[1][1], f = matrix[1][2];
            const g = matrix[2][0], h = matrix[2][1], i = matrix[2][2];

            const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
            return { determinant: det };
        }
    },
});
