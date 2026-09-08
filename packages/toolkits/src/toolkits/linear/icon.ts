const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#5E6AD2"/><path d="M6 17L10 7h1.5l4 10h-1.5l-1-2.5H8.5L7.5 17H6zm3.2-4h3.6L9.8 9.5 9.2 13z" fill="white"/></svg>`;

export const LINEAR_ICON = {
  kind: 'svg' as const,
  dataUri: `data:image/svg+xml;base64,${Buffer.from(SVG).toString('base64')}`,
};
