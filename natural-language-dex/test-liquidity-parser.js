import { parseCommand, NineMmPoolDiscoveryService } from './dist/index.js';

console.log('🧪 Testing Natural Language Liquidity Parsing\n');

// Test cases for liquidity commands
const testCases = [
  // Add liquidity commands
  "Add liquidity to PLS/USDC pool",
  "Provide 100 USDC and 50 PLS to liquidity",
  "Create position in HEX/PLSX 1% fee tier",
  "Add liquidity to PLS/USDC 0.25% pool full range",
  "I want to add 1000 USDC to HEX pool tight range",
  "Add to DAI/USDT 2% fee pool",
  
  // Remove liquidity commands
  "Remove all liquidity from PLS/USDC",
  "Withdraw 50% from position #123",
  "Exit HEX/PLSX pool",
  "Close position 456",
  "Remove half of my liquidity from PLS pool",
  
  // Pool query commands
  "Show PLS/USDC pools",
  "Find pools for HEX",
  "List my liquidity positions",
  "Pool stats for PLS/USDC",
  "Available fee tiers for DAI pools",
  "What pools are available for PLSX?",
];

console.log('Testing liquidity command parsing:');
console.log('=====================================\n');

testCases.forEach((testCase, index) => {
  const result = parseCommand(testCase);
  console.log(`${index + 1}. Input: "${testCase}"`);
  console.log(`   Intent: ${result.intent} (${(result.confidence * 100).toFixed(0)}% confidence)`);
  
  if (result.intent === 'addLiquidity') {
    console.log(`   Tokens: ${result.fromToken || '?'} / ${result.toToken || '?'}`);
    if (result.feeTier) console.log(`   Fee Tier: ${result.feeTier === '2500' ? '0.25%' : result.feeTier === '10000' ? '1%' : '2%'}`);
    if (result.rangeType) console.log(`   Range Type: ${result.rangeType}`);
    if (result.amount) console.log(`   Amount: ${result.amount}`);
  } else if (result.intent === 'removeLiquidity') {
    if (result.positionId) console.log(`   Position ID: ${result.positionId}`);
    if (result.percentage) console.log(`   Percentage: ${result.percentage}%`);
    if (result.fromToken) console.log(`   Tokens: ${result.fromToken} / ${result.toToken}`);
  } else if (result.intent === 'poolQuery') {
    if (result.fromToken) console.log(`   Tokens: ${result.fromToken}${result.toToken ? ' / ' + result.toToken : ''}`);
  }
  
  console.log('');
});

// Test pool discovery service
console.log('\n🔍 Testing 9mm V3 Pool Discovery Service');
console.log('========================================\n');

const poolDiscovery = new NineMmPoolDiscoveryService();

async function testPoolDiscovery() {
  try {
    // Test 1: Find PLS/USDC pools
    console.log('1. Finding PLS/USDC pools...');
    const plsUsdcPools = await poolDiscovery.findPools(
      '0xa1077a294dde1b09bb078844df40758a5d0f9a27', // WPLS
      '0x15D38573d2feeb82e7ad5187aB8c1D52810B1f07'  // USDC
    );
    
    if (plsUsdcPools.length > 0) {
      console.log(`   Found ${plsUsdcPools.length} PLS/USDC pools:\n`);
      plsUsdcPools.forEach((pool, index) => {
        console.log(poolDiscovery.formatPoolForDisplay(pool, index + 1));
      });
    } else {
      console.log('   No PLS/USDC pools found');
    }
    
    // Test 2: Get all pools sorted by volume
    console.log('\n2. Getting top pools by volume...');
    const topPools = await poolDiscovery.getAllAvailablePools({
      sortBy: 'volumeUSD',
      sortDirection: 'desc',
      minimumTVL: 10000
    });
    
    if (topPools.length > 0) {
      console.log(`   Found ${topPools.length} pools with TVL > $10K:\n`);
      topPools.slice(0, 5).forEach((pool, index) => {
        const token0 = pool.token0.symbol;
        const token1 = pool.token1.symbol;
        console.log(`   ${index + 1}. ${token0}/${token1} - ${poolDiscovery.formatPoolForDisplay(pool, index + 1)}`);
      });
    }
    
    // Test 3: Get pool details
    if (plsUsdcPools.length > 0) {
      console.log('\n3. Getting detailed pool information...');
      const details = await poolDiscovery.getPoolDetails(plsUsdcPools[0].id);
      if (details) {
        console.log(`   Pool: ${details.token0.symbol}/${details.token1.symbol}`);
        console.log(`   Fee Tier: ${poolDiscovery.formatFeeTier(details.feeTier)}`);
        console.log(`   TVL: $${parseFloat(details.totalValueLockedUSD).toLocaleString()}`);
        console.log(`   Volume: $${parseFloat(details.volumeUSD).toLocaleString()}`);
        console.log(`   APY: ~${poolDiscovery.calculateEstimatedAPY(details)}%`);
      }
    }
    
  } catch (error) {
    console.error('Error testing pool discovery:', error);
  }
}

// Run pool discovery tests
testPoolDiscovery();

// Test parser accuracy summary
console.log('\n📊 Parser Accuracy Summary');
console.log('=========================\n');

const intents = ['addLiquidity', 'removeLiquidity', 'poolQuery'];
const summary = {};

testCases.forEach(testCase => {
  const result = parseCommand(testCase);
  if (!summary[result.intent]) {
    summary[result.intent] = { count: 0, totalConfidence: 0 };
  }
  summary[result.intent].count++;
  summary[result.intent].totalConfidence += result.confidence;
});

intents.forEach(intent => {
  if (summary[intent]) {
    const avgConfidence = (summary[intent].totalConfidence / summary[intent].count * 100).toFixed(1);
    console.log(`${intent}: ${summary[intent].count} commands parsed (avg ${avgConfidence}% confidence)`);
  }
}); 