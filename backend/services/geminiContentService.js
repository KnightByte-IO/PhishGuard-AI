/**
 * services/geminiContentService.js
 *
 * Shared Gemini helpers for non-URL content:
 * - explain email findings
 * - explain SMS findings
 * - inspect screenshots for phishing cues
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

const getModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.3,
      responseMimeType: 'application/json',
    },
  });
};

const parseJson = (text) => {
  let cleaned = text.trim();

  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  return JSON.parse(cleaned);
};

const generateTextExplanation = async (type, facts) => {
  const model = getModel();
  const prompt = `You are a cybersecurity educator.

Explain this ${type} analysis in beginner-friendly JSON only.
Do not change the given risk score or risk level.

Facts:
${JSON.stringify(facts, null, 2)}

Return only JSON:
{
  "summary": "",
  "attackType": "",
  "securityTips": [],
  "recommendations": []
}`;

  const result = await model.generateContent(prompt);
  return parseJson(result.response.text());
};

const analyzeScreenshot = async ({ mimeType, base64Data, fileName }) => {
  const model = getModel();

  const prompt = `You are a cybersecurity analyst.

Inspect this screenshot for phishing indicators such as:
- fake login pages
- brand impersonation
- urgent warning banners
- suspicious forms asking for passwords or OTPs
- payment or account takeover prompts

Return only JSON:
{
  "summary": "",
  "attackType": "",
  "visualIndicators": [],
  "reasons": [],
  "recommendations": [],
  "securityTips": [],
  "riskScore": 0,
  "riskLevel": "Safe"
}

Important:
- riskScore must be a number from 0 to 100
- riskLevel must be one of Safe, Low, Medium, High, Critical
- do not include markdown`;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    },
    `File name: ${fileName}`,
  ]);

  return parseJson(result.response.text());
};

module.exports = {
  generateTextExplanation,
  analyzeScreenshot,
};
