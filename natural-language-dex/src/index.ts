import 'dotenv/config';
import { NineMMAggregator } from './utils/aggregator.js';
import { parseCommand, validateCommand, formatCommand, getExampleCommands, getTokenAddress } from './utils/parser.js';

// Export for external use
export { NineMMAggregator } from './utils/aggregator.js';
export { parseCommand, validateCommand, formatCommand, getExampleCommands, getTokenAddress } from './utils/parser.js';
export { POPULAR_TOKENS, CHAIN_CONFIGS } from './config/chains.js';
export { NineMmPoolDiscoveryService } from './utils/9mm-v3-pool-discovery.js';
export { NineMmV3PositionManager } from './utils/9mm-v3-position-manager.js';

/**
 * Natural Language DEX Interface - Phase 3 Demonstration
 * Testing API integration + Natural Language Processing
 */

console.log('🚀 Natural Language DEX Interface - Phase 3 Demo');
console.log('================================================');

async function testApiConnectivity() {
  console.log('\n📡 Testing API Connectivity...');
  
  try {
    const response = await fetch('https://api.9mm.pro/swap/v1/sources');
    
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    
    const data = await response.json();
    const sources = data.records || [];
    
    console.log('✅ 9mm API Connection Successful');
    console.log(`   Status: ${response.status}`);
    console.log(`   Available DEX Sources: ${sources.length}`);
    console.log(`   Sources: ${sources.slice(0, 5).join(', ')}${sources.length > 5 ? '...' : ''}`);
    
    return true;
  } catch (error) {
    console.error('❌ API Connectivity Failed:', error);
    return false;
  }
}

async function testNaturalLanguageParser() {
  console.log('\n🧠 Testing Natural Language Parser...');
  
  const testCommands = [
    'Swap 100 USDC for WPLS',
    'What\'s the price of HEX?',
    'Show my PLS balance',
    'Exchange 1000 pulse to hex',
    'How much is ethereum worth?',
    'Trade 50 9MM for USDT',
    'Portfolio overview',
    'Convert 0.5 ETH → PLS',
    'Price of PLSX',
    'help',
    'Buy 200 tokens', // Incomplete command
    'Random nonsense text', // Invalid command
  ];

  console.log(`   Testing ${testCommands.length} example commands...\n`);

  let successCount = 0;
  
  for (const [index, command] of testCommands.entries()) {
    console.log(`${index + 1}. Input: "${command}"`);
    
    const parsed = parseCommand(command);
    const validation = validateCommand(parsed);
    
    console.log(`   → Intent: ${parsed.intent} (${(parsed.confidence * 100).toFixed(0)}% confidence)`);
    console.log(`   → Parsed: ${formatCommand(parsed)}`);
    
    if (validation.isValid) {
      console.log(`   → ✅ Valid command`);
      successCount++;
    } else {
      console.log(`   → ❌ Invalid: ${validation.errors.join(', ')}`);
    }
    
    console.log('');
  }
  
  const accuracy = (successCount / testCommands.length) * 100;
  console.log(`📊 Parser Accuracy: ${successCount}/${testCommands.length} (${accuracy.toFixed(1)}%)`);
  
  return accuracy > 70; // Consider 70%+ as successful
}

async function testLiveSwapQuote() {
  console.log('\n💱 Testing Live Swap Quote with Natural Language...');
  
  try {
    // Parse a natural language command
    const userCommand = 'Swap 1 WPLS for USDC';
    console.log(`   User command: "${userCommand}"`);
    
    const parsed = parseCommand(userCommand);
    const validation = validateCommand(parsed);
    
    if (!validation.isValid) {
      console.log('❌ Command validation failed');
      return false;
    }
    
    console.log(`   ✅ Parsed: ${formatCommand(parsed)}`);
    
    // Get token addresses
    const fromAddress = getTokenAddress(parsed.fromToken!);
    const toAddress = getTokenAddress(parsed.toToken!);
    
    if (!fromAddress || !toAddress) {
      console.log('❌ Token addresses not found');
      return false;
    }
    
    console.log(`   From Token: ${parsed.fromToken} (${fromAddress})`);
    console.log(`   To Token: ${parsed.toToken} (${toAddress})`);
    
    // Get live quote
    const aggregator = new NineMMAggregator(369);
    const amountInWei = (parseFloat(parsed.amount!) * Math.pow(10, 18)).toString();
    
    console.log(`   Getting live quote for ${parsed.amount} ${parsed.fromToken}...`);
    
    const quote = await aggregator.getSwapQuote({
      fromToken: fromAddress,
      toToken: toAddress,
      amount: amountInWei,
      slippagePercentage: 0.005,
      userAddress: '0x0000000000000000000000000000000000000001',
      chainId: 369,
    });
    
    // Display results
    const buyAmount = parseFloat(quote.buyAmount) / Math.pow(10, 6); // USDC has 6 decimals
    const price = parseFloat(quote.price);
    
    console.log('   ✅ Live Quote Retrieved:');
    console.log(`      Trading: ${parsed.amount} ${parsed.fromToken}`);
    console.log(`      Receiving: ~${buyAmount.toFixed(6)} ${parsed.toToken}`);
    console.log(`      Rate: 1 ${parsed.fromToken} = ${price.toFixed(8)} ${parsed.toToken}`);
    console.log(`      Gas: ${quote.gas} units`);
    console.log(`      Sources: ${quote.sources?.length || 0} DEX sources`);
    
    return true;
  } catch (error) {
    console.error('❌ Live swap quote failed:', error);
    return false;
  }
}

