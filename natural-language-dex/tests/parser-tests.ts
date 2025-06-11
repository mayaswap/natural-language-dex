import { TestLogger, TestAssertions, TestResult } from './utils/test-helpers.js';

/**
 * Natural Language Parser Tests
 * Tests the enhanced parser that claims 100% accuracy
 */

const logger = new TestLogger();
const assert = TestAssertions;

// Import parser function - we'll need to adjust path based on actual structure
let parseCommand: any;

try {
  const parserModule = await import('../src/utils/parser.js');
  parseCommand = parserModule.parseCommand;
} catch (error) {
  console.error('Failed to import parser:', error);
  process.exit(1);
}

// Test cases that should achieve 100% accuracy
const SWAP_TEST_CASES = [
  {
    input: "Swap 100 USDC for ETH",
    expected: { intent: 'swap', fromToken: 'USDC', toToken: 'WETH', amount: '100' }
  },
  {
    input: "Exchange 1000 pulse to hex",
    expected: { intent: 'swap', fromToken: 'PLS', toToken: 'HEX', amount: '1000' }
  },
  {
    input: "I want to swap 50 DAI for WPLS",
    expected: { intent: 'swap', fromToken: 'DAI', toToken: 'WPLS', amount: '50' }
  },
  {
    input: "Can you exchange 25 PLSX into HEX",
    expected: { intent: 'swap', fromToken: 'PLSX', toToken: 'HEX', amount: '25' }
  },
  {
    input: "Looking to sell 500 HEX for USDC",
    expected: { intent: 'swap', fromToken: 'HEX', toToken: 'USDC', amount: '500' }
  },
  {
    input: "Trade 0.5 ETH to USDT",
    expected: { intent: 'swap', fromToken: 'WETH', toToken: 'USDT', amount: '0.5' }
  },
  {
    input: "Convert 2000 USDT into WPLS",
    expected: { intent: 'swap', fromToken: 'USDT', toToken: 'WPLS', amount: '2000' }
  },
  {
    input: "Change 50 DAI into WPLS",
    expected: { intent: 'swap', fromToken: 'DAI', toToken: 'WPLS', amount: '50' }
  },
  {
    input: "Turn 100 USDC into Pulse",
    expected: { intent: 'swap', fromToken: 'USDC', toToken: 'PLS', amount: '100' }
  },
  {
    input: "Buy 1000 HEX with USDC",
    expected: { intent: 'swap', fromToken: 'USDC', toToken: 'HEX', amount: '1000' }
  }
];

const PRICE_TEST_CASES = [
  {
    input: "What's HEX trading at?",
    expected: { intent: 'price', fromToken: 'HEX' }
  },
  {
    input: "What's the price of HEX?",
    expected: { intent: 'price', fromToken: 'HEX' }
  },
  {
    input: "How much is PLSX worth?",
    expected: { intent: 'price', fromToken: 'PLSX' }
  },
  {
    input: "PLS price",
    expected: { intent: 'price', fromToken: 'PLS' }
  },
  {
    input: "Current ETH price",
    expected: { intent: 'price', fromToken: 'WETH' }
  },
  {
    input: "Check USDC price",
    expected: { intent: 'price', fromToken: 'USDC' }
  },
  {
    input: "HEX value",
    expected: { intent: 'price', fromToken: 'HEX' }
  },
  {
    input: "What is WPLS trading at today?",
    expected: { intent: 'price', fromToken: 'WPLS' }
  }
];

const BALANCE_TEST_CASES = [
  {
    input: "How much USDC do I have?",
    expected: { intent: 'balance', fromToken: 'USDC' }
  },
  {
    input: "Show my HEX balance",
    expected: { intent: 'balance', fromToken: 'HEX' }
  },
  {
    input: "What's my PLS balance?",
    expected: { intent: 'balance', fromToken: 'PLS' }
  },
  {
    input: "Check my ETH holdings",
    expected: { intent: 'balance', fromToken: 'WETH' }
  },
  {
    input: "My PLSX amount",
    expected: { intent: 'balance', fromToken: 'PLSX' }
  }
];

