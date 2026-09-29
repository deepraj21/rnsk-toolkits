const SVG = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#FFF1EB"/><g stroke="#FF7A59" stroke-width="2.2" fill="none"><ellipse cx="16" cy="13.5" rx="6.5" ry="8.5"/><ellipse cx="16" cy="13.5" rx="6.5" ry="8.5" transform="rotate(60 16 16)"/><ellipse cx="16" cy="13.5" rx="6.5" ry="8.5" transform="rotate(120 16 16)"/></g><circle cx="16" cy="16" r="2.2" fill="#FF7A59"/></svg>`;

export const HUBSPOT_ICON = {
  kind: 'svg' as const,
  dataUri: `data:image/svg+xml;base64,${Buffer.from(SVG).toString('base64')}`,
};
