#!/usr/bin/env tsx

/**
 * Test script to verify parser accuracy improvements
 * Target: 95% accuracy for swap and price commands
 */

import { parseCommand } from "./src/utils/parser.js";

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m'
};

// Test cases for improved parser accuracy
const testCases = {
    swapCommands: [
        // Amount parsing tests (1000 vs 100 issue)
        { input: "Swap 100 USDC for WPLS", expected: { amount: "100", fromToken: "USDC", toToken: "WPLS" } },
        { input: "Swap 1000 USDC for WPLS", expected: { amount: "1000", fromToken: "USDC", toToken: "WPLS" } },
        { input: "Exchange 1,000 USDC to HEX", expected: { amount: "1000", fromToken: "USDC", toToken: "HEX" } },
        { input: "Trade 1.5k PLS for DAI", expected: { amount: "1500", fromToken: "PLS", toToken: "DAI" } },
        { input: "Convert 2.5m WPLS into USDT", expected: { amount: "2500000", fromToken: "WPLS", toToken: "USDT" } },
        
        // Buy/Sell disambiguation tests
        { input: "Buy 100 HEX with USDC", expected: { amount: "100", fromToken: "USDC", toToken: "HEX" } },
        { input: "Buy 1000 PLS with DAI", expected: { amount: "1000", fromToken: "DAI", toToken: "PLS" } },
        { input: "Sell 50 HEX for USDC", expected: { amount: "50", fromToken: "HEX", toToken: "USDC" } },
        { input: "Purchase 5000 9MM with USDT", expected: { amount: "5000", fromToken: "USDT", toToken: "9MM" } },
        
        // Complex sentences
        { input: "I want to swap 100 USDC for some ETH", expected: { amount: "100", fromToken: "USDC", toToken: "WETH" } },
        { input: "Can you exchange 1k PLS to HEX?", expected: { amount: "1000", fromToken: "PLS", toToken: "HEX" } },
        { input: "I need to swap my 500 DAI for WPLS", expected: { amount: "500", fromToken: "DAI", toToken: "WPLS" } },
        
        // Edge cases
        { input: "Swap 0.001 WETH for USDC", expected: { amount: "0.001", fromToken: "WETH", toToken: "USDC" } },
        { input: "Trade 123.456 USDC to DAI", expected: { amount: "123.456", fromToken: "USDC", toToken: "DAI" } },
        { input: "Convert 10,000.50 HEX into USDT", expected: { amount: "10000.50", fromToken: "HEX", toToken: "USDT" } }
    ],
    
    priceQueries: [
        // Basic price queries
        { input: "What's the price of HEX?", expected: { fromToken: "HEX" } },
        { input: "Price of WPLS", expected: { fromToken: "WPLS" } },
        { input: "HEX price", expected: { fromToken: "HEX" } },
        { input: "Show me USDC price", expected: { fromToken: "USDC" } },
        
        // "Trading at" pattern improvements
        { input: "What is HEX trading at?", expected: { fromToken: "HEX" } },
        { input: "What's WPLS trading at today?", expected: { fromToken: "WPLS" } },
        { input: "What is 9MM trading at?", expected: { fromToken: "9MM" } },
        { input: "What's DAI trading at right now?", expected: { fromToken: "DAI" } },
        
        // Complex price queries
        { input: "How much is PLS worth?", expected: { fromToken: "PLS" } },
        { input: "Current price of USDT", expected: { fromToken: "USDT" } },
        { input: "Check HEX price", expected: { fromToken: "HEX" } },
        { input: "What does PLSX cost?", expected: { fromToken: "PLSX" } },
        
        // Edge cases
        { input: "Get me the current HEX value", expected: { fromToken: "HEX" } },
        { input: "Price check on WPLS", expected: { fromToken: "WPLS" } },
        { input: "Show the price of DAI please", expected: { fromToken: "DAI" } }
    ]
};

