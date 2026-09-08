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
    defineTool({ name: 'calculateSum', tool: calculateSum, scope: 'read' }),
    defineTool({ name: 'calculateProduct', tool: calculateProduct, scope: 'read' }),
    defineTool({ name: 'getRandomNumber', tool: getRandomNumber, scope: 'read' }),
    defineTool({ name: 'calculateStatistics', tool: calculateStatistics, scope: 'read' }),
    defineTool({ name: 'solveLinearEquations', tool: solveLinearEquations, scope: 'read' }),
    defineTool({ name: 'calculateQuadraticRoots', tool: calculateQuadraticRoots, scope: 'read' }),
    defineTool({ name: 'calculateCombinatorics', tool: calculateCombinatorics, scope: 'read' }),
    defineTool({ name: 'calculatePercentage', tool: calculatePercentage, scope: 'read' }),
    defineTool({ name: 'calculateMatrixDeterminant', tool: calculateMatrixDeterminant, scope: 'read' }),
  ],
  meta: { since: '0.0.1' },
});
