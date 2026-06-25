/**
 * services/screenshotAnalysisService.js
 *
 * Handles screenshot-based phishing analysis.
 * The frontend sends the image as a base64 data URL so we do not need
 * an extra upload dependency for the first version.
 */

const ScreenshotScan = require('../models/ScreenshotScan');
const { analyzeScreenshot } = require('./geminiContentService');

const dataUrlPattern = /^data:(image\/(png|jpeg|jpg|webp));base64,(.+)$/i;

const validateImageInput = (imageData) => {
  const match = imageData.match(dataUrlPattern);

  if (!match) {
    const error = new Error('Please upload a valid PNG, JPG, JPEG, or WEBP image');
    error.statusCode = 400;
    throw error;
  }

  return {
    mimeType: match[1],
    base64Data: match[3],
  };
};

const analyzeUserScreenshot = async (userId, payload) => {
  const fileName = (payload.fileName || 'screenshot').trim();
  const imageData = (payload.imageData || '').trim();

  if (!imageData) {
    const error = new Error('Screenshot image is required');
    error.statusCode = 400;
    throw error;
  }

  const { mimeType, base64Data } = validateImageInput(imageData);

  let aiGenerated = false;
  let ai = {
    visualIndicators: [],
    riskScore: 10,
    riskLevel: 'Low',
    reasons: ['Image uploaded successfully, but AI visual explanation is unavailable.'],
    recommendations: ['Try again later after confirming the Gemini API key is active.'],
    summary: 'AI screenshot explanation is currently unavailable.',
    attackType: 'Unknown',
    securityTips: ['Always verify a website address directly in your browser before logging in.'],
  };

  try {
    ai = await analyzeScreenshot({ mimeType, base64Data, fileName });
    aiGenerated = true;
  } catch {
    aiGenerated = false;
  }

  return ScreenshotScan.create({
    userId,
    fileName,
    mimeType,
    imageData,
    visualIndicators: ai.visualIndicators || [],
    riskScore: Number(ai.riskScore) || 0,
    riskLevel: ai.riskLevel || 'Safe',
    reasons: ai.reasons || [],
    recommendations: ai.recommendations || [],
    summary: ai.summary || null,
    attackType: ai.attackType || null,
    securityTips: ai.securityTips || [],
    aiGenerated,
  });
};

const getScreenshotHistory = (userId) =>
  ScreenshotScan.find({ userId }).sort({ analyzedAt: -1 }).limit(20).select('-imageData');

module.exports = {
  analyzeUserScreenshot,
  getScreenshotHistory,
};
