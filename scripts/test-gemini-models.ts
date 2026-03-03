import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY not found in .env.local');
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // The SDK doesn't have a direct listModels, we need to use fetch or a different approach
    // but we can try to initialize a model and see if it fails with a specific error
    console.log('Testing models...');
    const models = ['gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-2.0-flash-exp', 'gemini-1.0-pro'];
    
    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('test');
        console.log(`✅ Model ${modelName} is working.`);
        break;
      } catch (e: any) {
        console.log(`❌ Model ${modelName} failed: ${e.message}`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

listModels();
