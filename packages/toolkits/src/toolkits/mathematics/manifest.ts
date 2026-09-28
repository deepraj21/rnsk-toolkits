import { defineToolkit, defineTool } from '../../core/define.js';
import { MATHEMATICS_ICON } from './icon.js';
import { calculateSum } from './tools/calculate-sum.js';
import { calculateProduct } from './tools/calculate-product.js';
import { getRandomNumber } from './tools/get-random-number.js';
import { calculateStatistics } from './tools/calculate-statistics.js';
import { solveLinearEquations } from './tools/solve-linear-equations.js';
import { calculateQuadraticRoots } from './tools/calculate-quadratic-roots.js';
import { calculateCombinatorics } from './tools/calculate-combinatorics.js';
import { calculatePercentage } from './tools/calculate-percentage.js';
import { calculateMatrixDeterminant } from './tools/calculate-matrix-determinant.js';

export default defineToolkit({
  id: 'mathematics',
  displayName: 'Mathematics',
  shortDescription: 'Sum, product, statistics, and equation utilities.',
  category: 'Data & Analytics',
  icon: MATHEMATICS_ICON,
  auth: { type: 'none' },
  tools: [
    defineTool({
      name: 'calculateSum',
      tool: calculateSum,
      scope: 'read',
      keywords: ['add', 'addition', 'plus'],
    }),
    defineTool({
      name: 'calculateProduct',
      tool: calculateProduct,
      scope: 'read',
      keywords: ['multiply', 'multiplication'],
    }),
    defineTool({
      name: 'getRandomNumber',
      tool: getRandomNumber,
      scope: 'read',
      keywords: ['rand', 'integer'],
    }),
    defineTool({
      name: 'calculateStatistics',
      tool: calculateStatistics,
      scope: 'read',
      keywords: ['average', 'stats'],
    }),
    defineTool({
      name: 'solveLinearEquations',
      tool: solveLinearEquations,
      scope: 'read',
      keywords: ['algebra', 'equation'],
    }),
    defineTool({
      name: 'calculateQuadraticRoots',
      tool: calculateQuadraticRoots,
      scope: 'read',
      keywords: ['polynomial'],
    }),
    defineTool({
      name: 'calculateCombinatorics',
      tool: calculateCombinatorics,
      scope: 'read',
      keywords: ['permutation', 'combination', 'factorial'],
    }),
    defineTool({
      name: 'calculatePercentage',
      tool: calculatePercentage,
      scope: 'read',
      keywords: ['percent', 'discount'],
    }),
    defineTool({
      name: 'calculateMatrixDeterminant',
      tool: calculateMatrixDeterminant,
      scope: 'read',
      keywords: ['matrices', 'det'],
    }),
  ],
  meta: { since: '0.0.1' },
});
