const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#6366f1"/><text x="12" y="17" text-anchor="middle" font-size="14" fill="white" font-family="system-ui">π</text></svg>`;

export const MATHEMATICS_ICON = {
  kind: 'svg' as const,
  dataUri: `data:image/svg+xml;base64,${Buffer.from(SVG).toString('base64')}`,
};
