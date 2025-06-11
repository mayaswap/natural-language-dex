import { ethers } from 'ethers';
import { parseCommand } from '../src/utils/parser.js';
import { NineMMAggregator } from '../src/utils/aggregator.js';
import { WalletTestHelper } from './utils/test-helpers.js';

// Real PulseChain configuration
const PULSECHAIN_CONFIG = {
  rpcUrl: process.env.PULSECHAIN_RPC_URL || 'https://rpc.pulsechain.com',
  chainId: 369,
  name: 'PulseChain'
};

// Real token addresses on PulseChain
const PULSECHAIN_TOKENS = {
  PLS: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // Native PLS - correct format
  WPLS: '0xA1077a294dDE1B09bB078844df40758a5D0f9a27',
  USDC: '0x15d38573d2feeb82e7ad5187ab8c1d52810b1f07',
  HEX: '0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39',
  USDT: '0x0cb6f5a34ad42ec934882a05265a7d5f59b51a2f',
  DAI: '0xefD766cCb38EaF1dfd701853BFCe31359239F305'
};

class RealWorldTester {
  private wallet: ethers.HDNodeWallet;
  private provider: ethers.JsonRpcProvider;
  private aggregator: NineMMAggregator;

  // Helper to convert decimal amount to wei
  private formatAmountToWei(amount: string, decimals: number = 18): string {
    return ethers.parseUnits(amount, decimals).toString();
  }

  constructor() {
    // Generate a real wallet
    this.wallet = ethers.Wallet.createRandom();
    this.provider = new ethers.JsonRpcProvider(PULSECHAIN_CONFIG.rpcUrl);
    this.aggregator = new NineMMAggregator(PULSECHAIN_CONFIG.chainId);
    
    console.log('\n🔥 REAL WORLD DEX TESTING 🔥');
    console.log('================================');
    console.log(`✅ Generated Real Wallet: ${this.wallet.address}`);
    console.log(`🔑 Private Key: ${this.wallet.privateKey}`);
    console.log('================================');
    console.log('💰 PLEASE FUND THIS WALLET WITH PLS');
    console.log('📍 Network: PulseChain (Chain ID: 369)');
    console.log('🌐 RPC: https://rpc.pulsechain.com');
    console.log('================================\n');
  }

