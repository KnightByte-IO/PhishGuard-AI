/**
 * utils/geminiConfig.js
 *
 * Shared Gemini API key validation and client setup.
 * Keys must come from Google AI Studio (https://aistudio.google.com/apikey).
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_MODELS = [
  process.env.GEMINI_MODEL,
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
].filter(Boolean);

const isGeminiConfigured = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  return Boolean(apiKey && apiKey.startsWith('AIza'));
};

const getGeminiApiKey = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const error = new Error('GEMINI_API_KEY is not configured in backend/.env');
    error.code = 'GEMINI_CONFIG';
    throw error;
  }

  if (!apiKey.startsWith('AIza')) {
    const error = new Error(
      'GEMINI_API_KEY must start with AIza — get a free key at https://aistudio.google.com/apikey'
    );
    error.code = 'GEMINI_CONFIG';
    throw error;
  }

  return apiKey;
};

const getGeminiModel = (modelName, options = {}) => {
  const genAI = new GoogleGenerativeAI(getGeminiApiKey());
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.3,
      responseMimeType: 'application/json',
      ...options.generationConfig,
    },
    ...options,
  });
};

const getGeminiErrorMessage = (error) => {
  if (error.code === 'GEMINI_CONFIG') {
    return error.message;
  }

  if (
    error.message?.includes('401') ||
    error.message?.includes('403') ||
    error.message?.includes('ACCESS_TOKEN_TYPE_UNSUPPORTED') ||
    error.message?.includes('API key not valid')
  ) {
    return 'Invalid Gemini API key. Create one at https://aistudio.google.com/apikey and set GEMINI_API_KEY in backend/.env';
  }

  if (error.message?.includes('404') && error.message?.includes('models')) {
    return 'Gemini model not available — check GEMINI_MODEL in backend/.env';
  }

  return 'AI explanation unavailable.';
};

module.exports = {
  GEMINI_MODELS,
  isGeminiConfigured,
  getGeminiApiKey,
  getGeminiModel,
  getGeminiErrorMessage,
};