const PORTFOLIO_TEST_CASES = [
  {
    input: "Show my portfolio",
    expected: { intent: 'portfolio' }
  },
  {
    input: "My portfolio overview",
    expected: { intent: 'portfolio' }
  },
  {
    input: "All my assets",
    expected: { intent: 'portfolio' }
  },
  {
    input: "Show all my tokens",
    expected: { intent: 'portfolio' }
  },
  {
    input: "Portfolio summary",
    expected: { intent: 'portfolio' }
  }
];

// Edge cases and complex scenarios
const EDGE_CASE_TESTS = [
  {
    input: "Swap 1.5k USDC for ETH",
    expected: { intent: 'swap', fromToken: 'USDC', toToken: 'WETH', amount: '1500' }
  },
  {
    input: "Exchange 2.5m PLS to HEX",
    expected: { intent: 'swap', fromToken: 'PLS', toToken: 'HEX', amount: '2500000' }
  },
  {
    input: "I need to swap my 100 USDC for some ETH",
    expected: { intent: 'swap', fromToken: 'USDC', toToken: 'WETH', amount: '100' }
  },
  {
    input: "Can you help me exchange 50 DAI for wrapped pulse?",
    expected: { intent: 'swap', fromToken: 'DAI', toToken: 'WPLS', amount: '50' }
  }
];

async function testSwapParsing() {
  logger.log('Testing swap command parsing...');
  
  let passedCount = 0;
  const results: Array<{input: string, passed: boolean, actual?: any, error?: string}> = [];
  
  for (const testCase of SWAP_TEST_CASES) {
    try {
      const parsed = parseCommand(testCase.input);
      
      const passed = (
        parsed.intent === testCase.expected.intent &&
        parsed.fromToken === testCase.expected.fromToken &&
        parsed.toToken === testCase.expected.toToken &&
        parsed.amount === testCase.expected.amount &&
        parsed.confidence > 0.6
      );
      
      if (passed) {
        passedCount++;
        logger.log(`✅ "${testCase.input}" → ${parsed.intent}: ${parsed.amount} ${parsed.fromToken} → ${parsed.toToken}`, 'info');
      } else {
        logger.log(`❌ "${testCase.input}" failed`, 'warning');
        logger.log(`   Expected: ${JSON.stringify(testCase.expected)}`, 'warning');
        logger.log(`   Actual: ${JSON.stringify({intent: parsed.intent, fromToken: parsed.fromToken, toToken: parsed.toToken, amount: parsed.amount})}`, 'warning');
      }
      
      results.push({
        input: testCase.input,
        passed,
        actual: parsed
      });
      
    } catch (error) {
      results.push({
        input: testCase.input,
        passed: false,
        error: error instanceof Error ? error.message : String(error)
      });
      
      logger.log(`❌ "${testCase.input}" threw error: ${error}`, 'error');
    }
  }
  
  const accuracy = (passedCount / SWAP_TEST_CASES.length) * 100;
  
  logger.log(`Swap parsing accuracy: ${accuracy}% (${passedCount}/${SWAP_TEST_CASES.length})`, 'info');
  
  assert.assertEqual(passedCount, SWAP_TEST_CASES.length, 'All swap tests should pass for 100% accuracy');
  
  return {
    total: SWAP_TEST_CASES.length,
    passed: passedCount,
    accuracy,
    results
  };
}

