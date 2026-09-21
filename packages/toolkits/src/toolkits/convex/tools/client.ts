// @ts-nocheck
const MGMT_BASE = 'https://api.convex.dev/v1';

export class ConvexApiError extends Error {
    status: number;
    details: unknown;
    constructor(message: string, status: number, details: unknown) {
        super(message);
        this.status = status;
        this.details = details;
    }
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

/** Convex Management API: Bearer team token against api.convex.dev. */
export async function convexMgmt(
    convexToken: string,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    path: string,
    options?: {
        query?: Record<string, string | number | boolean | undefined>;
        body?: unknown;
    },
): Promise<any> {
    const url = new URL(`${MGMT_BASE}${path}`);
    appendQuery(url, options?.query);
    const response = await fetch(url.toString(), {
        method,
        headers: {
            Authorization: `Bearer ${convexToken}`,
            'Content-Type': 'application/json',
        },
        body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
    const data = await parseBody(response);
    if (!response.ok) {
        throw new ConvexApiError(
            `Convex API request failed${(data as any)?.message ? `: ${(data as any).message}` : ''}`,
            response.status,
            data,
        );
    }
    return data;
}

/**
 * Deployment-scoped APIs on {deploymentUrl}: queries, timestamps, log streams.
 * These use the `Convex ` auth prefix; team tokens are accepted as well as deploy keys.
 */
export async function convexDeployment(
    convexToken: string,
    deploymentUrl: string,
    method: 'GET' | 'POST',
    path: string,
    body?: unknown,
): Promise<any> {
    const base = deploymentUrl.replace(/\/$/, '');
    const response = await fetch(`${base}${path}`, {
        method,
        headers: {
            Authorization: `Convex ${convexToken}`,
            'Content-Type': 'application/json',
        },
        body: body !== undefined ? JSON.stringify(body) : method === 'POST' ? '{}' : undefined,
    });
    const data = await parseBody(response);
    if (!response.ok) {
        throw new ConvexApiError(
            `Convex deployment request failed${(data as any)?.message ? `: ${(data as any).message}` : ''}`,
            response.status,
            data,
        );
    }
    return data;
}

export function toConvexError(error: unknown, label: string) {
    if ((error as any)?.details !== undefined) {
        return { error: label, details: (error as any).details };
    }
    return {
        error: label.replace('Failed', 'Error').replace('failed', 'error'),
        message: error instanceof Error ? error.message : 'Unknown error',
    };
}

export function requireToken(convexToken: string | undefined) {
    if (!convexToken) {
        return { error: 'Convex API token is required. Connect Convex first.' };
    }
    return null;
}
