# Liquidity Management Implementation Plan
## Natural Language DEX Interface - Phase 5 (REVISED)

> **Comprehensive plan for V3 liquidity operations with intelligent pool selection and natural language processing for 9mm DEX only**

## 🎯 **Overview**

Adding V3 liquidity management to our natural language DEX interface focusing exclusively on 9mm DEX:
- **V3 Pools Only**: Concentrated liquidity with price ranges and fee tiers (0.25%, 1%, 2%)
- **9mm DEX Focus**: Single DEX integration for liquidity operations
- **Pool Discovery**: Finding optimal pools within 9mm V3 ecosystem  
- **Position Management**: Track user positions via subgraph integration
- **Natural Language**: Intuitive commands for complex V3 operations
- **Multi-DEX Swaps**: Continue using aggregator for best swap rates across 20+ DEXs

---

## 🧠 **Natural Language Patterns**

### **Add Liquidity Commands**

```
🔵 Basic Liquidity Addition:
• "Add liquidity to PLS/USDC pool"
• "Provide 100 USDC and 50 PLS to liquidity"
• "Create position in HEX/PLSX pool"
• "Add 1000 HEX, 500 PLSX to liquidity"

🔵 V3 Concentrated Liquidity:
• "Add liquidity to PLS/USDC 1% fee tier"
• "Provide liquidity from $0.00001 to $0.0001 PLS price range"
• "Create concentrated position PLS/USDC range 0.00002-0.00005"
• "Add 100 USDC to HEX pool, tight range around current price"

🔵 Smart Pool Selection:
• "Add liquidity to best PLS/USDC pool" (finds highest volume/TVL pool)
• "Provide liquidity to highest volume HEX pool"
• "Add to most liquid PLSX/DAI pool"
• "Create position in 0.25% fee PLS pool"
```

### **Remove Liquidity Commands**

```
🔴 Position Management:
• "Remove all liquidity from PLS/USDC"
• "Withdraw 50% of my HEX/PLSX position"
• "Close position #123"
• "Remove 100 USDC worth of liquidity"

🔴 Specific Pool Operations:
• "Exit PLS/USDC 1% pool"
• "Remove liquidity from 9mm V3 HEX pool"
• "Withdraw from position #123"
• "Close all out-of-range positions"
```

### **Pool Query Commands**

```
🔍 Pool Discovery:
• "Show PLS/USDC pools"
• "Find best APY for HEX liquidity"
• "List my liquidity positions"
• "What pools are available for PLSX?"

🔍 Pool Analytics:
• "PLS/USDC pool stats"
• "Show HEX pool TVL and volume"
• "Available fee tiers for DAI pools"
• "Fee earnings from my positions"
```

---

## 🏗️ **Technical Architecture**

### **1. 9mm V3 Pool Discovery Service**

```typescript
class NineMmPoolDiscoveryService {
  private subgraphUrl = "https://graph.9mm.pro/subgraphs/name/pulsechain/9mm-v3-latest";
  
  async findPools(token0: string, token1: string): Promise<V3PoolInfo[]> {
    // Query 9mm V3 subgraph for pools with specific token pair
    // Return sorted by volumeUSD, totalValueLockedUSD, feeTier
  }
  
  async getPoolDetails(poolAddress: string): Promise<V3PoolDetails> {
    // Get comprehensive pool stats from subgraph
  }
  
  async getAllAvailablePools(criteria: PoolSelectionCriteria): Promise<V3PoolInfo[]> {
    // List all pools with user-specified sorting
  }
}

interface V3PoolInfo {
  id: string; // Pool address
  token0: TokenInfo;
  token1: TokenInfo;
  feeTier: string; // "2500" = 0.25%, "10000" = 1%, "20000" = 2%
  liquidity: string;
  totalValueLockedUSD: string;
  volumeUSD: string;
  feesUSD: string;
}
```

### **2. Enhanced Natural Language Parser**

```typescript
// Add new intent patterns for liquidity operations
const LIQUIDITY_INTENT_PATTERNS = {
  addLiquidity: [
    /\b(add|provide|create|deposit)\s+(liquidity|position)\b/i,
    /\bprovide\s+\d+.*?(and|,)\s+\d+.*?to\s+(liquidity|pool)\b/i,
    /\badd.*?(to|into)\s+(pool|liquidity|position)\b/i,
    /\bcreate\s+(position|lp)\b/i,
  ],
  
  removeLiquidity: [
    /\b(remove|withdraw|exit|close)\s+(liquidity|position)\b/i,
    /\bwithdraw.*?(from|of)\s+(pool|position|liquidity)\b/i,
    /\bexit\s+(pool|position)\b/i,
    /\bclose\s+(position|all)\b/i,
  ],
  
  poolQuery: [
    /\b(show|list|find|search)\s+(pools?|positions?)\b/i,
    /\bwhat\s+pools?\s+(are\s+)?available\b/i,
    /\bpool\s+(stats?|analytics?|info)\b/i,
    /\b(apy|yield|earnings?)\s+(for|from|of)\b/i,
  ],
};
```

