import { parseCommand } from "./utils/parser.js";
import swapAction from "./actions/swap.js";
import priceAction from "./actions/price.js";
import walletAction from "./actions/wallet.js";
import balanceAction from "./actions/balance.js";
import addLiquidityAction from "./actions/addLiquidity.js";
import queryPoolsAction from "./actions/queryPools.js";
import removeLiquidityAction from "./actions/removeLiquidity.js";
import portfolioAction from "./actions/portfolio.js";
import gasPriceAction from "./actions/gasPrice.js";
import transactionHistoryAction from "./actions/transactionHistory.js";
import multiChainAction from "./actions/multiChain.js";
import slippageManagementAction from "./actions/slippageManagement.js";
import defiAnalyticsAction from "./actions/defiAnalytics.js";
import tokenAllowanceAction from "./actions/tokenAllowance.js";
import positionTrackingAction from "./actions/positionTracking.js";
import advancedOrdersAction from "./actions/advancedOrders.js";
import startMonitoringAction from "./actions/startMonitoring.js";
import walletManagementAction from "./actions/walletManagement.js";
import { WalletStorage } from "./utils/wallet-storage.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple agent interface for testing our actions
interface SimpleAgent {
    actions: Array<{
        name: string;
        validate: (message: any) => Promise<boolean>;
        handler: (message: any, callback?: (response: any) => void) => Promise<void>;
    }>;
    character: {
        name: string;
    };
}

async function createAgent(): Promise<SimpleAgent> {
    try {
        // Load character name
        const characterPath = path.join(__dirname, "../characters/dex-trader.character.json");
        let characterName = "DEX Trader";

        if (fs.existsSync(characterPath)) {
            const characterData = JSON.parse(fs.readFileSync(characterPath, "utf8"));
            characterName = characterData.name || "DEX Trader";
            console.log("✅ Loaded DEX Trader character");
        } else {
            console.log("⚠️  Character file not found, using default");
        }

        // Initialize wallet storage
        const walletStorage = WalletStorage.getInstance();
        const storageInfo = walletStorage.getStorageInfo();
        console.log(`💾 Wallet storage: ${storageInfo.walletCount} wallets at ${storageInfo.location}`);
        
        // Create shared runtime that persists across all actions
        // Pre-populate with wallets from persistent storage
        const sharedRuntime = {
            userWallets: walletStorage.getAllWallets() || {},
            // Add other shared state as needed
        } as any;

                 // Create simple agent with our actions
         const agent: SimpleAgent = {
             actions: [
                 {
                     name: swapAction.name,
                     validate: async (message) => await swapAction.validate(sharedRuntime, message),
                     handler: async (message, callback) => {
                         await swapAction.handler(sharedRuntime, message, undefined, {}, callback);
                     }
                 },
                 {
                     name: priceAction.name,
                     validate: async (message) => await priceAction.validate(sharedRuntime, message),
                     handler: async (message, callback) => {
                         await priceAction.handler(sharedRuntime, message, undefined, {}, callback);
                     }
                 },
                 {
                     name: walletAction.name,
                     validate: async (message) => await walletAction.validate(sharedRuntime, message),
                     handler: async (message, callback) => {
                         await walletAction.handler(sharedRuntime, message, undefined, {}, callback);
                     }
                 },
                 {
                     name: balanceAction.name,
                     validate: async (message) => await balanceAction.validate(sharedRuntime, message),
                     handler: async (message, callback) => {
                         await balanceAction.handler(sharedRuntime, message, undefined, {}, callback);
                     }
                 },
                 {
                     name: addLiquidityAction.name,
                     validate: async (message) => await addLiquidityAction.validate(sharedRuntime, message),
                     handler: async (message, callback) => {
                         await addLiquidityAction.handler(sharedRuntime, message, undefined, {}, callback);
                     }
                 },
                 {
                     name: queryPoolsAction.name,
                     validate: async (message) => await queryPoolsAction.validate(sharedRuntime, message),
                     handler: async (message, callback) => {
                         await queryPoolsAction.handler(sharedRuntime, message, undefined, {}, callback);
                     }
                 },
                 {
                     name: removeLiquidityAction.name,
                     validate: async (message) => await removeLiquidityAction.validate(sharedRuntime, message),
                     handler: async (message, callback) => {
                         await removeLiquidityAction.handler(sharedRuntime, message, undefined, {}, callback);
                     }
                 },
                 {
                     name: portfolioAction.name,
                     validate: async (message) => await portfolioAction.validate(sharedRuntime, message),
                     handler: async (message, callback) => {
                         await portfolioAction.handler(sharedRuntime, message, undefined, {}, callback);
                     }
                 },
                 {
                     name: gasPriceAction.name,
                     validate: async (message) => await gasPriceAction.validate(sharedRuntime, message),
                     handler: async (message, callback) => {
                         await gasPriceAction.handler(sharedRuntime, message, undefined, {}, callback);
                     }
                 },
                 {
                     name: transactionHistoryAction.name,
                     validate: async (message) => await transactionHistoryAction.validate(sharedRuntime, message),
                     handler: async (message, callback) => {
                         await transactionHistoryAction.handler(sharedRuntime, message, undefined, {}, callback);
                     }
                 },
                 {
                     name: multiChainAction.name,
                     validate: async (message) => await multiChainAction.validate(sharedRuntime, message),
                     handler: async (message, callback) => {
                         await multiChainAction.handler(sharedRuntime, message, undefined, {}, callback);
                     }
                 },
                                   {
                      name: slippageManagementAction.name,
                      validate: async (message) => await slippageManagementAction.validate(sharedRuntime, message),
                      handler: async (message, callback) => {
                          await slippageManagementAction.handler(sharedRuntime, message, undefined, {}, callback);
                      }
                  },
                  {
                                      name: defiAnalyticsAction.name,
                validate: async (message) => await defiAnalyticsAction.validate(sharedRuntime, message),
                handler: async (message, callback) => {
                    await defiAnalyticsAction.handler(sharedRuntime, message, undefined, {}, callback);
                }
            },
            {
                name: tokenAllowanceAction.name,
                validate: async (message) => await tokenAllowanceAction.validate(sharedRuntime, message),
                handler: async (message, callback) => {
                    await tokenAllowanceAction.handler(sharedRuntime, message, undefined, {}, callback);
                }
            },
            {
                name: positionTrackingAction.name,
                validate: async (message) => await positionTrackingAction.validate(sharedRuntime, message),
                handler: async (message, callback) => {
                    await positionTrackingAction.handler(sharedRuntime, message, undefined, {}, callback);
                }
            },
            {
                name: advancedOrdersAction.name,
                validate: async (message) => await advancedOrdersAction.validate(sharedRuntime, message),
                handler: async (message, callback) => {
                    await advancedOrdersAction.handler(sharedRuntime, message, undefined, {}, callback);
                }
            },
            {
                name: startMonitoringAction.name,
                validate: async (message) => await startMonitoringAction.validate(sharedRuntime, message),
                handler: async (message, callback) => {
                    await startMonitoringAction.handler(sharedRuntime, message, undefined, {}, callback);
                }
            },
            {
                name: walletManagementAction.name,
                validate: async (message) => await walletManagementAction.validate(sharedRuntime, message),
                handler: async (message, callback) => {
                    await walletManagementAction.handler(sharedRuntime, message, undefined, {}, callback);
                }
            }
             ],
             character: {
                 name: characterName
             }
         };

        console.log("🚀 DEX Trading Agent initialized successfully!");
        return agent;

    } catch (error) {
        console.error("❌ Failed to create agent:", error);
        throw error;
    }
}

