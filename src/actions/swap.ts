import {
  Action,
  IAgentRuntime,
  Memory,
  State,
  HandlerCallback,
  Content,
  ActionExample,
} from '@elizaos/core';
import { SwapRequest, SwapQuote, DEXError, ErrorCodes } from '../types/index.js';
import { NineMMAggregator } from '../utils/aggregator.js';
import { getChainConfig, DEFAULT_CHAIN, CHAIN_CONFIGS } from '../config/chains.js';

/**
 * Token Swap Action for ElizaOS
 * Handles natural language commands for token swapping
 */
export const swapAction: Action = {
  name: 'SWAP_TOKENS',
  similes: [
    'EXCHANGE_TOKENS',
    'TRADE_TOKENS', 
    'CONVERT_TOKENS',
    'BUY_TOKEN',
    'SELL_TOKEN',
  ],
  description: 'Swap one token for another using the best available price through aggregated DEX routing',
  
  validate: async (runtime: IAgentRuntime, message: Memory) => {
    const content = message.content as Content;
    const text = content.text?.toLowerCase() || '';
    
    // Check for swap-related keywords
    const swapKeywords = [
      'swap', 'exchange', 'trade', 'convert',
      'buy', 'sell', 'for', 'to',
      'usdc', 'eth', 'pls', 'hex', 'plsx'
    ];
    
    const hasSwapKeywords = swapKeywords.some(keyword => text.includes(keyword));
    
    // Check for amount patterns
    const hasAmount = /(\d+\.?\d*|\d*\.?\d+)/.test(text);
    
    // Must have both swap intention and amount
    return hasSwapKeywords && hasAmount;
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    options: any,
    callback?: HandlerCallback
  ) => {
    try {
      const content = message.content as Content;
      const userMessage = content.text || '';
      
      // Extract swap parameters from natural language
      const swapParams = await parseSwapCommand(userMessage, runtime);
      
      if (!swapParams) {
        if (callback) {
          callback({
            text: "I couldn't understand your swap request. Please try something like 'Swap 100 USDC for ETH' or 'Exchange 0.5 ETH to PLS'.",
            action: 'SWAP_TOKENS',
            source: message.content.source,
          });
        }
        return false;
      }

      // Get user's wallet address and chain preference
      const userAddress = await getUserWalletAddress(runtime, message.userId);
      const chainId = await getUserChainPreference(runtime, message.userId);
      
      if (!userAddress) {
        if (callback) {
          callback({
            text: "You need to connect your wallet first. Would you like me to help you set up a new wallet?",
            action: 'SWAP_TOKENS',
            source: message.content.source,
          });
        }
        return false;
      }

      // Create swap request
      const swapRequest: SwapRequest = {
        fromToken: swapParams.fromToken,
        toToken: swapParams.toToken,
        amount: swapParams.amount,
        slippagePercentage: swapParams.slippage || 0.005,
        userAddress: userAddress,
        chainId: chainId,
      };

      // Get quote from aggregator
      const aggregator = new NineMMAggregator(chainId);
      const quote = await aggregator.getSwapQuote(swapRequest);

      // Format response with quote details
      const response = formatSwapQuoteResponse(quote, swapParams);
      
      if (callback) {
        callback({
          text: response,
          action: 'SWAP_TOKENS',
          source: message.content.source,
          data: {
            quote,
            swapParams,
            requiresConfirmation: true,
          },
        });
      }

      // Store quote in conversation state for potential execution
      await storeQuoteInState(runtime, message.userId, quote);
      
      return true;

    } catch (error) {
      console.error('Swap action error:', error);
      
      let errorMessage = 'Sorry, I encountered an error while processing your swap request.';
      
      if (error instanceof DEXError) {
        switch (error.code) {
          case ErrorCodes.INSUFFICIENT_BALANCE:
            errorMessage = 'You don\'t have enough balance to complete this swap.';
            break;
          case ErrorCodes.INVALID_TOKEN:
            errorMessage = 'I couldn\'t find one of the tokens you mentioned. Please check the token symbols.';
            break;
          case ErrorCodes.SLIPPAGE_TOO_HIGH:
            errorMessage = 'The price impact for this trade is too high. Try a smaller amount or different tokens.';
            break;
          case ErrorCodes.AGGREGATOR_ERROR:
            errorMessage = 'There was an issue getting quotes from the DEX. Please try again in a moment.';
            break;
          default:
            errorMessage = `Swap error: ${error.message}`;
        }
      }

      if (callback) {
        callback({
          text: errorMessage,
          action: 'SWAP_TOKENS',
          source: message.content.source,
        });
      }
      
      return false;
    }
  },

  examples: [
    [
      {
        user: '{{user1}}',
        content: { text: 'Swap 100 USDC for ETH' },
      },
      {
        user: '{{user2}}',
        content: {
          text: "I'll get you a quote for swapping 100 USDC to ETH.\n\n📊 **Swap Quote**\n• You're swapping: 100 USDC\n• You'll receive: ~0.0256 ETH\n• Rate: 1 ETH = 3,906.25 USDC\n• Price impact: 0.12%\n• Gas fee: ~$2.50\n• Slippage tolerance: 0.5%\n\nWould you like to proceed with this swap?",
          action: 'SWAP_TOKENS',
        },
      },
    ],
    [
      {
        user: '{{user1}}',
        content: { text: 'Exchange 0.5 ETH to PLS' },
      },
      {
        user: '{{user2}}',
        content: {
          text: "I'll help you exchange 0.5 ETH for PLS on Pulsechain.\n\n📊 **Swap Quote**\n• You're swapping: 0.5 ETH\n• You'll receive: ~48,750 PLS\n• Rate: 1 ETH = 97,500 PLS\n• Price impact: 0.08%\n• Gas fee: ~$1.20\n• Best route: ETH → WPLS → PLS\n\nThis trade will be executed on Pulsechain. Confirm to proceed.",
          action: 'SWAP_TOKENS',
        },
      },
    ],
    [
      {
        user: '{{user1}}',
        content: { text: 'Trade all my HEX for PLSX' },
      },
      {
        user: '{{user2}}',
        content: {
          text: "I'll help you trade all your HEX for PLSX. Let me check your HEX balance first...\n\n💰 **Your HEX Balance**: 1,250 HEX (~$89.50)\n\n📊 **Swap Quote**\n• You're swapping: 1,250 HEX\n• You'll receive: ~3,203 PLSX\n• Rate: 1 HEX = 2.56 PLSX\n• Price impact: 0.23%\n• Gas fee: ~$0.80\n\nThis will swap your entire HEX position. Are you sure you want to proceed?",
          action: 'SWAP_TOKENS',
        },
      },
    ],
  ] as ActionExample[][],
};

