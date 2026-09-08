import { tool } from 'ai';
import { z } from 'zod';

export const getRandomNumber = tool({
  description: 'Generates a random number within a specified range.',
  inputSchema: z.object({
    min: z.number().describe('Minimum value (inclusive)'),
    max: z.number().describe('Maximum value (inclusive)'),
  }),
  execute: async ({ min, max }) => {
    const random = Math.floor(Math.random() * (max - min + 1)) + min;
    return { random, range: { min, max } };
  },
});
