// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { REGISTRY_BASE, REPLICATE_BASE, escapePackage, missingKey, npmApiKeyField, npmRequest } from './client.js';

export const getPackageMetadata = tool({
    description:
        "Fetches package metadata (dist-tags, description, license, maintainers). Without version returns abbreviated metadata for all versions; with version returns that version's manifest. Use 'dist-tags.latest' as the stable version.",
    inputSchema: z.object({
        package: z.string().describe("Package name with scope, e.g. 'react', '@babel/core'"),
        version: z.string().optional().describe("Version or dist-tag, e.g. 'latest', '1.2.3', 'next' (omit for all versions)"),
    }),
    execute: async ({ package: pkg, version }) => {
        const path = version ? `/${escapePackage(pkg)}/${encodeURIComponent(version)}` : `/${escapePackage(pkg)}`;
        return npmRequest(REGISTRY_BASE, path);
    },
});

export const searchPackages = tool({
    description:
        "Searches packages by name/keywords/description. Results in 'objects' array with metadata under 'package' and weekly downloads under 'downloads.weekly'. Combine keywords for precision.",
    inputSchema: z.object({
        text: z.string().describe("Query, e.g. 'react', 'testing framework'"),
        size: z.number().int().min(1).max(250).optional().describe('Results to return (1-250, default 20)'),
        offset: z.number().int().min(0).optional().describe('Pagination offset (default 0)'),
        quality: z.number().min(0).max(1).optional().describe('Quality weight 0-1 (default 1)'),
        popularity: z.number().min(0).max(1).optional().describe('Popularity weight 0-1 (default 1)'),
        maintenance: z.number().min(0).max(1).optional().describe('Maintenance weight 0-1 (default 1)'),
    }),
    execute: async ({ text, size, offset, quality, popularity, maintenance }) =>
        npmRequest(REGISTRY_BASE, '/-/v1/search', { query: { text, size, from: offset, quality, popularity, maintenance } }),
});

export const getRegistryRoot = tool({
    description:
        'Fetches registry database statistics (total package count doc_count, update_seq) from the replication service. No inputs needed.',
    inputSchema: z.object({
        npmApiKey: npmApiKeyField.describe('Optional Bearer token (only needed for private registry mirrors)'),
    }),
    execute: async ({ npmApiKey }) => npmRequest(REPLICATE_BASE, '/', { apiKey: npmApiKey }),
});

export const getRegistryChanges = tool({
    description:
        'Streams the CouchDB-style registry change feed for replication. Pass back last_seq as since to continue polling.',
    inputSchema: z.object({
        since: z.number().int().min(0).optional().describe('Sequence number to start from (use last_seq to continue)'),
        limit: z.number().int().min(1).max(10000).optional().describe('Max changes (default 1000, max 10000)'),
    }),
    execute: async ({ since, limit }) =>
        npmRequest(REPLICATE_BASE, '/registry/_changes', { query: { since, limit } }),
});

export const getRegistryMeta = tool({
    description: "Calls a registry meta endpoint: 'ping' checks connectivity (public, returns {}), 'whoami' returns the token's username (needs API key).",
    inputSchema: z.object({
        npmApiKey: npmApiKeyField,
        endpoint: z.enum(['ping', 'whoami']).describe("'ping' for connectivity, 'whoami' for authenticated username"),
    }),
    execute: async ({ npmApiKey, endpoint }) => {
        if (endpoint === 'whoami' && !npmApiKey) return missingKey();
        const data = await npmRequest(REGISTRY_BASE, `/-/${endpoint}`, { apiKey: npmApiKey });
        if (endpoint === 'ping') return { ping: JSON.stringify(data) };
        return data;
    },
});