/**
 * Parse natural language swap command
 */
async function parseSwapCommand(text: string, runtime: IAgentRuntime): Promise<{
  fromToken: string;
  toToken: string;
  amount: string;
  slippage?: number;
} | null> {
  const lowerText = text.toLowerCase();
  
  // Extract amount
  const amountMatch = lowerText.match(/(\d+\.?\d*|\d*\.?\d+)/);
  if (!amountMatch) return null;
  
  const amount = amountMatch[1];
  
  // Extract token symbols
  const tokenSymbols = extractTokenSymbols(lowerText);
  if (tokenSymbols.length < 2) return null;
  
  // Determine from/to tokens based on command structure
  let fromToken = '';
  let toToken = '';
  
  // Pattern: "swap X TOKEN for TOKEN" or "exchange X TOKEN to TOKEN"
  if (lowerText.includes(' for ') || lowerText.includes(' to ')) {
    fromToken = tokenSymbols[0];
    toToken = tokenSymbols[1];
  }
  // Pattern: "buy TOKEN with X TOKEN" 
  else if (lowerText.includes('buy') && lowerText.includes('with')) {
    toToken = tokenSymbols[0];
    fromToken = tokenSymbols[1];
  }
  // Pattern: "sell X TOKEN for TOKEN"
  else if (lowerText.includes('sell')) {
    fromToken = tokenSymbols[0];
    toToken = tokenSymbols[1];
  }
  else {
    // Default: assume first token is from, second is to
    fromToken = tokenSymbols[0];
    toToken = tokenSymbols[1];
  }

  // Convert token symbols to addresses
  const fromTokenAddress = await getTokenAddress(fromToken, runtime);
  const toTokenAddress = await getTokenAddress(toToken, runtime);
  
  if (!fromTokenAddress || !toTokenAddress) return null;

  return {
    fromToken: fromTokenAddress,
    toToken: toTokenAddress,
    amount: amount,
  };
}

/**
 * Extract token symbols from text
 */
