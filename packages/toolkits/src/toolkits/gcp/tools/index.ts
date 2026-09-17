import { gcpListComputeInstances } from './compute/list-instances.js';
import { gcpGetComputeInstance } from './compute/get-instance.js';
import { gcpStartComputeInstance } from './compute/start-instance.js';
import { gcpStopComputeInstance } from './compute/stop-instance.js';
import { gcpGetMonitoringMetrics } from './monitoring/get-metrics.js';
import { gcpListMonitoringMetricDescriptors } from './monitoring/list-metric-descriptors.js';

export {
  gcpListComputeInstances,
  gcpGetComputeInstance,
  gcpStartComputeInstance,
  gcpStopComputeInstance,
  gcpGetMonitoringMetrics,
  gcpListMonitoringMetricDescriptors,
};

export const gcpTools = [
  {
    name: 'gcpListComputeInstances',
    description: 'List Compute Engine instances, optionally filtered by zone.',
    tool: gcpListComputeInstances,
    requiredAuth: 'gcpCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'gcpGetComputeInstance',
    description: 'Get details about a specific Compute Engine instance.',
    tool: gcpGetComputeInstance,
    requiredAuth: 'gcpCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'gcpStartComputeInstance',
    description: 'Start a stopped Compute Engine instance.',
    tool: gcpStartComputeInstance,
    requiredAuth: 'gcpCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'gcpStopComputeInstance',
    description: 'Stop a running Compute Engine instance.',
    tool: gcpStopComputeInstance,
    requiredAuth: 'gcpCredentials' as const,
    scope: 'write' as const,
  },
  {
    name: 'gcpGetMonitoringMetrics',
    description: 'Retrieve Cloud Monitoring time series data for a metric filter.',
    tool: gcpGetMonitoringMetrics,
    requiredAuth: 'gcpCredentials' as const,
    scope: 'read' as const,
  },
  {
    name: 'gcpListMonitoringMetricDescriptors',
    description: 'List available Cloud Monitoring metric descriptors.',
    tool: gcpListMonitoringMetricDescriptors,
    requiredAuth: 'gcpCredentials' as const,
    scope: 'read' as const,
  },
];
