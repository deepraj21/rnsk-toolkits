// @ts-nocheck
const API_BASE = 'https://slack.com/api';

export class SlackApiError extends Error {
    status: number;
    details: unknown;
    constructor(message: string, status: number, details: unknown) {
        super(message);
        this.status = status;
        this.details = details;
    }
}

function toForm(params?: Record<string, unknown>): URLSearchParams {
    const form = new URLSearchParams();
    if (!params) return form;
    for (const [key, value] of Object.entries(params)) {
        if (value === undefined) continue;
        form.set(key, typeof value === 'string' ? value : JSON.stringify(value));
    }
    return form;
}

/** Call a Slack Web API method. Throws SlackApiError when ok === false. */
export async function slackApi(
    slackToken: string,
    method: string,
    params?: Record<string, unknown>,
): Promise<any> {
    const response = await fetch(`${API_BASE}/${method}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${slackToken}`,
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
        body: toForm(params).toString(),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data?.ok === false) {
        throw new SlackApiError(
            `Slack ${method} failed${data?.error ? `: ${data.error}` : ''}`,
            response.status,
            data,
        );
    }
    return data;
}

/** GET helper for non-Web-API hosts (Audit Logs, SCIM). */
export async function slackGet(
    slackToken: string,
    url: string,
    query?: Record<string, string | number | boolean | undefined>,
): Promise<any> {
    const u = new URL(url);
    if (query) {
        for (const [key, value] of Object.entries(query)) {
            if (value === undefined) continue;
            u.searchParams.set(key, String(value));
        }
    }
    const response = await fetch(u.toString(), {
        headers: { Authorization: `Bearer ${slackToken}` },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data?.ok === false) {
        throw new SlackApiError(`Slack request failed${data?.error ? `: ${data.error}` : ''}`, response.status, data);
    }
    return data;
}

export function toSlackError(error: unknown, label: string) {
    if ((error as any)?.details !== undefined) {
        return { error: label, details: (error as any).details };
    }
    return {
        error: label.replace('Failed', 'Error').replace('failed', 'error'),
        message: error instanceof Error ? error.message : 'Unknown error',
    };
}

export function requireToken(slackToken: string | undefined) {
    if (!slackToken) {
        return { error: 'Slack token is required. Connect Slack first.' };
    }
    return null;
}
