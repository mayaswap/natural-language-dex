import { NineMmV3PositionManager, NineMmPoolDiscoveryService, parseCommand } from './dist/index.js';

console.log('🧪 Testing 9mm V3 Position Manager');
console.log('==================================\n');

const positionManager = new NineMmV3PositionManager();
const poolDiscovery = new NineMmPoolDiscoveryService();

// Test tick calculations
console.log('1. Testing Tick Calculations:');
console.log('   Current Price: $0.00005 USDC/PLS');

const price = 0.00005;
const tick = positionManager.priceToTick(price);
const priceFromTick = positionManager.tickToPrice(tick);

console.log(`   Price → Tick: ${price} → ${tick}`);
console.log(`   Tick → Price: ${tick} → ${priceFromTick.toFixed(8)}`);

// Test tick range calculations
console.log('\n2. Testing Tick Range Calculations:');
const feeTier = '2500'; // 0.25%
const tickSpacing = positionManager.getTickSpacing(feeTier);
console.log(`   Fee Tier: 0.25% → Tick Spacing: ${tickSpacing}`);

const priceLower = price * 0.9; // -10%
const priceUpper = price * 1.1; // +10%
const tickRange = positionManager.calculateTickRange(priceLower, priceUpper, tickSpacing);

console.log(`   Price Range: $${priceLower.toFixed(8)} - $${priceUpper.toFixed(8)}`);
console.log(`   Tick Range: ${tickRange.tickLower} - ${tickRange.tickUpper}`);

// Test optimal range suggestions
console.log('\n3. Testing Optimal Range Suggestions:');
const strategies = ['conservative', 'moderate', 'aggressive'];

for (const strategy of strategies) {
  const range = await positionManager.suggestOptimalRange(
    '0xc5ef2dc9a37b7cf7c0b95db5d503c8e7a87c375f', // Example pool address
    price,
    strategy,
    feeTier
  );
  
  console.log(`\n   ${strategy.toUpperCase()} Strategy:`);
  console.log(`   Price Range: $${range.lower.toFixed(8)} - $${range.upper.toFixed(8)}`);
  console.log(`   Range Width: ${((range.upper - range.lower) / price * 100).toFixed(1)}%`);
  console.log(`   Estimated APY: ${range.estimatedAPY}%`);
}

// Test position queries
console.log('\n\n4. Testing Position Queries:');
const testAddress = '0x1234567890123456789012345678901234567890';
console.log(`   Fetching positions for: ${testAddress}`);

const positions = await positionManager.getUserPositions(testAddress);
console.log(`   Found ${positions.length} active positions`);

if (positions.length > 0) {
  console.log('\n   Position Details:');
  positions.slice(0, 3).forEach((position, index) => {
    console.log(`\n${positionManager.formatPositionForDisplay(position, index + 1)}`);
  });
}

// Test natural language position management
console.log('\n\n5. Testing Natural Language Position Commands:');
const testCommands = [
  'Remove all liquidity from PLS/USDC',
  'Withdraw 50% from position #123',
  'Close all out-of-range positions',
  'Exit position 456',
  'Remove half from my HEX/PLSX position'
];

testCommands.forEach((command, index) => {
  const parsed = parseCommand(command);
  console.log(`\n   ${index + 1}. "${command}"`);
  console.log(`      Intent: ${parsed.intent} (${(parsed.confidence * 100).toFixed(0)}% confidence)`);
  if (parsed.positionId) {
    console.log(`      Position ID: #${parsed.positionId}`);
  }
  if (parsed.percentage !== undefined) {
    console.log(`      Percentage: ${parsed.percentage}%`);
  }
  if (parsed.outOfRange) {
    console.log(`      Filter: Out-of-range positions only`);
  }
  if (parsed.fromToken || parsed.toToken) {
    console.log(`      Tokens: ${parsed.fromToken || '?'}/${parsed.toToken || '?'}`);
  }
});

// Demo complete liquidity management flow
console.log('\n\n6. Complete Liquidity Management Flow Demo:');
console.log('   User: "I want to add liquidity to the best PLS/USDC pool"');

// Step 1: Find pools
const plsPools = await poolDiscovery.findPools(
  '0xa1077a294dde1b09bb078844df40758a5d0f9a27', // WPLS
  '0x15D38573d2feeb82e7ad5187aB8c1D52810B1f07'  // USDC
);

if (plsPools.length > 0) {
  console.log(`\n   Found ${plsPools.length} PLS/USDC pools:`);
  plsPools.slice(0, 3).forEach((pool, index) => {
    console.log(`   ${poolDiscovery.formatPoolForDisplay(pool, index + 1)}`);
  });
  
  // Step 2: Get optimal range for top pool
  const topPool = plsPools[0];
  const currentPrice = parseFloat(topPool.token0Price);
  
  console.log(`\n   Analyzing top pool for concentrated liquidity...`);
  console.log(`   Current Price: 1 WPLS = ${currentPrice.toFixed(8)} USDC`);
  
  const optimalRange = await positionManager.suggestOptimalRange(
    topPool.id,
    currentPrice,
    'moderate',
    topPool.feeTier
  );
  
  console.log(`\n   Suggested Range (Moderate Strategy):`);
  console.log(`   Lower: ${optimalRange.lower.toFixed(8)} USDC`);
  console.log(`   Upper: ${optimalRange.upper.toFixed(8)} USDC`);
  console.log(`   Estimated APY: ${optimalRange.estimatedAPY}%`);
  console.log(`\n   Ready to add liquidity! Next step would be contract interaction.`);
}

console.log('\n\n✅ V3 Position Manager Testing Complete!'); 