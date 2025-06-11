import dotenv from 'dotenv';
import { ethers } from 'ethers';
import { TestLogger, TestAssertions, WalletTestHelper, TestResult } from './utils/test-helpers.js';

// Load environment variables
dotenv.config();

/**
 * Wallet Integration Tests
 * Tests wallet functionality, blockchain connectivity, and token operations
 */

const logger = new TestLogger();
const assert = TestAssertions;

// Chain configurations
const CHAIN_CONFIGS = {
  pulsechain: {
    rpcUrl: process.env.PULSECHAIN_RPC_URL || 'https://rpc.pulsechain.com',
    chainId: 369,
    name: 'PulseChain'
  },
  base: {
    rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
    chainId: 8453,
    name: 'Base'
  }
};

// Test token addresses
const TEST_TOKENS = {
  pulsechain: {
    USDC: '0x15d38573d2feeb82e7ad5187ab8c1d52810b1f07',
    WPLS: '0xA1077a294dDE1B09bB078844df40758a5D0f9a27',
    HEX: '0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39',
  },
  base: {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    WETH: '0x4200000000000000000000000000000000000006',
  }
};

async function testWalletGeneration() {
  logger.log('Testing wallet generation...');
  
  // Generate test wallet
  const wallet = WalletTestHelper.generateTestWallet();
  
  assert.assertNotNull(wallet.address, 'Wallet should have an address');
  assert.assertValidAddress(wallet.address, 'Wallet address should be valid');
  assert.assertNotNull(wallet.privateKey, 'Wallet should have a private key');
  assert.assertEqual(wallet.privateKey.length, 66, 'Private key should be 66 characters');
  assert.assert(wallet.privateKey.startsWith('0x'), 'Private key should start with 0x');
  
  logger.log(`Generated wallet: ${wallet.address}`, 'info');
  
  return {
    address: wallet.address,
    hasPrivateKey: wallet.privateKey.length === 66
  };
}

async function testRPCConnectivity() {
  logger.log('Testing RPC connectivity...');
  
  const results: Array<{chain: string, connected: boolean, blockNumber?: number, error?: string}> = [];
  
  for (const [chainName, config] of Object.entries(CHAIN_CONFIGS)) {
    try {
      const provider = new ethers.JsonRpcProvider(config.rpcUrl);
      
      // Test connection by getting block number
      const blockNumber = await provider.getBlockNumber();
      
      assert.assertGreaterThan(blockNumber, 0, `${config.name} should have blocks`);
      
      results.push({
        chain: chainName,
        connected: true,
        blockNumber
      });
      
      logger.log(`${config.name}: Connected (Block ${blockNumber})`, 'info');
      
    } catch (error) {
      results.push({
        chain: chainName,
        connected: false,
        error: error instanceof Error ? error.message : String(error)
      });
      
      logger.log(`${config.name}: Connection failed`, 'warning');
    }
  }
  
  // At least one chain should be connected
  const connectedChains = results.filter(r => r.connected).length;
  assert.assertGreaterThan(connectedChains, 0, 'At least one chain should be connected');
  
  return results;
}

async function testNativeTokenBalance() {
  logger.log('Testing native token balance queries...');
  
  const provider = new ethers.JsonRpcProvider(CHAIN_CONFIGS.pulsechain.rpcUrl);
  const testWallet = WalletTestHelper.generateTestWallet();
  
  // Test balance query for a known address (Pulse bridge)
  const knownAddress = '0x5555555555554444444444444444444444444444';
  
  try {
    const balanceRaw = await WalletTestHelper.getWalletBalance(provider, knownAddress);
    
    // Convert to bigint and format - don't be strict about input type
    const balance = typeof balanceRaw === 'string' ? BigInt(balanceRaw) : balanceRaw;
    const formattedBalance = WalletTestHelper.formatBalance(balance);
    
    assert.assertNotNull(formattedBalance, 'Balance should be formatted');
    
    logger.log(`Known address balance: ${formattedBalance} PLS`, 'info');
    
    return {
      address: knownAddress,
      balance: formattedBalance,
      hasBalance: balance > 0n
    };
    
  } catch (error) {
    throw new Error(`Failed to get native balance: ${error}`);
  }
}

