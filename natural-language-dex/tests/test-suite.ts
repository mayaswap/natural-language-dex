#!/usr/bin/env node

import { TestLogger, TestResult } from './utils/test-helpers.js';
import { runAPITests } from './api-tests.js';
import { runWalletTests } from './wallet-tests.js';
import { runParserTests } from './parser-tests.js';

/**
 * Main Test Suite Runner
 * Executes comprehensive tests for the Natural Language DEX Interface
 */

const logger = new TestLogger();

interface TestSuiteResult {
  suiteName: string;
  passed: boolean;
  duration: number;
  error?: string;
}

async function runTestSuite(
  name: string,
  testFunction: () => Promise<any>
): Promise<TestSuiteResult> {
  const startTime = Date.now();
  
  try {
    logger.log(`🧪 Starting ${name} test suite...`, 'info');
    await testFunction();
    const duration = Date.now() - startTime;
    
    logger.log(`✅ ${name} test suite PASSED (${duration}ms)`, 'success');
    
    return {
      suiteName: name,
      passed: true,
      duration
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logger.log(`❌ ${name} test suite FAILED: ${errorMessage} (${duration}ms)`, 'error');
    
    return {
      suiteName: name,
      passed: false,
      duration,
      error: errorMessage
    };
  }
}

async function generateTestReport(results: TestSuiteResult[]) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 COMPREHENSIVE TEST REPORT');
  console.log('='.repeat(80));
  
  const totalSuites = results.length;
  const passedSuites = results.filter(r => r.passed).length;
  const failedSuites = results.filter(r => !r.passed).length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  
  console.log(`\n📈 SUMMARY:`);
  console.log(`  Total Test Suites: ${totalSuites}`);
  console.log(`  Passed: ${passedSuites}`);
  console.log(`  Failed: ${failedSuites}`);
  console.log(`  Success Rate: ${((passedSuites / totalSuites) * 100).toFixed(1)}%`);
  console.log(`  Total Duration: ${totalDuration}ms`);
  
  console.log(`\n📋 DETAILED RESULTS:`);
  for (const result of results) {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`  ${status} ${result.suiteName} (${result.duration}ms)`);
    if (result.error) {
      console.log(`      Error: ${result.error}`);
    }
  }
  
  // Production readiness assessment
  console.log(`\n🚀 PRODUCTION READINESS ASSESSMENT:`);
  
  const criticalTests = ['API Tests', 'Wallet Tests'];
  const criticalPassed = results
    .filter(r => criticalTests.includes(r.suiteName))
    .every(r => r.passed);
  
  const parserTest = results.find(r => r.suiteName === 'Parser Tests');
  const parserPassed = parserTest?.passed || false;
  
  if (criticalPassed && parserPassed) {
    console.log(`  🏆 PRODUCTION READY - All core systems functional!`);
    console.log(`  ✅ API Integration: Working`);
    console.log(`  ✅ Wallet Operations: Working`);
    console.log(`  ✅ Natural Language Parser: Working`);
    console.log(`  \n🎯 System is ready for live trading operations!`);
  } else {
    console.log(`  ⚠️  NOT PRODUCTION READY - Issues detected:`);
    if (!criticalPassed) {
      console.log(`  ❌ Critical system failures in API or Wallet tests`);
    }
    if (!parserPassed) {
      console.log(`  ❌ Natural Language Parser issues detected`);
    }
    console.log(`  \n🔧 Fix issues before deploying to production!`);
  }
  
  console.log('\n' + '='.repeat(80));
  
  return {
    totalSuites,
    passedSuites,
    failedSuites,
    successRate: (passedSuites / totalSuites) * 100,
    isProductionReady: criticalPassed && parserPassed,
    totalDuration
  };
}

async function checkEnvironment() {
  logger.log('🔍 Checking test environment...', 'info');
  
  const requiredEnvVars = [
    'PULSECHAIN_RPC_URL',
    'NINMM_AGGREGATOR_BASE_URL'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    logger.log('⚠️  Warning: Some environment variables are not set:', 'warning');
    missingVars.forEach(varName => {
      logger.log(`  - ${varName}`, 'warning');
    });
    logger.log('Tests will use default values where possible', 'warning');
  } else {
    logger.log('✅ Environment configuration looks good', 'success');
  }
  
  return {
    allConfigured: missingVars.length === 0,
    missingVars
  };
}

async function main() {
  console.log('🚀 STARTING COMPREHENSIVE DEX INTERFACE TEST SUITE\n');
  
  // Check environment first
  await checkEnvironment();
  
  const testSuites = [
    {
      name: 'API Tests',
      runner: runAPITests
    },
    {
      name: 'Wallet Tests', 
      runner: runWalletTests
    },
    {
      name: 'Parser Tests',
      runner: runParserTests
    }
  ];
  
  const results: TestSuiteResult[] = [];
  
  // Run each test suite
  for (const suite of testSuites) {
    const result = await runTestSuite(suite.name, suite.runner);
    results.push(result);
    
    // Add delay between test suites to avoid overwhelming APIs
    if (suite !== testSuites[testSuites.length - 1]) {
      logger.log('⏱️  Waiting before next test suite...', 'info');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Generate comprehensive report
  const report = await generateTestReport(results);
  
  // Exit with appropriate code
  const allPassed = results.every(r => r.passed);
  
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED - SYSTEM IS FULLY FUNCTIONAL!');
    process.exit(0);
  } else {
    console.log('💥 SOME TESTS FAILED - CHECK LOGS FOR DETAILS');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⚠️  Test suite interrupted by user');
  process.exit(130);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled promise rejection:', reason);
  process.exit(1);
});

// Run the main test suite
main().catch(error => {
  console.error('💥 Test suite crashed:', error);
  process.exit(1);
}); 