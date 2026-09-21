// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { infraApi, newRelicApiKeyField, restV2 } from './client.js';

const policyIdField = z.number().int().positive().describe('Policy ID the condition belongs to');

const thresholdTerm = (durationType: 'string' | 'int') =>
    z.object({
        duration: (durationType === 'string' ? z.string() : z.number().int().min(5).max(120)).describe('Minutes threshold must be breached (5-120)'),
        operator: z.enum(['above', 'below', 'equal']),
        priority: z.enum(['critical', 'warning']).describe('At least one term must be critical'),
        threshold: z.string().describe("Numeric string >= 0, e.g. '1.0'"),
        timeFunction: z.enum(['all', 'any']).describe('all: entire duration; any: at least once'),
    });

// ---- External service conditions (APM/mobile external calls) ----

export const createExternalServiceCondition = tool({
    description: 'Creates an external-service condition (response time/throughput of external calls from APM apps). URL without protocol.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        policyId: policyIdField,
        type: z.enum(['apm_external_service']).describe("Must be 'apm_external_service'"),
        name: z.string().describe('Condition name, unique within the policy'),
        entities: z.array(z.number().int()).min(1).describe('Application IDs to monitor'),
        metric: z.enum(['response_time_average', 'response_time_minimum', 'response_time_maximum', 'throughput']),
        externalServiceUrl: z.string().describe("Monitored host, e.g. 'api.example.com' (no protocol)"),
        terms: z.array(thresholdTerm('int')).min(1),
        enabled: z.boolean().optional().describe('Actively monitoring (default true)'),
        runbookUrl: z.string().optional(),
    }),
    execute: async ({ newRelicApiKey, policyId, ...condition }) =>
        restV2(newRelicApiKey, 'POST', `/alerts_external_service_conditions/policies/${policyId}.json`, { body: { external_service_condition: { enabled: true, ...condition } } }, 'create external service condition'),
});

export const updateExternalServiceCondition = tool({
    description: 'Updates an external-service condition (thresholds, entities, metric). Only provided fields change.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        conditionId: z.number().int().positive().describe('Condition ID to update'),
        name: z.string().optional(),
        type: z.enum(['apm_external_service']).optional(),
        entities: z.array(z.number().int()).min(1).optional(),
        metric: z.enum(['response_time_average', 'response_time_minimum', 'response_time_maximum', 'throughput']).optional(),
        externalServiceUrl: z.string().optional(),
        terms: z.array(thresholdTerm('int')).min(1).optional(),
        enabled: z.boolean().optional(),
        runbookUrl: z.string().optional(),
    }),
    execute: async ({ newRelicApiKey, conditionId, ...condition }) =>
        restV2(newRelicApiKey, 'PUT', `/alerts_external_service_conditions/${conditionId}.json`, { body: { external_service_condition: condition } }, 'update external service condition'),
});

export const deleteExternalServiceCondition = tool({
    description: 'Deletes an external-service condition after confirming the condition ID.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        conditionId: z.number().int().positive().describe('Condition ID to delete'),
    }),
    execute: async ({ newRelicApiKey, conditionId }) =>
        restV2(newRelicApiKey, 'DELETE', `/alerts_external_service_conditions/${conditionId}.json`, undefined, 'delete external service condition'),
});

export const listExternalServiceConditions = tool({
    description: 'Lists external-service conditions for a policy (existing monitoring configs).',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        policyId: policyIdField,
        page: z.number().int().min(1).optional(),
    }),
    execute: async ({ newRelicApiKey, policyId, page }) =>
        restV2(newRelicApiKey, 'GET', '/alerts_external_service_conditions.json', { query: { policy_id: policyId, page } }, 'list external service conditions'),
});

// ---- Synthetics conditions ----

