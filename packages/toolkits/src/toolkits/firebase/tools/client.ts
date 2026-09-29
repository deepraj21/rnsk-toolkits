// @ts-nocheck
import { createSign } from 'node:crypto';

export interface FirebaseCredentials {
  projectId: string;
  serviceAccountKey: string;
  databaseUrl?: string;
}

export function parseFirebaseCredentials(firebaseCredentials: string): FirebaseCredentials {
  let parsed: Partial<FirebaseCredentials>;
  try {
    parsed = JSON.parse(firebaseCredentials);
  } catch {
    throw new Error('Firebase credentials must be JSON with projectId and serviceAccountKey');
  }
  if (!parsed.projectId || !parsed.serviceAccountKey) {
    throw new Error(
      'Firebase credentials must include projectId and serviceAccountKey (service account JSON)',
    );
  }
  return {
    projectId: parsed.projectId,
    serviceAccountKey: parsed.serviceAccountKey,
    databaseUrl: parsed.databaseUrl,
  };
}

function serviceAccountKeyJson(firebaseCredentials: string): {
  client_email: string;
  private_key: string;
} {
  const { serviceAccountKey } = parseFirebaseCredentials(firebaseCredentials);
  const key = JSON.parse(serviceAccountKey);
  if (!key.client_email || !key.private_key) {
    throw new Error(
      'serviceAccountKey must be a service account JSON with client_email and private_key',
    );
  }
  return key;
}

const tokenCache = new Map<string, { token: string; expiresAt: number }>();

/** Mint a Google OAuth2 access token from the service account key (JWT bearer flow, no new deps). */
export async function mintAccessToken(firebaseCredentials: string): Promise<string> {
  const cacheKey = firebaseCredentials.slice(0, 64);
  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;

  const { client_email, private_key } = serviceAccountKeyJson(firebaseCredentials);
  const now = Math.floor(Date.now() / 1000);
  const b64 = (obj: object) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const header = b64({ alg: 'RS256', typ: 'JWT' });
  const claims = b64({
    iss: client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  });
  const signature = createSign('RSA-SHA256')
    .update(`${header}.${claims}`)
    .sign(private_key, 'base64url');
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${header}.${claims}.${signature}`,
    }).toString(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) {
    throw new Error(`Failed to mint access token: ${JSON.stringify(data)}`);
  }
  tokenCache.set(cacheKey, {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  });
  return data.access_token;
}

export interface FbRequestOptions {
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  /** Pass false for endpoints using ?access_token= instead (Realtime Database). */
  bearer?: boolean;
}

export async function fbRequest(
  firebaseCredentials: string,
  url: string,
  options?: FbRequestOptions,
): Promise<any> {
  const u = new URL(url);
  if (options?.query) {
    for (const [k, v] of Object.entries(options.query)) {
      if (v !== undefined) u.searchParams.set(k, String(v));
    }
  }
  const headers: Record<string, string> = { ...(options?.headers ?? {}) };
  if (options?.bearer !== false) {
    const token = await mintAccessToken(firebaseCredentials);
    headers.Authorization = `Bearer ${token}`;
  }
  let body: string | undefined;
  if (options?.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }
  const response = await fetch(u.toString(), { method: options?.method ?? 'GET', headers, body });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    return { error: 'Firebase request failed', status: response.status, details: data };
  }
  return data;
}

export function getProjectId(firebaseCredentials: string): string {
  return parseFirebaseCredentials(firebaseCredentials).projectId;
}

export function getDatabaseUrl(firebaseCredentials: string): string {
  const { projectId, databaseUrl } = parseFirebaseCredentials(firebaseCredentials);
  if (databaseUrl) return databaseUrl.replace(/\/+$/, '');
  return `https://${projectId}-default-rtdb.firebaseio.com`;
}

/** Plain JSON -> Firestore REST Value. */
export function encodeValue(value: any): any {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encodeValue) } };
  if (typeof value === 'object') {
    if (value.__timestamp) return { timestampValue: value.__timestamp };
    if (value.__bytes) return { bytesValue: value.__bytes };
    if (value.__reference) return { referenceValue: value.__reference };
    if (value.__geoPoint) {
      return {
        geoPointValue: {
          latitude: value.__geoPoint.latitude,
          longitude: value.__geoPoint.longitude,
        },
      };
    }
    const fields: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) fields[k] = encodeValue(v);
    return { mapValue: { fields } };
  }
  return { stringValue: String(value) };
}

/** Firestore REST Value -> plain JSON. */
export function decodeValue(value: any): any {
  if (!value || typeof value !== 'object') return value;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('timestampValue' in value) return value.timestampValue;
  if ('bytesValue' in value) return value.bytesValue;
  if ('referenceValue' in value) return value.referenceValue;
  if ('geoPointValue' in value) return value.geoPointValue;
  if ('arrayValue' in value) return (value.arrayValue.values ?? []).map(decodeValue);
  if ('mapValue' in value) {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value.mapValue.fields ?? {})) out[k] = decodeValue(v);
    return out;
  }
  return value;
}

export function decodeDocument(doc: any): any {
  if (!doc || doc.error) return doc;
  const out: any = { name: doc.name, createTime: doc.createTime, updateTime: doc.updateTime };
  out.fields = decodeValue({ mapValue: { fields: doc.fields ?? {} } });
  return out;
}
