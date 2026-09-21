// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { DOWNLOADS_BASE, escapePackage, npmRequest } from './client.js';

const periodField = z.string().describe("Period: 'last-day', 'last-week', 'last-month', 'last-year', or 'YYYY-MM-DD:YYYY-MM-DD' (data since 2015-01-10)");
const packageField = z.string().describe("Package name, e.g. 'express' or '@babel/core' ('/' is encoded automatically)");

export const getDownloadCountsPoint = tool({
    description:
        'Gets total download counts for one package over a period (preset or custom range up to 18 months). Query packages individually — bulk format differs.',
    inputSchema: z.object({
        period: periodField,
        package: packageField,
    }),
    execute: async ({ period, package: pkg }) =>
        npmRequest(DOWNLOADS_BASE, `/downloads/point/${period}/${escapePackage(pkg)}`),
});

export const getAllPackagesDownloadPoint = tool({
    description: 'Gets aggregate download counts across the entire registry for a period (preset or custom range up to 365 days).',
    inputSchema: z.object({ period: periodField }),
    execute: async ({ period }) =>
        npmRequest(DOWNLOADS_BASE, `/downloads/point/${period}`),
});

export const getDownloadCountsRangePackage = tool({
    description: 'Gets daily download counts for one package between two YYYY-MM-DD dates (inclusive). Use for historical trends.',
    inputSchema: z.object({
        package: packageField,
        start: z.string().describe("Start date YYYY-MM-DD, e.g. '2023-01-01'"),
        end: z.string().describe("End date YYYY-MM-DD (>= start), e.g. '2023-01-31'"),
    }),
    execute: async ({ package: pkg, start, end }) =>
        npmRequest(DOWNLOADS_BASE, `/downloads/range/${start}:${end}/${escapePackage(pkg)}`),
});

export const getDownloadRangeAll = tool({
    description: 'Gets daily aggregate download counts for all packages over a period. Use for registry-wide statistics.',
    inputSchema: z.object({ period: periodField }),
    execute: async ({ period }) =>
        npmRequest(DOWNLOADS_BASE, `/downloads/range/${period}`),
});

export const getVersionDownloads = tool({
    description: 'Gets per-version download counts for a package over the last 7 days. Use to see which versions are most popular.',
    inputSchema: z.object({ package: packageField }),
    execute: async ({ package: pkg }) =>
        npmRequest(DOWNLOADS_BASE, `/versions/${escapePackage(pkg)}/last-week`),
});
