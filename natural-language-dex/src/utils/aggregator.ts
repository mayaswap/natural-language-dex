import type { SwapQuote, SwapRequest } from '../types/index.js';
import { CHAIN_CONFIGS } from '../config/chains.js';

/**
 * 9mm Aggregator API Client
 * Handles interaction with the 9mm DEX aggregator (0x API v1 fork)
 */
export class NineMMAggregator {
  private baseUrl: string;
  private priceApiBaseUrl: string;

  constructor(chainId: number) {
    const chainConfig = Object.values(CHAIN_CONFIGS).find(c => c.chainId === chainId);
    if (!chainConfig?.aggregatorBaseUrl) {
      throw new Error(`Aggregator not available for chain ${chainId}`);
    }
    
    this.baseUrl = chainConfig.aggregatorBaseUrl;
    this.priceApiBaseUrl = 'https://price-api.9mm.pro'; // Dedicated price API
  }

  /**
   * Get swap quote from 9mm aggregator
   */
  async getSwapQuote(request: SwapRequest): Promise<SwapQuote> {
    try {
      const params = new URLSearchParams({
        sellToken: request.fromToken,
        buyToken: request.toToken,
        sellAmount: request.amount,
        slippagePercentage: request.slippagePercentage.toString(),
        takerAddress: request.userAddress,
      });

      const url = `${this.baseUrl}/swap/v1/quote?${params.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Aggregator API error: ${response.status}`);
      }

      const quoteData = await response.json();
      
