import dotenv from 'dotenv';
import { TestLogger, TestAssertions, APITestHelper, TestResult } from './utils/test-helpers.js';

// Load environment variables
dotenv.config();

/**
 * API Integration Tests
 * Tests all external API endpoints to ensure they're working correctly
 */

const logger = new TestLogger();
const assert = TestAssertions;

// Test configuration
const NINMM_BASE_URL = process.env.NINMM_AGGREGATOR_BASE_URL || 'https://api.9mm.pro';
const TIMEOUT_MS = parseInt(process.env.TEST_TIMEOUT_MS || '30000');

// Test token addresses for Pulsechain
const TEST_TOKENS = {
  USDC: '0x15d38573d2feeb82e7ad5187ab8c1d52810b1f07',
  WPLS: '0xA1077a294dDE1B09bB078844df40758a5D0f9a27',
  HEX: '0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39',
  PLSX: '0x95b303987a60c71504d99aa1b13b4da07b0790ab',
  PLS: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
};

async function test9mmAggregatorSources() {
  logger.log('Testing 9mm Aggregator Sources endpoint...');
  
  const url = `${NINMM_BASE_URL}/swap/v1/sources`;
  const data = await APITestHelper.testJSONResponse(url, ['records']);
  
  assert.assertType(data.records, 'object', '9mm sources should return records object');
  assert.assertGreaterThan(Object.keys(data.records).length, 0, 'Should have at least one DEX source');
  
  logger.log(`Found ${Object.keys(data.records).length} DEX sources`);
  
  // Log available sources
  for (const [source, details] of Object.entries(data.records)) {
    logger.log(`  - ${source}`, 'info');
  }
  
  return data;
}

async function test9mmPriceEndpoint() {
  logger.log('Testing 9mm Price endpoint...');
  
  // Test USDC to WPLS price
  const params = new URLSearchParams({
    sellToken: TEST_TOKENS.USDC,
    buyToken: TEST_TOKENS.WPLS,
    sellAmount: '1000000', // 1 USDC (6 decimals)
  });
  
  const url = `${NINMM_BASE_URL}/swap/v1/price?${params.toString()}`;
  const data = await APITestHelper.testJSONResponse(url, [
    'price',
    'buyAmount',
    'sellTokenAddress',
    'buyTokenAddress'
  ]);
  
  assert.assertType(data.price, 'string', 'Price should be a string');
  assert.assertType(data.buyAmount, 'string', 'Buy amount should be a string');
  assert.assertValidBigNumber(data.buyAmount, 'Buy amount should be valid BigNumber');
  
  const price = parseFloat(data.price);
  assert.assertGreaterThan(price, 0, 'Price should be greater than 0');
  
  logger.log(`USDC → WPLS Price: ${price}`, 'info');
  logger.log(`1 USDC = ${data.buyAmount} WPLS wei`, 'info');
  
  return data;
}

async function test9mmQuoteEndpoint() {
  logger.log('Testing 9mm Quote endpoint...');
  
  // Test USDC to HEX quote
  const params = new URLSearchParams({
    sellToken: TEST_TOKENS.USDC,
    buyToken: TEST_TOKENS.HEX,
    sellAmount: '1000000', // 1 USDC (6 decimals)
    slippagePercentage: '0.5',
    takerAddress: '0x742d35Cc6634C0532925a3b8D01d3e2e1Eb5f924', // Example address
  });
  
  const url = `${NINMM_BASE_URL}/swap/v1/quote?${params.toString()}`;
  const data = await APITestHelper.testJSONResponse(url, [
    'sellTokenAddress',
    'buyTokenAddress',
    'sellAmount',
    'buyAmount',
    'price'
  ]);
  
  assert.assertEqual(data.sellTokenAddress.toLowerCase(), TEST_TOKENS.USDC.toLowerCase(), 'Sell token should match');
  assert.assertEqual(data.buyTokenAddress.toLowerCase(), TEST_TOKENS.HEX.toLowerCase(), 'Buy token should match');
  assert.assertValidBigNumber(data.sellAmount, 'Sell amount should be valid');
  assert.assertValidBigNumber(data.buyAmount, 'Buy amount should be valid');
  assert.assertNotNull(data.price, 'Price should be present');
  
  const price = parseFloat(data.price);
  const buyAmount = parseFloat(data.buyAmount);
  
  logger.log(`USDC → HEX Quote:`, 'info');
  logger.log(`  Price: ${price} HEX per USDC`, 'info');
  logger.log(`  Buy Amount: ${buyAmount} HEX wei`, 'info');
  logger.log(`  Gas: ${data.gas || data.estimatedGas || 'N/A'}`, 'info');
  
  return data;
}

