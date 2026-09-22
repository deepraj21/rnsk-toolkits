const SVG = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0.00 0.00 48.00 48.00">
<g stroke-width="2.00" fill="none" stroke-linecap="butt">
<path stroke="#f29293" vector-effect="non-scaling-stroke" d="
  M 22.72 3.60
  Q 19.65 4.02 16.22 4.53
  Q 11.84 5.18 9.89 6.08
  Q 3.79 8.90 2.53 16.25
  Q 2.13 18.61 3.58 25.11"
/>
<path stroke="#fcd98e" vector-effect="non-scaling-stroke" d="
  M 3.58 25.11
  Q 3.99 28.48 4.57 32.23
  Q 5.28 36.78 6.50 38.94
  C 9.53 44.32 14.77 46.04 20.68 45.17
  Q 23.09 44.82 25.53 44.39"
/>
<path stroke="#91b6da" vector-effect="non-scaling-stroke" d="
  M 25.53 44.39
  C 29.75 43.78 35.24 43.43 38.66 41.65
  Q 44.52 38.58 45.48 31.26
  Q 45.72 29.47 44.61 23.94"
/>
<path stroke="#84cca4" vector-effect="non-scaling-stroke" d="
  M 44.61 23.94
  Q 44.08 20.18 43.45 16.12
  Q 42.64 10.96 41.23 8.62
  Q 37.94 3.17 30.75 2.49
  Q 29.00 2.32 22.72 3.60"
/>
<path stroke="#15837f" vector-effect="non-scaling-stroke" d="
  M 44.61 23.94
  Q 39.61 27.27 36.08 24.01"
/>
<path stroke="#84cca4" vector-effect="non-scaling-stroke" d="
  M 36.08 24.01
  L 34.51 14.35
  A 4.02 4.01 -9.0 0 0 29.94 11.03
  L 23.08 12.08"
/>
<path stroke="#765f38" vector-effect="non-scaling-stroke" d="
  M 23.08 12.08
  Q 28.56 8.10 22.72 3.60"
/>
<path stroke="#f29293" vector-effect="non-scaling-stroke" d="
  M 23.08 12.08
  Q 19.11 12.69 15.21 13.35
  C 9.32 14.34 11.17 19.35 11.82 23.49"
/>
<path stroke="#ef6c22" vector-effect="non-scaling-stroke" d="
  M 11.82 23.49
  Q 6.56 20.66 3.58 25.11"
/>
<path stroke="#91b6da" vector-effect="non-scaling-stroke" d="
  M 36.08 24.01
  L 36.97 30.06
  A 3.91 3.90 -8.8 0 1 33.72 34.49
  L 24.66 35.94"
/>
<path stroke="#fcd98e" vector-effect="non-scaling-stroke" d="
  M 24.66 35.94
  L 18.02 36.95
  A 3.97 3.96 -9.0 0 1 13.51 33.68
  L 11.82 23.49"
/>
<path stroke="#8e9069" vector-effect="non-scaling-stroke" d="
  M 24.66 35.94
  Q 19.39 40.68 25.53 44.39"
/>
</g>
<path fill="#089949" d="
  M 44.61 23.94
  Q 39.61 27.27 36.08 24.01
  L 34.51 14.35
  A 4.02 4.01 -9.0 0 0 29.94 11.03
  L 23.08 12.08
  Q 28.56 8.10 22.72 3.60
  Q 29.00 2.32 30.75 2.49
  Q 37.94 3.17 41.23 8.62
  Q 42.64 10.96 43.45 16.12
  Q 44.08 20.18 44.61 23.94
  Z"
/>
<path fill="#e42527" d="
  M 22.72 3.60
  Q 28.56 8.10 23.08 12.08
  Q 19.11 12.69 15.21 13.35
  C 9.32 14.34 11.17 19.35 11.82 23.49
  Q 6.56 20.66 3.58 25.11
  Q 2.13 18.61 2.53 16.25
  Q 3.79 8.90 9.89 6.08
  Q 11.84 5.18 16.22 4.53
  Q 19.65 4.02 22.72 3.60
  Z"
/>
<path fill="#f9b21d" d="
  M 11.82 23.49
  L 13.51 33.68
  A 3.97 3.96 -9.0 0 0 18.02 36.95
  L 24.66 35.94
  Q 19.39 40.68 25.53 44.39
  Q 23.09 44.82 20.68 45.17
  C 14.77 46.04 9.53 44.32 6.50 38.94
  Q 5.28 36.78 4.57 32.23
  Q 3.99 28.48 3.58 25.11
  Q 6.56 20.66 11.82 23.49
  Z"
/>
<path fill="#226db4" d="
  M 36.08 24.01
  Q 39.61 27.27 44.61 23.94
  Q 45.72 29.47 45.48 31.26
  Q 44.52 38.58 38.66 41.65
  C 35.24 43.43 29.75 43.78 25.53 44.39
  Q 19.39 40.68 24.66 35.94
  L 33.72 34.49
  A 3.91 3.90 -8.8 0 0 36.97 30.06
  L 36.08 24.01
  Z"
/>
</svg>`;

export const ZOHO_ICON = {
  kind: 'svg' as const,
  dataUri: `data:image/svg+xml;base64,${Buffer.from(SVG).toString('base64')}`,
};
