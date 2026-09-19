// @ts-nocheck
const BASE_URL = 'https://discord.com/api/v10';

export class DiscordApiError extends Error {
    status: number;
    details: unknown;
    constructor(message: string, status: number, details: unknown) {
        super(message);
        this.status = status;
        this.details = details;
    }
}

function appendQuery(url: URL, query?: Record<string, string | number | boolean | string[] | undefined>) {
    if (!query) return;
    for (const [key, value] of Object.entries(query)) {
        if (value === undefined) continue;
        if (Array.isArray(value)) {
            for (const item of value) url.searchParams.append(key, String(item));
        } else {
            url.searchParams.set(key, String(value));
        }
    }
}

export async function discordApi(
    discordToken: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    options?: {
        query?: Record<string, string | number | boolean | string[] | undefined>;
        body?: unknown;
    },
): Promise<any> {
    const url = new URL(`${BASE_URL}${path}`);
    appendQuery(url, options?.query);
    const response = await fetch(url.toString(), {
        method,
        headers: {
            Authorization: `Bearer ${discordToken}`,
            'Content-Type': 'application/json',
        },
        body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
    if (response.status === 204) {
        return { success: true };
    }
    const text = await response.text();
    let data: any = {};
    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        data = { raw: text };
    }
    if (!response.ok) {
        throw new DiscordApiError(
            `Discord API request failed${data?.message ? `: ${data.message}` : ''}`,
            response.status,
            data,
        );
    }
    return data;
}

export function toDiscordError(error: unknown, label: string) {
    if ((error as any)?.details !== undefined) {
        return { error: label, details: (error as any).details };
    }
    return {
        error: label.replace('Failed', 'Error').replace('failed', 'error'),
        message: error instanceof Error ? error.message : 'Unknown error',
    };
}

export function requireToken(discordToken: string | undefined) {
    if (!discordToken) {
        return { error: 'Discord token is required. Connect Discord first.' };
    }
    return null;
}
