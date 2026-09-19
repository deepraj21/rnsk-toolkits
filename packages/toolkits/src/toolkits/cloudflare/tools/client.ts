// @ts-nocheck
const BASE_URL = 'https://api.cloudflare.com/client/v4';

export class CloudflareApiError extends Error {
    status: number;
    details: unknown;
    constructor(message: string, status: number, details: unknown) {
        super(message);
        this.status = status;
        this.details = details;
    }
}

function authHeaders(cloudflareApiKey: string): Record<string, string> {
    return {
        Authorization: `Bearer ${cloudflareApiKey}`,
        'Content-Type': 'application/json',
    };
}

function appendQuery(url: URL, query?: Record<string, string | number | boolean | undefined>) {
    if (!query) return;
    for (const [key, value] of Object.entries(query)) {
        if (value === undefined) continue;
        url.searchParams.set(key, String(value));
    }
}

export async function cfRequest(
    cloudflareApiKey: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    options?: {
        query?: Record<string, string | number | boolean | undefined>;
        body?: unknown;
    },
): Promise<any> {
    const url = new URL(`${BASE_URL}${path}`);
    appendQuery(url, options?.query);
    const response = await fetch(url.toString(), {
        method,
        headers: authHeaders(cloudflareApiKey),
        body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
    const text = await response.text();
    let data: any = {};
    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        data = { raw: text };
    }
    if (!response.ok || data?.success === false) {
        throw new CloudflareApiError(
            'Cloudflare API request failed',
            response.status,
            data?.errors ?? data,
        );
    }
    return data;
}

export function toCfError(error: unknown, label: string) {
    if ((error as any)?.details !== undefined) {
        return { error: label, details: (error as any).details };
    }
    return {
        error: label.replace('Failed', 'Error').replace('failed', 'error'),
        message: error instanceof Error ? error.message : 'Unknown error',
    };
}