function extractTokenSymbols(text: string): string[] {
  const knownTokens = [
    'eth', 'weth', 'usdc', 'usdt', 'dai',
    'pls', 'wpls', 'plsx', 'hex', 'btc', 'wbtc'
  ];
  
  const foundTokens: string[] = [];
  
  for (const token of knownTokens) {
    if (text.includes(token)) {
      foundTokens.push(token.toUpperCase());
    }
  }
  
  return [...new Set(foundTokens)]; // Remove duplicates
}

/**
 * Get token address by symbol
 */
async function getTokenAddress(symbol: string, runtime: IAgentRuntime): Promise<string | null> {
  // This would typically query a token registry or database
  // For now, return hardcoded addresses for major tokens
  const tokenAddresses: Record<string, string> = {
    'ETH': '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    'WETH': '0x02DcDD04e3F455D838cd1249292C58f3B79e3C3C',
    'USDC': '0x15d38573d2feeb82e7ad5187ab8c1d52810b1f07',
    'USDT': '0x0Cb6F5a34ad42ec934882A05265A7d5F59b51A2f',
    'DAI': '0xefD766CcB38EaF1dfd701853BFCe31359239F305',
    'PLS': '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    'WPLS': '0xA1077a294dDE1B09bB078844df40758a5D0f9a27',
    'PLSX': '0x95b303987a60c71504d99aa1b13b4da07b0790ab',
    'HEX': '0x2b591e99afe9f32eaa6214f7b7629768c40eeb39',
  };
  
  return tokenAddresses[symbol] || null;
}

/**
 * Get user's wallet address
 */
async function getUserWalletAddress(runtime: IAgentRuntime, userId: string): Promise<string | null> {
  // This would integrate with Privy to get the user's wallet address
  // For now, return a placeholder
  return '0x742d35Cc6634C0532925a3b8BC9C24C22eeE7e37'; // Placeholder
}

/**
 * Get user's preferred chain
 */
async function getUserChainPreference(runtime: IAgentRuntime, userId: string): Promise<number> {
  // This would check user preferences
  // For now, default to Pulsechain
  return CHAIN_CONFIGS[DEFAULT_CHAIN].chainId;
}

/**
 * Format swap quote response for user
 */
function formatSwapQuoteResponse(quote: SwapQuote, params: any): string {
  const fromSymbol = getTokenSymbolFromAddress(quote.sellTokenAddress);
  const toSymbol = getTokenSymbolFromAddress(quote.buyTokenAddress);
  
  const sellAmount = NineMMAggregator.parseAmount(quote.sellAmount, 18);
  const buyAmount = NineMMAggregator.parseAmount(quote.buyAmount, 18);
  
  const priceImpact = quote.estimatedPriceImpact ? 
    `${(parseFloat(quote.estimatedPriceImpact) * 100).toFixed(2)}%` : 'N/A';
  
  const gasEstimate = (parseFloat(quote.gas) * parseFloat(quote.gasPrice) / 1e18).toFixed(4);
  
  return `📊 **Swap Quote**

• You're swapping: ${sellAmount} ${fromSymbol}
• You'll receive: ~${buyAmount} ${toSymbol}
• Price impact: ${priceImpact}
• Estimated gas: ${gasEstimate} ETH
• Route: ${quote.sources.map((s: any) => s.name).join(' → ') || 'Best Route'}

Would you like to proceed with this swap? Reply with "confirm" to execute.`;
}

/**
 * Get token symbol from address (simplified)
 */
function getTokenSymbolFromAddress(address: string): string {
  const addressToSymbol: Record<string, string> = {
    '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE': 'ETH',
    '0xA1077a294dDE1B09bB078844df40758a5D0f9a27': 'WPLS',
    '0x15d38573d2feeb82e7ad5187ab8c1d52810b1f07': 'USDC',
    '0x95b303987a60c71504d99aa1b13b4da07b0790ab': 'PLSX',
    '0x2b591e99afe9f32eaa6214f7b7629768c40eeb39': 'HEX',
  };
  
  return addressToSymbol[address] || address.slice(0, 6) + '...';
}

/**
 * Store quote in conversation state
 */
async function storeQuoteInState(runtime: IAgentRuntime, userId: string, quote: SwapQuote): Promise<void> {
  // This would store the quote for potential execution
  // Implementation depends on ElizaOS state management
  console.log('Storing quote for user:', userId, quote);
} 