### **3. 9mm V3 Position Manager**

```typescript
class NineMmV3PositionManager {
  private subgraphUrl = "https://graph.9mm.pro/subgraphs/name/pulsechain/9mm-v3-latest";
  private nftManagerContract: string = "0x..."; // 9mm V3 NFT Position Manager
  
  async addLiquidityV3(params: AddLiquidityV3Params): Promise<V3Position> {
    // Handle V3 concentrated liquidity with price ranges
    // Interact with 9mm V3 NFT Position Manager contract
  }
  
  async removeLiquidity(positionId: string, percentage: number): Promise<RemovalResult> {
    // Remove liquidity from existing V3 position
    // Uses positionId from subgraph
  }
  
  async getUserPositions(userAddress: string): Promise<V3Position[]> {
    // Query subgraph for all user positions
    // Filter by liquidity > 0 for active positions
  }
  
  async getPositionDetails(positionId: string): Promise<V3PositionDetails> {
    // Get detailed position info including unclaimed fees
  }
}

interface AddLiquidityV3Params {
  poolAddress: string;
  token0Amount: string;
  token1Amount: string;
  tickLower: number;    // V3 tick format
  tickUpper: number;    // V3 tick format
  slippageTolerance: number;
  deadline: number;
}
```

---

## 📊 **9mm V3 Pool Selection Intelligence**

### **1. User-Centric Pool Display & Selection**

```typescript
interface PoolSelectionCriteria {
  minimumTVL?: string;
  preferredFeeTier?: string; // "2500", "10000", "20000"
  sortBy: 'volumeUSD' | 'totalValueLockedUSD' | 'feesUSD';
  sortDirection: 'asc' | 'desc';
}

class NineMmPoolRankingEngine {
  // Display ALL available pools sorted by user criteria
  displayAvailablePools(pools: V3PoolInfo[], criteria: PoolSelectionCriteria): DisplayPool[] {
    return pools
      .filter(pool => this.meetsMinimumCriteria(pool, criteria))
      .sort((a, b) => this.compareByUserCriteria(a, b, criteria))
      .map(pool => ({
        ...pool,
        displayFeeTier: this.formatFeeTier(pool.feeTier),
        estimatedAPY: this.calculateEstimatedAPY(pool),
        recommendation: this.getRecommendation(pool)
      }));
  }
  
  private calculateEstimatedAPY(pool: V3PoolInfo): number {
    // Calculate APY based on fees earned and TVL
    const annualFees = parseFloat(pool.feesUSD) * 365;
    const tvl = parseFloat(pool.totalValueLockedUSD);
    return tvl > 0 ? (annualFees / tvl) * 100 : 0;
  }
  
  private formatFeeTier(feeTier: string): string {
    switch(feeTier) {
      case "2500": return "0.25%";
      case "10000": return "1%";
      case "20000": return "2%";
      default: return `${parseInt(feeTier) / 10000}%`;
    }
  }
  
  private getRecommendation(pool: V3PoolInfo): string {
    const tvl = parseFloat(pool.totalValueLockedUSD);
    const volume = parseFloat(pool.volumeUSD);
    
    if (tvl > 100000 && volume > 50000) return "Most Liquid & Active";
    if (volume > 100000) return "High Volume";
    if (tvl > 50000) return "Stable TVL";
    return "Emerging Pool";
  }
}
```

### **2. V3 Price Range Suggestions**

```typescript
class PriceRangeAnalyzer {
  async suggestOptimalRange(
    poolAddress: string,
    strategy: 'conservative' | 'moderate' | 'aggressive'
  ): Promise<PriceRange> {
    const currentPrice = await this.getCurrentPrice(poolAddress);
    const volatility = await this.calculateVolatility(poolAddress);
    
    const ranges = {
      conservative: { lower: 0.8, upper: 1.2 }, // ±20%
      moderate: { lower: 0.9, upper: 1.1 },     // ±10%
      aggressive: { lower: 0.95, upper: 1.05 }  // ±5%
    };
    
    const multiplier = ranges[strategy];
    
    return {
      lower: currentPrice * multiplier.lower,
      upper: currentPrice * multiplier.upper,
      currentPrice,
      estimatedAPY: await this.estimateAPYForRange(poolAddress, multiplier)
    };
  }
}
```

---

## 🎮 **ElizaOS Actions Implementation**

