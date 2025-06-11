# 0x API v1 Complete Capabilities Reference

> Documentation for 0x API v1 features available in the 9mm aggregator (Pulsechain fork)
> Based on: https://0x.org/docs/1.0/0x-swap-api/api-references/overview

## Overview

The 9mm aggregator is a fork of 0x API v1, providing professional-grade DEX aggregation and smart order routing. This document outlines all available features and capabilities.

## Core Endpoints

### 1. GET /swap/v1/quote
- **Purpose**: Get executable trade quote with transaction data
- **Returns**: Valid unsigned Ethereum transaction ready for signing
- **Use Case**: When user wants to execute a trade

### 2. GET /swap/v1/price  
- **Purpose**: Get price information only (read-only)
- **Returns**: Pricing data without transaction details
- **Use Case**: Price checking, UI updates, market data

### 3. GET /swap/v1/sources
- **Purpose**: List all available liquidity sources
- **Returns**: Array of supported DEXes and sources
- **Use Case**: Understanding routing options, source filtering

## Complete Parameter Reference

### Required Parameters
```
sellToken     - ERC20 token address to sell (or "ETH")
buyToken      - ERC20 token address to buy (or "ETH") 
sellAmount    - Amount to sell (in token base units) OR
buyAmount     - Amount to buy (in token base units)
```

### Trading Configuration
```
slippagePercentage              - Max slippage (default: 0.01 = 1%)
gasPrice                        - Target gas price in wei
takerAddress                    - Address executing the trade (enables validation)
skipValidation                  - Skip transaction validation (default: false)
shouldSellEntireBalance         - Sell entire token balance (boolean)
```

### Liquidity Source Control
```
excludedSources                 - Comma-separated list of sources to exclude
includedSources                 - Comma-separated list of sources to include only
```

**Available Sources** (from 9mm response):
- `PulseX_V1`, `PulseX_V2`
- `NineMM_V2`, `NineMM_V3` 
- `NineInch_V2`, `NineInch_V3`
- `EasySwap`, `PancakeSwap_V2`, `PancakeSwap_V3`
- `ShibaSwap`, `Uniswap`, `Uniswap_V2`, `Uniswap_V3`
- `SushiSwap`, `Balancer_V2`, `CryptoCom`
- `Dextop`, `Curve`, `Curve_V2`

### Monetization Features
```
feeRecipient                    - ETH address to receive affiliate fees
buyTokenPercentageFee           - Fee percentage (0.0 to 1.0, where 1.0 = 100%)
feeRecipientTradeSurplus        - Address to collect trade surplus
```

### Risk Management
```
priceImpactProtectionPercentage - Max allowed price impact (0.0 to 1.0)
```

## Complete Response Structure

### Core Pricing Data
```json
{
  "price": "0.010430437293969198",           // Best possible price
  "guaranteedPrice": "0.010378259148872167", // Price with slippage protection
  "estimatedPriceImpact": "0",               // Estimated price impact
  "grossPrice": "...",                       // Price without fees
}
```

### Transaction Data  
```json
{
  "to": "0x4491dbefc128e2de184baba03e7c991356f733ce",    // Contract to call
  "data": "0x415565b0000...",                            // Transaction call data
  "value": "100000000000000000000",                      // ETH amount (wei)
  "gas": "626255",                                       // Gas limit
  "estimatedGas": "626255",                              // Actual gas estimate
  "gasPrice": "1428651850621153"                         // Recommended gas price
}
```

### Amount Information
```json
{
  "buyAmount": "1043043988853463464",        // Output token amount
  "sellAmount": "100000000000000000000",     // Input token amount
  "grossBuyAmount": "...",                   // Buy amount without fees
  "grossSellAmount": "...",                  // Sell amount without fees
  "buyTokenAddress": "0x7b39712ef...",       // Buy token contract
  "sellTokenAddress": "0xeeeeeeee..."        // Sell token contract
}
```

### Routing & Sources
```json
{
  "sources": [
    {"name": "NineMM_V3", "proportion": "1"},
    {"name": "PulseX_V2", "proportion": "0"},
    // ... other sources with proportion "0"
  ],
  "orders": [
    {
      "type": 0,                             // Order type (Bridge=0, Limit=1, RFQ=2, OTC=3)
      "source": "NineMM_V3",
      "makerToken": "0x7b39712ef...",
      "takerToken": "0xa1077a294d...",
      "makerAmount": "1043562901940635344",
      "takerAmount": "100000000000000000000",
      "fillData": {
        "router": "0x7bE8fbe502191bBBCb38b02f2d4fA0D628301bEA",
        "tokenAddressPath": ["0xa1077a294d...", "0x962a4859b3...", "0x7b39712ef..."],
        "uniswapPath": "0xa1077a294d...004e20962a4859b3...0000647b39712ef...",
        "gasUsed": 427255
      }
    }
  ]
}
```

