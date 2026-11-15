// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { canvaRequest, compact } from './client.js';

export const canvaCreateDesignGenerationJob = tool({
  description:
    'Starts an AI job that generates a full Canva design from a written brief and returns the job. designType is "doc" or "presentation"; for presentations you can pass an ordered outline (sections with title/description/points). Poll canvaGetDesignGenerationJob until status is success to get the generated design. Requires the design_generation capability.',
  inputSchema: z.object({
    canvaToken: z.string().optional().describe('Canva access token (injected by system)'),
    brief: z
      .string()
      .min(1)
      .max(5000)
      .describe(
        'What to generate: subject, purpose, required wording, tone, visual direction (max 5000 chars)',
      ),
    designType: z
      .enum(['doc', 'presentation'])
      .describe('Preset Canva design type to generate (doc or presentation)'),
    outline: z
      .array(
        z.object({
          title: z.string().min(1).max(255).describe('Slide title'),
          description: z
            .string()
            .min(1)
            .max(2000)
            .optional()
            .describe('What the slide should cover'),
          points: z
            .array(z.string().max(1000))
            .optional()
            .describe('Individual points the slide should make'),
        }),
      )
      .max(100)
      .optional()
      .describe('Ordered slide outline (presentations only, 1-100 sections)'),
  }),
  execute: async ({ canvaToken, brief, designType, outline }) => {
    if (!brief) return { error: 'brief is required.' };
    if (!designType) return { error: 'designType is required.' };
    if (outline && outline.length && designType !== 'presentation')
      return { error: 'outline is only supported when designType is "presentation".' };

    const result = await canvaRequest(canvaToken, '/generations', {
      method: 'POST',
      body: compact({
        brief,
        design_type: { type: 'preset', name: designType },
        outline: outline && outline.length ? { sections: outline } : undefined,
      }),
    });
    if (result.error) return result;

    return result.data ?? {};
  },
});
