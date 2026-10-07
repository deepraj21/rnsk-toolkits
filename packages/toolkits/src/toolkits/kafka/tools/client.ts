// @ts-nocheck
// Shared helpers for the Kafka (Confluent) toolkit.
// Endpoint paths verified against the official Confluent docs and OpenAPI specs:
//   Cluster (Kafka REST v3):  {clusterRestUrl}/kafka/v3/clusters/{clusterId}/...
//     spec: confluentinc/kafka-rest api/v3/openapi.yaml
//   Control plane:            https://api.confluent.cloud/{org,cmk,iam}/v2/...
//   Schema Registry:          {schemaRegistryUrl}/{subjects,schemas,config,compatibility}/...
// Auth everywhere is HTTP Basic (API key = username, secret = password).

export interface KafkaCredentials {
  clusterRestUrl?: string;
  clusterId?: string;
  apiKey?: string;
  apiSecret?: string;
  cloudApiKey?: string;
  cloudApiSecret?: string;
  schemaRegistryUrl?: string;
  schemaRegistryApiKey?: string;
  schemaRegistryApiSecret?: string;
}

export function parseKafkaCredentials(kafkaCredentials: string): KafkaCredentials {
  let parsed: KafkaCredentials;
  try {
    parsed = JSON.parse(kafkaCredentials) as KafkaCredentials;
  } catch {
    throw new Error(
      'Kafka credentials must be JSON like {"clusterRestUrl":"https://pkc-xxx.confluent.cloud:443","clusterId":"lkc-xxx","apiKey":"...","apiSecret":"..."}',
    );
  }
  return parsed ?? {};
}

function stripTrailing(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

function basicAuth(key?: string, secret?: string): string {
  return `Basic ${Buffer.from(`${key ?? ''}:${secret ?? ''}`).toString('base64')}`;
}

export interface KafkaResponse {
  ok: boolean;
  status: number;
  data: any;
}

function appendQuery(url: URL, query?: Record<string, unknown>) {
  if (!query) return;
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined && item !== null) url.searchParams.append(key, String(item));
      }
      continue;
    }
    url.searchParams.set(key, String(value));
  }
}

async function doFetch(
  url: string,
  auth: string,
  options?: {
    method?: string;
    query?: Record<string, unknown>;
    body?: unknown;
    contentType?: string;
  },
): Promise<KafkaResponse> {
  const full = new URL(url);
  appendQuery(full, options?.query);
  const headers: Record<string, string> = { Accept: 'application/json', Authorization: auth };
  const fetchOptions: RequestInit = { method: options?.method ?? 'GET', headers };
  if (options?.body !== undefined) {
    fetchOptions.body = JSON.stringify(options.body);
    headers['Content-Type'] = options.contentType ?? 'application/json';
  }
  try {
    const response = await fetch(full.toString(), fetchOptions);
    const data = await response.json().catch(() => null);
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return {
      ok: false,
      status: 502,
      data: { error: error instanceof Error ? error.message : 'Request failed' },
    };
  }
}

function bad(status: number, error: string): KafkaResponse {
  return { ok: false, status, data: { error } };
}

/** Call the Kafka Cluster REST API v3 on the cluster REST endpoint. */
export async function kafkaClusterRequest(
  kafkaCredentials: string,
  path: string,
  options?: { method?: string; query?: Record<string, unknown>; body?: unknown },
): Promise<KafkaResponse> {
  let credentials: KafkaCredentials;
  try {
    credentials = parseKafkaCredentials(kafkaCredentials);
  } catch (error) {
    return bad(400, error instanceof Error ? error.message : 'Invalid Kafka credentials');
  }
  const { clusterRestUrl, clusterId, apiKey, apiSecret } = credentials;
  if (!clusterRestUrl || !clusterId) {
    return bad(
      401,
      'Cluster credentials are required: {"clusterRestUrl":"https://pkc-xxx.<region>.<provider>.confluent.cloud:443","clusterId":"lkc-xxx","apiKey":"...","apiSecret":"..."} (REST endpoint + ID from Cluster Settings, Kafka API key with access to the cluster).',
    );
  }
  if (!apiKey) return bad(401, 'Kafka API key is required. Connect Kafka first.');
  return doFetch(
    `${stripTrailing(clusterRestUrl)}/kafka/v3/clusters/${clusterId}${path.startsWith('/') ? path : `/${path}`}`,
    basicAuth(apiKey, apiSecret),
    options,
  );
}

