
const apiKeys = {
  groq: process.env.GROQ_API_KEY,
  together: process.env.TOGETHER_AI_API_KEY,
  huggingface: process.env.HUGGINGFACE_API_KEY,
  deepseek: process.env.DEEPSEEK_API_KEY,
  cerebras: process.env.CEREBRAS_API_KEY,
  bing: process.env.BING_SEARCH_API_KEY,
  brave: process.env.BRAVE_SEARCH_API_KEY,
  gemini: process.env.GEMINI_API_KEY,
};

export type ApiProvider = keyof typeof apiKeys;

export function getApiKey(provider: ApiProvider): string | undefined {
  return apiKeys[provider];
}
