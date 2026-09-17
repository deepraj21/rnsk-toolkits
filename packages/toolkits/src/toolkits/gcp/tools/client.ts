import { InstancesClient } from '@google-cloud/compute';
import { MetricServiceClient } from '@google-cloud/monitoring';

export interface GcpCredentials {
  projectId: string;
  serviceAccountKey: string;
}

/** gcpCredentials is the JSON blob injected by the framework under the manifest's tokenField. */
export function parseGcpCredentials(gcpCredentials: string): GcpCredentials {
  const parsed = JSON.parse(gcpCredentials) as Partial<GcpCredentials>;
  if (!parsed.projectId || !parsed.serviceAccountKey) {
    throw new Error('GCP credentials must include projectId and serviceAccountKey');
  }
  return { projectId: parsed.projectId, serviceAccountKey: parsed.serviceAccountKey };
}

function clientConfig(gcpCredentials: string): { projectId: string; credentials: object } {
  const { projectId, serviceAccountKey } = parseGcpCredentials(gcpCredentials);
  return { projectId, credentials: JSON.parse(serviceAccountKey) };
}

export function createComputeClient(gcpCredentials: string): InstancesClient {
  return new InstancesClient(clientConfig(gcpCredentials));
}

export function createMonitoringClient(gcpCredentials: string): MetricServiceClient {
  return new MetricServiceClient(clientConfig(gcpCredentials));
}

export function getProjectId(gcpCredentials: string): string {
  return parseGcpCredentials(gcpCredentials).projectId;
}
