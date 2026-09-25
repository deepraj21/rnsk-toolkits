// @ts-nocheck
const ATLASSIAN_API = 'https://api.atlassian.com';

const cloudCache = new Map();

export async function getCloudId(token, hint) {
    if (hint) return hint;
    if (cloudCache.has(token)) return cloudCache.get(token);
    const response = await fetch(`${ATLASSIAN_API}/oauth/token/accessible-resources`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    if (!response.ok) return null;
    const sites = await response.json().catch(() => []);
    const id = Array.isArray(sites) && sites.length > 0 ? sites[0].id : null;
    if (id) cloudCache.set(token, id);
    return id;
}

function withQuery(url, query = {}) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null || value === '') continue;
        if (Array.isArray(value)) {
            if (value.length === 0) continue;
            for (const v of value) {
                if (v === undefined || v === null || v === '') continue;
                params.append(key, String(v));
            }
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

export async function conf(token, { cloudId, path, method = 'GET', query, body }) {
    if (!token) return { error: 'Confluence token is required. Connect Confluence first.' };
    const cid = await getCloudId(token, cloudId);
    if (!cid) return { error: 'Could not determine your Confluence Cloud site. Reconnect Confluence and try again.' };
    const url = withQuery(`${ATLASSIAN_API}/ex/confluence/${cid}/wiki${path}`, query);
    try {
        const response = await fetch(url, {
            method,
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
            body: body !== undefined ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
        });
        if (!response.ok) {
            const details = await parseBody(response).catch(() => ({}));
            return { error: `Confluence API request failed with status ${response.status}`, details };
        }
        if (response.status === 204) return { success: true };
        return await parseBody(response);
    } catch (error) {
        return { error: 'Error calling Confluence API', message: error instanceof Error ? error.message : 'Unknown error' };
    }
}

export async function confBinary(token, { cloudId, path, query }) {
    if (!token) return { error: 'Confluence token is required. Connect Confluence first.' };
    const cid = await getCloudId(token, cloudId);
    if (!cid) return { error: 'Could not determine your Confluence Cloud site. Reconnect Confluence and try again.' };
    const url = withQuery(`${ATLASSIAN_API}/ex/confluence/${cid}/wiki${path}`, query);
    try {
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}`, Accept: '*/*' },
        });
        if (!response.ok) {
            const details = await response.text().catch(() => '');
            return { error: `Confluence API request failed with status ${response.status}`, details: details.slice(0, 2000) };
        }
        const buffer = Buffer.from(await response.arrayBuffer());
        return {
            data: buffer,
            contentType: response.headers.get('content-type') ?? undefined,
            contentLength: Number(response.headers.get('content-length') ?? buffer.length),
        };
    } catch (error) {
        return { error: 'Error calling Confluence API', message: error instanceof Error ? error.message : 'Unknown error' };
    }
}

/** Resolve a numeric space ID or space key to a numeric space ID. */
export async function resolveSpaceId(token, cloudId, spaceIdOrKey) {
    if (spaceIdOrKey === undefined || spaceIdOrKey === null || spaceIdOrKey === '') return undefined;
    if (/^\d+$/.test(String(spaceIdOrKey))) return String(spaceIdOrKey);
    const data = await conf(token, { cloudId, path: '/api/v2/spaces', query: { keys: [spaceIdOrKey], limit: 1 } });
    const hit = data?.results?.[0];
    return hit?.id !== undefined ? String(hit.id) : null;
}

/** Parse a JSON-string property value, falling back to the raw string. */
export function parseJsonValue(value) {
    if (value === undefined) return undefined;
    if (typeof value !== 'string') return value;
    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
}

export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export { ATLASSIAN_API };
