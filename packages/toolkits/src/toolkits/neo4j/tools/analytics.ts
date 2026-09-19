// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { auraRequest } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const neo4jEstimateGdsSessionSize = tool({
    description:
        'Estimate GDS session memory and size tier from node/relationship counts and algorithm categories. Use before creating a graph analytics session.',
    inputSchema: z.object({
        neo4jCredentials: tokenField,
        nodeCount: z.number().int().min(0).describe('Number of nodes'),
        relationshipCount: z.number().int().min(0).describe('Number of relationships'),
        nodeLabelCount: z.number().int().min(0).optional().describe('Labels per node'),
        nodePropertyCount: z.number().int().min(0).optional().describe('Properties per node'),
        relationshipPropertyCount: z.number().int().min(0).optional().describe('Properties per relationship'),
        algorithmCategories: z
            .array(z.string())
            .optional()
            .describe("Algorithm categories, e.g. ['pathfinding', 'community_detection', 'centrality', 'similarity', 'link_prediction']"),
    }),
    execute: async ({ neo4jCredentials, nodeCount, relationshipCount, nodeLabelCount, nodePropertyCount, relationshipPropertyCount, algorithmCategories }) => {
        return auraRequest(neo4jCredentials, '/v1/graph-analytics/sessions/sizing', {
            method: 'POST',
            body: {
                node_count: nodeCount,
                relationship_count: relationshipCount,
                node_label_count: nodeLabelCount,
                node_property_count: nodePropertyCount,
                relationship_property_count: relationshipPropertyCount,
                algorithm_categories: algorithmCategories,
            },
        });
    },
});

export const neo4jListGdsSessions = tool({
    description:
        'List GDS sessions with status, memory, host, and expiry. Optionally filter by instance, tenant, or organization. Read-only.',
    inputSchema: z.object({
        neo4jCredentials: tokenField,
        instanceId: z.string().optional().describe('Filter by instance ID'),
        tenantId: z.string().optional().describe('Filter by project/tenant ID'),
        organizationId: z.string().optional().describe('Filter by organization ID'),
    }),
    execute: async ({ neo4jCredentials, instanceId, tenantId, organizationId }) => {
        return auraRequest(neo4jCredentials, '/v1/graph-analytics/sessions', {
            query: { instance_id: instanceId, tenant_id: tenantId, organization_id: organizationId },
        });
    },
});

export const neo4jAggregateDirectors = tool({
    description:
        'Count directors via a directorsAggregate GraphQL query. Only use when a GraphQL movies API with a Director type is available; pass the instance ID the data belongs to.',
    inputSchema: z.object({
        neo4jCredentials: tokenField,
        instanceId: z.string().describe('Aura instance ID the request relates to'),
        graphQlEndpoint: z
            .string()
            .describe('GraphQL HTTP endpoint exposing a directorsAggregate query, e.g. "https://example.com/graphql"'),
    }),
    execute: async ({ neo4jCredentials, instanceId, graphQlEndpoint }) => {
        if (!neo4jCredentials) {
            return { error: 'Neo4j Aura API credentials are required. Connect Neo4j first.' };
        }
        let endpoint;
        try {
            endpoint = new URL(graphQlEndpoint);
        } catch {
            return { error: 'Invalid graphQlEndpoint. Provide a full HTTP(S) URL.' };
        }
        if (endpoint.protocol !== 'https:' && endpoint.protocol !== 'http:') {
            return { error: 'Invalid graphQlEndpoint. Provide a full HTTP(S) URL.' };
        }
        try {
            const response = await fetch(endpoint.toString(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ query: '{ directorsAggregate { count } }', variables: { instanceId } }),
            });
            if (!response.ok) {
                const details = await response.json().catch(() => ({}));
                return { error: `GraphQL request failed with status ${response.status}`, details };
            }
            return await response.json();
        } catch (error) {
            return {
                error: 'Error executing directorsAggregate query',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
