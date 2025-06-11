import { parseCommand } from './src/utils/parser.js';

async function testCaching() {
    console.log('🧪 Testing AI Parser Caching System\n');
    
    const testInput = "hi there";
    
    console.log('First call (should attempt AI, then cache result):');
    const start1 = Date.now();
    const result1 = await parseCommand(testInput);
    const time1 = Date.now() - start1;
    console.log(`Result: ${result1.intent} (${result1.confidence}) - Time: ${time1}ms\n`);
    
    console.log('Second call (should use cache):');
    const start2 = Date.now();
    const result2 = await parseCommand(testInput);
    const time2 = Date.now() - start2;
    console.log(`Result: ${result2.intent} (${result2.confidence}) - Time: ${time2}ms\n`);
    
    console.log('Third call (should use cache):');
    const start3 = Date.now();
    const result3 = await parseCommand(testInput);
    const time3 = Date.now() - start3;
    console.log(`Result: ${result3.intent} (${result3.confidence}) - Time: ${time3}ms\n`);
    
    console.log('Summary:');
    console.log(`First call: ${time1}ms (with AI attempt)`);
    console.log(`Second call: ${time2}ms (cached)`);
    console.log(`Third call: ${time3}ms (cached)`);
    console.log(`Cache effectiveness: ${time2 < time1 && time3 < time1 ? '✅' : '❌'}`);
}

testCaching().catch(console.error); 