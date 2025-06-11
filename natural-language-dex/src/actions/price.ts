import {
    ActionExample,
    Content,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
    type Action,
} from "@elizaos/core";
import { parseCommand } from "../utils/parser.js";
import { NineMMAggregator } from "../utils/aggregator.js";
import { POPULAR_TOKENS } from "../config/chains.js";

// Token metadata for proper decimal handling
const TOKEN_METADATA: Record<string, { decimals: number; symbol: string }> = {
  'PLS': { decimals: 18, symbol: 'PLS' },
  'WPLS': { decimals: 18, symbol: 'WPLS' },
  'USDC': { decimals: 6, symbol: 'USDC' },
  'USDT': { decimals: 6, symbol: 'USDT' },
  'DAI': { decimals: 18, symbol: 'DAI' },
  'HEX': { decimals: 8, symbol: 'HEX' },
  'PLSX': { decimals: 18, symbol: 'PLSX' },
  '9MM': { decimals: 18, symbol: '9MM' },
  'WETH': { decimals: 18, symbol: 'WETH' },
};

const priceAction: Action = {
    name: "GET_PRICE",
    similes: [
        "CHECK_PRICE",
        "PRICE_LOOKUP",
        "MARKET_PRICE",
        "TOKEN_PRICE",
        "QUOTE_PRICE"
    ],
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        const text = message.content.text;
        const parsed = await parseCommand(text);
        
        // Valid if it's a price command with sufficient confidence
        return parsed.intent === 'price' && parsed.confidence > 0.6;
    },
    description: "Get current token prices using natural language commands via 9mm DEX aggregator",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state?: State,
        _options?: { [key: string]: unknown },
        callback?: HandlerCallback
    ): Promise<boolean> => {
        const text = message.content.text;
        const parsed = await parseCommand(text);
        
        if (!parsed.fromToken) {
            if (callback) {
                callback({
                    text: "I need to know which token price you want to check. For example: 'What's the price of HEX?' or 'HEX price'"
                });
            }
            return false;
        }

        try {
            const aggregator = new NineMMAggregator(369); // Pulsechain
            
            // Get token addresses from popular tokens config
            const pulsechainTokens = POPULAR_TOKENS.pulsechain;
            
            const tokenAddress = pulsechainTokens[parsed.fromToken as keyof typeof pulsechainTokens];
            const tokenMetadata = TOKEN_METADATA[parsed.fromToken];
            
            if (!tokenAddress) {
                throw new Error(`Token not found: ${parsed.fromToken}`);
            }

            // Use dedicated price API for direct USD prices
            const priceData = await aggregator.getTokenPrice(tokenAddress);
            
            const tokenPriceUSD = priceData.priceUSD;
            
            // Format price based on value magnitude
            let formattedPrice: string;
            if (tokenPriceUSD < 0.000001) {
                formattedPrice = tokenPriceUSD.toExponential(4);
            } else if (tokenPriceUSD < 0.01) {
                formattedPrice = tokenPriceUSD.toFixed(8);
            } else if (tokenPriceUSD < 1) {
                formattedPrice = tokenPriceUSD.toFixed(6);
            } else {
                formattedPrice = tokenPriceUSD.toFixed(4);
            }
            
            // Create market cap and volume estimates for major tokens
            let additionalInfo = '';
            if (parsed.fromToken === 'PLS') {
                additionalInfo = '\n**Note:** PLS is the native token of PulseChain';
            } else if (parsed.fromToken === 'HEX') {
                additionalInfo = '\n**Note:** HEX is a certificate of deposit on blockchain';
            }
            
            const responseText = `📊 **${parsed.fromToken} Price**

**Current Price:** $${formattedPrice} USD
**Token:** ${tokenMetadata?.symbol || parsed.fromToken}
**Decimals:** ${tokenMetadata?.decimals || 18}
**Address:** \`${tokenAddress}\`${additionalInfo}

*Price sourced from 9mm price API on PulseChain*`;

            if (callback) {
                callback({
                    text: responseText
                });
            }

            return true;

        } catch (error) {
            console.error('Price action error:', error);
            if (callback) {
                callback({
                    text: `❌ Failed to get price: ${error instanceof Error ? error.message : 'Unknown error'}`
                });
            }
            return false;
        }
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "What's the price of HEX?" }
            },
            {
                user: "{{agent}}",
                content: {   
                    text: "Let me check the current HEX price across all DEX pools.",
                    action: "GET_PRICE"
                }
            }
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "PLS price" }
            },
            {
                user: "{{agent}}",
                content: {
                    text: "I'll fetch the current PLS price for you.",
                    action: "GET_PRICE"
                }
            }
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "How much is PLSX worth?" }
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Let me get the latest PLSX market price.",
                    action: "GET_PRICE"
                }
            }
        ]
    ] as ActionExample[][],
};

export default priceAction; 