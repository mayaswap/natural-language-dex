import { parseCommand } from "./utils/parser.js";
import swapAction from "./actions/swap.js";
import priceAction from "./actions/price.js";
import walletAction from "./actions/wallet.js";
import balanceAction from "./actions/balance.js";
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

        // Create shared runtime that persists across all actions
        const sharedRuntime = {
            userWallets: {} as Record<string, any>,
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
    console.log("  • What's the price of HEX?");
    console.log("  • Trade 50 PLS for USDT");
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
                console.log(`\n🤖 ${agent.character.name}: I can help you with token swaps and price checks. Try asking about swapping tokens or checking prices!`);
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