import { parseCommand } from './src/utils/parser.js';

// Simulate what happens when the agent validates actions
async function testAgentValidation() {
    console.log('🤖 Simulating Agent Action Validation\n');
    
    const userInput = "create wallet";
    console.log(`User input: "${userInput}"\n`);
    
    // Simulate what each action does during validation
    const actions = ['swap', 'price', 'wallet', 'balance'];
    
    for (const action of actions) {
        console.log(`${action} action validating...`);
        const start = Date.now();
        const result = await parseCommand(userInput);
        const time = Date.now() - start;
        console.log(`  → Intent: ${result.intent}, Confidence: ${result.confidence}, Time: ${time}ms`);
    }
    
    console.log('\n✅ All validations complete - only first one should take time, rest are cached!');
    
    // Now test a typo command to see the difference
    console.log('\n🔄 Testing with typo...\n');
    
    const typoInput = "craete walet";
    console.log(`User input: "${typoInput}"\n`);
    
    const start = Date.now();
    const result = await parseCommand(typoInput);
    const time = Date.now() - start;
    console.log(`Result: Intent: ${result.intent}, Confidence: ${result.confidence}, Time: ${time}ms`);
    console.log('\n📝 Note: With a valid API key, this typo would be understood as "create wallet"!');
}

testAgentValidation().catch(console.error); 