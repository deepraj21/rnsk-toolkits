// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { kaggle } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const kaggleGetModelInstance = tool({
    description: "Tool to get details for a specific Kaggle model instance (variation). Returns metadata including overview, usage instructions, download URL, version information, and license details. Use when you need to inspect or retrieve information about a specific model variation before downloading or using it.",
    inputSchema: z.object({
        kaggleCredentials: tokenField,
        framework: z.string().describe("Framework name for this model variation (e.g., TensorFlow2, PyTorch, Jax, TfLite, TfJs, Coral)."),
        modelSlug: z.string().describe("Model name/slug. This is the second part of the model identifier (e.g., 'bert' in 'tensorflow/bert')."),
        ownerSlug: z.string().describe("Model owner username or organization name. This is the first part of the model identifier (e.g., 'tensorflow' in 'tensorflow/bert')."),
        variationSlug: z.string().describe("Variation name/slug. This identifies the specific model instance or version (e.g., 'bert-en-uncased-l-12-h-768-a-12')."),
    }),
    execute: async ({ kaggleCredentials, framework, modelSlug, ownerSlug, variationSlug }) => {
        const queryParams = undefined;
        return kaggle(kaggleCredentials, { path: `/models/${encodeURIComponent(ownerSlug)}/${encodeURIComponent(modelSlug)}/${encodeURIComponent(framework)}/${encodeURIComponent(variationSlug)}`, method: 'GET', query: queryParams });
    },
});