/** Call the Kafka REST API v3 at the endpoint root (no cluster ID), e.g. '/clusters'. */
export async function kafkaRootRequest(
  kafkaCredentials: string,
  path: string,
  options?: { method?: string; query?: Record<string, unknown>; body?: unknown },
): Promise<KafkaResponse> {
  let credentials: KafkaCredentials;
  try {
    credentials = parseKafkaCredentials(kafkaCredentials);
  } catch (error) {
    return bad(400, error instanceof Error ? error.message : 'Invalid Kafka credentials');
  }
  const { clusterRestUrl, apiKey, apiSecret } = credentials;
  if (!clusterRestUrl) {
    return bad(
      401,
      'Cluster REST URL is required: {"clusterRestUrl":"https://pkc-xxx.<region>.<provider>.confluent.cloud:443","apiKey":"...","apiSecret":"..."}.',
    );
  }
  if (!apiKey) return bad(401, 'Kafka API key is required. Connect Kafka first.');
  return doFetch(
    `${stripTrailing(clusterRestUrl)}/kafka/v3${path.startsWith('/') ? path : `/${path}`}`,
    basicAuth(apiKey, apiSecret),
    options,
  );
}

/** Call the Confluent Cloud control plane (api.confluent.cloud). */
export async function confluentCloudRequest(
  kafkaCredentials: string,
  path: string,
  options?: { method?: string; query?: Record<string, unknown>; body?: unknown },
): Promise<KafkaResponse> {
  let credentials: KafkaCredentials;
  try {
    credentials = parseKafkaCredentials(kafkaCredentials);
  } catch (error) {
    return bad(400, error instanceof Error ? error.message : 'Invalid Kafka credentials');
  }
  const { cloudApiKey, cloudApiSecret } = credentials;
  if (!cloudApiKey) {
    return bad(
      401,
      'Confluent Cloud API key is required for management calls: add {"cloudApiKey":"...","cloudApiSecret":"..."} (Cloud API key from Confluent Console).',
    );
  }
  return doFetch(
    `https://api.confluent.cloud${path.startsWith('/') ? path : `/${path}`}`,
    basicAuth(cloudApiKey, cloudApiSecret),
    options,
  );
}

/** Call the Schema Registry REST API. */
export async function schemaRegistryRequest(
  kafkaCredentials: string,
  path: string,
  options?: {
    method?: string;
    query?: Record<string, unknown>;
    body?: unknown;
    contentType?: string;
  },
): Promise<KafkaResponse> {
  let credentials: KafkaCredentials;
  try {
    credentials = parseKafkaCredentials(kafkaCredentials);
  } catch (error) {
    return bad(400, error instanceof Error ? error.message : 'Invalid Kafka credentials');
  }
  const { schemaRegistryUrl, schemaRegistryApiKey, schemaRegistryApiSecret } = credentials;
  if (!schemaRegistryUrl) {
    return bad(
      401,
      'Schema Registry credentials are required: add {"schemaRegistryUrl":"https://psrc-xxx.confluent.cloud","schemaRegistryApiKey":"...","schemaRegistryApiSecret":"..."}.',
    );
  }
  if (!schemaRegistryApiKey) {
    return bad(401, 'Schema Registry API key is required. Connect Kafka first.');
  }
  return doFetch(
    `${stripTrailing(schemaRegistryUrl)}${path.startsWith('/') ? path : `/${path}`}`,
    basicAuth(schemaRegistryApiKey, schemaRegistryApiSecret),
    options,
  );
}

export function failedResult(action: string, result: KafkaResponse) {
  return {
    error: action,
    statusCode: result.status,
    details: result.data,
  };
}

export function toKafkaError(error: unknown, action: string) {
  return {
    error: action,
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}