      return this.transformQuoteResponse(quoteData);
      
    } catch (error) {
      throw new Error(
        `Failed to get swap quote: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get individual token price in USD from dedicated price API
   */
  async getTokenPrice(tokenAddress: string): Promise<{
    price: string;
    priceUSD: number;
  }> {
    try {
      // Normalize address to lowercase for consistent comparison
      const normalizedAddress = tokenAddress.toLowerCase();
      
      const url = `${this.priceApiBaseUrl}/api/price/pulsechain/?address=${normalizedAddress}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Price API error: ${response.status}`);
      }

      const priceData = await response.json();
      
      return {
        price: priceData.price,
        priceUSD: parseFloat(priceData.price),
      };
      
    } catch (error) {
      throw new Error(
        `Failed to get token price: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get price information only (no transaction data)
   */
  async getPrice(fromToken: string, toToken: string, amount: string): Promise<{
    price: string;
    buyAmount: string;
    estimatedPriceImpact?: string;
  }> {
    try {
      const params = new URLSearchParams({
        sellToken: fromToken,
        buyToken: toToken,
        sellAmount: amount,
      });

      const url = `${this.baseUrl}/swap/v1/price?${params.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Price API error: ${response.status}`);
      }

      const priceData = await response.json();
      
      return {
        price: priceData.price,
        buyAmount: priceData.buyAmount,
        estimatedPriceImpact: priceData.estimatedPriceImpact,
      };
      
    } catch (error) {
      throw new Error(
        `Failed to get price: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get available liquidity sources
   */
  async getSources(): Promise<Array<{ name: string; proportion: string }>> {
    try {
      const url = `${this.baseUrl}/swap/v1/sources`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Sources API error: ${response.status}`);
      }

      const sourcesData = await response.json();
      
      // Handle the actual API response format: {"records": [...]}
      const records = sourcesData.records || [];
      return records.map((name: string) => ({
        name,
        proportion: '1.0', // Equal weight since we don't have specific proportions
      }));
      
    } catch (error) {
      throw new Error(
        `Failed to get sources: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Transform 9mm API response to our SwapQuote schema
   */
  private transformQuoteResponse(data: any): SwapQuote {
    // Handle BigInt values from API by converting to string
    const safeStringify = (value: any): string => {
      if (typeof value === 'bigint') {
        return value.toString();
      }
      if (typeof value === 'number') {
        return value.toString();
      }
      return value || '0';
    };

    // Handle sources array - API might return different formats
    let sources = [];
    if (Array.isArray(data.sources)) {
      sources = data.sources.map((source: any) => {
        if (typeof source === 'string') {
          return { name: source, proportion: '1' };
        }
        return {
          name: source.name || 'Unknown',
          proportion: source.proportion || '1'
        };
      });
    }

    return {
      sellToken: data.sellToken || data.sellTokenAddress,
      buyToken: data.buyToken || data.buyTokenAddress,
      sellAmount: safeStringify(data.sellAmount),
      buyAmount: safeStringify(data.buyAmount),
      price: safeStringify(data.price),
      guaranteedPrice: safeStringify(data.guaranteedPrice || data.price),
      gas: safeStringify(data.gas || data.estimatedGas || data.gasEstimate || '600000'),
      gasPrice: safeStringify(data.gasPrice || '30000000000'), // 30 gwei default
      protocolFee: safeStringify(data.protocolFee || '0'),
      minimumProtocolFee: safeStringify(data.minimumProtocolFee || '0'),
      buyTokenAddress: data.buyTokenAddress || data.buyToken,
      sellTokenAddress: data.sellTokenAddress || data.sellToken,
      value: safeStringify(data.value || '0'),
      to: data.to || '0x0000000000000000000000000000000000000000',
      data: data.data || '0x',
      estimatedPriceImpact: safeStringify(data.estimatedPriceImpact || data.priceImpact || '0'),
      sources: sources,
    };
  }

  /**
   * Format amount for API calls (handle decimal precision)
   */
  static formatAmount(amount: string, decimals: number): string {
    try {
      // Handle scientific notation and ensure we have a valid number
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount)) {
        throw new Error(`Invalid amount: ${amount}`);
      }

      // For small decimals, use regular math to avoid precision issues
      if (decimals <= 18) {
        const multiplier = Math.pow(10, decimals);
        const result = Math.floor(numericAmount * multiplier);
        return result.toString();
      }

      // For large decimals, use BigInt
      const factor = BigInt(10) ** BigInt(decimals);
      const wholePart = BigInt(Math.floor(numericAmount));
      const fractionalPart = BigInt(Math.floor((numericAmount % 1) * Number(factor)));
      const total = wholePart * factor + fractionalPart;
      return total.toString();
    } catch (error) {
      console.error('Error formatting amount:', error);
      return '0';
    }
  }

  /**
   * Parse amount from API response (convert from wei to decimal)
   */
  static parseAmount(amount: string | number | bigint, decimals: number): string {
    try {
      // Convert input to string, handling BigInt properly
      let amountStr: string;
      if (typeof amount === 'bigint') {
        amountStr = amount.toString();
      } else if (typeof amount === 'number') {
        amountStr = Math.floor(amount).toString();
      } else {
        amountStr = amount.toString();
      }

      // Handle empty or invalid inputs
      if (!amountStr || amountStr === '0') {
        return '0';
      }

      // For small decimals, use regular math
      if (decimals <= 18) {
        const divisor = Math.pow(10, decimals);
        const numericAmount = parseFloat(amountStr) / divisor;
        
        // Format with appropriate decimal places
        if (numericAmount < 0.000001) {
          return numericAmount.toExponential(6);
        }
        
        // Remove trailing zeros
        return numericAmount.toString();
      }

      // For large decimals, use BigInt
      const factor = BigInt(10) ** BigInt(decimals);
      const amountBigInt = BigInt(amountStr);
      const wholePart = amountBigInt / factor;
      const fractionalPart = amountBigInt % factor;
      
      if (fractionalPart === 0n) {
        return wholePart.toString();
      }
      
      const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
      const trimmedFractional = fractionalStr.replace(/0+$/, '');
      
      return trimmedFractional ? `${wholePart}.${trimmedFractional}` : wholePart.toString();
    } catch (error) {
      console.error('Error parsing amount:', error);
      return '0';
    }
  }

  /**
   * Calculate price impact percentage
   */
  static calculatePriceImpact(inputAmount: string, outputAmount: string, marketPrice: string): string {
    const input = parseFloat(inputAmount);
    const output = parseFloat(outputAmount);
    const market = parseFloat(marketPrice);
    
    if (input === 0 || market === 0) return '0';
    
    const expectedOutput = input / market;
    const priceImpact = ((expectedOutput - output) / expectedOutput) * 100;
    
    return Math.abs(priceImpact).toFixed(4);
  }

  /**
   * Validate slippage tolerance
   */
  static validateSlippage(slippage: number): boolean {
    return slippage >= 0 && slippage <= 0.5; // 0% to 50%
  }

  /**
   * Get minimum received amount with slippage
   */
  static getMinimumReceived(buyAmount: string, slippagePercentage: number): string {
    const amount = parseFloat(buyAmount);
    const minimum = amount * (1 - slippagePercentage);
    return minimum.toString();
  }
}
