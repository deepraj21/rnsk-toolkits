// @ts-nocheck

export interface JenkinsCredentials {
    baseUrl: string;
    username?: string;
    apiToken?: string;
}

export function parseJenkinsCredentials(jenkinsCredentials: string): JenkinsCredentials {
    let parsed: Partial<JenkinsCredentials>;
    try {
        parsed = JSON.parse(jenkinsCredentials);
    } catch {
        throw new Error(
            'Jenkins credentials must be valid JSON with baseUrl and optional username/apiToken',
        );
    }
    if (!parsed.baseUrl) {
        throw new Error(
            'Jenkins credentials must include baseUrl, e.g. {"baseUrl":"https://jenkins.example.com","username":"ci-bot","apiToken":"..."}',
        );
    }
    return {
        baseUrl: parsed.baseUrl.replace(/\/+$/, ''),
        username: parsed.username,
        apiToken: parsed.apiToken,
    };
}

function buildHeaders(credentials: JenkinsCredentials): Record<string, string> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (credentials.username && credentials.apiToken) {
        headers.Authorization = `Basic ${Buffer.from(`${credentials.username}:${credentials.apiToken}`).toString('base64')}`;
    } else if (credentials.apiToken) {
        headers.Authorization = `Basic ${Buffer.from(`:${credentials.apiToken}`).toString('base64')}`;
    }
    return headers;
}

function appendQuery(url: URL, query?: Record<string, string | number | boolean | undefined>) {
    if (!query) return;
    for (const [key, value] of Object.entries(query)) {
        if (value === undefined) continue;
        url.searchParams.set(key, String(value));
    }
}

/**
 * Convert a user-supplied job path like "folder/sub/my-job" into the
 * Jenkins URL segment "/job/folder/job/sub/job/my-job". Segments that
 * already look like "job/..." are left alone.
 */
export function toJobPath(jobName: string): string {
    const cleaned = jobName.trim().replace(/^\/+|\/+$/g, '');
    if (!cleaned) throw new Error('jobName is required');
    if (cleaned.startsWith('job/')) return `/${cleaned}`;
    return `/${cleaned.split('/').map((s) => `job/${s}`).join('/')}`;
}

export interface JenkinsResponse {
    ok: boolean;
    status: number;
    data: any;
    headers: Record<string, string>;
}

export async function jenkinsRequest(
    jenkinsCredentials: string,
    path: string,
    options?: {
        method?: string;
        query?: Record<string, string | number | boolean | undefined>;
        body?: unknown;
        contentType?: string;
        accept?: string;
    },
): Promise<JenkinsResponse> {
    const credentials = parseJenkinsCredentials(jenkinsCredentials);
    const url = new URL(`${credentials.baseUrl}${path.startsWith('/') ? path : `/${path}`}`);
    appendQuery(url, options?.query);

    const headers = buildHeaders(credentials);
    if (options?.accept) headers.Accept = options.accept;
    if (options?.contentType) headers['Content-Type'] = options.contentType;

    const fetchOptions: RequestInit = {
        method: options?.method ?? 'GET',
        headers,
        redirect: 'manual',
    };
    if (options?.body !== undefined) {
        fetchOptions.body =
            typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
        if (!options?.contentType) headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url.toString(), fetchOptions);
    const headersOut: Record<string, string> = {};
    response.headers.forEach((value, key) => {
        headersOut[key] = value;
    });

    // Jenkins POST actions (build, delete, quietDown) usually return 200/201/302 with an empty body.
    if (response.status === 201 || response.status === 302) {
        const text = await response.text().catch(() => '');
        return { ok: response.ok, status: response.status, data: text || null, headers: headersOut };
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json') || contentType.includes('text/json')) {
        const data = await response.json().catch(() => null);
        return { ok: response.ok, status: response.status, data, headers: headersOut };
    }

    const text = await response.text();
    return { ok: response.ok, status: response.status, data: text, headers: headersOut };
}

export function toJenkinsError(error: unknown, action: string) {
    if (error instanceof Error && /credentials|jobName/i.test(error.message)) {
        return { error: action, message: error.message };
    }
    return {
        error: action,
        message: error instanceof Error ? error.message : 'Unknown error',
    };
}

export function failedResult(action: string, result: JenkinsResponse) {
    return {
        error: action,
        statusCode: result.status,
        details: result.data,
    };
}