async function testPriceParsing() {
  logger.log('Testing price command parsing...');
  
  let passedCount = 0;
  const results: Array<{input: string, passed: boolean, actual?: any, error?: string}> = [];
  
  for (const testCase of PRICE_TEST_CASES) {
    try {
      const parsed = parseCommand(testCase.input);
      
      const passed = (
        parsed.intent === testCase.expected.intent &&
        parsed.fromToken === testCase.expected.fromToken &&
        parsed.confidence > 0.6
      );
      
      if (passed) {
        passedCount++;
        logger.log(`✅ "${testCase.input}" → ${parsed.intent}: ${parsed.fromToken}`, 'info');
      } else {
        logger.log(`❌ "${testCase.input}" failed`, 'warning');
        logger.log(`   Expected: ${JSON.stringify(testCase.expected)}`, 'warning');
        logger.log(`   Actual: ${JSON.stringify({intent: parsed.intent, fromToken: parsed.fromToken})}`, 'warning');
      }
      
      results.push({
        input: testCase.input,
        passed,
        actual: parsed
      });
      
    } catch (error) {
      results.push({
        input: testCase.input,
        passed: false,
        error: error instanceof Error ? error.message : String(error)
      });
      
      logger.log(`❌ "${testCase.input}" threw error: ${error}`, 'error');
    }
  }
  
  const accuracy = (passedCount / PRICE_TEST_CASES.length) * 100;
  
  logger.log(`Price parsing accuracy: ${accuracy}% (${passedCount}/${PRICE_TEST_CASES.length})`, 'info');
  
  assert.assertEqual(passedCount, PRICE_TEST_CASES.length, 'All price tests should pass for 100% accuracy');
  
  return {
    total: PRICE_TEST_CASES.length,
    passed: passedCount,
    accuracy,
    results
  };
}

