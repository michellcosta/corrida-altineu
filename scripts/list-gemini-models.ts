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
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.error('API Error:', data.error);
      return;
    }

    console.log('Available models:');
    data.models.forEach((model: any) => {
      console.log(`- ${model.name} (${model.displayName})`);
    });
  } catch (error) {
    console.error('Fetch Error:', error);
  }
}

listModels();
