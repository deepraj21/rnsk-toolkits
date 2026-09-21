// @ts-nocheck
const KAGGLE_API = 'https://www.kaggle.com/api/v1';

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

function basicHeader(kaggleCredentials) {
    if (!kaggleCredentials || !kaggleCredentials.includes(':')) {
        return null;
    }
    return `Basic ${Buffer.from(kaggleCredentials, 'utf-8').toString('base64')}`;
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

export async function kaggle(kaggleCredentials, { path, method = 'GET', query, body, form }) {
    const auth = basicHeader(kaggleCredentials);
    if (!auth) return { error: 'Kaggle credentials are required. Connect Kaggle with your username and API key first.' };
    const url = withQuery(`${KAGGLE_API}${path}`, query);
    try {
        const headers = {
            'Authorization': auth,
            'Accept': 'application/json',
        };
        let payload;
        if (form !== undefined) {
            const formBody = new URLSearchParams();
            for (const [key, value] of Object.entries(form)) {
                if (value !== undefined && value !== null) formBody.append(key, String(value));
            }
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
            payload = formBody.toString();
        } else if (body !== undefined) {
            headers['Content-Type'] = 'application/json';
            payload = JSON.stringify(body);
        }
        const response = await fetch(url, { method, headers, body: payload });
        if (!response.ok) {
            const details = await parseBody(response).catch(() => ({}));
            return { error: `Kaggle API request failed with status ${response.status}`, details };
        }
        if (response.status === 204 || response.status === 202) {
            return { success: true };
        }
        const contentType = response.headers.get('content-type') ?? '';
        if (!contentType.includes('application/json')) {
            return downloadMetaFromResponse(response, url);
        }
        return await parseBody(response);
    } catch (error) {
        return { error: 'Error calling Kaggle API', message: error instanceof Error ? error.message : 'Unknown error' };
    }
}

async function downloadMetaFromResponse(response, url) {
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    await response.body?.cancel().catch(() => null);
    const finalUrl = response.url || url;
    const name = decodeURIComponent(finalUrl.split('?')[0].split('/').pop() || 'download');
    return {
        name,
        mimetype: contentType,
        sizeBytes: contentLength ? Number(contentLength) : null,
        url: finalUrl,
        note: 'Binary content is not embedded in tool output. Use the url to download the file directly.',
    };
}

export { KAGGLE_API };
