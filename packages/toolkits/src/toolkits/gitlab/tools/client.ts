// @ts-nocheck
const GITLAB_API_BASE = 'https://gitlab.com/api/v4';

export function encodeId(id: string | number): string {
    return encodeURIComponent(String(id));
}

export async function gitlabRequest(
    gitlabToken: string | undefined,
    path: string,
    options: { method?: string; query?: Record<string, string | number | boolean | undefined>; body?: unknown } = {},
) {
    if (!gitlabToken) {
        return { error: 'GitLab token is required. Connect GitLab first.' };
    }
    const params = new URLSearchParams();
    if (options.query) {
        for (const [key, value] of Object.entries(options.query)) {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, String(value));
            }
        }
    }
    const queryString = params.toString();
    const url = `${GITLAB_API_BASE}${path}${queryString ? `?${queryString}` : ''}`;
    try {
        const response = await fetch(url, {
            method: options.method ?? 'GET',
            headers: {
                Authorization: `Bearer ${gitlabToken}`,
                'Content-Type': 'application/json',
            },
            body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        });
        if (!response.ok) {
            const details = await response.json().catch(() => ({}));
            return { error: `GitLab API request failed with status ${response.status}`, details };
        }
        if (response.status === 204) {
            return { success: true };
        }
        return await response.json();
    } catch (error) {
        return {
            error: 'Error calling GitLab API',
            message: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
