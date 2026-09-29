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

export const digitalOceanCreateDroplet = tool({
  description:
    'Provision a new Droplet (VM) with name, region, size, and image. The image, region, and size must be mutually compatible — the region must be listed in the available regions of the image. Returns the created Droplet.',
  inputSchema: z.object({
    ...authField,
    name: z.string().describe('Human-readable name for the Droplet'),
    region: z.string().describe("Region slug where the Droplet will be created (e.g. 'nyc3')"),
    size: z.string().describe("Size slug for the Droplet (e.g. 's-1vcpu-1gb')"),
    image: z
      .union([z.string(), z.number()])
      .describe("Image slug (e.g. 'ubuntu-20-04-x64') or numeric image ID to use"),
    sshKeys: z
      .array(z.union([z.number(), z.string()]))
      .optional()
      .describe('SSH key IDs or fingerprints to embed for secure access'),
    backups: z.boolean().optional().describe('Enable automatic backups'),
    ipv6: z.boolean().optional().describe('Enable IPv6'),
    monitoring: z.boolean().optional().describe('Enable monitoring'),
    volumes: z.array(z.string()).optional().describe('Volume IDs to attach to the Droplet'),
    tags: z.array(z.string()).optional().describe('Tags to apply to the Droplet'),
    vpcUuid: z.string().optional().describe('VPC UUID to assign the Droplet to'),
    userData: z
      .string()
      .optional()
      .describe('Cloud-init user data script to configure the Droplet'),
    withDropletAgent: z.boolean().optional().describe('Install the Droplet agent for metrics'),
  }),
  execute: async ({
    digitalOceanApiKey,
    name,
    region,
    size,
    image,
    sshKeys,
    backups,
    ipv6,
    monitoring,
    volumes,
    tags,
    vpcUuid,
    userData,
    withDropletAgent,
  }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      return await digitalOceanRequest(digitalOceanApiKey, 'POST', '/droplets', {
        body: {
          name,
          region,
          size,
          image,
          ...(sshKeys !== undefined ? { ssh_keys: sshKeys } : {}),
          ...(backups !== undefined ? { backups } : {}),
          ...(ipv6 !== undefined ? { ipv6 } : {}),
          ...(monitoring !== undefined ? { monitoring } : {}),
          ...(volumes !== undefined ? { volumes } : {}),
          ...(tags !== undefined ? { tags } : {}),
          ...(vpcUuid !== undefined ? { vpc_uuid: vpcUuid } : {}),
          ...(userData !== undefined ? { user_data: userData } : {}),
          ...(withDropletAgent !== undefined ? { with_droplet_agent: withDropletAgent } : {}),
        },
      });
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to create Droplet');
    }
  },
});

export const digitalOceanListDroplets = tool({
  description:
    'List all Droplets in the account with specs, status, IP addresses, region, image, and tags. Paginate with page/per_page (up to 200) and optionally filter by tag; a single request returns only one page.',
  inputSchema: z.object({
    ...authField,
    ...paginationFields,
    tagName: z.string().optional().describe('Filter Droplets by tag name'),
  }),
  execute: async ({ digitalOceanApiKey, page, perPage, tagName }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      return await digitalOceanRequest(digitalOceanApiKey, 'GET', '/droplets', {
        query: { page, per_page: perPage, tag_name: tagName },
      });
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to list Droplets');
    }
  },
});

export const digitalOceanRetrieveDroplet = tool({
  description:
    'Get detailed information about a Droplet by ID: status, specs, IPv4/IPv6 addresses, image, region, VPC, backups, attached volumes, and tags.',
  inputSchema: z.object({
    ...authField,
    dropletId: z.number().int().min(1).describe('Numeric ID of the Droplet to retrieve'),
  }),
  execute: async ({ digitalOceanApiKey, dropletId }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      return await digitalOceanRequest(digitalOceanApiKey, 'GET', `/droplets/${dropletId}`);
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to retrieve Droplet');
    }
  },
});

export const digitalOceanDeleteDroplet = tool({
  description:
    'Permanently delete a Droplet by ID. Deletion is irreversible — all data is lost. Confirm the ID with the user and verify a backup or snapshot exists first.',
  inputSchema: z.object({
    ...authField,
    dropletId: z.number().int().min(1).describe('Numeric ID of the Droplet to delete'),
  }),
  execute: async ({ digitalOceanApiKey, dropletId }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      await digitalOceanRequest(digitalOceanApiKey, 'DELETE', `/droplets/${dropletId}`);
      return { success: true, message: `Droplet ${dropletId} deleted.` };
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to delete Droplet');
    }
  },
});
