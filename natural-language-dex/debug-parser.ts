import { parseCommand } from './src/utils/parser.js';

// Test balance parsing
const testInputs = [
    "what is my balance",
    "my balance", 
    "show my balance",
    "check my balance",
    "what's my balance"
];

console.log('🧪 Testing balance intent detection:\n');

for (const input of testInputs) {
    const result = parseCommand(input);
    console.log(`Input: "${input}"`);
    console.log(`Intent: ${result.intent} (confidence: ${result.confidence})`);
    console.log('---');
}

console.log('\n🧪 Testing wallet intent detection:\n');

const walletInputs = [
    "create a wallet",
    "create wallet", 
    "make me a wallet"
];

for (const input of walletInputs) {
    const result = parseCommand(input);
    console.log(`Input: "${input}"`);
    console.log(`Intent: ${result.intent} (confidence: ${result.confidence})`);
    console.log('---');
} 