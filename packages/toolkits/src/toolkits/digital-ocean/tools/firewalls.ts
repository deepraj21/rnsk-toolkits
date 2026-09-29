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

const ruleProtocol = z.enum(['tcp', 'udp', 'icmp']).describe('Traffic protocol');

const ruleEndpoint = z
  .object({
    addresses: z
      .array(z.string())
      .optional()
      .describe("IPv4/IPv6 CIDR addresses to allow (e.g. '0.0.0.0/0', '::/0')"),
    dropletIds: z.array(z.number().int()).optional().describe('Droplet IDs to allow'),
    tags: z.array(z.string()).optional().describe('Droplet tags; matching Droplets are allowed'),
    kubernetesIds: z.array(z.string()).optional().describe('Kubernetes cluster UUIDs to allow'),
    loadBalancerUids: z.array(z.string()).optional().describe('Load Balancer UUIDs to allow'),
  })
  .describe('Sources (inbound) or destinations (outbound) for a firewall rule');

const inboundRule = z.object({
  protocol: ruleProtocol,
  ports: z
    .string()
    .optional()
    .describe("Port or range (e.g. '80', '8000-9000', 'all'); required for tcp/udp, omit for icmp"),
  sources: ruleEndpoint.describe('Allowed traffic sources'),
});

const outboundRule = z.object({
  protocol: ruleProtocol,
  ports: z
    .string()
    .optional()
    .describe("Port or range (e.g. '80', '8000-9000', 'all'); required for tcp/udp, omit for icmp"),
  destinations: ruleEndpoint.describe('Allowed traffic destinations'),
});

export const digitalOceanCreateFirewall = tool({
  description:
    'Create a cloud firewall with inbound and outbound rules (at least one of each). Target Droplets by ID or tag, and optionally scope to a VPC. Supports tcp, udp, and icmp.',
  inputSchema: z.object({
    ...authField,
    name: z.string().describe("Firewall name (e.g. 'web-firewall')"),
    inboundRules: z.array(inboundRule).min(1).describe('Inbound rules; at least one required'),
    outboundRules: z.array(outboundRule).min(1).describe('Outbound rules; at least one required'),
    dropletIds: z
      .array(z.number().int())
      .optional()
      .describe('Droplet IDs to apply the firewall to'),
    tags: z.array(z.string()).optional().describe('Apply the firewall to Droplets with these tags'),
    vpcUuid: z.string().optional().describe('Scope the firewall to a VPC UUID'),
  }),
  execute: async ({
    digitalOceanApiKey,
    name,
    inboundRules,
    outboundRules,
    dropletIds,
    tags,
    vpcUuid,
  }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      const toWire = (rules: any[], endpointKey: string) =>
        rules.map(({ dropletIds: ids, loadBalancerUids, kubernetesIds, ...rest }: any) => {
          const endpoint: Record<string, unknown> = { ...rest[endpointKey] };
          if (ids !== undefined) endpoint.droplet_ids = ids;
          if (loadBalancerUids !== undefined) endpoint.load_balancer_uids = loadBalancerUids;
          if (kubernetesIds !== undefined) endpoint.kubernetes_ids = kubernetesIds;
          return { ...rest, [endpointKey]: endpoint };
        });
      return await digitalOceanRequest(digitalOceanApiKey, 'POST', '/firewalls', {
        body: {
          name,
          inbound_rules: toWire(inboundRules, 'sources'),
          outbound_rules: toWire(outboundRules, 'destinations'),
          ...(dropletIds !== undefined ? { droplet_ids: dropletIds } : {}),
          ...(tags !== undefined ? { tags } : {}),
          ...(vpcUuid !== undefined ? { vpc_uuid: vpcUuid } : {}),
        },
      });
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to create firewall');
    }
  },
});

export const digitalOceanListFirewalls = tool({
  description:
    'List all cloud firewalls with rules, associated Droplets, tags, and status. Use to audit network security or find firewall IDs.',
  inputSchema: z.object({
    ...authField,
    ...paginationFields,
  }),
  execute: async ({ digitalOceanApiKey, page, perPage }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      return await digitalOceanRequest(digitalOceanApiKey, 'GET', '/firewalls', {
        query: { page, per_page: perPage },
      });
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to list firewalls');
    }
  },
});

export const digitalOceanDeleteFirewall = tool({
  description:
    'Delete a firewall by ID once confirmed no longer needed. Droplets previously covered lose those rules.',
  inputSchema: z.object({
    ...authField,
    firewallId: z.string().describe('UUID of the firewall to delete'),
  }),
  execute: async ({ digitalOceanApiKey, firewallId }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      await digitalOceanRequest(digitalOceanApiKey, 'DELETE', `/firewalls/${firewallId}`);
      return { success: true, message: `Firewall ${firewallId} deleted.` };
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to delete firewall');
    }
  },
});
