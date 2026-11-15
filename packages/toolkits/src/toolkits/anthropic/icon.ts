const SVG = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="24" width="24"><desc>Anthropic Icon Streamline Icon: https://streamlinehq.com</desc><path fill="#181818" d="m13.789 3.932 6.433 16.136h3.528L17.317 3.932zm-7.464 9.751 2.202-5.67 2.2 5.67zm.357-9.751L.25 20.068h3.597l1.315-3.389h6.73l1.315 3.39h3.596L10.371 3.931z"/></svg>`;

export const ANTHROPIC_ICON = {
  kind: 'svg' as const,
  dataUri: `data:image/svg+xml;base64,${Buffer.from(SVG).toString('base64')}`,
};
