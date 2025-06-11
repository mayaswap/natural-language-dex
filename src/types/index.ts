import { z } from 'zod';

// ===========================================
// Chain & Network Types
// ===========================================

export type SupportedChain = 'pulsechain' | 'base' | 'sonic';

export interface ChainConfig {
  chainId: number;
  name: string;
  symbol: string;
  rpcUrl: string;
  explorerUrl: string;
  wrappedToken: string;
  aggregatorBaseUrl?: string;
}

// ===========================================
// Token & Asset Types
// ===========================================

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  chainId: number;
  priceUSD?: string;
  balance?: string;
}

// ===========================================
// Trading & Swap Types
// ===========================================

export interface SwapQuote {
  sellToken: string;
  buyToken: string;
  sellAmount: string;
  buyAmount: string;
  price: string;
  guaranteedPrice: string;
  gas: string;
  gasPrice: string;
  protocolFee: string;
  minimumProtocolFee: string;
  buyTokenAddress: string;
  sellTokenAddress: string;
  value: string;
  to: string;
  data: string;
  estimatedPriceImpact?: string;
  sources: Array<{
    name: string;
    proportion: string;
  }>;
}

export interface SwapRequest {
  fromToken: string;
  toToken: string;
  amount: string;
  slippagePercentage: number;
  userAddress: string;
  chainId: number;
}

// ===========================================
// Portfolio & Analytics Types
// ===========================================

export const PortfolioSchema = z.object({
  totalValueUSD: z.string(),
  totalPnLUSD: z.string(),
  totalPnLPercentage: z.string(),
  tokens: z.array(TokenBalanceSchema),
  lastUpdated: z.date(),
});

export type Portfolio = z.infer<typeof PortfolioSchema>;

export const TransactionSchema = z.object({
  hash: z.string(),
  chainId: z.number(),
  type: z.enum(['swap', 'add_liquidity', 'remove_liquidity', 'approve', 'transfer']),
  status: z.enum(['pending', 'confirmed', 'failed']),
  fromToken: TokenSchema.optional(),
  toToken: TokenSchema.optional(),
  fromAmount: z.string().optional(),
  toAmount: z.string().optional(),
  gasUsed: z.string().optional(),
  gasFee: z.string().optional(),
  timestamp: z.date(),
  blockNumber: z.number().optional(),
});

export type Transaction = z.infer<typeof TransactionSchema>;

// ===========================================
// User & Session Types
// ===========================================

export const UserSchema = z.object({
  id: z.string(),
  privyUserId: z.string(),
  walletAddress: z.string(),
  email: z.string().optional(),
  createdAt: z.date(),
  lastActiveAt: z.date(),
  preferences: z.object({
    defaultSlippage: z.number().default(0.005),
    defaultChain: z.string().default('pulsechain'),
    priceAlerts: z.boolean().default(false),
    riskTolerance: z.enum(['low', 'medium', 'high']).default('medium'),
  }),
});

export type User = z.infer<typeof UserSchema>;

export const ConversationContextSchema = z.object({
  userId: z.string(),
  sessionId: z.string(),
  currentChain: z.string(),
  lastAction: z.string().optional(),
  pendingTransactions: z.array(z.string()),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
    timestamp: z.date(),
  })),
});

export type ConversationContext = z.infer<typeof ConversationContextSchema>;

// ===========================================
// Action & Command Types
// ===========================================

export type ActionType = 
  | 'swap_tokens'
  | 'check_balance'
  | 'get_portfolio'
  | 'get_price'
  | 'add_liquidity'
  | 'remove_liquidity'
  | 'check_transaction'
  | 'set_price_alert'
  | 'get_market_data'
  | 'analyze_token'
  | 'get_gas_estimate';

export const ActionRequestSchema = z.object({
  type: z.string(),
  parameters: z.record(z.any()),
  userAddress: z.string(),
  chainId: z.number(),
  conversationId: z.string(),
});

export type ActionRequest = z.infer<typeof ActionRequestSchema>;

export const ActionResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  message: z.string(),
  transactionHash: z.string().optional(),
  estimatedGas: z.string().optional(),
  error: z.string().optional(),
});

export type ActionResponse = z.infer<typeof ActionResponseSchema>;

// ===========================================
// Market Data Types
// ===========================================

export const PriceDataSchema = z.object({
  tokenAddress: z.string(),
  priceUSD: z.string(),
  priceChange24h: z.string(),
  volume24h: z.string(),
  marketCap: z.string().optional(),
  lastUpdated: z.date(),
});

export type PriceData = z.infer<typeof PriceDataSchema>;

export const PoolInfoSchema = z.object({
  address: z.string(),
  token0: TokenSchema,
  token1: TokenSchema,
  tvlUSD: z.string(),
  volume24hUSD: z.string(),
  apy: z.string(),
  fee: z.string(),
  chainId: z.number(),
});

export type PoolInfo = z.infer<typeof PoolInfoSchema>;

// ===========================================
// Error Types
// ===========================================

export class DEXError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'DEXError';
  }
}

export const ErrorCodes = {
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  INVALID_TOKEN: 'INVALID_TOKEN',
  SLIPPAGE_TOO_HIGH: 'SLIPPAGE_TOO_HIGH',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INVALID_CHAIN: 'INVALID_CHAIN',
  WALLET_NOT_CONNECTED: 'WALLET_NOT_CONNECTED',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  AGGREGATOR_ERROR: 'AGGREGATOR_ERROR',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]; 