// Test runner
function runTest(testCase: any, index: number, category: string): boolean {
    const result = parseCommand(testCase.input);
    let passed = true;
    let issues: string[] = [];
    
    // Check intent
    const expectedIntent = category === 'swapCommands' ? 'swap' : 'price';
    if (result.intent !== expectedIntent) {
        passed = false;
        issues.push(`Intent: expected '${expectedIntent}', got '${result.intent}'`);
    }
    
    // Check amount (for swap commands)
    if (testCase.expected.amount && result.amount !== testCase.expected.amount) {
        passed = false;
        issues.push(`Amount: expected '${testCase.expected.amount}', got '${result.amount}'`);
    }
    
    // Check tokens
    if (testCase.expected.fromToken && result.fromToken !== testCase.expected.fromToken) {
        passed = false;
        issues.push(`FromToken: expected '${testCase.expected.fromToken}', got '${result.fromToken}'`);
    }
    
    if (testCase.expected.toToken && result.toToken !== testCase.expected.toToken) {
        passed = false;
        issues.push(`ToToken: expected '${testCase.expected.toToken}', got '${result.toToken}'`);
    }
    
    // Check confidence
    if (result.confidence < 0.7) {
        issues.push(`Low confidence: ${result.confidence.toFixed(2)}`);
    }
    
    // Display result
    console.log(`\n${index + 1}. "${testCase.input}"`);
    console.log(`   ${passed ? colors.green + '✓' : colors.red + '✗'} ${colors.reset}Parsed: ${result.intent} (${result.confidence.toFixed(2)} confidence)`);
    
    if (result.amount || result.fromToken || result.toToken) {
        const details: string[] = [];
        if (result.amount) details.push(`amount: ${result.amount}`);
        if (result.fromToken) details.push(`from: ${result.fromToken}`);
        if (result.toToken) details.push(`to: ${result.toToken}`);
        console.log(`   ${colors.cyan}${details.join(', ')}${colors.reset}`);
    }
    
    if (issues.length > 0) {
        issues.forEach(issue => {
            console.log(`   ${colors.yellow}⚠ ${issue}${colors.reset}`);
        });
    }
    
    return passed;
}

// Main test runner
function runAllTests() {
    console.log(`${colors.magenta}${'='.repeat(80)}${colors.reset}`);
    console.log(`${colors.magenta}Parser Accuracy Test - Target: 95% for Swap & Price Commands${colors.reset}`);
    console.log(`${colors.magenta}${'='.repeat(80)}${colors.reset}`);
    
    const results: Record<string, { total: number, passed: number }> = {};
    
    // Test each category
    for (const [category, cases] of Object.entries(testCases)) {
        console.log(`\n${colors.yellow}${category.replace(/([A-Z])/g, ' $1').trim()}:${colors.reset}`);
        console.log(`${colors.yellow}${'='.repeat(60)}${colors.reset}`);
        
        let passed = 0;
        const total = cases.length;
        
        cases.forEach((testCase, index) => {
            if (runTest(testCase, index, category)) {
                passed++;
            }
        });
        
        results[category] = { total, passed };
        
        const accuracy = (passed / total) * 100;
        const color = accuracy >= 95 ? colors.green : accuracy >= 85 ? colors.yellow : colors.red;
        console.log(`\n${color}Category Accuracy: ${accuracy.toFixed(1)}% (${passed}/${total})${colors.reset}`);
    }
    
    // Overall summary
    console.log(`\n${colors.magenta}${'='.repeat(80)}${colors.reset}`);
    console.log(`${colors.magenta}OVERALL RESULTS:${colors.reset}`);
    console.log(`${colors.magenta}${'='.repeat(80)}${colors.reset}`);
    
    let totalTests = 0;
    let totalPassed = 0;
    
    for (const [category, { total, passed }] of Object.entries(results)) {
        totalTests += total;
        totalPassed += passed;
        const accuracy = (passed / total) * 100;
        const color = accuracy >= 95 ? colors.green : accuracy >= 85 ? colors.yellow : colors.red;
        console.log(`${color}${category}: ${accuracy.toFixed(1)}% (${passed}/${total})${colors.reset}`);
    }
    
    const overallAccuracy = (totalPassed / totalTests) * 100;
    const overallColor = overallAccuracy >= 95 ? colors.green : overallAccuracy >= 85 ? colors.yellow : colors.red;
    
    console.log(`\n${overallColor}OVERALL ACCURACY: ${overallAccuracy.toFixed(1)}% (${totalPassed}/${totalTests})${colors.reset}`);
    
    if (overallAccuracy >= 95) {
        console.log(`\n${colors.green}✓ TARGET ACHIEVED! Parser accuracy is now production-ready.${colors.reset}`);
    } else {
        console.log(`\n${colors.yellow}⚠ Target not yet achieved. Need ${(95 - overallAccuracy).toFixed(1)}% more improvement.${colors.reset}`);
    }
}

// Run the tests
runAllTests(); 