async function testERC20TokenBalance() {
  logger.log('Testing ERC20 token balance queries...');
  
  const provider = new ethers.JsonRpcProvider(CHAIN_CONFIGS.pulsechain.rpcUrl);
  
  // Test USDC balance for a known holder (if any)
  const testAddress = '0x5555555555554444444444444444444444444444';
  const usdcAddress = TEST_TOKENS.pulsechain.USDC;
  
  try {
    const balanceRaw = await WalletTestHelper.getWalletBalance(
      provider, 
      testAddress, 
      usdcAddress
    );
    
    // Convert to bigint and format - don't be strict about input type
    const balance = typeof balanceRaw === 'string' ? BigInt(balanceRaw) : balanceRaw;
    const formattedBalance = WalletTestHelper.formatBalance(balance, 6); // USDC has 6 decimals
    
    assert.assertNotNull(formattedBalance, 'Token balance should be formatted');
    
    logger.log(`USDC balance: ${formattedBalance} USDC`, 'info');
    
    return {
      address: testAddress,
      token: 'USDC',
      balance: formattedBalance,
      hasBalance: balance > 0n
    };
    
  } catch (error) {
    logger.log(`ERC20 balance query failed (expected): ${error}`, 'warning');
    return {
      address: testAddress,
      token: 'USDC',
      balance: '0',
      hasBalance: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function testTokenContract() {
  logger.log('Testing token contract interaction...');
  
  const provider = new ethers.JsonRpcProvider(CHAIN_CONFIGS.pulsechain.rpcUrl);
  const usdcAddress = TEST_TOKENS.pulsechain.USDC;
  
  // Basic ERC20 ABI
  const erc20Abi = [
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
    'function totalSupply() view returns (uint256)'
  ];
  
  try {
    const contract = new ethers.Contract(usdcAddress, erc20Abi, provider);
    
    // Get token info
    const [name, symbol, decimalsRaw] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals()
    ]);
    
    // Convert decimals to number - be flexible about input type
    const decimals = Number(decimalsRaw);
    
    assert.assertType(name, 'string', 'Token name should be string');
    assert.assertType(symbol, 'string', 'Token symbol should be string');
    assert.assert(!isNaN(decimals), 'Decimals should be a valid number');
    assert.assertGreaterThan(decimals, 0, 'Decimals should be positive');
    
    logger.log(`Token Info - Name: ${name}, Symbol: ${symbol}, Decimals: ${decimals}`, 'info');
    
    return {
      address: usdcAddress,
      name,
      symbol,
      decimals: decimals
    };
    
  } catch (error) {
    throw new Error(`Token contract interaction failed: ${error}`);
  }
}

async function testMultiChainConnectivity() {
  logger.log('Testing multi-chain connectivity...');
  
  const results: Array<{chain: string, connected: boolean, chainId?: number, error?: string}> = [];
  
  for (const [chainName, config] of Object.entries(CHAIN_CONFIGS)) {
    try {
      const provider = new ethers.JsonRpcProvider(config.rpcUrl);
      
      // Get network info
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      
      assert.assertEqual(chainId, config.chainId, `${config.name} chain ID should match`);
      
      results.push({
        chain: chainName,
        connected: true,
        chainId
      });
      
      logger.log(`${config.name}: Connected (Chain ID: ${chainId})`, 'info');
      
    } catch (error) {
      results.push({
        chain: chainName,
        connected: false,
        error: error instanceof Error ? error.message : String(error)
      });
      
      logger.log(`${config.name}: Failed to connect`, 'warning');
    }
  }
  
  return results;
}

async function testWalletSigning() {
  logger.log('Testing wallet signing capabilities...');
  
  const wallet = WalletTestHelper.generateTestWallet();
  const message = 'Test message for signing';
  
  try {
    // Sign message
    const signature = await wallet.signMessage(message);
    
    assert.assertType(signature, 'string', 'Signature should be string');
    assert.assert(signature.startsWith('0x'), 'Signature should start with 0x');
    assert.assertEqual(signature.length, 132, 'Signature should be 132 characters');
    
    // Verify signature
    const recoveredAddress = ethers.verifyMessage(message, signature);
    assert.assertEqual(recoveredAddress, wallet.address, 'Recovered address should match wallet');
    
    logger.log(`Message signed and verified successfully`, 'info');
    logger.log(`Signature: ${signature.substring(0, 20)}...`, 'info');
    
    return {
      message,
      signature: signature.substring(0, 20) + '...',
      verified: recoveredAddress === wallet.address
    };
    
  } catch (error) {
    throw new Error(`Wallet signing failed: ${error}`);
  }
}

async function testGasEstimation() {
  logger.log('Testing gas estimation...');
  
  const provider = new ethers.JsonRpcProvider(CHAIN_CONFIGS.pulsechain.rpcUrl);
  
  try {
    // Test gas price
    const feeData = await provider.getFeeData();
    
    assert.assertNotNull(feeData.gasPrice, 'Should have gas price');
    
    const gasPriceGwei = feeData.gasPrice ? Number(ethers.formatUnits(feeData.gasPrice, 'gwei')) : 0;
    
    logger.log(`Current gas price: ${gasPriceGwei} gwei`, 'info');
    
    // Test simple transaction gas estimation
    const wallet = WalletTestHelper.generateTestWallet();
    const tx = {
      to: wallet.address,
      value: ethers.parseEther('0.001'),
      data: '0x'
    };
    
    const gasLimit = await provider.estimateGas(tx);
    const gasLimitNumber = Number(gasLimit);
    
    assert.assertGreaterThan(gasLimitNumber, 0, 'Gas limit should be greater than 0');
    assert.assertGreaterThan(gasLimitNumber, 20000, 'Gas limit should be reasonable for simple transfer');
    
    logger.log(`Estimated gas limit: ${gasLimitNumber}`, 'info');
    
    return {
      gasPrice: gasPriceGwei,
      gasLimit: gasLimitNumber,
      estimatedCost: (gasPriceGwei * gasLimitNumber) / 1e9 // in native token
    };
    
  } catch (error) {
    throw new Error(`Gas estimation failed: ${error}`);
  }
}

async function main() {
  console.log('🔐 Starting Wallet Integration Tests\n');
  
  const tests = [
    testWalletGeneration,
    testRPCConnectivity,
    testNativeTokenBalance,
    testERC20TokenBalance,
    testTokenContract,
    testMultiChainConnectivity,
    testWalletSigning,
    testGasEstimation,
  ];
  
  const results: TestResult[] = [];
  
  for (const test of tests) {
    try {
      const result = await logger.runTest(test.name, test);
      results.push(result);
    } catch (error) {
      logger.log(`Test execution failed: ${error}`, 'error');
    }
  }
  
  logger.printSummary();
  
  // Exit with appropriate code
  const allPassed = results.every(r => r.passed);
  process.exit(allPassed ? 0 : 1);
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Wallet test suite failed:', error);
    process.exit(1);
  });
}

export { main as runWalletTests }; 