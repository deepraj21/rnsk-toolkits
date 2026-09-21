// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { accountIdField, nerdgraph, newRelicApiKeyField } from './client.js';

const NRQL_SELECT = 'results queryProgress { queryId completed retryAfter retryDeadline resultExpiration }';

function nrqlQueryObject(accountId: number, nrql: string, timeout?: number, asyncExecution?: boolean) {
    return `{
  actor {
    account(id: ${accountId}) {
      nrql(query: ${JSON.stringify(nrql)}${timeout !== undefined ? `, timeout: ${timeout}` : ''}${asyncExecution ? ', async: true' : ''}) {
        ${NRQL_SELECT}
      }
    }
  }
}`;
}

export const executeNrqlQuery = tool({
    description:
        "Executes a NRQL query against telemetry data (transactions, logs, metrics, events). Use asyncExecution for queries over ~5s, then poll with the returned queryId via the same query string.",
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdField('Account ID whose data to query'),
        query: z.string().describe("NRQL query, e.g. 'SELECT count(*) FROM Transaction SINCE 1 HOUR AGO'"),
        timeout: z.number().int().min(1).max(600).optional().describe('Timeout seconds (default 5; up to 600 on Data Plus)'),
        asyncExecution: z.boolean().optional().describe('Async mode for long queries — returns queryId to poll'),
    }),
    execute: async ({ newRelicApiKey, accountId, query, timeout, asyncExecution }) =>
        nerdgraph(newRelicApiKey, `query { ${nrqlQueryObject(accountId, query, timeout, asyncExecution)} }`, undefined, 'execute NRQL query'),
});

export const queryError = tool({
    description:
        'Queries error data (TransactionError etc.) with a custom NRQL query. Use to analyze error counts, facet by error.message, or spot error patterns.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdField('Account ID to query error data from'),
        nrqlQuery: z.string().describe("NRQL query, e.g. 'SELECT count(*) FROM TransactionError FACET error.message SINCE 24 HOURS AGO'"),
    }),
    execute: async ({ newRelicApiKey, accountId, nrqlQuery }) =>
        nerdgraph(newRelicApiKey, `query { ${nrqlQueryObject(accountId, nrqlQuery)} }`, undefined, 'query error data'),
});

export const queryExampleReadQuery = tool({
    description:
        'Executes any raw GraphQL read query against NerdGraph. Use for data not covered by other tools; pass variables separately.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        query: z.string().describe("GraphQL query, e.g. '{ actor { user { name email } } }'"),
        variables: z.record(z.any()).optional().describe('Query variables, e.g. {accountId: 123456}'),
    }),
    execute: async ({ newRelicApiKey, query, variables }) =>
        nerdgraph(newRelicApiKey, query.startsWith('query') || query.startsWith('mutation') ? query : `query { ${query} }`, variables, 'execute GraphQL query'),
});

export const searchEntities = tool({
    description:
        'Searches New Relic entities by name/type/domain (up to 200 per page). Use to find GUIDs for tagging, workloads, or deployments. Provide raw query OR queryBuilder, not both.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        query: z.string().optional().describe("Search string, e.g. \"domain = 'APM' and type = 'APPLICATION'\""),
        domain: z.string().optional().describe("Builder: domain filter, e.g. 'APM', 'BROWSER', 'SYNTH', 'INFRA'"),
        type: z.string().optional().describe("Builder: entity type, e.g. 'APPLICATION', 'MONITOR', 'HOST'"),
        infrastructureIntegrationType: z.string().optional().describe('Builder: infra integration type, e.g. AWS_RDS_DB_INSTANCE'),
        cursor: z.string().optional().describe('nextCursor from a previous page'),
    }),
    execute: async ({ newRelicApiKey, query, domain, type, infrastructureIntegrationType, cursor }) => {
        if (query && (domain || type || infrastructureIntegrationType)) {
            return { error: 'Provide either query or queryBuilder fields (domain/type), not both' };
        }
        const searchArgs: string[] = [];
        if (query) searchArgs.push(`query: ${JSON.stringify(query)}`);
        else {
            const qb: string[] = [];
            if (domain) qb.push(`domain: ${JSON.stringify(domain)}`);
            if (type) qb.push(`type: ${JSON.stringify(type)}`);
            if (infrastructureIntegrationType) qb.push(`infrastructureIntegrationType: ${JSON.stringify(infrastructureIntegrationType)}`);
            if (qb.length) searchArgs.push(`queryBuilder: { ${qb.join(', ')} }`);
        }
        return nerdgraph(
            newRelicApiKey,
            `query($cursor: String) { actor { entitySearch(${searchArgs.join(', ')}) { query results(cursor: $cursor) { nextCursor entities { guid name entityType domainType accountId tags { key values } } } } } }`,
            { cursor: cursor ?? null },
            'search entities',
        );
    },
});

export const fetchRulesCollection = tool({
    description:
        'Fetches rules/elements from a Scorecard collection by collection ID. Use cursor pagination via nextCursor.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        collectionId: z.string().describe('Scorecard collection ID'),
        cursor: z.string().optional().describe('nextCursor from a previous page'),
    }),
    execute: async ({ newRelicApiKey, collectionId, cursor }) =>
        nerdgraph(
            newRelicApiKey,
            `query($collectionId: [ID!]!, $cursor: String) { actor { entityManagement { collectionElements(collectionIds: $collectionId, cursor: $cursor) { items { id name type } nextCursor } } } }`,
            { collectionId: [collectionId], cursor: cursor ?? null },
            'fetch rules collection',
        ),
});

export const fetchYourOrgId = tool({
    description:
        'Returns the organization ID and name for the API key owner. Takes no inputs — run first when the org ID is unknown.',
    inputSchema: z.object({ newRelicApiKey: newRelicApiKeyField }),
    execute: async ({ newRelicApiKey }) =>
        nerdgraph(newRelicApiKey, 'query { actor { organization { id name } } }', undefined, 'fetch organization ID'),
});

export const queryCloudProviders = tool({
    description:
        'Lists cloud integration providers (AWS, GCP, Azure) configured for an account. Use before linking accounts or configuring integrations.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        accountId: accountIdField('Account ID to query cloud providers for'),
    }),
    execute: async ({ newRelicApiKey, accountId }) =>
        nerdgraph(
            newRelicApiKey,
            `query($accountId: Int!) { actor { account(id: $accountId) { cloud { providers { id name slug } } } } }`,
            { accountId },
            'query cloud providers',
        ),
});
