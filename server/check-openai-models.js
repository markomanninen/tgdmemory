// check-openai-models.js - Check available OpenAI models and their capabilities
require('dotenv').config();
const OpenAI = require('openai');

async function checkAvailableModels() {
  try {
    console.log('Checking available OpenAI models...');
    
    if (!process.env.OPENAI_API_KEY) {
      console.error('Error: OPENAI_API_KEY is not set in .env file');
      process.exit(1);
    }
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    console.log('Fetching available models...');
    const models = await openai.models.list();
    
    // Filter for GPT models
    const gptModels = models.data.filter(model => 
      model.id.startsWith('gpt') && !model.id.includes('ft-')
    );
    
    // Sort models by id
    gptModels.sort((a, b) => a.id.localeCompare(b.id));
    
    console.log('\nAvailable GPT models:');
    console.log('-------------------');
    gptModels.forEach(model => {
      console.log(`- ${model.id}`);
    });
    
    // List of models to check
    const modelsToCheck = [
      'gpt-4.1-nano',
      'gpt-4.1-preview',
      'gpt-4.0-turbo',
      'gpt-4o',
      'gpt-4-turbo',
      'gpt-4',
      'gpt-3.5-turbo'
    ];
    
    console.log('\nChecking for recommended models:');
    console.log('------------------------------');
    
    for (const modelName of modelsToCheck) {
      const found = gptModels.some(model => model.id === modelName || model.id.startsWith(modelName));
      console.log(`${found ? '✅' : '❌'} ${modelName}`);
    }
    
    // Now test a basic completion with gpt-4.1-nano
    console.log('\nTesting GPT-4.1-nano model (if available)...');
    try {
      const testModel = 'gpt-4.1-nano';
      if (gptModels.some(model => model.id === testModel || model.id.startsWith(testModel))) {
        const completion = await openai.chat.completions.create({
          model: testModel,
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: "Say hello" }
          ],
          max_tokens: 10
        });
        
        console.log(`✅ Test successful: ${testModel}`);
        console.log(`Response: "${completion.choices[0].message.content}"`);
      } else {
        console.log(`❌ Cannot test: ${testModel} is not available`);
      }
    } catch (error) {
      console.log('❌ Test failed for gpt-4.1-nano');
      console.log(`   Error: ${error.message}`);
    }
    
    console.log('\nModel availability check complete.');
    console.log('\nRecommended model for equation explanations: gpt-4.1-nano');
    console.log('Add to your .env file:');
    console.log('OPENAI_MODEL=gpt-4.1-nano');
    
  } catch (error) {
    console.error('Error checking models:', error);
    console.error('Details:', error.message);
  }
}

checkAvailableModels();
