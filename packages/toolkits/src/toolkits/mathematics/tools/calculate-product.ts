import { tool } from 'ai';
import { z } from 'zod';

export const calculateProduct = tool({
  description: 'Multiplies two numbers together and returns the product.',
  inputSchema: z.object({
    a: z.number().describe('First number'),
    b: z.number().describe('Second number'),
  }),
  execute: async ({ a, b }) => {
    return { result: a * b, operation: 'product', operands: [a, b] };
  },
});
