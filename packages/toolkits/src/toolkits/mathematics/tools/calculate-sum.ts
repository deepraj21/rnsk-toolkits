import { tool } from 'ai';
import { z } from 'zod';

export const calculateSum = tool({
  description: 'Adds two numbers together and returns the sum.',
  inputSchema: z.object({
    a: z.number().describe('First number'),
    b: z.number().describe('Second number'),
  }),
  execute: async ({ a, b }) => {
    return { result: a + b, operation: 'sum', operands: [a, b] };
  },
});
