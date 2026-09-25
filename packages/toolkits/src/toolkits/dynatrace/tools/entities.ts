// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { dynatraceRequest, failedResult, toDynatraceError } from './client.js';

const credsField = z
    .string()
    .describe(
        'Dynatrace credentials JSON with baseUrl and apiToken, e.g. {"baseUrl":"https://abc123.live.dynatrace.com","apiToken":"..."} (Managed: "https://dynatrace.example.com/e/ENV_ID").',
    );
const timeFields = {
    from: z.string().optional().describe('Start of timeframe: relative ("now-2h") or ISO timestamp'),
    to: z.string().optional().describe('End of timeframe: relative or ISO timestamp (default now)'),
};

export const listEntities = tool({
    description:
        'List monitored entities (Smartscape topology) with an entity selector, e.g. \'type("HOST")\', \'type("SERVICE"),tag("team:backend")\', \'entityId("HOST-...")\'. Use to resolve entity IDs for problems, metrics and events.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        entitySelector: z.string().describe('Entity selector (required), e.g. \'type("SERVICE")\''),
        fields: z
            .string()
            .optional()
            .describe('Extra fields, e.g. "+tags,+properties,+managementZones"'),
        sort: z.string().optional().describe('Sort, e.g. "displayName" (prefix - for descending)'),
        pageSize: z.number().int().min(1).max(500).optional().describe('Results per page (default 50)'),
        ...timeFields,
    }),
    execute: async ({ dynatraceCredentials, entitySelector, fields, sort, pageSize, from, to }) => {
        try {
            const result = await dynatraceRequest(dynatraceCredentials, '/api/v2/entities', {
                query: { entitySelector, fields, from, to, sort, pageSize },
            });
            if (!result.ok) return failedResult('Failed to list Dynatrace entities', result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, 'Error listing Dynatrace entities');
        }
    },
});

export const getEntity = tool({
    description: 'Get one monitored entity with properties, tags and relations. Requires entities.read scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        entityId: z.string().describe('Entity ID, e.g. "HOST-ABC123DEF456" or "SERVICE-..."'),
        fields: z.string().optional().describe('Extra fields, e.g. "+tags,+properties,+fromRelationships"'),
        ...timeFields,
    }),
    execute: async ({ dynatraceCredentials, entityId, fields, from, to }) => {
        try {
            const result = await dynatraceRequest(
                dynatraceCredentials,
                `/api/v2/entities/${encodeURIComponent(entityId)}`,
                { query: { fields, from, to } },
            );
            if (!result.ok)
                return failedResult(`Failed to get Dynatrace entity "${entityId}"`, result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, `Error getting Dynatrace entity "${entityId}"`);
        }
    },
});

export const listEntityTypes = tool({
    description: 'List all entity types known to the environment (HOST, SERVICE, PROCESS_GROUP, ...). Requires entities.read scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        pageSize: z.number().int().min(1).max(500).optional().describe('Results per page (default 50)'),
    }),
    execute: async ({ dynatraceCredentials, pageSize }) => {
        try {
            const result = await dynatraceRequest(dynatraceCredentials, '/api/v2/entityTypes', {
                query: { pageSize },
            });
            if (!result.ok) return failedResult('Failed to list Dynatrace entity types', result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, 'Error listing Dynatrace entity types');
        }
    },
});

export const getEntityType = tool({
    description: 'Get properties and capabilities of one entity type. Requires entities.read scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        entityType: z.string().describe('Entity type, e.g. "HOST", "SERVICE", "KUBERNETES_CLUSTER"'),
    }),
    execute: async ({ dynatraceCredentials, entityType }) => {
        try {
            const result = await dynatraceRequest(
                dynatraceCredentials,
                `/api/v2/entityTypes/${encodeURIComponent(entityType)}`,
            );
            if (!result.ok)
                return failedResult(`Failed to get entity type "${entityType}"`, result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, `Error getting entity type "${entityType}"`);
        }
    },
});

export const listTags = tool({
    description: 'List custom tags on entities selected by an entity selector. Requires entities.read scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        entitySelector: z.string().describe('Entity scope, e.g. \'type("HOST")\''),
        ...timeFields,
    }),
    execute: async ({ dynatraceCredentials, entitySelector, from, to }) => {
        try {
            const result = await dynatraceRequest(dynatraceCredentials, '/api/v2/tags', {
                query: { entitySelector, from, to },
            });
            if (!result.ok) return failedResult('Failed to list Dynatrace tags', result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, 'Error listing Dynatrace tags');
        }
    },
});

export const addTags = tool({
    description: 'Add custom tags to entities matching an entity selector. Requires entities.write scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        entitySelector: z.string().describe('Entity scope, e.g. \'type("SERVICE"),tag("team:backend")\''),
        tags: z
            .array(z.object({ key: z.string(), value: z.string().optional() }))
            .describe('Tags to apply, e.g. [{"key":"team","value":"backend"},{"key":"critical"}]'),
        ...timeFields,
    }),
    execute: async ({ dynatraceCredentials, entitySelector, tags, from, to }) => {
        try {
            const result = await dynatraceRequest(dynatraceCredentials, '/api/v2/tags', {
                method: 'POST',
                query: { entitySelector, from, to },
                body: { tags },
            });
            if (!result.ok) return failedResult('Failed to add Dynatrace tags', result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, 'Error adding Dynatrace tags');
        }
    },
});

export const deleteTag = tool({
    description: 'Delete a tag from entities matching a selector. Requires entities.write scope.',
    inputSchema: z.object({
        dynatraceCredentials: credsField,
        key: z.string().describe('Tag key to remove'),
        entitySelector: z.string().describe('Entity scope, e.g. \'type("HOST")\''),
        value: z.string().optional().describe('Only remove this value (omit with deleteAllWithKey to remove the key entirely)'),
        deleteAllWithKey: z.boolean().optional().describe('Remove the key with all its values (default false)'),
        ...timeFields,
    }),
    execute: async ({ dynatraceCredentials, key, entitySelector, value, deleteAllWithKey, from, to }) => {
        try {
            const result = await dynatraceRequest(dynatraceCredentials, '/api/v2/tags', {
                method: 'DELETE',
                query: { key, entitySelector, value, deleteAllWithKey, from, to },
            });
            if (!result.ok) return failedResult('Failed to delete Dynatrace tag', result);
            return result.data;
        } catch (error) {
            return toDynatraceError(error, 'Error deleting Dynatrace tag');
        }
    },
});