### **1. Add Liquidity Action**

```typescript
const addLiquidityAction: Action = {
  name: "ADD_LIQUIDITY",
  similes: ["PROVIDE_LIQUIDITY", "CREATE_POSITION", "DEPOSIT_LP"],
  
  validate: async (runtime: IAgentRuntime, message: Memory) => {
    const parsed = parseCommand(message.content.text);
    return parsed.intent === 'addLiquidity' && parsed.confidence > 0.7;
  },
  
  handler: async (runtime, message, state, options, callback) => {
    const parsed = parseCommand(message.content.text);
    
    // 1. Parse liquidity parameters
    const { token0, token1, amount0, amount1, priceRange } = 
      await parseLiquidityParams(parsed);
    
    // 2. Find optimal pools
    const pools = await poolDiscovery.findPools(token0, token1);
    const rankedPools = poolRanking.rankPools(pools, getUserPreferences());
    
    // 3. Get liquidity quote
    const quote = await liquidityManager.getAddLiquidityQuote({
      pool: rankedPools[0],
      token0Amount: amount0,
      token1Amount: amount1,
      priceRange
    });
    
    // 4. Format response
    const response = formatLiquidityQuoteResponse(quote, rankedPools[0]);
    callback({ text: response });
    
    return true;
  }
};
```

### **2. Remove Liquidity Action**

```typescript
const removeLiquidityAction: Action = {
  name: "REMOVE_LIQUIDITY",
  similes: ["WITHDRAW_LIQUIDITY", "EXIT_POSITION", "CLOSE_LP"],
  
  handler: async (runtime, message, state, options, callback) => {
    const parsed = parseCommand(message.content.text);
    
    // 1. Get user positions
    const userAddress = await getUserWalletAddress(runtime, message.userId);
    const positions = await liquidityManager.getUserPositions(userAddress);
    
    // 2. Identify target position
    const targetPosition = await identifyTargetPosition(parsed, positions);
    
    // 3. Calculate removal quote
    const removalQuote = await liquidityManager.getRemovalQuote(
      targetPosition.id,
      parsed.percentage || 100
    );
    
    // 4. Format response
    const response = formatRemovalQuoteResponse(removalQuote, targetPosition);
    callback({ text: response });
    
    return true;
  }
};
```

### **3. Pool Query Action**

```typescript
const poolQueryAction: Action = {
  name: "QUERY_POOLS",
  similes: ["SEARCH_POOLS", "FIND_POOLS", "POOL_INFO"],
  
  handler: async (runtime, message, state, options, callback) => {
    const parsed = parseCommand(message.content.text);
    
    if (parsed.queryType === 'userPositions') {
      // Show user's positions
      const positions = await liquidityManager.getUserPositions(userAddress);
      const response = formatUserPositionsResponse(positions);
      callback({ text: response });
    } else {
      // Search for pools
      const pools = await poolDiscovery.findPools(parsed.token0, parsed.token1);
      const response = formatPoolSearchResponse(pools);
      callback({ text: response });
    }
    
    return true;
  }
};
```

---

## 🔧 **API Integration Extensions**

### **1. Pool Data APIs**

```typescript
// Extend NineMMAggregator with pool functionality
class NineMMAggregator {
  // ... existing methods ...
  
  async getPools(token0: string, token1: string): Promise<PoolInfo[]> {
    const url = `${this.baseUrl}/pools/v1/list?token0=${token0}&token1=${token1}`;
    const response = await fetch(url);
    return this.transformPoolsResponse(await response.json());
  }
  
  async getPoolStats(poolAddress: string): Promise<PoolStats> {
    const url = `${this.baseUrl}/pools/v1/stats?address=${poolAddress}`;
    const response = await fetch(url);
    return await response.json();
  }
  
  async getLiquidityQuote(params: LiquidityQuoteParams): Promise<LiquidityQuote> {
    const url = `${this.baseUrl}/liquidity/v1/quote`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return await response.json();
  }
}
```

### **2. Subgraph Integration**

```typescript
class SubgraphClient {
  async getUserPositions(userAddress: string): Promise<Position[]> {
    const query = `
      query getUserPositions($user: String!) {
        positions(where: { owner: $user, liquidity_gt: 0 }) {
          id
          pool {
            id
            token0 { symbol, decimals }
            token1 { symbol, decimals }
            feeTier
          }
          liquidity
          tickLower
          tickUpper
          depositedToken0
          depositedToken1
          withdrawnToken0
          withdrawnToken1
          collectedFeesToken0
          collectedFeesToken1
        }
      }
    `;
    
    return this.executeQuery(query, { user: userAddress.toLowerCase() });
  }
}
```

---

