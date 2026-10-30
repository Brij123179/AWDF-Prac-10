import React from 'react';

/**
 * lazyWithMinDelay Utility
 * 
 * Problem Solved (Supplementary Problem 2):
 * On high-speed networks or local environments, dynamic import() can resolve in
 * under 30-50 milliseconds. When this occurs, React's <Suspense> boundary rapidly
 * mounts the fallback skeleton and immediately replaces it with the resolved component.
 * This micro-flash creates an unpleasant visual "flicker" and layout shift.
 * 
 * Solution:
 * By chaining the dynamic import with a controlled Promise timer, we guarantee that
 * whenever a fallback state is initiated, it stays rendered for at least `minDelayMs` (default 300ms).
 * This ensures smooth, polished transitions without jarring UI strobes.
 * 
 * @param {Function} importFn - Factory function returning Promise<Module>
 * @param {number} minDelayMs - Minimum display threshold (default: 300ms)
 * @returns {React.LazyExoticComponent}
 */
export function lazyWithMinDelay(importFn, minDelayMs = 300) {
  return React.lazy(() => {
    const start = performance.now();
    return Promise.all([
      importFn(),
      new Promise((resolve) => setTimeout(resolve, minDelayMs))
    ]).then(([moduleExports]) => {
      const elapsed = Math.round(performance.now() - start);
      console.log(`[lazyWithMinDelay] Chunk loaded smoothly in ${elapsed}ms (enforced >= ${minDelayMs}ms)`);
      return moduleExports;
    });
  });
}
