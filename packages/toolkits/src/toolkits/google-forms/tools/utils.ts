// @ts-nocheck

export const FORMS_API_BASE = 'https://forms.googleapis.com/v1';

export async function formsApiRequest(
    googleFormsToken: string,
    path: string,
    options?: {
        method?: string;
        body?: Record<string, unknown>;
        searchParams?: Record<string, string | number | undefined>;
    },
) {
    const url = new URL(`${FORMS_API_BASE}${path}`);
    if (options?.searchParams) {
        for (const [key, value] of Object.entries(options.searchParams)) {
            if (value !== undefined) {
                url.searchParams.set(key, String(value));
            }
        }
    }

    const fetchOptions: RequestInit = {
        method: options?.method ?? 'GET',
        headers: {
            Authorization: `Bearer ${googleFormsToken}`,
            ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
        },
    };

    if (options?.body) {
        fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(url.toString(), fetchOptions);

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        return { ok: false as const, error };
    }

    if (response.status === 204) {
        return { ok: true as const, data: { success: true } };
    }

    const data = await response.json();
    return { ok: true as const, data };
}
