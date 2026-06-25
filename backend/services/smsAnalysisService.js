/**
 * services/smsAnalysisService.js
 *
 * Rule-based smishing detection for text messages.
 */

const SmsScan = require('../models/SmsScan');
const { URL_SHORTENERS } = require('../utils/urlConstants');
const {
  SMS_SUSPICIOUS_KEYWORDS,
  SMS_URGENT_PHRASES,
} = require('../utils/smsConstants');
const { generateTextExplanation } = require('./geminiContentService');

const getRiskLevel = (score) => {
  if (score <= 19) return 'Safe';
  if (score <= 39) return 'Low';
  if (score <= 59) return 'Medium';
  if (score <= 79) return 'High';
  return 'Critical';
};

const extractLinks = (text) => text.match(/https?:\/\/[^\s)]+/gi) || [];
const findMatches = (text, list) => {
  const lower = text.toLowerCase();
  return list.filter((item) => lower.includes(item));
};

const hasShortenedLinks = (links) =>
  links.some((link) => URL_SHORTENERS.some((host) => link.toLowerCase().includes(host)));

const requestsSensitiveInfo = (text) => {
  const lower = text.toLowerCase();
  return (
    lower.includes('otp') ||
    lower.includes('password') ||
    lower.includes('pin') ||
    lower.includes('card details') ||
    lower.includes('account verification')
  );
};

const analyzeSms = async (userId, payload) => {
  const senderNumber = (payload.senderNumber || '').trim();
  const message = (payload.message || '').trim();

  if (!message) {
    const error = new Error('SMS message is required');
    error.statusCode = 400;
    throw error;
  }

  const suspiciousKeywords = findMatches(message, SMS_SUSPICIOUS_KEYWORDS);
  const urgentPhrases = findMatches(message, SMS_URGENT_PHRASES);
  const extractedLinks = extractLinks(message);
  const shortened = hasShortenedLinks(extractedLinks);
  const sensitiveRequest = requestsSensitiveInfo(message);

  let riskScore = 0;
  if (suspiciousKeywords.length) riskScore += 15 + Math.min(20, suspiciousKeywords.length * 5);
  if (urgentPhrases.length) riskScore += 15;
  if (shortened) riskScore += 20;
  if (sensitiveRequest) riskScore += 25;
  if (extractedLinks.length) riskScore += 10;
  riskScore = Math.min(riskScore, 100);

  const riskLevel = getRiskLevel(riskScore);
  const reasons = [];
  if (suspiciousKeywords.length) reasons.push(`Suspicious keywords found: ${suspiciousKeywords.join(', ')}`);
  if (urgentPhrases.length) reasons.push(`Urgent phrases found: ${urgentPhrases.join(', ')}`);
  if (shortened) reasons.push('Message contains a shortened link');
  if (sensitiveRequest) reasons.push('Message asks for sensitive information');
  if (!reasons.length) reasons.push('No strong smishing indicators were found');

  const baseData = {
    userId,
    senderNumber,
    message,
    suspiciousKeywords,
    urgentPhrases,
    extractedLinks,
    containsShortenedLinks: shortened,
    hasUrgencyLanguage: urgentPhrases.length > 0,
    requestsSensitiveInfo: sensitiveRequest,
    riskScore,
    riskLevel,
    reasons,
    recommendations:
      riskScore >= 60
        ? [
            'Do not tap the link in this message.',
            'Do not reply with OTPs, passwords, or banking details.',
            'Block the sender and report the message as spam or fraud.',
          ]
        : ['Verify unexpected messages through an official app or website.'],
  };

  try {
    const ai = await generateTextExplanation('sms smishing report', {
      senderNumber,
      riskScore,
      riskLevel,
      suspiciousKeywords,
      urgentPhrases,
      extractedLinks,
      reasons,
    });
    baseData.summary = ai.summary || null;
    baseData.attackType = ai.attackType || null;
    baseData.securityTips = ai.securityTips || [];
    baseData.recommendations = ai.recommendations?.length
      ? ai.recommendations
      : baseData.recommendations;
    baseData.aiGenerated = true;
  } catch {
    baseData.aiGenerated = false;
    baseData.summary = 'AI explanation unavailable.';
  }

  return SmsScan.create(baseData);
};

const getSmsHistory = (userId) =>
  SmsScan.find({ userId }).sort({ analyzedAt: -1 }).limit(30).select('-message');

module.exports = {
  analyzeSms,
  getSmsHistory,
};