async function testBalanceParsing() {
  logger.log('Testing balance command parsing...');
  
  let passedCount = 0;
  const results: Array<{input: string, passed: boolean, actual?: any, error?: string}> = [];
  
  for (const testCase of BALANCE_TEST_CASES) {
    try {
      const parsed = parseCommand(testCase.input);
      
      const passed = (
        parsed.intent === testCase.expected.intent &&
        parsed.fromToken === testCase.expected.fromToken &&
        parsed.confidence > 0.6
      );
      
      if (passed) {
        passedCount++;
        logger.log(`✅ "${testCase.input}" → ${parsed.intent}: ${parsed.fromToken}`, 'info');
      } else {
        logger.log(`❌ "${testCase.input}" failed`, 'warning');
      }
      
      results.push({
        input: testCase.input,
        passed,
        actual: parsed
      });
      
    } catch (error) {
      results.push({
        input: testCase.input,
        passed: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  const accuracy = (passedCount / BALANCE_TEST_CASES.length) * 100;
  
  logger.log(`Balance parsing accuracy: ${accuracy}% (${passedCount}/${BALANCE_TEST_CASES.length})`, 'info');
  
  return {
    total: BALANCE_TEST_CASES.length,
    passed: passedCount,
    accuracy,
    results
  };
}

async function testPortfolioParsing() {
  logger.log('Testing portfolio command parsing...');
  
  let passedCount = 0;
  const results: Array<{input: string, passed: boolean, actual?: any, error?: string}> = [];
  
  for (const testCase of PORTFOLIO_TEST_CASES) {
    try {
      const parsed = parseCommand(testCase.input);
      
      const passed = (
        parsed.intent === testCase.expected.intent &&
        parsed.confidence > 0.6
      );
      
      if (passed) {
        passedCount++;
        logger.log(`✅ "${testCase.input}" → ${parsed.intent}`, 'info');
      } else {
        logger.log(`❌ "${testCase.input}" failed`, 'warning');
      }
      
      results.push({
        input: testCase.input,
        passed,
        actual: parsed
      });
      
    } catch (error) {
      results.push({
        input: testCase.input,
        passed: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  const accuracy = (passedCount / PORTFOLIO_TEST_CASES.length) * 100;
  
  logger.log(`Portfolio parsing accuracy: ${accuracy}% (${passedCount}/${PORTFOLIO_TEST_CASES.length})`, 'info');
  
  return {
    total: PORTFOLIO_TEST_CASES.length,
    passed: passedCount,
    accuracy,
    results
  };
}

async function testEdgeCases() {
  logger.log('Testing edge cases and complex scenarios...');
  
  let passedCount = 0;
  const results: Array<{input: string, passed: boolean, actual?: any, error?: string}> = [];
  
  for (const testCase of EDGE_CASE_TESTS) {
    try {
      const parsed = parseCommand(testCase.input);
      
      const passed = (
        parsed.intent === testCase.expected.intent &&
        parsed.fromToken === testCase.expected.fromToken &&
        parsed.toToken === testCase.expected.toToken &&
        parsed.amount === testCase.expected.amount &&
        parsed.confidence > 0.6
      );
      
      if (passed) {
        passedCount++;
        logger.log(`✅ "${testCase.input}" → Correctly parsed complex case`, 'info');
      } else {
        logger.log(`❌ "${testCase.input}" failed edge case`, 'warning');
      }
      
      results.push({
        input: testCase.input,
        passed,
        actual: parsed
      });
      
    } catch (error) {
      results.push({
        input: testCase.input,
        passed: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  const accuracy = (passedCount / EDGE_CASE_TESTS.length) * 100;
  
  logger.log(`Edge case accuracy: ${accuracy}% (${passedCount}/${EDGE_CASE_TESTS.length})`, 'info');
  
  return {
    total: EDGE_CASE_TESTS.length,
    passed: passedCount,
    accuracy,
    results
  };
}

async function testOverallAccuracy() {
  logger.log('Calculating overall parser accuracy...');
  
  const allTestCases: Array<{input: string, expected: any}> = [
    ...SWAP_TEST_CASES,
    ...PRICE_TEST_CASES,
    ...BALANCE_TEST_CASES,
    ...PORTFOLIO_TEST_CASES,
    ...EDGE_CASE_TESTS
  ];
  
  let totalPassed = 0;
  let totalTests = allTestCases.length;
  
  for (const testCase of allTestCases) {
    try {
      const parsed = parseCommand(testCase.input);
      
      // Simple validation based on intent
      let passed = false;
      if (testCase.expected.intent === 'swap') {
        passed = (
          parsed.intent === 'swap' &&
          parsed.fromToken === testCase.expected.fromToken &&
          parsed.toToken === testCase.expected.toToken &&
          parsed.amount === testCase.expected.amount &&
          parsed.confidence > 0.6
        );
      } else if (testCase.expected.intent === 'price' || testCase.expected.intent === 'balance') {
        passed = (
          parsed.intent === testCase.expected.intent &&
          parsed.fromToken === testCase.expected.fromToken &&
          parsed.confidence > 0.6
        );
      } else if (testCase.expected.intent === 'portfolio') {
        passed = (
          parsed.intent === 'portfolio' &&
          parsed.confidence > 0.6
        );
      }
      
      if (passed) {
        totalPassed++;
      }
      
    } catch (error) {
      // Test failed due to error
    }
  }
  
  const overallAccuracy = (totalPassed / totalTests) * 100;
  
  logger.log(`🎯 OVERALL PARSER ACCURACY: ${overallAccuracy.toFixed(1)}% (${totalPassed}/${totalTests})`, 'info');
  
  if (overallAccuracy === 100) {
    logger.log('🏆 ACHIEVED 100% ACCURACY - PARSER IS PRODUCTION READY!', 'success');
  } else {
    logger.log(`⚠️  Accuracy is ${overallAccuracy.toFixed(1)}% - Some commands need improvement`, 'warning');
  }
  
  return {
    totalTests,
    totalPassed,
    overallAccuracy,
    isProductionReady: overallAccuracy >= 95
  };
}

async function main() {
  console.log('🧠 Starting Natural Language Parser Tests\n');
  
  const tests = [
    testSwapParsing,
    testPriceParsing,
    testBalanceParsing,
    testPortfolioParsing,
    testEdgeCases,
    testOverallAccuracy,
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
  
  // Special validation for 100% accuracy claim
  const overallTest = results.find(r => r.name === 'testOverallAccuracy');
  if (overallTest?.data?.overallAccuracy === 100) {
    logger.log('✅ CONFIRMED: Parser achieves 100% accuracy as claimed!', 'success');
  } else {
    logger.log('❌ WARNING: Parser does not achieve 100% accuracy as claimed', 'error');
  }
  
  // Exit with appropriate code
  const allPassed = results.every(r => r.passed);
  process.exit(allPassed ? 0 : 1);
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Parser test suite failed:', error);
    process.exit(1);
  });
}

export { main as runParserTests }; 