// @ts-nocheck
const AURA_API = 'https://api.neo4j.io';
const TOKEN_URL = `${AURA_API}/oauth/token`;

const tokenCache = new Map();

function credentialsOf(neo4jCredentials: string): { clientId: string; clientSecret: string } | null {
    const idx = (neo4jCredentials ?? '').indexOf(':');
    if (idx <= 0) return null;
    return {
        clientId: neo4jCredentials.slice(0, idx),
        clientSecret: neo4jCredentials.slice(idx + 1),
    };
}

async function getAccessToken(neo4jCredentials: string): Promise<string | null> {
    const cached = tokenCache.get(neo4jCredentials);
    if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;
    const creds = credentialsOf(neo4jCredentials);
    if (!creds) return null;
    const basic = Buffer.from(`${creds.clientId}:${creds.clientSecret}`).toString('base64');
    const response = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${basic}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });
    if (!response.ok) return null;
    const data = await response.json().catch(() => null);
    if (!data?.access_token) return null;
    tokenCache.set(neo4jCredentials, {
        token: data.access_token,
        expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
    });
    return data.access_token;
}

export async function auraRequest(
    neo4jCredentials: string | undefined,
    path: string,
    options: { method?: string; query?: Record<string, string | number | boolean | undefined>; body?: unknown } = {},
) {
    if (!neo4jCredentials) {
        return { error: 'Neo4j Aura API credentials are required. Connect Neo4j first.' };
    }
    if (!credentialsOf(neo4jCredentials)) {
        return { error: 'Invalid Neo4j credentials. Expected "clientId:clientSecret". Reconnect Neo4j.' };
    }
    const params = new URLSearchParams();
    if (options.query) {
        for (const [key, value] of Object.entries(options.query)) {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, String(value));
            }
        }
    }
    const qs = params.toString();
    const url = `${AURA_API}${path}${qs ? `?${qs}` : ''}`;
    try {
        const doFetch = async (token: string) =>
            fetch(url, {
                method: options.method ?? 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
            });
        let token = await getAccessToken(neo4jCredentials);
        if (!token) {
            return { error: 'Failed to authenticate with Neo4j Aura API. Check your client ID and secret.' };
        }
        let response = await doFetch(token);
        if (response.status === 401 || response.status === 403) {
            tokenCache.delete(neo4jCredentials);
            token = await getAccessToken(neo4jCredentials);
            if (!token) {
                return { error: 'Failed to authenticate with Neo4j Aura API. Check your client ID and secret.' };
            }
            response = await doFetch(token);
        }
        if (!response.ok) {
            const details = await response.json().catch(() => ({}));
            return { error: `Neo4j Aura API request failed with status ${response.status}`, details };
        }
        if (response.status === 204 || response.status === 202) {
            const text = await response.text();
            if (!text) return { success: true, status: response.status };
            try {
                return JSON.parse(text);
            } catch {
                return { success: true, status: response.status };
            }
        }
        return await response.json();
    } catch (error) {
        return {
            error: 'Error calling Neo4j Aura API',
            message: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
