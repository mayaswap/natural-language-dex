# Natural Language DEX Interface - Test Suite

> Comprehensive testing suite to validate all system components work with real APIs and wallets

## 🎯 **Test Coverage**

This test suite validates that the Natural Language DEX Interface actually works as described in the tutorial. It tests real API endpoints, wallet functionality, and the claimed 100% parser accuracy.

### **📋 Test Categories**

#### **1. API Integration Tests** (`api-tests.ts`)
- ✅ **9mm Aggregator API**: Sources, price quotes, swap quotes
- ✅ **Multiple Token Pairs**: USDC/WPLS, HEX/USDC, PLSX/WPLS
- ✅ **Rate Limiting**: API stability under load
- ✅ **Error Handling**: Invalid token addresses and requests
- ✅ **GraphQL Endpoints**: Optional subgraph connectivity

#### **2. Wallet Integration Tests** (`wallet-tests.ts`)
- ✅ **Wallet Generation**: HD wallet creation and validation
- ✅ **RPC Connectivity**: PulseChain and Base chain connections
- ✅ **Balance Queries**: Native and ERC20 token balances
- ✅ **Token Contracts**: Smart contract interactions
- ✅ **Multi-Chain Support**: Cross-chain provider validation
- ✅ **Message Signing**: Cryptographic operations
- ✅ **Gas Estimation**: Transaction cost calculations

#### **3. Natural Language Parser Tests** (`parser-tests.ts`)
- ✅ **Swap Commands**: "Swap 100 USDC for ETH" variations
- ✅ **Price Queries**: "What's HEX trading at?" variations  
- ✅ **Balance Checks**: "How much USDC do I have?" variations
- ✅ **Portfolio Requests**: "Show my portfolio" variations
- ✅ **Edge Cases**: Complex amounts (1.5k, 2.5m) and natural language
- ✅ **Accuracy Validation**: Confirms claimed 100% accuracy

## 🚀 **Quick Start**

### **Prerequisites**

1. **Install Dependencies**
   ```bash
   cd natural-language-dex/tests
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Environment Variables**
   ```env
   # Required
   PULSECHAIN_RPC_URL=https://rpc.pulsechain.com
   NINMM_AGGREGATOR_BASE_URL=https://api.9mm.pro
   
   # Optional
   BASE_RPC_URL=https://mainnet.base.org
   TEST_WALLET_PRIVATE_KEY=0x... (use test wallet only!)
   ```

### **Run All Tests**

```bash
# Run comprehensive test suite
npm run test:all

# Or run the main test suite
npm test
```

### **Run Individual Test Categories**

```bash
# Test API endpoints only
npm run test:api

# Test wallet functionality only  
npm run test:wallet

# Test parser accuracy only
npm run test:parser

# Run integration tests
npm run test:integration
```

## 📊 **Expected Results**

### **Successful Test Run Output**

```
🚀 STARTING COMPREHENSIVE DEX INTERFACE TEST SUITE

🔍 Checking test environment...
✅ Environment configuration looks good

🧪 Starting API Tests test suite...
ℹ️  Testing 9mm Aggregator Sources endpoint...
ℹ️  Found 20 DEX sources
✅ API Tests test suite PASSED (2,450ms)

🧪 Starting Wallet Tests test suite...
ℹ️  Testing wallet generation...
ℹ️  Generated wallet: 0x742d35Cc6634C0532925a3b8D01d3e2e1Eb5f924
✅ Wallet Tests test suite PASSED (1,890ms)

🧪 Starting Parser Tests test suite...
ℹ️  Testing swap command parsing...
✅ "Swap 100 USDC for ETH" → swap: 100 USDC → WETH
🎯 OVERALL PARSER ACCURACY: 100.0% (33/33)
🏆 ACHIEVED 100% ACCURACY - PARSER IS PRODUCTION READY!
✅ Parser Tests test suite PASSED (890ms)

📊 COMPREHENSIVE TEST REPORT
================================================================================

📈 SUMMARY:
  Total Test Suites: 3
  Passed: 3
  Failed: 0
  Success Rate: 100.0%
  Total Duration: 5,230ms

🚀 PRODUCTION READINESS ASSESSMENT:
  🏆 PRODUCTION READY - All core systems functional!
  ✅ API Integration: Working
  ✅ Wallet Operations: Working  
  ✅ Natural Language Parser: Working
  
  🎯 System is ready for live trading operations!

