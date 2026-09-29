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

const tagResource = z.object({
  resourceId: z.string().describe('UUID of the resource to tag or untag'),
  resourceType: z.string().describe('Resource type (e.g. droplet, volume, image, database)'),
  resourceUrn: z.string().optional().describe('URN alternative to resource_id'),
  region: z
    .string()
    .optional()
    .describe('Resource region (required for some types when untagging)'),
});

export const digitalOceanCreateTag = tool({
  description:
    'Create a tag for organizing Droplets, images, volumes, snapshots, and databases. Idempotent — returns the existing tag if the name is taken. Names allow letters, numbers, hyphens, underscores (1-255 chars).',
  inputSchema: z.object({
    ...authField,
    name: z.string().min(1).max(255).describe('Tag name (alphanumeric, hyphens, underscores only)'),
  }),
  execute: async ({ digitalOceanApiKey, name }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      return await digitalOceanRequest(digitalOceanApiKey, 'POST', '/tags', {
        body: { name },
      });
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to create tag');
    }
  },
});

export const digitalOceanListTags = tool({
  description:
    'List all account tags with per-resource-type counts. Paginate with page/per_page to retrieve every tag.',
  inputSchema: z.object({
    ...authField,
    ...paginationFields,
  }),
  execute: async ({ digitalOceanApiKey, page, perPage }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      return await digitalOceanRequest(digitalOceanApiKey, 'GET', '/tags', {
        query: { page, per_page: perPage },
      });
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to list tags');
    }
  },
});

export const digitalOceanRetrieveTag = tool({
  description:
    'Get a single tag by name with counts and last-tagged info for each grouped resource type.',
  inputSchema: z.object({
    ...authField,
    name: z.string().describe('Tag name (case-sensitive)'),
  }),
  execute: async ({ digitalOceanApiKey, name }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      return await digitalOceanRequest(
        digitalOceanApiKey,
        'GET',
        `/tags/${encodeURIComponent(name)}`,
      );
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to retrieve tag');
    }
  },
});

export const digitalOceanDeleteTag = tool({
  description:
    'Delete a tag; it is automatically removed from all tagged resources. Idempotent — deleting a missing tag still succeeds.',
  inputSchema: z.object({
    ...authField,
    name: z.string().describe('Tag name to delete; resources using it are untagged'),
  }),
  execute: async ({ digitalOceanApiKey, name }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      await digitalOceanRequest(digitalOceanApiKey, 'DELETE', `/tags/${encodeURIComponent(name)}`);
      return { success: true, message: `Tag ${name} deleted.` };
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to delete tag');
    }
  },
});

export const digitalOceanTagResource = tool({
  description:
    'Assign an existing tag to one or more resources (Droplets, volumes, images, databases, load balancers, firewalls, domains, etc.) in a single call.',
  inputSchema: z.object({
    ...authField,
    tagName: z.string().describe('Tag to assign'),
    resources: z.array(tagResource).min(1).describe('Resources to tag, each with id and type'),
  }),
  execute: async ({ digitalOceanApiKey, tagName, resources }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      await digitalOceanRequest(
        digitalOceanApiKey,
        'POST',
        `/tags/${encodeURIComponent(tagName)}/resources`,
        {
          body: {
            resources: resources.map(({ resourceId, resourceType, resourceUrn, region }: any) => ({
              resource_id: resourceId,
              resource_type: resourceType,
              ...(resourceUrn !== undefined ? { resource_urn: resourceUrn } : {}),
              ...(region !== undefined ? { region } : {}),
            })),
          },
        },
      );
      return { success: true, message: `Tagged ${resources.length} resource(s) with ${tagName}.` };
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to tag resources');
    }
  },
});

export const digitalOceanUntagResource = tool({
  description:
    'Remove a tag from multiple resources in one call. Use to bulk-untag without deleting the tag itself.',
  inputSchema: z.object({
    ...authField,
    tagName: z.string().describe('Tag to remove from the resources'),
    resources: z.array(tagResource).min(1).describe('Resources to untag, each with id and type'),
  }),
  execute: async ({ digitalOceanApiKey, tagName, resources }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      await digitalOceanRequest(
        digitalOceanApiKey,
        'DELETE',
        `/tags/${encodeURIComponent(tagName)}/resources`,
        {
          body: {
            resources: resources.map(({ resourceId, resourceType, resourceUrn, region }: any) => ({
              resource_id: resourceId,
              resource_type: resourceType,
              ...(resourceUrn !== undefined ? { resource_urn: resourceUrn } : {}),
              ...(region !== undefined ? { region } : {}),
            })),
          },
        },
      );
      return {
        success: true,
        message: `Removed tag ${tagName} from ${resources.length} resource(s).`,
      };
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to untag resources');
    }
  },
});