### Fee Information
```json
{
  "protocolFee": "0",                        // Protocol fee amount
  "minimumProtocolFee": "0",                 // Minimum protocol fee
  "fees": {
    "zeroExFee": null                        // 0x platform fees
  }
}
```

### Token Allowances
```json
{
  "allowanceTarget": "0x0000000000000000000000000000000000000000"  // Contract needing approval
}
```

### Exchange Rates
```json
{
  "sellTokenToEthRate": "1",                 // Sell token to ETH rate
  "buyTokenToEthRate": "0.001715856671851786" // Buy token to ETH rate
}
```

## Special Features

### ETH/WETH Handling
- Automatic detection of ETH ↔ WETH trades
- Direct interaction with WETH9 contract
- No token allowance required for ETH trades
- `allowanceTarget` returns null address for ETH

### RFQ (Request for Quote) Support
- Professional market maker liquidity
- Requires API key authentication
- Zero slippage guaranteed execution
- MEV protection
- Access via `includedSources=0x` parameter

### Smart Order Routing
- Multi-path routing across liquidity sources
- Optimal price discovery algorithm
- Gas-efficient execution paths
- Automatic source proportion optimization

### Advanced Validation
When `takerAddress` provided:
- Balance validation
- Allowance checking  
- Transaction simulation
- Gas estimation accuracy
- Revert prediction

## Error Handling

### Common Error Codes
- **105**: IncompleteFillError - Insufficient liquidity
- **400**: Bad Request - Invalid parameters
- **429**: Rate Limit Exceeded
- **500**: Internal Server Error

### Error Response Format
```json
{
  "code": 105,
  "reason": "IncompleteFillError", 
  "values": {
    "error": 0,
    "expectedAssetFillAmount": "10000000",
    "actualAssetFillAmount": "0"
  }
}
```

## Integration Examples

### Basic Price Check
```bash
curl "https://api.9mm.pro/swap/v1/price?sellToken=0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE&buyToken=0x7b39712Ef45F7dcED2bBDF11F3D5046bA61dA719&sellAmount=1000000000000000000"
```

### Get Executable Quote
```bash
curl "https://api.9mm.pro/swap/v1/quote?sellToken=0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE&buyToken=0x7b39712Ef45F7dcED2bBDF11F3D5046bA61dA719&sellAmount=1000000000000000000&slippagePercentage=0.005&takerAddress=0x..."
```

### Source Filtering
```bash
curl "https://api.9mm.pro/swap/v1/quote?sellToken=ETH&buyToken=0x7b39712Ef45F7dcED2bBDF11F3D5046bA61dA719&sellAmount=1000000000000000000&excludedSources=PulseX_V1,PulseX_V2"
```

### Monetization Setup
```bash
curl "https://api.9mm.pro/swap/v1/quote?sellToken=ETH&buyToken=0x7b39712Ef45F7dcED2bBDF11F3D5046bA61dA719&sellAmount=1000000000000000000&feeRecipient=0x...&buyTokenPercentageFee=0.001"
```

## Chain-Specific Information

### Pulsechain (Chain ID: 369)
- **Base URL**: `https://api.9mm.pro`
- **Native Token**: PLS (use `0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE`)
- **Wrapped Native**: WPLS (`0xA1077a294dDE1B09bB078844df40758a5D0f9a27`)

### Authentication
- No API key required for basic usage
- Rate limiting may apply
- Consider API key for production use

## Best Practices

### Performance Optimization
1. Use `/price` for UI updates, `/quote` for execution
2. Include `takerAddress` for accurate gas estimates
3. Cache responses appropriately (prices change frequently)
4. Implement proper error handling

### Security Considerations
1. Always validate transaction data before signing
2. Check allowance requirements
3. Verify gas estimates are reasonable
4. Implement slippage protection
5. Monitor for MEV protection when needed

### Gas Optimization
1. Use recommended `gasPrice` from response
2. Consider `estimatedGas` vs `gas` for limit setting
3. Monitor gas usage patterns across different sources

## Future Enhancements

Based on 0x API evolution, potential future features:
- Gasless trading support
- Cross-chain routing
- Advanced order types
- Enhanced RFQ access
- Real-time price streaming
- Portfolio optimization

---

**Note**: This documentation is based on 9mm's fork of 0x API v1. Features and endpoints should be tested for compatibility and availability on Pulsechain. 