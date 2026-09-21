// @ts-nocheck
export const NOTEBOOK_LM_API_VERSION = 'v1alpha';
export const DEFAULT_LOCATION = 'global';
export const DEFAULT_ENDPOINT_LOCATION = 'global';

export function getEndpoint(endpointLocation?: string): string {
    const loc = (endpointLocation || DEFAULT_ENDPOINT_LOCATION).toLowerCase();
    if (loc === 'global') return `https://discoveryengine.googleapis.com/${NOTEBOOK_LM_API_VERSION}`;
    return `https://${loc}-discoveryengine.googleapis.com/${NOTEBOOK_LM_API_VERSION}`;
}

export function buildNotebookName(notebookId: string, projectNumber?: string, location?: string): string {
    if (notebookId.includes('/')) return notebookId;
    const proj = projectNumber || '-';
    const loc = location || DEFAULT_LOCATION;
    return `projects/${proj}/locations/${loc}/notebooks/${notebookId}`;
}

export function buildParent(projectNumber?: string, location?: string): string {
    const proj = projectNumber || '-';
    const loc = location || DEFAULT_LOCATION;
    return `projects/${proj}/locations/${loc}`;
}

export function buildSourceName(notebookId: string, sourceId: string, projectNumber?: string, location?: string): string {
    if (sourceId.includes('/')) return sourceId;
    const notebookName = buildNotebookName(notebookId, projectNumber, location);
    return `${notebookName}/sources/${sourceId}`;
}

export async function parseResponseError(response: Response): Promise<{ error: string; details: unknown }> {
    const text = await response.text().catch(() => '');
    let details: unknown = text;
    try {
        details = text ? JSON.parse(text) : {};
    } catch {
        details = text;
    }
    return { error: `Request failed with ${response.status} ${response.statusText}`, details };
}

export function requireToken(token: unknown, field: string) {
    if (!token || typeof token !== 'string' || token.trim() === '') {
        return { error: `${field} is required. Connect NotebookLM first.` };
    }
    return null;
}
