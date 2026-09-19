// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { neon } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const neonRetrieveAllRegions = tool({
    description: "Retrieves a list of available geographic regions supported by the Neon B2B SaaS integration platform. This endpoint provides crucial information about the different areas where the API is accessible and optimized for service delivery. It should be used when developers need to understand the platform's global coverage, select appropriate endpoints for data localization, or implement region-specific configurations. The endpoint returns details about each region, which may include region identifiers, names, and potentially associated endpoints or data centers. This information is essential for ensuring compliance with data residency regulations and optimizing performance by choosing the most suitable region for specific integration needs.",
    inputSchema: z.object({
        neonApiKey: tokenField,
    }),
    execute: async ({ neonApiKey }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/regions`, method: 'GET', query: queryParams });
    },
});
