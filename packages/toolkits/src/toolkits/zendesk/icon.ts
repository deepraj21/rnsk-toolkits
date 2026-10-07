const SVG = `<svg width="800" height="800" viewBox="0 -30.5 256 256" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid"><path d="M118.25 51.233v142.773H0zm0-51.233c0 32.644-26.481 59.125-59.125 59.125S0 32.645 0 0zm19.5 194.006c0-32.677 26.449-59.125 59.125-59.125S256 161.361 256 194.006zm0-51.266V0H256z" fill="#03363d"/></svg>`;

export const ZENDESK_ICON = {
  kind: 'svg' as const,
  dataUri: `data:image/svg+xml;base64,${Buffer.from(SVG).toString('base64')}`,
};
