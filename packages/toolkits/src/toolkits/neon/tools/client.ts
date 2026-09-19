// @ts-nocheck
const NEON_API = 'https://console.neon.tech/api/v2';

function withQuery(url, query = {}) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null || value === '') continue;
        if (Array.isArray(value)) {
            if (value.length === 0) continue;
            params.append(key, value.join(','));
        } else {
            params.append(key, String(value));
        }
    }
    const qs = params.toString();
    return qs ? `${url}?${qs}` : url;
}

async function parseBody(response) {
    const text = await response.text();
    if (!text) return { success: true };
    try {
        return JSON.parse(text);
    } catch {
        return { raw: text };
    }
}

export async function neon(apiKey, { path, method = 'GET', query, body }) {
    if (!apiKey) return { error: 'Neon API key is required. Connect Neon first.' };
    const url = withQuery(`${NEON_API}${path}`, query);
    try {
        const response = await fetch(url, {
            method,
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
        if (!response.ok) {
            const details = await parseBody(response).catch(() => ({}));
            return { error: `Neon API request failed with status ${response.status}`, details };
        }
        if (response.status === 204) return { success: true };
        return await parseBody(response);
    } catch (error) {
        return { error: 'Error calling Neon API', message: error instanceof Error ? error.message : 'Unknown error' };
    }
}

export function setNested(obj, dotted, value) {
    const parts = dotted.split('.');
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        if (cur[parts[i]] === undefined || typeof cur[parts[i]] !== 'object') cur[parts[i]] = {};
        cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = value;
    return obj;
}

export { NEON_API };
