// @ts-nocheck

/**
 * Base64URL encodes a string in accordance with RFC 4648 §5.
 */
export function encodeBase64Url(str: string): string {
  return Buffer.from(str, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Base64URL decodes a string back to UTF-8.
 */
export function decodeBase64Url(data: string): string {
  const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(base64, 'base64').toString('utf-8');
}

/**
 * Encodes an email with standard RFC 2822 headers into Base64URL format.
 */
export function encodeRFC822Message(params: {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
  inReplyTo?: string;
  references?: string;
}): string {
  const headerLines: string[] = [
    `To: ${params.to}`,
    params.cc ? `Cc: ${params.cc}` : null,
    params.bcc ? `Bcc: ${params.bcc}` : null,
    `Subject: ${params.subject}`,
    params.inReplyTo ? `In-Reply-To: ${params.inReplyTo}` : null,
    params.references ? `References: ${params.references}` : null,
    'Content-Type: text/plain; charset="UTF-8"',
    'MIME-Version: 1.0',
  ].filter(Boolean) as string[];

  const raw = `${headerLines.join('\n')}\n\n${params.body}`;
  return encodeBase64Url(raw);
}

/**
 * Recursively extracts plain text (or HTML fallback) body from a Gmail message payload.
 */
export function extractBodyFromPayload(payload: any): string {
  if (!payload) return '';
  if (payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }
  if (payload.parts && Array.isArray(payload.parts)) {
    // Look for text/plain first
    const plainPart = payload.parts.find((p: any) => p.mimeType === 'text/plain');
    if (plainPart?.body?.data) {
      return decodeBase64Url(plainPart.body.data);
    }
    // Check nested parts (multipart/alternative, multipart/mixed, etc.)
    for (const part of payload.parts) {
      if (part.parts) {
        const nested = extractBodyFromPayload(part);
        if (nested) return nested;
      }
    }
    // Fallback to text/html if plain text not available
    const htmlPart = payload.parts.find((p: any) => p.mimeType === 'text/html');
    if (htmlPart?.body?.data) {
      return decodeBase64Url(htmlPart.body.data);
    }
  }
  return '';
}

/**
 * Extracts structured message details and headers from a Gmail message API response.
 */
export function extractMessageDetails(data: any, maxBodyLength = 4000) {
  if (!data) return null;
  const headers = data.payload?.headers || [];
  const getHeader = (name: string) =>
    headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value;

  const subject = getHeader('subject');
  const from = getHeader('from');
  const to = getHeader('to');
  const cc = getHeader('cc');
  const date = getHeader('date');
  const messageIdHeader = getHeader('message-id');

  const rawBody = extractBodyFromPayload(data.payload);
  const body = rawBody ? rawBody.substring(0, maxBodyLength) : '';

  return {
    id: data.id,
    threadId: data.threadId,
    labelIds: data.labelIds || [],
    snippet: data.snippet,
    subject,
    from,
    to,
    cc,
    date,
    messageIdHeader,
    body,
  };
}

export function encodeBase64Mime(data: string): string {
  return data.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
}

export function chunkBase64(data: string): string {
  return data.match(/.{1,76}/g)?.join('\r\n') || data;
}

export function getHeaderValue(headers: Array<{ name?: string; value?: string }> | undefined, name: string): string | undefined {
  return headers?.find((header) => header.name?.toLowerCase() === name.toLowerCase())?.value;
}

export function collectAttachments(payload: any): Array<{ attachmentId: string; filename: string; mimeType: string }> {
  const attachments: Array<{ attachmentId: string; filename: string; mimeType: string }> = [];

  const walk = (part: any) => {
    const attachmentId = part?.body?.attachmentId;
    const filename = part?.filename;
    if (attachmentId && filename) {
      attachments.push({
        attachmentId,
        filename,
        mimeType: part.mimeType || 'application/octet-stream',
      });
    }

    for (const child of part?.parts || []) {
      walk(child);
    }
  };

  walk(payload);
  return attachments;
}

export function encodeMultipartMessage(params: {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
  attachments?: Array<{ filename: string; mimeType: string; data: string }>;
}): string {
  const boundary = `rnsk-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const headers = [
    `To: ${params.to}`,
    params.cc ? `Cc: ${params.cc}` : '',
    params.bcc ? `Bcc: ${params.bcc}` : '',
    `Subject: ${params.subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
  ].filter(Boolean);

  const parts = [
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    params.body,
  ];

  for (const attachment of params.attachments || []) {
    parts.push(
      `--${boundary}`,
      `Content-Type: ${attachment.mimeType}; name="${attachment.filename}"`,
      'Content-Transfer-Encoding: base64',
      `Content-Disposition: attachment; filename="${attachment.filename}"`,
      '',
      chunkBase64(encodeBase64Mime(attachment.data)),
    );
  }

  parts.push(`--${boundary}--`);

  return encodeBase64Url([...headers, '', ...parts].join('\r\n'));
}