## 📱 **User Experience Flow**

### **Example Interaction 1: Add Liquidity**

```
User: "Add liquidity to PLS/USDC pool with 100 USDC"

DEX Trader: I'll help you add liquidity to a PLS/USDC pool on 9mm! Let me show you 
all available options.

🔍 **Available PLS/USDC Pools on 9mm V3** (sorted by volume)
1. **0.25% Fee Tier** - Vol: $45.2K | TVL: $890K | APY: ~12.3%
2. **1% Fee Tier** - Vol: $23.1K | TVL: $1.2M | APY: ~8.7%
3. **2% Fee Tier** - Vol: $8.9K | TVL: $340K | APY: ~18.9%

💡 **My Recommendation**: 0.25% tier (highest volume = better execution)

📊 **Liquidity Options**
1. **Full Range**: Provide liquidity across entire price range (safer, lower fees)
2. **Concentrated Range**: ±5% around current price (higher fees, more risk)
3. **Custom Range**: Specify your own price range

Which option would you prefer? You can also specify a different fee tier.
```

### **Example Interaction 2: V3 Concentrated Liquidity**

```
User: "Create tight range position in HEX/USDC 0.3% pool"

DEX Trader: I'll create a concentrated liquidity position for you! 

📈 **Current HEX Price**: $0.00681 USDC

🎯 **Suggested Price Ranges**:
1. **Tight Range** (±2%): $0.00667 - $0.00695 | Est. APY: 89.3%
2. **Moderate Range** (±5%): $0.00647 - $0.00716 | Est. APY: 62.1%
3. **Wide Range** (±10%): $0.00613 - $0.00749 | Est. APY: 41.8%

💡 Higher concentration = Higher fees but more IL risk

Which range would you prefer? Or specify custom range?
```

---

## 🚀 **Implementation Timeline**

### **Phase 5A: 9mm V3 Core Infrastructure (Week 4-5)**
- [ ] **9mm V3 Pool Discovery**: Query subgraph for all available pools
- [ ] **Enhanced Natural Language Patterns**: V3-specific add/remove liquidity commands
- [ ] **Pool Display Logic**: User-centric pool listing with volume/TVL/fees sorting
- [ ] **Fee Tier Understanding**: Parse 0.25%, 1%, 2% fee tier commands

### **Phase 5B: V3 Position Management (Week 5-6)**
- [ ] **V3 Position Integration**: Track positions via subgraph
- [ ] **Tick Range Calculations**: Convert price ranges to V3 tick format
- [ ] **Position Lifecycle**: Create, modify, close V3 positions
- [ ] **Subgraph Position Queries**: Real-time position data and fee tracking

### **Phase 5C: Advanced V3 Features (Week 6-7)**
- [ ] **Intelligent Pool Recommendations**: Volume/TVL-based suggestions
- [ ] **APY Calculations**: Fee-based yield estimation for V3 pools
- [ ] **Position Analytics**: In-range status, unclaimed fees, IL tracking
- [ ] **Range Strategy Helpers**: Full-range, concentrated, custom range options

### **Phase 5D: ElizaOS Integration (Week 7)**
- [ ] **V3 Liquidity Actions**: ADD_LIQUIDITY_V3, REMOVE_LIQUIDITY_V3, QUERY_V3_POOLS
- [ ] **Pool Selection UI**: Present all available options to users
- [ ] **Error Handling**: V3-specific validation and user guidance
- [ ] **Testing and Validation**: >85% natural language accuracy for V3 operations

---

## 🔒 **Risk Management**

### **Impermanent Loss Protection**
- Calculate and display IL risk for each position
- Warn users about high-volatility pairs
- Suggest hedging strategies

### **Slippage Management**
- Dynamic slippage calculation based on pool depth
- Price impact warnings for large positions
- Timeout protection for stale quotes

### **Position Monitoring**
- Alert users when positions go out of range (V3)
- Notify about unclaimed fees
- Suggest rebalancing opportunities

---

## 📊 **Success Metrics**

- [ ] **Natural Language Accuracy**: >85% for V3 liquidity commands
- [ ] **Pool Discovery**: Find all pools within 9mm V3 ecosystem
- [ ] **Quote Accuracy**: <2% deviation from actual V3 execution
- [ ] **User Experience**: Complete V3 liquidity flow in <3 interactions
- [ ] **Position Management**: Track all user V3 positions accurately via subgraph

---

This comprehensive plan provides a roadmap for implementing sophisticated V3 liquidity management on 9mm DEX while maintaining the intuitive natural language interface that users love. The system will intelligently handle pool selection, price ranges, and position management within the 9mm V3 ecosystem, while continuing to use multi-DEX aggregation for optimal swap routing. 