async function testMultipleTokenPairs() {
  logger.log('Testing multiple token pairs...');
  
  const testPairs = [
    { from: TEST_TOKENS.WPLS, to: TEST_TOKENS.HEX, name: 'WPLS → HEX' },
    { from: TEST_TOKENS.HEX, to: TEST_TOKENS.USDC, name: 'HEX → USDC' },
    { from: TEST_TOKENS.PLSX, to: TEST_TOKENS.WPLS, name: 'PLSX → WPLS' },
  ];
  
  const results: Array<{pair: string, price: number, buyAmount: string}> = [];
  
  for (const pair of testPairs) {
    try {
      const params = new URLSearchParams({
        sellToken: pair.from,
        buyToken: pair.to,
        sellAmount: '1000000000000000000', // 1 token (18 decimals)
      });
      
      const url = `${NINMM_BASE_URL}/swap/v1/price?${params.toString()}`;
      const data = await APITestHelper.testJSONResponse(url, ['price', 'buyAmount']);
      
      const price = parseFloat(data.price);
      results.push({
        pair: pair.name,
        price,
        buyAmount: data.buyAmount
      });
      
      logger.log(`${pair.name}: ${price}`, 'info');
      
    } catch (error) {
      logger.log(`Failed to get price for ${pair.name}: ${error}`, 'warning');
    }
  }
  
  assert.assertGreaterThan(results.length, 0, 'Should successfully get at least one price');
  
  return results;
}

async function testAPIRateLimits() {
  logger.log('Testing API rate limits...');
  
  const requests: Array<Promise<{status: number, requestId: number}>> = [];
  const url = `${NINMM_BASE_URL}/swap/v1/sources`;
  
  // Make 5 rapid requests
  for (let i = 0; i < 5; i++) {
    requests.push(
      APITestHelper.testEndpoint(url).then(response => ({
        status: response.status,
        requestId: i
      }))
    );
  }
  
  const results = await Promise.allSettled(requests);
  const successful = results.filter(r => r.status === 'fulfilled').length;
  
  logger.log(`${successful}/5 requests successful`, 'info');
  
  // Should allow at least 3 requests
  assert.assertGreaterThan(successful, 2, 'API should handle multiple requests');
  
  return { successful, total: 5 };
}

async function testErrorHandling() {
  logger.log('Testing error handling...');
  
  // Test invalid token address
  const params = new URLSearchParams({
    sellToken: '0x0000000000000000000000000000000000000000',
    buyToken: TEST_TOKENS.USDC,
    sellAmount: '1000000',
  });
  
  const url = `${NINMM_BASE_URL}/swap/v1/price?${params.toString()}`;
  
  try {
    await APITestHelper.testEndpoint(url);
    throw new Error('Should have failed for invalid token');
  } catch (error) {
    if (error instanceof Error && error.message.includes('HTTP')) {
      logger.log('API correctly returns error for invalid token', 'info');
      return { errorHandled: true };
    }
    throw error;
  }
}

async function testGraphQLEndpoints() {
  logger.log('Testing GraphQL endpoints...');
  
  const endpoints = [
    process.env.PULSECHAIN_GRAPHQL_URL,
    process.env.BASE_GRAPHQL_URL
  ].filter(Boolean);
  
  if (endpoints.length === 0) {
    logger.log('No GraphQL endpoints configured, skipping...', 'warning');
    return { skipped: true };
  }
  
  const results: Array<{endpoint: string, status?: number, working: boolean, error?: string}> = [];
  
  for (const endpoint of endpoints) {
    if (!endpoint) continue;
    
    try {
      const response = await APITestHelper.testEndpoint(endpoint);
      results.push({
        endpoint,
        status: response.status,
        working: true
      });
      logger.log(`GraphQL endpoint working: ${endpoint}`, 'info');
    } catch (error) {
      results.push({
        endpoint,
        error: error instanceof Error ? error.message : String(error),
        working: false
      });
      logger.log(`GraphQL endpoint failed: ${endpoint}`, 'warning');
    }
  }
  
  return results;
}

async function main() {
  console.log('🚀 Starting API Integration Tests\n');
  
  const tests = [
    () => test9mmAggregatorSources(),
    () => test9mmPriceEndpoint(),
    () => test9mmQuoteEndpoint(),
    () => testMultipleTokenPairs(),
    () => testAPIRateLimits(),
    () => testErrorHandling(),
    () => testGraphQLEndpoints(),
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
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

export { main as runAPITests }; 