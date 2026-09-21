// @ts-nocheck
export interface DatadogCredentials {
    apiKey: string;
    appKey: string;
    site: string;
}

const SITE_HOSTS: Record<string, string> = {
    us1: 'api.datadoghq.com',
    us3: 'api.us3.datadoghq.com',
    us5: 'api.us5.datadoghq.com',
    eu: 'api.datadoghq.eu',
    ap1: 'api.ap1.datadoghq.com',
    ap2: 'api.ap2.datadoghq.com',
    gov: 'api.ddog-gov.com',
    us2gov: 'api.us2.ddog-gov.com',
    uk1: 'api.uk1.datadoghq.com',
};

/** datadogCredentials is the JSON blob injected by the framework under the manifest's tokenField. */
export function parseDatadogCredentials(datadogCredentials: string): DatadogCredentials {
    let parsed: any;
    try {
        parsed = JSON.parse(datadogCredentials);
    } catch {
        throw new Error('Datadog credentials must be a JSON object with apiKey and appKey');
    }
    if (!parsed?.apiKey || !parsed?.appKey) {
        throw new Error('Datadog credentials must include apiKey and appKey');
    }
    let site = String(parsed.site || 'api.datadoghq.com')
        .replace(/^https?:\/\//, '')
        .replace(/\/$/, '');
    const alias = SITE_HOSTS[site.toLowerCase()];
    if (alias) site = alias;
    return { apiKey: parsed.apiKey, appKey: parsed.appKey, site };
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

export async function ddApi(
    datadogCredentials: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    options?: {
        query?: Record<string, string | number | boolean | undefined>;
        body?: unknown;
    },
): Promise<any> {
    const creds = parseDatadogCredentials(datadogCredentials);
    const url = new URL(`https://${creds.site}${path}`);
    appendQuery(url, options?.query);
    const response = await fetch(url.toString(), {
        method,
        headers: {
            'DD-API-KEY': creds.apiKey,
            'DD-APPLICATION-KEY': creds.appKey,
            'Content-Type': 'application/json',
        },
        body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
    const data = await parseBody(response);
    if (!response.ok) {
        const message =
            (data as any)?.errors?.join?.('; ') ?? (data as any)?.message ?? (data as any)?.error ?? '';
        throw new Error(`Datadog API request failed (HTTP ${response.status})${message ? `: ${message}` : ''}`);
    }
    return data;
}

export function toDatadogError(error: unknown, label: string) {
    if (error instanceof Error && /Datadog credentials/.test(error.message)) {
        return { error: 'Datadog credentials are missing or invalid. Connect Datadog first.' };
    }
    return {
        error: label.replace('Failed', 'Error').replace('failed', 'error'),
        message: error instanceof Error ? error.message : 'Unknown error',
    };
}
