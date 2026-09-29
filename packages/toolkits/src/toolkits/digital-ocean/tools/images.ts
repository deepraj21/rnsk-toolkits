// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { digitalOceanRequest, missingKey, toDigitalOceanError } from './client.js';

const authField = {
  digitalOceanApiKey: z.string().optional().describe('Injected by system; do not provide'),
};

const paginationFields = {
  page: z.number().int().min(1).optional().describe('Page of results to return (>= 1)'),
  perPage: z.number().int().min(1).max(200).optional().describe('Number of items per page (1-200)'),
};

export const digitalOceanCreateCustomImage = tool({
  description:
    'Import a custom Linux VM disk image from a public URL (raw, qcow2, VHDX, VDI, VMDK; gzip/bzip2 ok) for later Droplet creation. Processing is asynchronous — monitor status via the returned image ID.',
  inputSchema: z.object({
    ...authField,
    name: z.string().describe("Human-readable image name (e.g. 'ubuntu-20.04-webserver')"),
    url: z.string().describe('Public HTTP/HTTPS URL of the disk image'),
    region: z.string().describe("Region slug for initial storage (e.g. 'nyc3', 'sfo2', 'lon1')"),
    distribution: z
      .enum(['Ubuntu', 'Debian', 'CentOS', 'Fedora', 'Arch Linux', 'Unknown'])
      .describe('OS distribution of the image'),
    description: z.string().optional().describe('Description of the image purpose or contents'),
    tags: z.array(z.string()).optional().describe('Tags for organizing the image'),
  }),
  execute: async ({ digitalOceanApiKey, name, url, region, distribution, description, tags }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      return await digitalOceanRequest(digitalOceanApiKey, 'POST', '/images', {
        body: {
          name,
          url,
          region,
          distribution,
          ...(description !== undefined ? { description } : {}),
          ...(tags !== undefined ? { tags } : {}),
        },
      });
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to create custom image');
    }
  },
});

export const digitalOceanListImages = tool({
  description:
    'List distribution, application, and private images. Filter by type, private visibility, or tag; paginate for large inventories.',
  inputSchema: z.object({
    ...authField,
    ...paginationFields,
    type: z
      .enum(['distribution', 'application', 'private'])
      .optional()
      .describe('Filter images by type'),
    private: z.boolean().optional().describe('If true, return only private images'),
    tagName: z.string().optional().describe('Return only images with this tag'),
  }),
  execute: async ({ digitalOceanApiKey, page, perPage, type, private: priv, tagName }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      return await digitalOceanRequest(digitalOceanApiKey, 'GET', '/images', {
        query: { page, per_page: perPage, type, private: priv, tag_name: tagName },
      });
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to list images');
    }
  },
});

export const digitalOceanRetrieveImage = tool({
  description:
    'Get detailed metadata for an image by numeric ID or slug (e.g. ubuntu-20-04-x64). Check regions and min disk size before creating Droplets from it.',
  inputSchema: z.object({
    ...authField,
    imageId: z.union([z.number().int(), z.string()]).describe('Numeric image ID or image slug'),
  }),
  execute: async ({ digitalOceanApiKey, imageId }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      return await digitalOceanRequest(digitalOceanApiKey, 'GET', `/images/${imageId}`);
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to retrieve image');
    }
  },
});

export const digitalOceanDeleteImage = tool({
  description:
    'Permanently delete a user-owned custom image or snapshot by numeric ID. Distribution and Marketplace images cannot be deleted (403).',
  inputSchema: z.object({
    ...authField,
    imageId: z.number().int().describe('Numeric ID of the custom image or snapshot to delete'),
  }),
  execute: async ({ digitalOceanApiKey, imageId }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      await digitalOceanRequest(digitalOceanApiKey, 'DELETE', `/images/${imageId}`);
      return { success: true, message: `Image ${imageId} deleted.` };
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to delete image');
    }
  },
});

export const digitalOceanListSnapshots = tool({
  description:
    'List Droplet and volume snapshots for backup inventory workflows. Filter by resource type and paginate through large sets.',
  inputSchema: z.object({
    ...authField,
    ...paginationFields,
    resourceType: z
      .enum(['droplet', 'volume'])
      .optional()
      .describe('Filter snapshots by source resource type'),
  }),
  execute: async ({ digitalOceanApiKey, page, perPage, resourceType }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      return await digitalOceanRequest(digitalOceanApiKey, 'GET', '/snapshots', {
        query: { page, per_page: perPage, resource_type: resourceType },
      });
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to list snapshots');
    }
  },
});
