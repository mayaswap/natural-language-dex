export { default as swapAction } from './swap.js';
export { default as priceAction } from './price.js';
export { default as addLiquidityAction } from './addLiquidity.js';
export { default as removeLiquidityAction } from './removeLiquidity.js';
export { default as queryPoolsAction } from './queryPools.js';

// Export all actions as an array for easy registration
export const allActions = async () => {
    const { default: swapAction } = await import('./swap.js');
    const { default: priceAction } = await import('./price.js');
    const { default: addLiquidityAction } = await import('./addLiquidity.js');
    const { default: removeLiquidityAction } = await import('./removeLiquidity.js');
    const { default: queryPoolsAction } = await import('./queryPools.js');
    
    return [
        swapAction,
        priceAction,
        addLiquidityAction,
        removeLiquidityAction,
        queryPoolsAction
    ];
}; 