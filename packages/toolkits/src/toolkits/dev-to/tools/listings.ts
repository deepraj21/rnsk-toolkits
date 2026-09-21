// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { devToRequest, toDevToError, requireApiKey } from './client.js';

const apiKeyField = z.string().optional().describe('Injected by system; do not provide');

const listingCategory = z
  .enum(['cfp', 'education', 'jobs', 'mentors', 'products', 'mentees', 'forsale', 'events', 'collabs', 'misc'])
  .describe('Listing category');

export const devToGetListing = tool({
  description: 'Get a single classified listing by ID, including title, body, category, and poster info.',
  inputSchema: z.object({
    devToApiKey: apiKeyField,
    id: z.number().int().describe('The ID of the listing'),
  }),
  execute: async ({ devToApiKey, id }) => {
    try {
      return await devToRequest(devToApiKey, 'GET', `/listings/${id}`);
    } catch (error) {
      return toDevToError(error, 'Failed to get listing');
    }
  },
});

export const devToListListings = tool({
  description: 'List classified listings (jobs, mentors, products, events, etc.), optionally filtered by category.',
  inputSchema: z.object({
    devToApiKey: apiKeyField,
    category: listingCategory.optional().describe('Filter by category'),
    page: z.number().int().min(1).optional().describe('Page number for pagination'),
    perPage: z.number().int().min(1).max(100).optional().describe('Items per page (default 30, max 100)'),
  }),
  execute: async ({ devToApiKey, perPage, ...rest }) => {
    try {
      const query: Record<string, unknown> = { ...rest };
      if (perPage !== undefined) query.per_page = perPage;
      return await devToRequest(devToApiKey, 'GET', '/listings', { query });
    } catch (error) {
      return toDevToError(error, 'Failed to list listings');
    }
  },
});

export const devToListListingsByCategory = tool({
  description: 'List classified listings for one specific category (jobs, mentors, products, events, etc.).',
  inputSchema: z.object({
    devToApiKey: apiKeyField,
    category: listingCategory,
    page: z.number().int().min(1).optional().describe('Page number for pagination'),
    perPage: z.number().int().min(1).max(100).optional().describe('Items per page (default 30, max 100)'),
  }),
  execute: async ({ devToApiKey, category, perPage, ...rest }) => {
    try {
      const query: Record<string, unknown> = { ...rest };
      if (perPage !== undefined) query.per_page = perPage;
      return await devToRequest(devToApiKey, 'GET', `/listings/category/${encodeURIComponent(category)}`, {
        query,
      });
    } catch (error) {
      return toDevToError(error, 'Failed to list listings by category');
    }
  },
});

export const devToUpdateListing = tool({
  description:
    "Update your classified listing. Use action 'bump' to refresh its timestamp, 'publish'/'unpublish' to change status, or provide title/body/category/tags to edit content.",
  inputSchema: z.object({
    devToApiKey: apiKeyField,
    id: z.number().int().describe('The ID of the listing to update'),
    title: z.string().optional().describe('Updated title'),
    bodyMarkdown: z.string().optional().describe('Updated body in Markdown'),
    category: z.string().optional().describe('Updated category (must be valid)'),
    tags: z.array(z.string()).optional().describe('Updated tags'),
    action: z.string().optional().describe("'bump', 'publish', or 'unpublish'"),
  }),
  execute: async ({ devToApiKey, id, bodyMarkdown, ...rest }) => {
    const missing = requireApiKey(devToApiKey);
    if (missing) return missing;
    try {
      const listing: Record<string, unknown> = { ...rest };
      if (bodyMarkdown !== undefined) listing.body_markdown = bodyMarkdown;
      return await devToRequest(devToApiKey, 'PUT', `/listings/${id}`, { body: { listing } });
    } catch (error) {
      return toDevToError(error, 'Failed to update listing');
    }
  },
});
