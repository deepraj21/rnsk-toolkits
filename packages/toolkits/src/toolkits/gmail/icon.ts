const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#EA4335"/><path d="M6 12l6 5 6-5-6-5-6 5z" fill="white"/></svg>`;

export const GMAIL_ICON = {
  kind: 'svg' as const,
  dataUri: `data:image/svg+xml;base64,${Buffer.from(SVG).toString('base64')}`,
};
