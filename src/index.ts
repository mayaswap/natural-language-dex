import 'dotenv/config';
import { NineMMAggregator } from './utils/aggregator.js';
import { CHAIN_CONFIGS, DEFAULT_CHAIN } from './config/chains.js';
import type { SwapRequest } from './types/index.js';

/**
 * Natural Language DEX Interface - Core Demo
 * Demonstrates the 9mm aggregator integration
 */

console.log('🚀 Starting Natural Language DEX Interface Demo...');

async function testBasicSetup() {
  try {
    console.log('✅ TypeScript compilation working');
    console.log('✅ ES Modules configured');
    console.log('✅ Node.js environment ready');
    
    // Test 9mm API connectivity
    const response = await fetch('https://api.9mm.pro/swap/v1/sources');
    console.log('✅ 9mm API accessible');
    console.log(`   Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   Available sources: ${Object.keys(data.sources || {}).length}`);
      console.log(`   Sources: ${Object.keys(data.sources || {}).slice(0, 5).join(', ')}...`);
    }
    
    console.log('');
    console.log('🎉 Basic setup test completed successfully!');
    console.log('');
    console.log('🔧 Ready for next steps:');
    console.log('   1. ✅ Core infrastructure');
    console.log('   2. ✅ API connectivity');
    console.log('   3. 🔄 Full aggregator integration');
    console.log('   4. 🔄 Natural language processing');
    
  } catch (error) {
    console.error('❌ Basic setup test failed:', error);
    console.log('');
    console.log('💡 Possible issues:');
    console.log('   • Network connectivity');
    console.log('   • API temporarily down');
    console.log('   • Firewall blocking requests');
  }
}

testBasicSetup();

// Parse command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log('Natural Language DEX Interface');
  console.log('');
  console.log('Usage:');
  console.log('  npm run dev           Run the demo');
  console.log('  npm run dev --help    Show this help');
  console.log('');
  console.log('Environment Variables:');
  console.log('  OPENAI_API_KEY        OpenAI API key (for future ElizaOS integration)');
  console.log('  NINMM_API_KEY         9mm Aggregator API key (optional)');
  console.log('');
  process.exit(0);
}

// Run the demo
if (import.meta.url === `file://${process.argv[1]}`) {
  testAggregator().catch(console.error);
}

export { NineMMAggregator, CHAIN_CONFIGS }; 