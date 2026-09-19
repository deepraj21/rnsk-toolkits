// @ts-nocheck
const FIREBASE_BASE = 'https://hacker-news.firebaseio.com/v0';
const ALGOLIA_BASE = 'https://hn.algolia.com/api/v1';

export async function hnFirebase(path: string, query: Record<string, string | number | undefined> = {}) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== '') params.append(key, String(value));
    }
    const qs = params.toString();
    const url = `${FIREBASE_BASE}${path}${qs ? `?${qs}` : ''}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            return { error: `Hacker News API request failed with status ${response.status}` };
        }
        return await response.json();
    } catch (error) {
        return {
            error: 'Error calling Hacker News API',
            message: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

export async function hnSearch(params: {
    query?: string;
    tags?: string[];
    page?: number;
    hitsPerPage?: number;
}) {
    const search = new URLSearchParams();
    if (params.query) search.append('query', params.query);
    if (params.tags && params.tags.length > 0) search.append('tags', `(${params.tags.join(',')})`);
    if (params.page !== undefined) search.append('page', String(params.page));
    if (params.hitsPerPage !== undefined) search.append('hitsPerPage', String(params.hitsPerPage));
    const qs = search.toString();
    try {
        const response = await fetch(`${ALGOLIA_BASE}/search${qs ? `?${qs}` : ''}`);
        if (!response.ok) {
            return { error: `Hacker News search request failed with status ${response.status}` };
        }
        return await response.json();
    } catch (error) {
        return {
            error: 'Error searching Hacker News',
            message: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