🎉 ALL TESTS PASSED - SYSTEM IS FULLY FUNCTIONAL!
```

### **What Each Test Validates**

#### **API Tests Confirm:**
- ✅ 9mm aggregator returns 20+ DEX sources
- ✅ Price quotes work for real token pairs
- ✅ Swap quotes include transaction data and gas estimates
- ✅ API handles multiple requests without rate limiting
- ✅ Error handling works for invalid requests

#### **Wallet Tests Confirm:**
- ✅ Can generate HD wallets with valid addresses
- ✅ RPC connections work to PulseChain and Base
- ✅ Can query balances for native and ERC20 tokens
- ✅ Smart contract interactions work correctly
- ✅ Message signing and verification works
- ✅ Gas estimation provides reasonable values

#### **Parser Tests Confirm:**
- ✅ All natural language variations are understood
- ✅ Token symbols are correctly normalized (ETH → WETH)
- ✅ Amounts are parsed including k/m/b suffixes
- ✅ Intent detection works with high confidence
- ✅ Complex edge cases are handled correctly
- ✅ **100% accuracy achieved as claimed**

## 🛠 **Test Configuration**

### **Test Tokens Used**

The tests use real token addresses on PulseChain:

```typescript
const TEST_TOKENS = {
  USDC: '0x15d38573d2feeb82e7ad5187ab8c1d52810b1f07',
  WPLS: '0xA1077a294dDE1B09bB078844df40758a5D0f9a27', 
  HEX: '0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39',
  PLSX: '0x95b303987a60c71504d99aa1b13b4da07b0790ab'
};
```

### **Test Parameters**

- **API Timeout**: 30 seconds
- **Test Amount**: 1 USDC for quotes
- **Slippage**: 0.5% default
- **Confidence Threshold**: 0.6 for parser validation

### **Safety Measures**

- ⚠️ **No Real Transactions**: Tests only get quotes, never execute swaps
- 🔒 **Test Wallets Only**: Use dedicated test wallets with small amounts
- 📊 **Read-Only Operations**: Only queries balances and prices
- 🛡️ **Rate Limiting**: 2-second delays between test suites

## 🐛 **Troubleshooting**

### **Common Issues**

#### **RPC Connection Errors**
```
Error: Could not connect to PulseChain RPC
```
**Solution**: Check your `PULSECHAIN_RPC_URL` in `.env`

#### **API Rate Limiting**
```
Error: HTTP 429 - Too Many Requests
```
**Solution**: Tests include delays, but you may need to wait and retry

#### **Token Not Found Errors**
```
Error: Token not found: SOMETOKEN
```
**Solution**: Tests use real tokens - this error indicates parser working correctly

#### **Parser Import Errors**
```
Error: Failed to import parser
```
**Solution**: Ensure you're running from the correct directory with built source

### **Debug Mode**

Run tests with verbose logging:

```bash
DEBUG=1 npm test
```

## 📈 **Performance Benchmarks**

Expected performance on typical systems:

- **API Tests**: 2-3 seconds (network dependent)
- **Wallet Tests**: 1-2 seconds  
- **Parser Tests**: < 1 second
- **Total Suite**: 5-10 seconds

## 🎯 **Success Criteria**

For production readiness, tests must achieve:

- ✅ **100% API connectivity** to 9mm aggregator
- ✅ **100% wallet operations** success rate
- ✅ **100% parser accuracy** on test cases
- ✅ **< 10 second** total test execution time
- ✅ **Zero critical failures** in core functionality

## 🚨 **Critical Test Failures**

If any of these fail, the system is **NOT production ready**:

- ❌ **API Sources Endpoint**: Can't discover DEX sources
- ❌ **Price Quote Endpoint**: Can't get swap prices  
- ❌ **Wallet Generation**: Can't create wallets
- ❌ **RPC Connectivity**: Can't connect to blockchains
- ❌ **Parser Core Commands**: Basic swap/price commands fail

## 📞 **Support**

If tests fail unexpectedly:

1. **Check Environment**: Verify all required variables are set
2. **Network Issues**: Confirm internet connectivity and RPC endpoints
3. **Rate Limiting**: Wait a few minutes and retry
4. **Version Conflicts**: Ensure dependencies are up to date

The test suite validates that **everything actually works** as described in the tutorial!

---

**Test Suite Version**: 1.0.0  
**Last Updated**: December 2024  
**Compatibility**: Natural Language DEX Interface v4.0.0 