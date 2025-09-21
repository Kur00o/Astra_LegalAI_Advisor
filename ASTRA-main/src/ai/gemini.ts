import { GenAI } from '@google/generative-ai';
import { configure, defineFlow } from '@genkit-ai/core';
import { googleAI } from '@genkit-ai/googleai';
import { getApiKey } from './config';

configure({
  plugins: [
    googleAI(),
  ],
  logLevel: 'debug',
  enableTracing: true,
});

export const conversationalAssistant = defineFlow(
  {
    name: 'conversationalAssistant',
    inputSchema: { type: 'string' },
    outputSchema: { type: 'string' },
  },
  async (prompt) => {
    const geminiApiKey = getApiKey('gemini');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables.');
    }
    const genAI = new GenAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
);