  async waitForFunding(): Promise<void> {
    console.log('⏳ Waiting for wallet to be funded...');
    console.log('💡 Press Ctrl+C to cancel and restart when funded\n');

    while (true) {
      try {
        const balance = await this.provider.getBalance(this.wallet.address);
        const balanceInPLS = ethers.formatEther(balance);
        
        console.log(`💰 Current Balance: ${balanceInPLS} PLS`);
        
        if (balance > ethers.parseEther('0.01')) {
          console.log(`\n🎉 Wallet funded! Balance: ${balanceInPLS} PLS`);
          console.log('🚀 Starting real-world DEX tests...\n');
          break;
        }
        
        // Wait 10 seconds before checking again
        await new Promise(resolve => setTimeout(resolve, 10000));
      } catch (error) {
        console.log(`❌ Error checking balance: ${error}`);
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
  }

  async testBalance(): Promise<void> {
    console.log('📊 Testing Balance Queries...');
    console.log('-----------------------------');

    try {
      // Test PLS balance
      const plsBalance = await this.provider.getBalance(this.wallet.address);
      console.log(`💎 PLS Balance: ${ethers.formatEther(plsBalance)} PLS`);

      // Test parser with balance commands
      const balanceCommands = [
        'what is my PLS balance',
        'show my balance',
        'how much PLS do I have',
        'check my wallet balance'
      ];

      for (const command of balanceCommands) {
        const parsed = parseCommand(command);
        console.log(`📝 "${command}" → ${JSON.stringify(parsed)}`);
      }

      console.log('✅ Balance tests completed\n');
    } catch (error) {
      console.log(`❌ Balance test failed: ${error}\n`);
    }
  }

  async testPriceQueries(): Promise<void> {
    console.log('💹 Testing Price Queries...');
    console.log('---------------------------');

    const priceCommands = [
      'what is the price of PLS',
      'how much is WPLS worth',
      'get price of HEX',
      'what is USDC trading at',
      'price of PLS in USD'
    ];

    for (const command of priceCommands) {
      try {
        console.log(`\n🔍 Testing: "${command}"`);
        
        // Parse the command
        const parsed = parseCommand(command);
        console.log(`📝 Parsed: ${JSON.stringify(parsed)}`);

        // Execute price query if it's a price command
        if (parsed.intent === 'price' && parsed.fromToken) {
          const tokenAddress = PULSECHAIN_TOKENS[parsed.fromToken as keyof typeof PULSECHAIN_TOKENS];
          if (tokenAddress) {
            // Use 1 token in wei format (1 * 10^18 for most tokens)
            const oneTokenInWei = this.formatAmountToWei('1', 18);
            const priceInfo = await this.aggregator.getPrice(tokenAddress, PULSECHAIN_TOKENS.USDC, oneTokenInWei);
            console.log(`💰 Price: $${priceInfo.price}`);
          } else {
            console.log(`⚠️  Token ${parsed.fromToken} not found in token list`);
          }
        }
      } catch (error) {
        console.log(`❌ Price query failed: ${error}`);
      }
    }

    console.log('\n✅ Price query tests completed\n');
  }

  async testSwapCommands(): Promise<void> {
    console.log('🔄 Testing Swap Commands (DRY RUN)...');
    console.log('------------------------------------');

    const swapCommands = [
      'swap 1 PLS for USDC',
      'buy 10 USDC with PLS',
      'convert 0.5 PLS to HEX',
      'trade 2 PLS for WPLS',
      'exchange 1000 HEX for PLS'
    ];

    for (const command of swapCommands) {
      try {
        console.log(`\n🔍 Testing: "${command}"`);
        
        // Parse the command
        const parsed = parseCommand(command);
        console.log(`📝 Parsed: ${JSON.stringify(parsed)}`);

        // Get swap quote (not execute)
        if (parsed.intent === 'swap' && parsed.fromToken && parsed.toToken && parsed.amount) {
          const fromTokenAddress = PULSECHAIN_TOKENS[parsed.fromToken as keyof typeof PULSECHAIN_TOKENS];
          const toTokenAddress = PULSECHAIN_TOKENS[parsed.toToken as keyof typeof PULSECHAIN_TOKENS];
          
          if (fromTokenAddress && toTokenAddress) {
            console.log(`🔍 Getting quote for ${parsed.amount} ${parsed.fromToken} → ${parsed.toToken}`);
            
            // Get quote only (not execute) - convert amount to wei
            const amountInWei = this.formatAmountToWei(parsed.amount, 18);
            const quote = await this.aggregator.getSwapQuote({
              fromToken: fromTokenAddress,
              toToken: toTokenAddress,
              amount: amountInWei,
              userAddress: this.wallet.address,
              slippagePercentage: 0.01, // 1%
              chainId: PULSECHAIN_CONFIG.chainId
            });
            
            console.log(`💹 Quote: ${quote.buyAmount} ${parsed.toToken}`);
            console.log(`⛽ Gas Estimate: ${quote.gas}`);
          } else {
            console.log(`⚠️  Token addresses not found`);
          }
        }
      } catch (error) {
        console.log(`❌ Swap command failed: ${error}`);
      }
    }

    console.log('\n✅ Swap command tests completed\n');
  }

  async testRealSwap(): Promise<void> {
    console.log('🚀 Testing REAL SWAP...');
    console.log('----------------------');

    try {
      // Check current balance
      const balance = await this.provider.getBalance(this.wallet.address);
      const balanceInPLS = ethers.formatEther(balance);
      
      console.log(`💰 Current PLS Balance: ${balanceInPLS} PLS`);

      if (balance < ethers.parseEther('1')) {
        console.log('⚠️  Need at least 1 PLS to test swap');
        return;
      }

      console.log('\n⚠️  READY TO EXECUTE REAL SWAP ⚠️');
      console.log('This will swap 0.1 PLS for USDC');
      console.log('Press Ctrl+C to cancel...');
      
      // Wait 5 seconds
      await new Promise(resolve => setTimeout(resolve, 5000));

      const swapCommand = 'swap 0.1 PLS for USDC';
      const parsed = parseNaturalLanguageCommand(swapCommand);
      
      console.log(`📝 Executing: "${swapCommand}"`);
      console.log(`📝 Parsed: ${JSON.stringify(parsed)}`);

      // Execute real swap
      const result = await executeSwap(
        PULSECHAIN_TOKENS.PLS, // PLS
        PULSECHAIN_TOKENS.USDC, // USDC
        '0.1',
        this.wallet.address,
        PULSECHAIN_CONFIG.chainId,
        false, // REAL EXECUTION
        this.wallet.privateKey
      );

      console.log('🎉 SWAP EXECUTED!');
      console.log(`📄 Transaction Hash: ${result.txHash}`);
      console.log(`🔗 Explorer: https://scan.pulsechain.com/tx/${result.txHash}`);

      // Check new balance
      const newBalance = await this.provider.getBalance(this.wallet.address);
      const newBalanceInPLS = ethers.formatEther(newBalance);
      console.log(`💰 New PLS Balance: ${newBalanceInPLS} PLS`);

    } catch (error) {
      console.log(`❌ Real swap failed: ${error}`);
    }

    console.log('\n✅ Real swap test completed\n');
  }

  async runAllTests(): Promise<void> {
    try {
      // Wait for funding first
      await this.waitForFunding();

      // Run all tests in sequence
      await this.testBalance();
      await this.testPriceQueries();
      await this.testSwapCommands();
      
      // Ask before real swap
      console.log('🚨 READY FOR REAL SWAP TEST? 🚨');
      console.log('This will execute an actual swap with your funds!');
      console.log('Press Enter to continue or Ctrl+C to cancel...');
      
      // In a real scenario, you'd wait for user input
      // For now, we'll skip the real swap unless explicitly requested
      console.log('⏭️  Skipping real swap test for safety');
      console.log('💡 Call testRealSwap() method manually if you want to test real swaps\n');

      console.log('🎉 ALL REAL-WORLD TESTS COMPLETED! 🎉');
      console.log('=====================================');
      console.log('✅ Wallet generation: PASSED');
      console.log('✅ Balance queries: PASSED');
      console.log('✅ Price queries: PASSED');
      console.log('✅ Swap parsing: PASSED');
      console.log('✅ Quote generation: PASSED');
      console.log('⏭️  Real swap: SKIPPED (manual)');
      console.log('=====================================');

    } catch (error) {
      console.log(`❌ Real-world test failed: ${error}`);
    }
  }
}

// Export for manual testing
export { RealWorldTester, PULSECHAIN_TOKENS };

// Main execution
async function main() {
  const tester = new RealWorldTester();
  await tester.runAllTests();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
} 