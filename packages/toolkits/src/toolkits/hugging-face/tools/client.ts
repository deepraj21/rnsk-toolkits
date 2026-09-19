// @ts-nocheck
const HOSTS = {
    HUB: 'https://huggingface.co',
    DS: 'https://datasets-server.huggingface.co',
    ROUTER: 'https://router.huggingface.co',
    AII: 'https://api-inference.huggingface.co',
    IE: 'https://api.endpoints.huggingface.cloud',
};

const UI_PREFIX = { models: '', datasets: 'datasets', spaces: 'spaces' };

export function repoIdOf(namespace, repo, repoId) {
    if (repoId) return repoId;
    if (namespace && repo) return `${namespace}/${repo}`;
    return repo ?? '';
}

export function uiPrefix(repoType) {
    return UI_PREFIX[repoType] ?? '';
}

function authHeaders(token, extra = {}) {
    return { Authorization: `Bearer ${token}`, ...extra };
}

function withQuery(url, query = {}) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
        if (v === undefined || v === null || v === '') continue;
        if (Array.isArray(v)) {
            for (const item of v) params.append(k, String(item));
        } else {
            params.append(k, String(v));
        }
    }
    const qs = params.toString();
    return qs ? `${url}?${qs}` : url;
}

async function parseJsonSafe(response) {
    const text = await response.text();
    if (!text) return {};
    try {
        return JSON.parse(text);
    } catch {
        return { raw: text };
    }
}

/** Standard JSON API call. Returns parsed JSON or { error, details }. */
export async function hfApi(token, { method = 'GET', url, query, body, headers = {} }) {
    if (!token) return { error: 'Hugging Face token is required. Connect Hugging Face first.' };
    try {
        const response = await fetch(withQuery(url, query), {
            method,
            headers: authHeaders(token, { 'Content-Type': 'application/json', ...headers }),
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
        if (!response.ok) {
            const details = await parseJsonSafe(response).catch(() => ({}));
            return { error: `Hugging Face API request failed with status ${response.status}`, details };
        }
        if (response.status === 204) return { success: true };
        return await parseJsonSafe(response);
    } catch (error) {
        return { error: 'Error calling Hugging Face API', message: error instanceof Error ? error.message : 'Unknown error' };
    }
}

/** Resolve-style call: follow redirects manually and return the final URL. */
export async function hfRedirect(token, { url, query, headers = {} }) {
    if (!token) return { error: 'Hugging Face token is required. Connect Hugging Face first.' };
    try {
        const response = await fetch(withQuery(url, query), {
            method: 'GET',
            headers: authHeaders(token, headers),
            redirect: 'manual',
        });
        if (response.status === 301 || response.status === 302 || response.status === 303 || response.status === 307 || response.status === 308) {
            return { url: response.headers.get('location') };
        }
        if (!response.ok) {
            const details = await parseJsonSafe(response).catch(() => ({}));
            return { error: `Hugging Face API request failed with status ${response.status}`, details };
        }
        const contentType = response.headers.get('content-type') ?? '';
        if (contentType.includes('application/json')) return await parseJsonSafe(response);
        return { url: response.url, contentType };
    } catch (error) {
        return { error: 'Error resolving Hugging Face file', message: error instanceof Error ? error.message : 'Unknown error' };
    }
}

/** Plain-text call (e.g. revision diffs). */
export async function hfText(token, { url, query }) {
    if (!token) return { error: 'Hugging Face token is required. Connect Hugging Face first.' };
    try {
        const response = await fetch(withQuery(url, query), { headers: authHeaders(token) });
        if (!response.ok) {
            const details = await parseJsonSafe(response).catch(() => ({}));
            return { error: `Hugging Face API request failed with status ${response.status}`, details };
        }
        return { diff: await response.text() };
    } catch (error) {
        return { error: 'Error calling Hugging Face API', message: error instanceof Error ? error.message : 'Unknown error' };
    }
}

/** SSE-style call: read the stream up to timeoutMs, return collected events. */
export async function hfStream(token, { url, query, timeoutMs = 5000 }) {
    if (!token) return { error: 'Hugging Face token is required. Connect Hugging Face first.' };
    try {
        const response = await fetch(withQuery(url, query), {
            headers: authHeaders(token, { Accept: 'text/event-stream' }),
            signal: AbortSignal.timeout(timeoutMs),
        });
        if (!response.ok) {
            const details = await parseJsonSafe(response).catch(() => ({}));
            return { error: `Hugging Face API request failed with status ${response.status}`, details };
        }
        const raw = await response.text();
        const events = [];
        for (const chunk of raw.split('\n\n')) {
            const data = chunk.split('\n').filter((l) => l.startsWith('data:')).map((l) => l.slice(5).trim()).join('\n');
            if (!data || data === '[DONE]') continue;
            try {
                events.push(JSON.parse(data));
            } catch {
                events.push({ raw: data });
            }
        }
        return { events, totalEvents: events.length };
    } catch (error) {
        if (error instanceof Error && error.name === 'TimeoutError') {
            return { error: 'Timed out waiting for Hugging Face stream', message: 'No events received in time' };
        }
        return { error: 'Error streaming from Hugging Face API', message: error instanceof Error ? error.message : 'Unknown error' };
    }
}

/** Multipart commit call for model/dataset/space repositories. */
export async function hfCommit(token, { repoType, repoId, rev, summary, description, parentCommit, files, lfsFiles, deletedEntries, createPr }) {
    if (!token) return { error: 'Hugging Face token is required. Connect Hugging Face first.' };
    try {
        const form = new FormData();
        form.append('header', JSON.stringify({ summary, description: description ?? '', parentCommit }));
        for (const f of files ?? []) {
            if (!f?.path) continue;
            const oldPath = f.oldPath ?? f.old_path;
            if (f.content === undefined && oldPath) continue;
            if (f.content === undefined) continue;
            const bytes = f.encoding === 'base64' ? Buffer.from(f.content, 'base64') : Buffer.from(f.content ?? '', 'utf-8');
            form.append('file', new Blob([bytes]), f.path);
        }
        for (const f of lfsFiles ?? []) {
            if (!f?.path) continue;
            form.append('lfsFile', JSON.stringify({ oid: f.oid, algo: f.algo ?? 'sha256', size: f.size }), f.path);
        }
        for (const e of deletedEntries ?? []) {
            if (!e?.path) continue;
            form.append('deletedFile', new Blob([]), e.path);
        }
        let url = `${HOSTS.HUB}/api/${repoType}/${repoId}/commit/${encodeURIComponent(rev)}`;
        if (createPr === '1' || createPr === 'true' || createPr === true) url += '?create_pr=true';
        const response = await fetch(url, { method: 'POST', headers: authHeaders(token), body: form });
        if (!response.ok) {
            const details = await parseJsonSafe(response).catch(() => ({}));
            return { error: `Hugging Face API request failed with status ${response.status}`, details };
        }
        return await parseJsonSafe(response);
    } catch (error) {
        return { error: 'Error creating Hugging Face commit', message: error instanceof Error ? error.message : 'Unknown error' };
    }
}

export { HOSTS };
