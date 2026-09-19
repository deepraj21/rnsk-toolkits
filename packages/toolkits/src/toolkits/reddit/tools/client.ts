// @ts-nocheck
const BASE_URL = 'https://oauth.reddit.com';
const USER_AGENT = 'web:rnsk-toolkits:0.0.8 (by /u/runstack)';

export class RedditApiError extends Error {
    status: number;
    details: unknown;
    constructor(message: string, status: number, details: unknown) {
        super(message);
        this.status = status;
        this.details = details;
    }
}

function authHeaders(redditToken: string): Record<string, string> {
    return {
        Authorization: `Bearer ${redditToken}`,
        'User-Agent': USER_AGENT,
    };
}

function appendQuery(url: URL, query?: Record<string, string | number | boolean | undefined>) {
    if (!query) return;
    for (const [key, value] of Object.entries(query)) {
        if (value === undefined) continue;
        url.searchParams.set(key, String(value));
    }
}

async function parseBody(response: Response): Promise<unknown> {
    const text = await response.text();
    if (!text) return {};
    try {
        return JSON.parse(text);
    } catch {
        return { raw: text };
    }
}

export async function redditGet(
    redditToken: string,
    path: string,
    query?: Record<string, string | number | boolean | undefined>,
): Promise<any> {
    const url = new URL(path, BASE_URL);
    appendQuery(url, query);
    const response = await fetch(url.toString(), { headers: authHeaders(redditToken) });
    const data = await parseBody(response);
    if (!response.ok) {
        throw new RedditApiError('Reddit API request failed', response.status, data);
    }
    return data;
}

export async function redditPost(
    redditToken: string,
    path: string,
    form: Record<string, string | number | boolean | undefined>,
): Promise<any> {
    const body = new URLSearchParams();
    body.set('api_type', 'json');
    for (const [key, value] of Object.entries(form)) {
        if (value === undefined) continue;
        body.set(key, String(value));
    }
    const response = await fetch(new URL(path, BASE_URL).toString(), {
        method: 'POST',
        headers: { ...authHeaders(redditToken), 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
    });
    const data = await parseBody(response);
    if (!response.ok) {
        throw new RedditApiError('Reddit API request failed', response.status, data);
    }
    return data;
}

/** Surface Reddit's 200-with-errors convention (`{ json: { errors: [...] } }`). */
export function throwIfJsonErrors(data: any, label: string): void {
    const errors = data?.json?.errors;
    if (Array.isArray(errors) && errors.length > 0) {
        throw new RedditApiError(`${label} rejected by Reddit`, 422, { errors });
    }
}
