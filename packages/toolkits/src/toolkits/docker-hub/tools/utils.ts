// @ts-nocheck

export const DOCKER_HUB_BASE = 'https://hub.docker.com';

export interface DockerHubCredentials {
    username: string;
    personalAccessToken: string;
}

export function parseDockerHubCredentials(raw: string): DockerHubCredentials {
    const parsed = JSON.parse(raw) as Partial<DockerHubCredentials>;
    if (!parsed.username || !parsed.personalAccessToken) {
        throw new Error('Docker Hub credentials must include username and personalAccessToken');
    }

    return {
        username: parsed.username,
        personalAccessToken: parsed.personalAccessToken,
    };
}

let tokenCache: { key: string; token: string; expiresAt: number } | null = null;

async function getAccessToken(credentials: DockerHubCredentials): Promise<string> {
    const cacheKey = `${credentials.username}:${credentials.personalAccessToken.slice(0, 8)}`;
    if (tokenCache && tokenCache.key === cacheKey && tokenCache.expiresAt > Date.now()) {
        return tokenCache.token;
    }

    const response = await fetch(`${DOCKER_HUB_BASE}/v2/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
            identifier: credentials.username,
            secret: credentials.personalAccessToken,
        }),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(data?.message ?? data?.detail ?? 'Failed to authenticate with Docker Hub');
    }

    const token = data?.access_token ?? data?.token;
    if (!token) {
        throw new Error('Docker Hub auth response did not include an access token');
    }

    tokenCache = { key: cacheKey, token, expiresAt: Date.now() + 8 * 60 * 1000 };
    return token;
}

export function buildQueryString(params: Record<string, unknown>): string {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
            search.set(key, String(value));
        }
    }
    const qs = search.toString();
    return qs ? `?${qs}` : '';
}

export async function dockerHubRequest(
    dockerHubCredentials: string,
    path: string,
    options?: {
        method?: string;
        body?: unknown;
        auth?: boolean;
        acceptJson?: boolean;
    },
) {
    const credentials = parseDockerHubCredentials(dockerHubCredentials);
    const url = `${DOCKER_HUB_BASE}${path.startsWith('/') ? path : `/${path}`}`;

    const headers: Record<string, string> = {};
    if (options?.acceptJson !== false) {
        headers.Accept = 'application/json';
    }
    if (options?.body !== undefined) {
        headers['Content-Type'] = 'application/json';
    }

    if (options?.auth !== false) {
        const token = await getAccessToken(credentials);
        headers.Authorization = `Bearer ${token}`;
    }

    const fetchOptions: RequestInit = {
        method: options?.method ?? 'GET',
        headers,
    };

    if (options?.body !== undefined) {
        fetchOptions.body =
            typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
    }

    const response = await fetch(url, fetchOptions);
    const contentType = response.headers.get('content-type') ?? '';

    if (response.status === 204 || response.status === 202) {
        return { ok: response.ok, status: response.status, data: null, contentType };
    }

    if (contentType.includes('application/json')) {
        const data = await response.json().catch(() => null);
        return { ok: response.ok, status: response.status, data, contentType };
    }

    const text = await response.text();
    return { ok: response.ok, status: response.status, data: text, contentType };
}

export const credentialsSchema = {
    dockerHubCredentials: {
        describe:
            'Docker Hub credentials JSON with username and personalAccessToken (PAT from Account Settings)',
    },
};
