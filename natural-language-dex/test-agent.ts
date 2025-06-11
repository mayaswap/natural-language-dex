import { parseCommand } from "./src/utils/parser.js";
import { NineMMAggregator } from "./src/utils/aggregator.js";
import { POPULAR_TOKENS } from "./src/config/chains.js";

/**
 * Phase 4 Demo: ElizaOS Integration Prototype
 * This demonstrates our natural language parser integrated with real DEX trading
 */
async function testAgent() {
    console.log("🚀 Phase 4: ElizaOS Integration Demo");
    console.log("=====================================\n");

    const testCommands = [
        "Swap 1 WPLS for USDC",
        "What's the price of HEX?",
        "Trade 100 USDC for PLS", 
        "Convert 0.5 WETH to USDT",
        "Price of PLSX"
    ];

    for (const command of testCommands) {
        console.log(`💬 User: "${command}"`);
        
        // Parse natural language command
        const parsed = parseCommand(command);
        console.log(`🧠 Parsed: ${parsed.intent} (${(parsed.confidence * 100).toFixed(1)}% confidence)`);
        
        if (parsed.confidence < 0.6) {
            console.log("🤖 Agent: I'm not sure what you want to do. Can you rephrase?");
            console.log();
            continue;
        }

        try {
            const aggregator = new NineMMAggregator(369); // Pulsechain
            
            if (parsed.intent === 'swap' && parsed.fromToken && parsed.toToken && parsed.amount) {
                // Handle swap command
                const pulsechainTokens = POPULAR_TOKENS.pulsechain;
                const fromTokenAddress = pulsechainTokens[parsed.fromToken as keyof typeof pulsechainTokens];
                const toTokenAddress = pulsechainTokens[parsed.toToken as keyof typeof pulsechainTokens];

                if (!fromTokenAddress || !toTokenAddress) {
                    console.log(`🤖 Agent: I don't recognize one of those tokens: ${parsed.fromToken} or ${parsed.toToken}`);
                    console.log();
                    continue;
                }

                const quote = await aggregator.getSwapQuote({
                    fromToken: fromTokenAddress,
                    toToken: toTokenAddress,
                    amount: parsed.amount.toString(),
                    slippagePercentage: 0.5,
                    userAddress: "0x0000000000000000000000000000000000000000",
                    chainId: 369
                });

                const priceImpact = quote.estimatedPriceImpact ? `${parseFloat(quote.estimatedPriceImpact)}%` : 'N/A';
                const gasEstimate = quote.gas ? `~${Math.round(parseInt(quote.gas) / 1000)}K` : 'N/A';
                
                console.log(`🤖 Agent: Perfect! I found the best route for your swap:
                
🔄 **Swap Quote Ready**
**Trade:** ${parsed.amount} ${parsed.fromToken} → ${parsed.toToken}
**You'll receive:** ~${parseFloat(quote.buyAmount).toFixed(6)} ${parsed.toToken}
**Price Impact:** ${priceImpact}
**Gas Estimate:** ${gasEstimate} gas units
**Price:** ${parseFloat(quote.price).toFixed(8)} ${parsed.toToken} per ${parsed.fromToken}

*This quote is sourced from 9mm aggregator across 20+ DEX pools*`);

            } else if (parsed.intent === 'price' && parsed.fromToken) {
                // Handle price command
                const pulsechainTokens = POPULAR_TOKENS.pulsechain;
                const tokenAddress = pulsechainTokens[parsed.fromToken as keyof typeof pulsechainTokens];
                const baseTokenAddress = pulsechainTokens.USDC;

                if (!tokenAddress) {
                    console.log(`🤖 Agent: I don't recognize that token: ${parsed.fromToken}`);
                    console.log();
                    continue;
                }

                const price = await aggregator.getPrice(tokenAddress, baseTokenAddress, "1000000000000000000");
                
                const tokenPrice = parseFloat(price.price);
                const formattedPrice = tokenPrice < 0.01 ? 
                    tokenPrice.toExponential(4) : 
                    tokenPrice.toFixed(tokenPrice < 1 ? 6 : 2);

                console.log(`🤖 Agent: Here's the current ${parsed.fromToken} price:

📊 **${parsed.fromToken} Price**
**Current Price:** $${formattedPrice} USDC
**Buy Amount:** ${parseFloat(price.buyAmount).toFixed(6)} USDC
${price.estimatedPriceImpact ? `**Price Impact:** ${parseFloat(price.estimatedPriceImpact)}%` : ''}

*Price sourced from 9mm aggregator across multiple DEX pools*`);
            }

        } catch (error) {
            console.log(`🤖 Agent: ❌ Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        console.log("\n" + "=".repeat(60) + "\n");
    }
}

// Live agent simulation
async function liveAgentDemo() {
    const readline = require('readline');
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '🔄 DEX Agent> '
    });

    console.log("\n🤖 Live DEX Trading Agent (Phase 4 Demo)");
    console.log("Try natural language commands like:");
    console.log("  • Swap 100 USDC for WPLS");
    console.log("  • What's the price of HEX?");
    console.log("  • Trade 50 PLS for USDT");
    console.log("  • Type 'demo' for automated test or 'exit' to quit\n");

    rl.prompt();

    rl.on('line', async (input: string) => {
        const command = input.trim();
        
        if (command.toLowerCase() === 'exit') {
            console.log("👋 Goodbye!");
            rl.close();
            return;
        }

        if (command.toLowerCase() === 'demo') {
            console.log("Running automated demo...\n");
            await testAgent();
            rl.prompt();
            return;
        }

        if (!command) {
            rl.prompt();
            return;
        }

        // Process the command (same logic as testAgent but for single command)
        const parsed = parseCommand(command);
        
        if (parsed.confidence < 0.6) {
            console.log("🤖 I'm not sure what you want to do. Can you rephrase?");
            rl.prompt();
            return;
        }

        try {
            const aggregator = new NineMMAggregator(369);
            
            if (parsed.intent === 'swap' && parsed.fromToken && parsed.toToken && parsed.amount) {
                const pulsechainTokens = POPULAR_TOKENS.pulsechain;
                const fromTokenAddress = pulsechainTokens[parsed.fromToken as keyof typeof pulsechainTokens];
                const toTokenAddress = pulsechainTokens[parsed.toToken as keyof typeof pulsechainTokens];

                if (!fromTokenAddress || !toTokenAddress) {
                    console.log(`🤖 I don't recognize one of those tokens: ${parsed.fromToken} or ${parsed.toToken}`);
                    rl.prompt();
                    return;
                }

                console.log("🔄 Getting swap quote...");
                const quote = await aggregator.getSwapQuote({
                    fromToken: fromTokenAddress,
                    toToken: toTokenAddress,
                    amount: parsed.amount.toString(),
                    slippagePercentage: 0.5,
                    userAddress: "0x0000000000000000000000000000000000000000",
                    chainId: 369
                });

                console.log(`🤖 ${parsed.amount} ${parsed.fromToken} → ~${parseFloat(quote.buyAmount).toFixed(6)} ${parsed.toToken}`);
                console.log(`💰 Price: ${parseFloat(quote.price).toFixed(8)} ${parsed.toToken} per ${parsed.fromToken}`);
                
            } else if (parsed.intent === 'price' && parsed.fromToken) {
                const pulsechainTokens = POPULAR_TOKENS.pulsechain;
                const tokenAddress = pulsechainTokens[parsed.fromToken as keyof typeof pulsechainTokens];
                const baseTokenAddress = pulsechainTokens.USDC;

                if (!tokenAddress) {
                    console.log(`🤖 I don't recognize that token: ${parsed.fromToken}`);
                    rl.prompt();
                    return;
                }

                console.log("📊 Fetching price...");
                const price = await aggregator.getPrice(tokenAddress, baseTokenAddress, "1000000000000000000");
                
                const tokenPrice = parseFloat(price.price);
                const formattedPrice = tokenPrice < 0.01 ? tokenPrice.toExponential(4) : tokenPrice.toFixed(6);
                console.log(`🤖 ${parsed.fromToken} price: $${formattedPrice} USDC`);
            }

        } catch (error) {
            console.log(`🤖 ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        console.log();
        rl.prompt();
    });

    rl.on('close', () => {
        process.exit(0);
    });
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.includes('--live')) {
    liveAgentDemo();
} else {
    testAgent();
} 