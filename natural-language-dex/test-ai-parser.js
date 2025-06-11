import { parseCommand } from './src/utils/parser.js';

// Test cases with typos and variations
const testCases = [
    // Perfect commands (should use AI)
    'create wallet',
    'swap 100 usdc for pls',
    'what is my balance',
    
    // Commands with typos (AI should handle)
    'craete a walet for me',
    'make me a walet please',
    'swap 100 usdc for pulsechain',
    'whats my ballance',
    'chek my balance',
    'i need to make new wallet',
    'exhange 50 pls for hex',
    
    // Natural variations (AI should understand)
    'i want to trade some tokens',
    'help me create a new wallet please',
    'can you check how much money i have',
    'price check on hexagon token',
    'show me ethereum price',
];

async function testAIParser() {
    console.log('🤖 Testing AI-Enhanced Natural Language Parser\n');
    
    for (const [i, command] of testCases.entries()) {
        console.log(`${i + 1}. Testing: "${command}"`);
        
        try {
            const result = await parseCommand(command);
            console.log(`   → Intent: ${result.intent} (${(result.confidence * 100).toFixed(0)}% confidence)`);
            if (result.fromToken) console.log(`   → From: ${result.fromToken}`);
            if (result.toToken) console.log(`   → To: ${result.toToken}`);
            if (result.amount) console.log(`   → Amount: ${result.amount}`);
            console.log();
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}\n`);
        }
    }
}

testAIParser().catch(console.error); 