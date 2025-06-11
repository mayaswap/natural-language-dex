import type { SwapQuote, SwapRequest, DEXError } from '../types/index.js';
import { CHAIN_CONFIGS } from '../config/chains.js';

/**
 * 9mm Aggregator API Client
 * Handles interaction with the 9mm DEX aggregator (0x API v1 fork)
 */
export class NineMMAggregator {
  private baseUrl: string;

  constructor(chainId: number) {
    const chainConfig = Object.values(CHAIN_CONFIGS).find(c => c.chainId === chainId);
    if (!chainConfig?.aggregatorBaseUrl) {
      throw new Error(`Aggregator not available for chain ${chainId}`);
    }
    
    this.baseUrl = chainConfig.aggregatorBaseUrl;
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
      
      // Transform the sources data to our format
      return Object.keys(sourcesData.sources).map(name => ({
        name,
        proportion: sourcesData.sources[name].toString(),
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
    return {
      sellToken: data.sellToken,
      buyToken: data.buyToken,
      sellAmount: data.sellAmount,
      buyAmount: data.buyAmount,
      price: data.price,
      guaranteedPrice: data.guaranteedPrice,
      gas: data.gas || data.estimatedGas,
      gasPrice: data.gasPrice,
      protocolFee: data.protocolFee || '0',
      minimumProtocolFee: data.minimumProtocolFee || '0',
      buyTokenAddress: data.buyTokenAddress || data.buyToken,
      sellTokenAddress: data.sellTokenAddress || data.sellToken,
      value: data.value,
      to: data.to,
      data: data.data,
      estimatedPriceImpact: data.estimatedPriceImpact,
      sources: data.sources || [],
    };
  }

  /**
   * Format amount for API calls (handle decimal precision)
   */
  static formatAmount(amount: string, decimals: number): string {
    // Convert to wei/smallest unit
    const factor = BigInt(10 ** decimals);
    const amountBigInt = BigInt(Math.floor(parseFloat(amount) * Math.pow(10, decimals)));
    return amountBigInt.toString();
  }

  /**
   * Parse amount from API response (convert from wei to decimal)
   */
  static parseAmount(amount: string, decimals: number): string {
    const factor = BigInt(10 ** decimals);
    const amountBigInt = BigInt(amount);
    const wholePart = amountBigInt / factor;
    const fractionalPart = amountBigInt % factor;
    
    if (fractionalPart === 0n) {
      return wholePart.toString();
    }
    
    const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
    const trimmedFractional = fractionalStr.replace(/0+$/, '');
    
    return trimmedFractional ? `${wholePart}.${trimmedFractional}` : wholePart.toString();
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