export const createSyntheticsAlertCondition = tool({
    description: 'Creates a synthetics condition alerting on monitor failures/performance. Monitor UUID must already exist.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        policyId: policyIdField,
        syntheticsCondition: z.object({
            name: z.string().describe('Condition name, unique within the policy'),
            monitorId: z.string().describe('Synthetics monitor UUID to watch'),
            enabled: z.boolean().optional().describe('Active immediately (default true)'),
            runbookUrl: z.string().optional(),
        }).describe('Synthetics condition configuration'),
    }),
    execute: async ({ newRelicApiKey, policyId, syntheticsCondition }) =>
        restV2(newRelicApiKey, 'POST', `/alerts_synthetics_conditions/policies/${policyId}.json`, { body: { synthetics_condition: { enabled: true, ...syntheticsCondition } } }, 'create synthetics condition'),
});

export const updateSyntheticsAlertCondition = tool({
    description: 'Updates a synthetics condition (name, enabled, runbook). monitor_id is required by the API even for updates.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        conditionId: z.number().int().describe('Condition ID to update'),
        syntheticsCondition: z.object({
            monitorId: z.string().describe('Monitor UUID (required, resend current value)'),
            name: z.string().optional(),
            enabled: z.boolean().optional(),
            runbookUrl: z.string().optional(),
        }).describe('Fields to update'),
    }),
    execute: async ({ newRelicApiKey, conditionId, syntheticsCondition }) =>
        restV2(newRelicApiKey, 'PUT', `/alerts_synthetics_conditions/${conditionId}.json`, { body: { synthetics_condition: syntheticsCondition } }, 'update synthetics condition'),
});

export const deleteSyntheticsCondition = tool({
    description: 'Deletes a synthetics alert condition after confirming the condition ID.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        conditionId: z.number().int().describe('Condition ID to delete'),
    }),
    execute: async ({ newRelicApiKey, conditionId }) =>
        restV2(newRelicApiKey, 'DELETE', `/alerts_synthetics_conditions/${conditionId}.json`, undefined, 'delete synthetics condition'),
});

export const listSyntheticsConditions = tool({
    description: 'Lists synthetics conditions for a policy with their monitor bindings.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        policyId: policyIdField,
        page: z.number().int().min(1).optional(),
    }),
    execute: async ({ newRelicApiKey, policyId, page }) =>
        restV2(newRelicApiKey, 'GET', '/alerts_synthetics_conditions.json', { query: { policy_id: policyId, page } }, 'list synthetics conditions'),
});

// ---- Location failure (multi-location) conditions ----

const locationTerm = z.object({
    priority: z.enum(['critical', 'warning']),
    threshold: z.number().int().min(1).describe('Failing locations triggering the alert'),
});

export const createLocationFailureCondition = tool({
    description: 'Creates a multi-location failure condition alerting when N locations fail simultaneously. Entities are monitor UUIDs.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        policyId: policyIdField,
        name: z.string().describe('Condition name, unique within the policy'),
        entities: z.array(z.string()).min(1).describe('Synthetics monitor UUIDs to watch'),
        terms: z.array(locationTerm).min(1),
        enabled: z.boolean().optional().describe('Actively monitoring (default true)'),
        runbookUrl: z.string().optional(),
        violationTimeLimitSeconds: z.number().int().min(300).max(2592000).optional().describe('Auto-close seconds (default 86400)'),
    }),
    execute: async ({ newRelicApiKey, policyId, ...condition }) =>
        restV2(newRelicApiKey, 'POST', `/alerts_location_failure_conditions/policies/${policyId}.json`, { body: { location_failure_condition: { enabled: true, violation_time_limit_seconds: 86400, ...condition } } }, 'create location failure condition'),
});

export const updateLocationFailureCondition = tool({
    description: 'Updates a location-failure condition (name, entities, terms, limits). Only provided fields change.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        conditionId: z.number().int().positive().describe('Condition ID to update'),
        name: z.string().optional(),
        entities: z.array(z.string()).min(1).optional(),
        terms: z.array(locationTerm).min(1).optional(),
        enabled: z.boolean().optional(),
        runbookUrl: z.string().optional(),
        violationTimeLimitSeconds: z.number().int().min(300).max(2592000).optional(),
    }),
    execute: async ({ newRelicApiKey, conditionId, ...condition }) =>
        restV2(newRelicApiKey, 'PUT', `/alerts_location_failure_conditions/${conditionId}.json`, { body: { location_failure_condition: condition } }, 'update location failure condition'),
});

