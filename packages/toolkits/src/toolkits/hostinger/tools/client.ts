// @ts-nocheck
const HOSTINGER_API_BASE = 'https://developers.hostinger.com';

export async function hostingerRequest(
    hostingerApiKey: string | undefined,
    path: string,
    options: { method?: string; query?: Record<string, string | number | boolean | undefined>; body?: unknown } = {},
) {
    if (!hostingerApiKey) {
        return { error: 'Hostinger API key is required. Connect Hostinger first.' };
    }
    const params = new URLSearchParams();
    if (options.query) {
        for (const [key, value] of Object.entries(options.query)) {
            if (value !== undefined && value !== null && value !== '') {
                if (Array.isArray(value)) {
                    for (const item of value) params.append(key, String(item));
                } else {
                    params.append(key, String(value));
                }
            }
        }
    }
    const queryString = params.toString();
    const url = `${HOSTINGER_API_BASE}${path}${queryString ? `?${queryString}` : ''}`;
    try {
        const response = await fetch(url, {
            method: options.method ?? 'GET',
            headers: {
                Authorization: `Bearer ${hostingerApiKey}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        });
        if (!response.ok) {
            const details = await response.json().catch(() => ({}));
            return { error: `Hostinger API request failed with status ${response.status}`, details };
        }
        if (response.status === 204) {
            return { success: true };
        }
        const text = await response.text();
        if (!text) return { success: true };
        try {
            return JSON.parse(text);
        } catch {
            return { raw: text };
        }
    } catch (error) {
        return {
            error: 'Error calling Hostinger API',
            message: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
