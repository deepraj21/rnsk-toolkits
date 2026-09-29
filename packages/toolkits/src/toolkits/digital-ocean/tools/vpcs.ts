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

export const digitalOceanCreateVpc = tool({
  description:
    'Create a Virtual Private Cloud in a region for isolating Droplets, databases, load balancers, and Kubernetes clusters. In-region VPC traffic is free. The first VPC per region becomes the default.',
  inputSchema: z.object({
    ...authField,
    name: z.string().describe('VPC name, unique within the account'),
    region: z.string().describe("Region slug (e.g. 'nyc3', 'sfo3', 'lon1', 'fra1')"),
    ipRange: z
      .string()
      .optional()
      .describe(
        "CIDR range (/16 to /28, e.g. '10.20.0.0/16'); auto-assigned when omitted and must not overlap existing VPCs",
      ),
    description: z.string().optional().describe('Free-form VPC description'),
    tags: z.array(z.string()).optional().describe('Tags to apply after creation'),
  }),
  execute: async ({ digitalOceanApiKey, name, region, ipRange, description, tags }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      return await digitalOceanRequest(digitalOceanApiKey, 'POST', '/vpcs', {
        body: {
          name,
          region,
          ...(ipRange !== undefined ? { ip_range: ipRange } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(tags !== undefined ? { tags } : {}),
        },
      });
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to create VPC');
    }
  },
});

export const digitalOceanListVpcs = tool({
  description:
    'Inventory all VPCs on the account. Paginate with page/per_page (max 200) to retrieve the complete set.',
  inputSchema: z.object({
    ...authField,
    ...paginationFields,
  }),
  execute: async ({ digitalOceanApiKey, page, perPage }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      return await digitalOceanRequest(digitalOceanApiKey, 'GET', '/vpcs', {
        query: { page, per_page: perPage },
      });
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to list VPCs');
    }
  },
});

export const digitalOceanRetrieveVpc = tool({
  description:
    'Get a VPC by ID for configuration or auditing: CIDR range, region, default status, resolver IP, and timestamps.',
  inputSchema: z.object({
    ...authField,
    vpcId: z.string().describe('UUID of the VPC to retrieve'),
  }),
  execute: async ({ digitalOceanApiKey, vpcId }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      return await digitalOceanRequest(digitalOceanApiKey, 'GET', `/vpcs/${vpcId}`);
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to retrieve VPC');
    }
  },
});

export const digitalOceanUpdateVpc = tool({
  description: 'Rename a VPC, change its description, or set it as the regional default.',
  inputSchema: z.object({
    ...authField,
    vpcId: z.string().describe('UUID of the VPC to update'),
    name: z.string().optional().describe('New VPC name'),
    description: z.string().optional().describe('New free-form description'),
    isDefault: z.boolean().optional().describe('Set as the default VPC for its region'),
  }),
  execute: async ({ digitalOceanApiKey, vpcId, name, description, isDefault }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      return await digitalOceanRequest(digitalOceanApiKey, 'PUT', `/vpcs/${vpcId}`, {
        body: {
          ...(name !== undefined ? { name } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(isDefault !== undefined ? { default: isDefault } : {}),
        },
      });
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to update VPC');
    }
  },
});

export const digitalOceanDeleteVpc = tool({
  description:
    'Permanently delete an empty, non-default VPC by ID. Confirm the ID first: deletion is irreversible, and VPCs with member resources or default status cannot be deleted.',
  inputSchema: z.object({
    ...authField,
    vpcId: z.string().describe('UUID of the VPC to delete'),
  }),
  execute: async ({ digitalOceanApiKey, vpcId }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      await digitalOceanRequest(digitalOceanApiKey, 'DELETE', `/vpcs/${vpcId}`);
      return { success: true, message: `VPC ${vpcId} deleted.` };
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to delete VPC');
    }
  },
});