// Interactive CLI for testing
async function startInteractiveCLI(agent: SimpleAgent) {
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '🔄 DEX> '
    });

    console.log("\n🚀 DEX Trading Agent Ready!");
    console.log("Try commands like:");
    console.log("  • Swap 100 USDC for WPLS");
    console.log("  • Show market analytics");
    console.log("  • What's the gas price?");
    console.log("  • Switch to Base network");
    console.log("  • Set slippage to 0.5%");
    console.log("  • Type 'exit' to quit\n");

    rl.prompt();

    rl.on('line', async (input: string) => {
        const message = input.trim();
        
        if (message.toLowerCase() === 'exit') {
            console.log("👋 Goodbye!");
            rl.close();
            return;
        }

        if (!message) {
            rl.prompt();
            return;
        }

        try {
            // Simulate a user message
            const userMessage = {
                userId: "user1",
                content: { text: message },
                roomId: "test-room",
                id: Math.random().toString(36),
                createdAt: Date.now(),
                agentId: "dex-trader"
            };

            // Check which action should handle this
            let handled = false;
            for (const action of agent.actions) {
                if (await action.validate(userMessage)) {
                    console.log(`\n🤖 ${agent.character.name}:`);
                    
                    await action.handler(userMessage, (response) => {
                        console.log(response.text);
                    });
                    handled = true;
                    break;
                }
            }

            if (!handled) {
                console.log(`\n🤖 ${agent.character.name}: I can help you with comprehensive DeFi operations including swaps, liquidity management, gas monitoring, multi-chain support, and trade settings. Try asking about any trading or DeFi operation!`);
            }

        } catch (error) {
            console.error("❌ Error:", error instanceof Error ? error.message : 'Unknown error');
        }

        console.log(); // Add spacing
        rl.prompt();
    });

    rl.on('close', () => {
        process.exit(0);
    });
}

// Main execution
async function main() {
    try {
        const agent = await createAgent();
        await startInteractiveCLI(agent);
    } catch (error) {
        console.error("❌ Failed to start agent:", error);
        process.exit(1);
    }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error("Uncaught exception:", error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error("Unhandled rejection at:", promise, "reason:", reason);
    process.exit(1);
});

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { createAgent }; 