async function testLivePriceQuery() {
  console.log('\n📈 Testing Live Price Query with Natural Language...');
  
  try {
    // Parse a price query
    const userCommand = 'What\'s the price of HEX?';
    console.log(`   User command: "${userCommand}"`);
    
    const parsed = parseCommand(userCommand);
    const validation = validateCommand(parsed);
    
    if (!validation.isValid) {
      console.log('❌ Command validation failed');
      return false;
    }
    
    console.log(`   ✅ Parsed: ${formatCommand(parsed)}`);
    
    // Get token address
    const tokenAddress = getTokenAddress(parsed.fromToken!);
    const usdcAddress = getTokenAddress('USDC');
    
    if (!tokenAddress || !usdcAddress) {
      console.log('❌ Token address not found');
      return false;
    }
    
    console.log(`   Token: ${parsed.fromToken} (${tokenAddress})`);
    console.log(`   Getting live price...`);
    
    // Get live price
    const aggregator = new NineMMAggregator(369);
    
    const price = await aggregator.getPrice(
      tokenAddress,
      usdcAddress,
      '1000000000000000000' // 1 token in wei
    );
    
    // Display results
    const priceValue = parseFloat(price.price);
    const buyAmount = parseFloat(price.buyAmount) / Math.pow(10, 6); // USDC decimals
    
    console.log('   ✅ Live Price Retrieved:');
    console.log(`      Token: ${parsed.fromToken}`);
    console.log(`      Price: ${priceValue.toFixed(8)} USDC per token`);
    console.log(`      1 ${parsed.fromToken} = ${buyAmount.toFixed(6)} USDC`);
    
    return true;
  } catch (error) {
    console.error('❌ Live price query failed:', error);
    return false;
  }
}

function displaySupportedCommands() {
  console.log('\n📚 Natural Language Commands Supported');
  console.log('=====================================');
  
  const examples = getExampleCommands();
  
  for (const [category, commands] of Object.entries(examples)) {
    console.log(`\n${category}:`);
    commands.forEach(cmd => console.log(`   • "${cmd}"`));
  }
  
  console.log('\n🔍 Supported Tokens:');
  console.log('   PLS, WPLS, USDC, USDT, DAI, HEX, PLSX, 9MM, WETH');
  
  console.log('\n✨ Advanced Features:');
  console.log('   • Smart token recognition (hex → HEX, pulse → PLS)');
  console.log('   • Flexible amount formats (100, 1.5k, 2.3m)');
  console.log('   • Multiple command patterns (swap/trade/exchange/convert)');
  console.log('   • Confidence scoring for command interpretation');
  console.log('   • Real-time validation and error handling');
}

async function runComprehensiveDemo() {
  console.log('Starting comprehensive Natural Language DEX demonstration...\n');
  
  const results = {
    connectivity: await testApiConnectivity(),
    nlpParser: await testNaturalLanguageParser(),
    liveSwap: await testLiveSwapQuote(),
    livePrice: await testLivePriceQuery(),
  };
  
  // Display supported commands
  displaySupportedCommands();
  
  console.log('\n📊 Demo Results Summary');
  console.log('========================');
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    const emoji = passed ? '✅' : '❌';
    const label = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${emoji} ${label}`);
  });
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 Phase 3 Complete - Natural Language Interface Working!');
    console.log('\n🚀 Ready for Next Steps:');
    console.log('   1. ✅ API Integration Complete');
    console.log('   2. ✅ Natural Language Processing Working');  
    console.log('   3. ✅ Live Trading Quotes with NLP');
    console.log('   4. 🔧 ElizaOS Agent Integration');
    console.log('   5. 🔧 Web Interface Development');
    console.log('   6. 🔧 Wallet Connection & Execution');
    
    console.log('\n💡 Try running with different commands:');
    console.log('   npm run dev -- --demo "Swap 50 HEX for USDC"');
    console.log('   npm run dev -- --demo "Price of PLSX"');
  } else {
    console.log('\n⚠️  Some tests failed - check implementations');
  }
  
  return results;
}

// Parse command line arguments for different modes
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log('Natural Language DEX Interface - Phase 3 Demo');
  console.log('');
  console.log('Usage:');
  console.log('  npm run dev                     Run full demo');
  console.log('  npm run dev -- --nlp            Test parser only');
  console.log('  npm run dev -- --demo "command" Test specific command');
  console.log('  npm run dev -- --help           Show this help');
  console.log('');
  process.exit(0);
}

// Demo specific command
const demoIndex = args.indexOf('--demo');
if (demoIndex !== -1 && args[demoIndex + 1]) {
  const testCommand = args[demoIndex + 1];
  console.log(`\n🧪 Testing specific command: "${testCommand}"`);
  
  const parsed = parseCommand(testCommand);
  const validation = validateCommand(parsed);
  
  console.log(`\nParsed Result:`);
  console.log(`   Intent: ${parsed.intent}`);
  console.log(`   Confidence: ${(parsed.confidence * 100).toFixed(0)}%`);
  console.log(`   Formatted: ${formatCommand(parsed)}`);
  console.log(`   Valid: ${validation.isValid ? '✅' : '❌'}`);
  
  if (!validation.isValid) {
    console.log(`   Errors: ${validation.errors.join(', ')}`);
  }
  
  process.exit(0);
}

// Run specific tests
async function main() {
  if (args.includes('--nlp')) {
    await testNaturalLanguageParser();
  } else {
    // Run full comprehensive demo
    await runComprehensiveDemo();
  }
}

// Execute main function
main().catch(console.error);