export const deleteLocationFailureCondition = tool({
    description: 'Deletes a location-failure condition after confirming the condition ID.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        conditionId: z.number().int().positive().describe('Condition ID to delete'),
    }),
    execute: async ({ newRelicApiKey, conditionId }) =>
        restV2(newRelicApiKey, 'DELETE', `/alerts_location_failure_conditions/${conditionId}.json`, undefined, 'delete location failure condition'),
});

export const listLocationFailureConditions = tool({
    description: 'Lists multi-location failure conditions for a policy.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        policyId: policyIdField,
        page: z.number().int().min(1).optional(),
    }),
    execute: async ({ newRelicApiKey, policyId, page }) =>
        restV2(newRelicApiKey, 'GET', `/alerts_location_failure_conditions/policies/${policyId}.json`, { query: { page } }, 'list location failure conditions'),
});

// ---- Infrastructure conditions (infra-api host) ----

const infraThreshold = z.object({
    value: z.number().optional().describe('Breach value (omit for host-not-reporting)'),
    durationMinutes: z.number().int().min(1).max(120).describe('Minutes violated before alerting (1-120)'),
    timeFunction: z.enum(['all', 'any']).optional().describe('Metric conditions: all vs any'),
});

const infraFields = {
    name: z.string().optional().describe('Condition name, unique within the policy'),
    type: z.enum(['infra_metric', 'infra_process_running', 'infra_host_not_reporting']).optional(),
    enabled: z.boolean().optional(),
    policyId: z.number().int().positive().optional().describe('Owning policy ID'),
    comparison: z.enum(['above', 'below', 'equal']).optional(),
    eventType: z.string().optional().describe("Metric conditions, e.g. 'SystemSample', 'StorageSample'"),
    selectValue: z.string().optional().describe("Metric, e.g. 'cpuPercent', 'diskUsedPercent'"),
    whereClause: z.string().optional().describe("Host filter, e.g. \"hostname LIKE 'prod-%'\""),
    processWhereClause: z.string().optional().describe("Process filter, e.g. \"commandName = 'java'\" (required for process-running)"),
    criticalThreshold: infraThreshold.optional(),
    warningThreshold: infraThreshold.optional().describe('Metric conditions only'),
    violationCloseTimer: z.number().int().min(0).max(720).optional().describe('Auto-close hours (0,1,2,4,8,12,24,48,72)'),
    runbookUrl: z.string().optional(),
};

export const createInfraCondition = tool({
    description: 'Creates an infrastructure condition (CPU/memory/disk, process-running, host-not-reporting) via the Infrastructure API.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        policyId: z.number().int().positive().describe('Policy ID to attach to'),
        type: z.enum(['infra_metric', 'infra_process_running', 'infra_host_not_reporting']),
        name: z.string(),
        enabled: z.boolean(),
        comparison: z.enum(['above', 'below', 'equal']).optional(),
        eventType: z.string().optional(),
        selectValue: z.string().optional(),
        whereClause: z.string().optional(),
        processWhereClause: z.string().optional(),
        criticalThreshold: infraThreshold.optional(),
        warningThreshold: infraThreshold.optional(),
        violationCloseTimer: z.number().int().min(0).max(720).optional(),
        runbookUrl: z.string().optional(),
    }),
    execute: async ({ newRelicApiKey, ...data }) =>
        infraApi(newRelicApiKey, 'POST', '/alerts/conditions', { data }, 'create infrastructure condition'),
});

