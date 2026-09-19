// @ts-nocheck

export async function fetchVideoBytes(videoUrl: string) {
    const response = await fetch(videoUrl);
    if (!response.ok) throw new Error(`Failed to fetch video file (HTTP ${response.status})`);
    const contentType = response.headers.get('content-type') ?? 'video/mp4';
    return { bytes: Buffer.from(await response.arrayBuffer()), contentType };
}

export function buildMultipart(
    metadata: Record<string, unknown>,
    bytes: Buffer,
    contentType: string,
): { body: Buffer; boundary: string } {
    const boundary = `rnsk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    const header = Buffer.from(
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: ${contentType}\r\n\r\n`,
        'utf8',
    );
    const footer = Buffer.from(`\r\n--${boundary}--`, 'utf8');
    return { body: Buffer.concat([header, bytes, footer]), boundary };
}

export function snippetStatusVideo(
    title: string,
    description: string,
    categoryId: string,
    privacyStatus: string,
    tags?: string[],
) {
    const snippet: Record<string, unknown> = { title, description, categoryId: String(categoryId) };
    if (tags) snippet.tags = tags;
    return { snippet, status: { privacyStatus } };
}
