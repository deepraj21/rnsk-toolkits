// @ts-nocheck
import { createOtlpV1Logs } from './create-otlp-v1-logs.js';
import { getDistributorHaTracker } from './get-distributor-ha-tracker.js';
import { getHealth } from './get-health.js';
import { getIndexGatewayRing } from './get-index-gateway-ring.js';
import { getOverridesExporterRing } from './get-overrides-exporter-ring.js';
import { getRulerRing } from './get-ruler-ring.js';
import { getStatus } from './get-status.js';
import { getStoreGatewayTenants } from './get-store-gateway-tenants.js';
import { postAcs } from './post-acs.js';
import { queryPublicDashboard } from './query-public-dashboard.js';
import { retrieveJwks } from './retrieve-jwks.js';

export {
    createOtlpV1Logs,
    getDistributorHaTracker,
    getHealth,
    getIndexGatewayRing,
    getOverridesExporterRing,
    getRulerRing,
    getStatus,
    getStoreGatewayTenants,
    postAcs,
    queryPublicDashboard,
    retrieveJwks,
};

export const grafanaTools = [
    {
        name: 'grafanaCreateOtlpV1Logs',
        description:
            'Send OpenTelemetry Protocol (OTLP) v1 logs to Grafana Loki for ingestion and storage.',
        tool: createOtlpV1Logs,
        requiredAuth: 'grafanaCredentials' as const,
        scope: 'write' as const,
    },
    {
        name: 'grafanaGetDistributorHaTracker',
        description:
            'Retrieve distributor HA tracker status showing which replica is elected leader for each Prometheus HA cluster.',
        tool: getDistributorHaTracker,
        requiredAuth: 'grafanaCredentials' as const,
        scope: 'read' as const,
    },
    {
        name: 'grafanaGetHealth',
        description:
            'Check Grafana server health and database connectivity. Returns ok if the web server is running and can access the database.',
        tool: getHealth,
        requiredAuth: 'grafanaCredentials' as const,
        scope: 'read' as const,
    },
    {
        name: 'grafanaGetIndexGatewayRing',
        description:
            'Retrieve index gateway hash ring status including state, health, and last heartbeat of each node.',
        tool: getIndexGatewayRing,
        requiredAuth: 'grafanaCredentials' as const,
        scope: 'read' as const,
    },
    {
        name: 'grafanaGetOverridesExporterRing',
        description:
            'Retrieve overrides-exporter hash ring status including state, health, and last heartbeat of each node.',
        tool: getOverridesExporterRing,
        requiredAuth: 'grafanaCredentials' as const,
        scope: 'read' as const,
    },
    {
        name: 'grafanaGetRulerRing',
        description:
            'Retrieve ruler hash ring status including state, health, and last heartbeat of each ruler node.',
        tool: getRulerRing,
        requiredAuth: 'grafanaCredentials' as const,
        scope: 'read' as const,
    },
    {
        name: 'grafanaGetStatus',
        description: 'Check if a valid Grafana Enterprise license is available on the instance.',
        tool: getStatus,
        requiredAuth: 'grafanaCredentials' as const,
        scope: 'read' as const,
    },
    {
        name: 'grafanaGetStoreGatewayTenants',
        description:
            'Retrieve store gateway tenants that have blocks stored in the configured storage.',
        tool: getStoreGatewayTenants,
        requiredAuth: 'grafanaCredentials' as const,
        scope: 'read' as const,
    },
    {
        name: 'grafanaPostAcs',
        description:
            'Perform SAML Assertion Consumer Service (ACS) operation when processing authentication responses from an identity provider.',
        tool: postAcs,
        requiredAuth: 'grafanaCredentials' as const,
        scope: 'write' as const,
    },
    {
        name: 'grafanaQueryPublicDashboard',
        description:
            'Query a panel on a public Grafana dashboard to retrieve time-series data and metrics for a specified time range.',
        tool: queryPublicDashboard,
        requiredAuth: 'grafanaCredentials' as const,
        scope: 'read' as const,
    },
    {
        name: 'grafanaRetrieveJwks',
        description:
            'Retrieve JSON Web Key Set (JWKS) with all public keys that can be used to verify JWT tokens.',
        tool: retrieveJwks,
        requiredAuth: 'grafanaCredentials' as const,
        scope: 'read' as const,
    },
];
