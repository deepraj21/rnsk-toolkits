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

export const digitalOceanCreateVolume = tool({
  description:
    'Provision persistent block storage in a region that supports volumes (e.g. 100 GiB ext4 backup volume in nyc1). Optionally create from a snapshot or pre-format with a filesystem.',
  inputSchema: z.object({
    ...authField,
    name: z.string().describe('Human-readable volume name'),
    sizeGigabytes: z.number().int().min(1).describe('Volume size in GiB (minimum 1)'),
    region: z.string().describe("Region slug (e.g. 'nyc1')"),
    description: z.string().optional().describe('Free-form volume description'),
    snapshotId: z.string().optional().describe('Snapshot UUID to create the volume from'),
    filesystemType: z.string().optional().describe("Filesystem to initialize (e.g. 'ext4')"),
    filesystemLabel: z.string().optional().describe('Label for the filesystem'),
    tags: z.array(z.string()).optional().describe('Tags for the volume'),
  }),
  execute: async ({
    digitalOceanApiKey,
    name,
    sizeGigabytes,
    region,
    description,
    snapshotId,
    filesystemType,
    filesystemLabel,
    tags,
  }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      return await digitalOceanRequest(digitalOceanApiKey, 'POST', '/volumes', {
        body: {
          name,
          size_gigabytes: sizeGigabytes,
          region,
          ...(description !== undefined ? { description } : {}),
          ...(snapshotId !== undefined ? { snapshot_id: snapshotId } : {}),
          ...(filesystemType !== undefined ? { filesystem_type: filesystemType } : {}),
          ...(filesystemLabel !== undefined ? { filesystem_label: filesystemLabel } : {}),
          ...(tags !== undefined ? { tags } : {}),
        },
      });
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to create volume');
    }
  },
});

export const digitalOceanListVolumes = tool({
  description:
    'List block storage volumes, optionally filtered by exact name and region. Paginate to cover every volume.',
  inputSchema: z.object({
    ...authField,
    ...paginationFields,
    name: z.string().optional().describe('Only return the volume with this exact name'),
    region: z.string().optional().describe('Only return volumes in this region slug'),
  }),
  execute: async ({ digitalOceanApiKey, page, perPage, name, region }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      return await digitalOceanRequest(digitalOceanApiKey, 'GET', '/volumes', {
        query: { page, per_page: perPage, name, region },
      });
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to list volumes');
    }
  },
});

export const digitalOceanDeleteVolume = tool({
  description:
    'Permanently delete a block storage volume by UUID. The volume must first be detached from all Droplets. Cannot be undone.',
  inputSchema: z.object({
    ...authField,
    volumeId: z.string().describe('UUID of the volume to delete'),
  }),
  execute: async ({ digitalOceanApiKey, volumeId }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      await digitalOceanRequest(digitalOceanApiKey, 'DELETE', `/volumes/${volumeId}`);
      return { success: true, message: `Volume ${volumeId} deleted.` };
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to delete volume');
    }
  },
});