export const getInfraCondition = tool({
    description: 'Gets one infrastructure condition (thresholds, filters, status) by ID.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        conditionId: z.string().describe('Infrastructure condition ID'),
    }),
    execute: async ({ newRelicApiKey, conditionId }) =>
        infraApi(newRelicApiKey, 'GET', `/alerts/conditions/${conditionId}`, undefined, 'get infrastructure condition'),
});

export const listInfraConditions = tool({
    description: 'Lists infrastructure conditions for a policy with limit/offset pagination (default 50 per page).',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        policyId: z.number().int().positive().describe('Policy ID to list conditions for'),
        limit: z.number().int().min(1).max(1000).optional().describe('Records per page'),
        offset: z.number().int().min(0).optional().describe('Records to skip'),
    }),
    execute: async ({ newRelicApiKey, policyId, limit, offset }) =>
        infraApi(newRelicApiKey, 'GET', '/alerts/conditions', { query: { policy_id: policyId, limit, offset } }, 'list infrastructure conditions'),
});

export const updateInfraCondition = tool({
    description: 'Updates an infrastructure condition. Only provided fields change; to change type, delete and recreate.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        conditionId: z.number().int().positive().describe('Condition ID to update'),
        ...infraFields,
    }),
    execute: async ({ newRelicApiKey, conditionId, ...data }) =>
        infraApi(newRelicApiKey, 'PUT', `/alerts/conditions/${conditionId}`, { data }, 'update infrastructure condition'),
});

export const deleteInfraCondition = tool({
    description: 'Deletes an infrastructure condition after confirming the condition ID.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        conditionId: z.string().describe('Infrastructure condition ID to delete'),
    }),
    execute: async ({ newRelicApiKey, conditionId }) =>
        infraApi(newRelicApiKey, 'DELETE', `/alerts/conditions/${conditionId}`, undefined, 'delete infrastructure condition'),
});

// ---- APM/app conditions, entity membership, violations ----

export const getAlertConditions = tool({
    description: 'Lists APM/browser/mobile conditions for a policy. Use after confirming the policy ID.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        policyId: z.number().int().describe('Policy ID to list conditions for'),
    }),
    execute: async ({ newRelicApiKey, policyId }) =>
        restV2(newRelicApiKey, 'GET', '/alerts_conditions.json', { query: { policy_id: policyId } }, 'list alert conditions'),
});

export const removeEntityCondition = tool({
    description: 'Removes an entity (app/browser/mobile) from an alert condition. A condition must keep at least one entity.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        entityId: z.number().int().positive().describe('Numeric entity ID to remove'),
        entityType: z.string().describe("Entity type, e.g. 'Application', 'MobileApplication', 'BrowserApplication'"),
        conditionId: z.number().int().positive().describe('Condition ID to remove the entity from'),
    }),
    execute: async ({ newRelicApiKey, entityId, entityType, conditionId }) =>
        restV2(newRelicApiKey, 'DELETE', `/alerts_entity_conditions/${entityId}.json`, { query: { entity_type: entityType, condition_id: conditionId } }, 'remove entity from condition'),
});

export const getAlertsViolations = tool({
    description: 'Lists alert violations (current/historical incidents) with date-range and open-only filters.',
    inputSchema: z.object({
        newRelicApiKey: newRelicApiKeyField,
        startDate: z.string().optional().describe("Violations after this ISO-8601 time, e.g. '2024-01-01T00:00:00Z'"),
        endDate: z.string().optional().describe("Violations before this ISO-8601 time, e.g. '2024-12-31T23:59:59Z'"),
        onlyOpen: z.boolean().optional().describe('Only unresolved violations'),
        page: z.number().int().min(1).optional().describe('Result page (1-indexed)'),
    }),
    execute: async ({ newRelicApiKey, startDate, endDate, onlyOpen, page }) =>
        restV2(newRelicApiKey, 'GET', '/alerts_violations.json', { query: { start_date: startDate, end_date: endDate, only_open: onlyOpen, page } }, 'list alert violations'),
});
