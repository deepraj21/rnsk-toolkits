export interface KubernetesCredentials {
  clusterUrl: string;
  bearerToken: string;
  defaultNamespace?: string;
}

/** kubernetesCredentials is the JSON blob injected by the framework under the manifest's tokenField. */
export function parseKubernetesCredentials(kubernetesCredentials: string): KubernetesCredentials {
  let parsed: Partial<KubernetesCredentials>;
  try {
    parsed = JSON.parse(kubernetesCredentials) as Partial<KubernetesCredentials>;
  } catch {
    throw new Error('Kubernetes credentials must be a JSON object with clusterUrl and bearerToken');
  }
  if (!parsed.clusterUrl || !parsed.bearerToken) {
    throw new Error('Kubernetes credentials must include clusterUrl and bearerToken');
  }
  return {
    clusterUrl: parsed.clusterUrl.replace(/\/+$/, ''),
    bearerToken: parsed.bearerToken,
    defaultNamespace: parsed.defaultNamespace,
  };
}

/** Namespace for single-object operations — explicit param wins, then stored default, then 'default'. */
export function resolveNamespace(kubernetesCredentials: string, namespace?: string): string {
  if (namespace) return namespace;
  try {
    return parseKubernetesCredentials(kubernetesCredentials).defaultNamespace || 'default';
  } catch {
    return 'default';
  }
}

export type K8sMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface K8sRequestOptions {
  method?: K8sMethod;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  patchType?: 'merge' | 'strategic' | 'json';
  responseType?: 'json' | 'text';
}

const PATCH_TYPES = {
  merge: 'application/merge-patch+json',
  strategic: 'application/strategic-merge-patch+json',
  json: 'application/json-patch+json',
} as const;

export async function k8sRequest(
  kubernetesCredentials: string,
  path: string,
  options: K8sRequestOptions = {},
): Promise<unknown> {
  const creds = parseKubernetesCredentials(kubernetesCredentials);
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined) params.set(key, String(value));
  }
  const query = params.size > 0 ? `?${params.toString()}` : '';
  const headers: Record<string, string> = {
    Authorization: `Bearer ${creds.bearerToken}`,
    Accept: 'application/json',
  };
  if (options.body !== undefined) {
    headers['Content-Type'] =
      options.method === 'PATCH' ? PATCH_TYPES[options.patchType ?? 'merge'] : 'application/json';
  }
  const response = await fetch(`${creds.clusterUrl}${path}${query}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(
      `Kubernetes request failed: ${options.method ?? 'GET'} ${path} -> ${response.status} ${text.slice(0, 2000)}`,
    );
  }
  if (options.responseType === 'text') return text;
  if (!text) return { status: response.status };
  try {
    return JSON.parse(text);
  } catch {
    return { status: response.status, raw: text };
  }
}

/** Collection path for a resource type. Empty group = core (/api/v1). Omit namespace to list across all namespaces. */
export function collectionPath(group: string, version: string, resource: string, namespace?: string): string {
  const prefix = group ? `/apis/${group}/${version}` : `/api/${version}`;
  return namespace ? `${prefix}/namespaces/${encodeURIComponent(namespace)}/${resource}` : `${prefix}/${resource}`;
}

/** Single-object path for a resource instance. */
export function itemPath(
  group: string,
  version: string,
  resource: string,
  name: string,
  namespace?: string,
): string {
  return `${collectionPath(group, version, resource, namespace)}/${encodeURIComponent(name)}`;
}

export function missingCredentialsError() {
  return { error: 'Kubernetes credentials are required. Connect Kubernetes first.' };
}
