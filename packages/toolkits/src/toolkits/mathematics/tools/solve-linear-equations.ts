import { tool } from 'ai';
import { z } from 'zod';

export const solveLinearEquations = tool({
    description: 'Solves systems of linear equations for 2 or 3 variables using Cramer\'s rule.',
    inputSchema: z.discriminatedUnion('type', [
        z.object({
            type: z.literal('2x2'),
            equations: z.array(z.object({
                a: z.number().describe('Coefficient of x'),
                b: z.number().describe('Coefficient of y'),
                c: z.number().describe('Constant term (ax + by = c)'),
            })).length(2),
        }),
        z.object({
            type: z.literal('3x3'),
            equations: z.array(z.object({
                a: z.number().describe('Coefficient of x'),
                b: z.number().describe('Coefficient of y'),
                c: z.number().describe('Coefficient of z'),
                d: z.number().describe('Constant term (ax + by + cz = d)'),
            })).length(3),
        }),
    ]),
    execute: async (input) => {
        if (input.type === '2x2') {
            const [{ a: a1, b: b1, c: c1 }, { a: a2, b: b2, c: c2 }] = input.equations;

            const det = a1 * b2 - a2 * b1;
            if (det === 0) {
                return { error: 'The system has no unique solution (determinant is zero).' };
            }

            const x = (c1 * b2 - c2 * b1) / det;
            const y = (a1 * c2 - a2 * c1) / det;

            return { solutions: { x, y }, determinant: det };
        } else {
            const [{ a: a1, b: b1, c: c1, d: d1 }, { a: a2, b: b2, c: c2, d: d2 }, { a: a3, b: b3, c: c3, d: d3 }] = input.equations;

            const det = a1 * (b2 * c3 - b3 * c2) - b1 * (a2 * c3 - a3 * c2) + c1 * (a2 * b3 - a3 * b2);

            if (det === 0) {
                return { error: 'The system has no unique solution (determinant is zero).' };
            }

            const detX = d1 * (b2 * c3 - b3 * c2) - b1 * (d2 * c3 - d3 * c2) + c1 * (d2 * b3 - d3 * b2);
            const detY = a1 * (d2 * c3 - d3 * c2) - d1 * (a2 * c3 - a3 * c2) + c1 * (a2 * d3 - a3 * d2);
            const detZ = a1 * (b2 * d3 - b3 * d2) - b1 * (a2 * d3 - a3 * d2) + d1 * (a2 * b3 - a3 * b2);

            return {
                solutions: {
                    x: detX / det,
                    y: detY / det,
                    z: detZ / det
                },
                determinant: det
            };
        }
    },
});
