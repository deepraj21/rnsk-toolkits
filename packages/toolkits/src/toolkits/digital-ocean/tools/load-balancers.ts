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

const forwardingRule = z.object({
  entryProtocol: z.enum(['http', 'https', 'tcp', 'tls']).describe('Inbound protocol'),
  entryPort: z.number().int().min(1).max(65535).describe('Port accepting traffic'),
  targetProtocol: z.enum(['http', 'https', 'tcp', 'tls']).describe('Backend protocol'),
  targetPort: z.number().int().min(1).max(65535).describe('Backend Droplet port'),
  certificateId: z
    .string()
    .optional()
    .describe('TLS certificate ID; required for https/tls entry protocols'),
  tlsPassthrough: z
    .boolean()
    .optional()
    .describe('Pass TLS to backends; only valid with tls entry protocol'),
});

export const digitalOceanCreateLoadBalancer = tool({
  description:
    'Create a load balancer in a region with forwarding rules mapping entry to backend protocols and ports. Attach Droplets by ID or tag (mutually exclusive).',
  inputSchema: z.object({
    ...authField,
    name: z.string().describe('Unique load balancer name'),
    region: z.string().describe("Region slug (e.g. 'nyc1')"),
    forwardingRules: z.array(forwardingRule).min(1).describe('Forwarding rules (at least one)'),
    dropletIds: z
      .array(z.number().int())
      .optional()
      .describe('Droplet IDs to attach (not with tag)'),
    tag: z.string().optional().describe('Droplet tag to select targets (not with droplet_ids)'),
    algorithm: z
      .enum(['round_robin', 'least_connections'])
      .optional()
      .describe("Balancing algorithm (default 'round_robin')"),
    vpcUuid: z.string().optional().describe('VPC UUID for the load balancer'),
    healthCheck: z
      .object({
        protocol: z.enum(['http', 'https', 'tcp']),
        port: z.number().int().min(1).max(65535),
        path: z.string().optional().describe("HTTP/HTTPS check path (e.g. '/health')"),
        checkIntervalSeconds: z.number().int().min(5).optional(),
        responseTimeoutSeconds: z.number().int().min(1).optional(),
        healthyThreshold: z.number().int().min(1).optional(),
        unhealthyThreshold: z.number().int().min(1).optional(),
      })
      .optional()
      .describe('Health check configuration'),
    stickySessions: z
      .object({
        type: z.enum(['none', 'cookie']),
        cookieName: z.string().optional(),
        cookieTtlSeconds: z.number().int().min(0).optional(),
      })
      .optional()
      .describe('Session persistence configuration'),
    redirectHttpToHttps: z.boolean().optional().describe('Redirect HTTP traffic to HTTPS'),
    enableProxyProtocol: z.boolean().optional().describe('Enable PROXY protocol to backends'),
    enableBackendKeepalive: z.boolean().optional().describe('Keepalive connections to backends'),
    firewallPolicy: z.string().optional().describe('Custom firewall policy ID to apply'),
  }),
  execute: async ({
    digitalOceanApiKey,
    name,
    region,
    forwardingRules,
    dropletIds,
    tag,
    algorithm,
    vpcUuid,
    healthCheck,
    stickySessions,
    redirectHttpToHttps,
    enableProxyProtocol,
    enableBackendKeepalive,
    firewallPolicy,
  }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      const toWireRule = ({
        entryProtocol,
        entryPort,
        targetProtocol,
        targetPort,
        certificateId,
        tlsPassthrough,
      }: any) => ({
        entry_protocol: entryProtocol,
        entry_port: entryPort,
        target_protocol: targetProtocol,
        target_port: targetPort,
        ...(certificateId !== undefined ? { certificate_id: certificateId } : {}),
        ...(tlsPassthrough !== undefined ? { tls_passthrough: tlsPassthrough } : {}),
      });
      return await digitalOceanRequest(digitalOceanApiKey, 'POST', '/load_balancers', {
        body: {
          name,
          region,
          forwarding_rules: forwardingRules.map(toWireRule),
          ...(dropletIds !== undefined ? { droplet_ids: dropletIds } : {}),
          ...(tag !== undefined ? { tag } : {}),
          ...(algorithm !== undefined ? { algorithm } : {}),
          ...(vpcUuid !== undefined ? { vpc_uuid: vpcUuid } : {}),
          ...(healthCheck !== undefined
            ? {
                health_check: {
                  protocol: healthCheck.protocol,
                  port: healthCheck.port,
                  ...(healthCheck.path !== undefined ? { path: healthCheck.path } : {}),
                  ...(healthCheck.checkIntervalSeconds !== undefined
                    ? { check_interval_seconds: healthCheck.checkIntervalSeconds }
                    : {}),
                  ...(healthCheck.responseTimeoutSeconds !== undefined
                    ? { response_timeout_seconds: healthCheck.responseTimeoutSeconds }
                    : {}),
                  ...(healthCheck.healthyThreshold !== undefined
                    ? { healthy_threshold: healthCheck.healthyThreshold }
                    : {}),
                  ...(healthCheck.unhealthyThreshold !== undefined
                    ? { unhealthy_threshold: healthCheck.unhealthyThreshold }
                    : {}),
                },
              }
            : {}),
          ...(stickySessions !== undefined
            ? {
                sticky_sessions: {
                  type: stickySessions.type,
                  ...(stickySessions.cookieName !== undefined
                    ? { cookie_name: stickySessions.cookieName }
                    : {}),
                  ...(stickySessions.cookieTtlSeconds !== undefined
                    ? { cookie_ttl_seconds: stickySessions.cookieTtlSeconds }
                    : {}),
                },
              }
            : {}),
          ...(redirectHttpToHttps !== undefined
            ? { redirect_http_to_https: redirectHttpToHttps }
            : {}),
          ...(enableProxyProtocol !== undefined
            ? { enable_proxy_protocol: enableProxyProtocol }
            : {}),
          ...(enableBackendKeepalive !== undefined
            ? { enable_backend_keepalive: enableBackendKeepalive }
            : {}),
          ...(firewallPolicy !== undefined ? { firewall: firewallPolicy } : {}),
        },
      });
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to create load balancer');
    }
  },
});

export const digitalOceanListLoadBalancers = tool({
  description:
    'List all load balancers with IPs, forwarding rules, health checks, sticky sessions, Droplets, and regions. Paginate to cover every balancer.',
  inputSchema: z.object({
    ...authField,
    ...paginationFields,
  }),
  execute: async ({ digitalOceanApiKey, page, perPage }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      return await digitalOceanRequest(digitalOceanApiKey, 'GET', '/load_balancers', {
        query: { page, per_page: perPage },
      });
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to list load balancers');
    }
  },
});

export const digitalOceanDeleteLoadBalancer = tool({
  description:
    'Permanently delete a load balancer by ID after confirming it. Backends stop receiving its traffic.',
  inputSchema: z.object({
    ...authField,
    loadBalancerId: z.string().describe('UUID of the load balancer to delete'),
  }),
  execute: async ({ digitalOceanApiKey, loadBalancerId }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      await digitalOceanRequest(digitalOceanApiKey, 'DELETE', `/load_balancers/${loadBalancerId}`);
      return { success: true, message: `Load balancer ${loadBalancerId} deleted.` };
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to delete load balancer');
    }
  },
});
