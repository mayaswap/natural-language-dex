import type { ChainConfig, SupportedChain } from '../types/index.js';

/**
 * Chain configurations for supported networks
 * Based on the established configurations from dex-interface-resources
 */
export const CHAIN_CONFIGS: Record<SupportedChain, ChainConfig> = {
  pulsechain: {
    chainId: 369,
    name: 'PulseChain',
    symbol: 'PLS',
    rpcUrl: 'https://rpc.pulsechain.com',
    explorerUrl: 'https://scan.pulsechain.com',
    wrappedToken: '0xA1077a294dDE1B09bB078844df40758a5D0f9a27', // WPLS
    aggregatorBaseUrl: 'https://api.9mm.pro',
  },
  base: {
    chainId: 8453,
    name: 'Base',
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    wrappedToken: '0x4200000000000000000000000000000000000006', // WETH on Base
    aggregatorBaseUrl: 'https://api.0x.org',
  },
  sonic: {
    chainId: 146,
    name: 'Sonic',
    symbol: 'S',
    rpcUrl: 'https://rpc.sonic.network',
    explorerUrl: 'https://explorer.sonic.network',
    wrappedToken: '0x0000000000000000000000000000000000000000', // Update with actual WSONIC
    aggregatorBaseUrl: 'https://api.sonic.swap',
  },
};

/**
 * 9mm DEX Contract Addresses on Pulsechain
 * From our established configuration in pulsechain-config.json
 */
export const NINMM_CONTRACTS = {
  pulsechain: {
    // V2 Contracts
    v2Factory: '0x3a0Fa7884dD93f3cd234bBE2A0958Ef04b05E13b',
    v2Router: '0xcC73b59F8D7b7c532703bDfea2808a28a488cF47',
    
    // V3 Contracts
    v3Factory: '0xe50DbDC88E87a2C92984d794bcF3D1d76f619C68',
    v3SmartRouter: '0xa9444246d80d6E3496C9242395213B4f22226a59',
    v3QuoterV2: '0x500260dD7C27eCE20b89ea0808d05a13CF867279',
    v3NonfungiblePositionManager: '0xCC05bf158202b4F461Ede8843d76dcd7Bbad07f2',
    
    // Multicall & Utils
    multicall3: '0x4c3781eaA6cCe2EA1EC0A8b3cF4d2e6a29e95b14',
    universalRouter: '0x3C5Fd0000EdDAc70d3A69f9648f7D1f9f1C4D97b',
  },
};

/**
 * Token Lists for each supported chain
 */
export const NATIVE_TOKENS: Record<SupportedChain, string> = {
  pulsechain: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // PLS
  base: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // ETH
  sonic: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // Sonic native
};

/**
 * Major stablecoins on each chain
 */
export const STABLECOINS: Record<SupportedChain, string[]> = {
  pulsechain: [
    '0xefD766CcB38EaF1dfd701853BFCe31359239F305', // DAI from Ethereum
    '0x15d38573d2feeb82e7ad5187ab8c1d52810b1f07', // USDC from Ethereum  
    '0x0Cb6F5a34ad42ec934882A05265A7d5F59b51A2f', // USDT from Ethereum
    '0x600136Da8cc6D1ea07449514604dc4Ab7098dB82', // Coast (CST)
  ],
  base: [
    '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC native
    '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA', // USDbC (bridged)
    '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', // DAI
  ],
  sonic: [
    // Update with actual Sonic stablecoin addresses
  ],
};

/**
 * Get chain configuration by chain ID
 */
export function getChainConfig(chainId: number): ChainConfig | undefined {
  return Object.values(CHAIN_CONFIGS).find(config => config.chainId === chainId);
}

/**
 * Get chain configuration by name
 */
export function getChainConfigByName(chainName: SupportedChain): ChainConfig {
  return CHAIN_CONFIGS[chainName];
}

/**
 * Check if a chain is supported
 */
export function isSupportedChain(chainId: number): boolean {
  return Object.values(CHAIN_CONFIGS).some(config => config.chainId === chainId);
}

/**
 * Get all supported chain IDs
 */
export function getSupportedChainIds(): number[] {
  return Object.values(CHAIN_CONFIGS).map(config => config.chainId);
}

/**
 * Default chain for new users
 */
export const DEFAULT_CHAIN: SupportedChain = 'pulsechain';

/**
 * Gas price multipliers for transaction speed
 */
export const GAS_PRICE_MULTIPLIERS = {
  slow: 1.0,
  standard: 1.2,
  fast: 1.5,
  instant: 2.0,
} as const;

/**
 * Default slippage tolerances
 */
export const DEFAULT_SLIPPAGE_TOLERANCES = {
  low: 0.001,     // 0.1%
  medium: 0.005,  // 0.5%
  high: 0.01,     // 1.0%
  custom: 0.03,   // 3.0% max
} as const; 