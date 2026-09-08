import { tool } from 'ai';
import { z } from 'zod';

export const calculateQuadraticRoots = tool({
    description: 'Calculates the real and complex roots of a quadratic equation (ax^2 + bx + c = 0).',
    inputSchema: z.object({
        a: z.number().describe('Coefficient of x^2'),
        b: z.number().describe('Coefficient of x'),
        c: z.number().describe('Constant term'),
    }),
    execute: async ({ a, b, c }) => {
        if (a === 0) {
            if (b === 0) {
                return { error: 'Not a valid equation (a and b are both zero).' };
            }
            return { type: 'linear', root: -c / b };
        }

        const discriminant = b * b - 4 * a * c;

        if (discriminant > 0) {
            const r1 = (-b + Math.sqrt(discriminant)) / (2 * a);
            const r2 = (-b - Math.sqrt(discriminant)) / (2 * a);
            return { type: 'two-real-roots', roots: [r1, r2], discriminant };
        } else if (discriminant === 0) {
            const root = -b / (2 * a);
            return { type: 'one-real-root', root, discriminant };
        } else {
            const realPart = -b / (2 * a);
            const imaginaryPart = Math.sqrt(-discriminant) / (2 * a);
            return {
                type: 'complex-roots',
                roots: [
                    `${realPart} + ${imaginaryPart}i`,
                    `${realPart} - ${imaginaryPart}i`
                ],
                discriminant
            };
        }
    },
});
