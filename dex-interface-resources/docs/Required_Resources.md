# Required Resources & Information
## What We Need From You to Build the DEX Interface

This document outlines all the specific resources, APIs, smart contracts, and configuration details needed to implement the Natural Language DEX Interface project.

---

## **🔗 1. DEX Smart Contracts & Integration**

### **Smart Contract Addresses**
Please provide the DEX smart contract addresses for each chain:

#### **Pulsechain (Primary)**
```
Router Contract: 0x...
Factory Contract: 0x...
WETH/Wrapped Native Token: 0x...
Multicall Contract: 0x... (if available)
```

#### **Base Chain**
```
Router Contract: 0x...
Factory Contract: 0x...
WETH Contract: 0x...
Multicall Contract: 0x...
```

#### **Sonic Chain**
```
Router Contract: 0x...
Factory Contract: 0x...
Wrapped Native Token: 0x...
Multicall Contract: 0x...
```

### **Contract ABIs**
- Router ABI (JSON format)
- Factory ABI (JSON format)
- ERC20 Token ABI (JSON format)
- LP Token ABI (JSON format)
- Any custom contract ABIs specific to your DEX

### **DEX Information**
- DEX name and branding
- Fee structure (trading fees, LP fees)
- Supported token standards
- Any special features or mechanics
- Documentation or whitepaper links

---

## **📊 2. Swap Aggregator API**

### **API Details**
```
Base URL: https://api.example.com
Authentication: API Key / Bearer Token
Rate Limits: X requests per minute
```

### **Required Endpoints**
Please provide documentation for:
- **Quote Endpoint**: Get swap quotes
- **Swap Endpoint**: Execute swaps
- **Supported Tokens**: List of available tokens
- **Price Feed**: Real-time price data
- **Route Optimization**: Best path calculation

### **API Schema Examples**
```json
// Quote Request Example
{
  "fromToken": "0x...",
  "toToken": "0x...",
  "amount": "1000000000000000000",
  "chainId": 369
}

// Quote Response Example
{
  "route": {...},
  "estimatedGas": "150000",
  "priceImpact": "0.5",
  "expectedOutput": "999000000000000000"
}
```

---

## **💰 3. Token Lists & Configurations**

### **Supported Tokens**
For each chain, provide:
- Token contract addresses
- Token symbols and names
- Token decimals
- Token logos/icons
- Price feed sources
- Whether tokens are verified/trusted

### **Token List Format**
```json
{
  "name": "Your DEX Token List",
  "version": {
    "major": 1,
    "minor": 0,
    "patch": 0
  },
  "tokens": [
    {
      "chainId": 369,
      "address": "0x...",
      "name": "Token Name",
      "symbol": "TOKEN",
      "decimals": 18,
      "logoURI": "https://...",
      "tags": ["verified"]
    }
  ]
}
```

### **Native Tokens**
- Symbol and name for each chain's native token
- Decimal places
- Current price sources

---

## **⚙️ 4. Chain Configurations**

### **RPC Endpoints**
Reliable RPC endpoints for each chain:
```
Pulsechain:
- Primary RPC: https://...
- Backup RPC: https://...
- WebSocket RPC: wss://...

Base Chain:
- Primary RPC: https://...
- Backup RPC: https://...
- WebSocket RPC: wss://...

Sonic Chain:
- Primary RPC: https://...
- Backup RPC: https://...
- WebSocket RPC: wss://...
```

### **Chain Details**
For each chain:
- Chain ID
- Block explorer URLs
- Average block time
- Gas price estimation APIs
- Recommended gas limits
- Native token symbol

### **Network Status**
- Any known limitations or special considerations
- Maintenance schedules or downtime patterns
- Performance characteristics

---

## **📈 5. Data Sources & Analytics**

### **Price Data APIs**
- Preferred price data providers
- API keys for price services
- Token price identifiers/mappings
- Historical data availability

### **Subgraph URLs** (if available)
```
Pulsechain Subgraph: https://api.thegraph.com/subgraphs/name/...
Base Chain Subgraph: https://api.thegraph.com/subgraphs/name/...
Sonic Chain Subgraph: https://api.thegraph.com/subgraphs/name/...
```

### **Analytics Requirements**
- Which metrics are most important to you
- Existing analytics dashboards or tools
- Data retention requirements
- Compliance or reporting needs

---

## **🔐 6. Security & Access**

### **API Keys & Authentication**
- **Privy App ID and API Keys** (from Privy Dashboard)
- Swap aggregator API credentials
- Price data API keys
- Any other service authentication requirements
- Rate limiting considerations

### **Security Preferences**
- Privy configuration preferences
- MPC vs standard wallet preferences
- Security audit requirements
- Compliance considerations
- Risk tolerance levels

### **Access Control**
- Admin panel requirements
- User management needs
- Monitoring and alerting preferences

---

## **🎨 7. Branding & UI**

### **Design Assets**
- Logo files (SVG, PNG)
- Brand colors (hex codes)
- Typography preferences
- Icon sets
- UI mockups or designs (if available)

### **User Experience**
- Target user persona
- Preferred conversation style
- Error message tone
- Help and support approach

---

## **🔧 8. Infrastructure & Deployment**

### **Hosting Preferences**
- Cloud provider preferences
- Geographic region requirements
- Scalability expectations
- Budget considerations

### **Domain & SSL**
- Domain name for the application
- SSL certificate preferences
- CDN requirements

### **Monitoring & Alerts**
- Preferred monitoring services
- Alert notification channels (email, Slack, etc.)
- Uptime requirements
- Performance SLA expectations

---

## **📝 9. Development & Testing**

### **Testing Requirements**
- Testnet contract addresses (if available)
- Testing token faucets
- QA environment specifications
- User acceptance testing criteria

### **Development Timeline**
- Launch deadline or target date
- Milestone preferences
- Beta testing participant list
- Feedback collection methods

---

## **📋 10. Business Logic & Rules**

### **Trading Rules**
- Minimum/maximum trade amounts
- Slippage tolerance defaults
- Gas price strategies
- Fee structures

### **Risk Management**
- Position size limits
- Loss prevention mechanisms
- Suspicious activity detection
- Compliance requirements

### **Feature Priorities**
- Must-have features for launch
- Nice-to-have features for later
- Features to avoid or exclude
- Integration priorities

---

## **📞 11. Communication & Support**

### **Points of Contact**
- Technical contact for smart contract questions
- Business contact for feature decisions
- Design contact for UI/UX feedback
- QA contact for testing coordination

### **Communication Preferences**
- Preferred communication channels
- Meeting schedules and time zones
- Progress reporting frequency
- Escalation procedures

---

## **✅ Priority Checklist**

**Immediate Needs (to start development):**
- [ ] Privy App ID and API keys
- [ ] DEX smart contract addresses
- [ ] Swap aggregator API documentation
- [ ] RPC endpoints for all chains
- [ ] Basic token list
- [ ] Chain configurations

**Phase 1 Requirements:**
- [ ] Complete token lists
- [ ] Price data API access
- [ ] Branding assets
- [ ] Testing environments

**Phase 2 Requirements:**
- [ ] Analytics integrations
- [ ] Advanced features specifications
- [ ] Production infrastructure
- [ ] Security audit plans

Please provide these resources in priority order, starting with the immediate needs to begin development. 