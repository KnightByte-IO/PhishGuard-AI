/**
 * services/emailAnalysisService.js
 *
 * Rule-based phishing detection for emails.
 * We score obvious warning signs, then optionally ask Gemini to explain them.
 */

const EmailScan = require('../models/EmailScan');
const {
  EMAIL_SUSPICIOUS_KEYWORDS,
  EMAIL_URGENT_PHRASES,
} = require('../utils/emailConstants');
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

const senderLooksSuspicious = (sender) => {
  if (!sender) return false;
  const lower = sender.toLowerCase();
  return (
    lower.includes('noreply') ||
    lower.includes('support-') ||
    lower.includes('.ru') ||
    lower.includes('.xyz') ||
    lower.includes('secure-')
  );
};

const buildReasons = (data) => {
  const reasons = [];
  if (data.suspiciousKeywords.length) {
    reasons.push(`Suspicious keywords found: ${data.suspiciousKeywords.join(', ')}`);
  }
  if (data.urgentPhrases.length) {
    reasons.push(`Urgent language found: ${data.urgentPhrases.join(', ')}`);
  }
  if (data.containsSuspiciousLinks) {
    reasons.push(`Email contains ${data.extractedLinks.length} clickable link(s)`);
  }
  if (data.senderLooksSuspicious) {
    reasons.push('Sender address pattern looks suspicious');
  }
  if (!reasons.length) {
    reasons.push('No strong phishing indicators were found in this email');
  }
  return reasons;
};

const buildRecommendations = (score) => {
  if (score >= 60) {
    return [
      'Do not click links or download attachments from this email.',
      'Verify the sender through an official channel before responding.',
      'Report this email as phishing.',
    ];
  }

  return [
    'Double-check the sender and any links before taking action.',
    'Avoid sharing passwords or OTP codes by email.',
  ];
};

const analyzeEmail = async (userId, payload) => {
  const sender = (payload.sender || '').trim();
  const subject = (payload.subject || '').trim();
  const content = (payload.content || '').trim();

  if (!content) {
    const error = new Error('Email content is required');
    error.statusCode = 400;
    throw error;
  }

  const fullText = `${sender} ${subject} ${content}`;
  const suspiciousKeywords = findMatches(fullText, EMAIL_SUSPICIOUS_KEYWORDS);
  const urgentPhrases = findMatches(fullText, EMAIL_URGENT_PHRASES);
  const extractedLinks = extractLinks(content);
  const suspiciousSender = senderLooksSuspicious(sender);

  let riskScore = 0;
  if (suspiciousKeywords.length) riskScore += 15 + Math.min(20, suspiciousKeywords.length * 5);
  if (urgentPhrases.length) riskScore += 20;
  if (extractedLinks.length) riskScore += Math.min(20, extractedLinks.length * 5);
  if (suspiciousSender) riskScore += 20;
  riskScore = Math.min(riskScore, 100);

  const riskLevel = getRiskLevel(riskScore);
  const baseData = {
    userId,
    sender,
    subject,
    content,
    suspiciousKeywords,
    urgentPhrases,
    extractedLinks,
    containsSuspiciousLinks: extractedLinks.length > 0,
    hasUrgencyLanguage: urgentPhrases.length > 0,
    senderLooksSuspicious: suspiciousSender,
    riskScore,
    riskLevel,
    reasons: buildReasons({
      suspiciousKeywords,
      urgentPhrases,
      extractedLinks,
      containsSuspiciousLinks: extractedLinks.length > 0,
      senderLooksSuspicious: suspiciousSender,
    }),
    recommendations: buildRecommendations(riskScore),
  };

  try {
    const ai = await generateTextExplanation('email phishing report', {
      sender,
      subject,
      riskScore,
      riskLevel,
      suspiciousKeywords,
      urgentPhrases,
      extractedLinks,
      reasons: baseData.reasons,
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

  return EmailScan.create(baseData);
};

const getEmailHistory = (userId) =>
  EmailScan.find({ userId }).sort({ analyzedAt: -1 }).limit(30).select('-content');

module.exports = {
  analyzeEmail,
  getEmailHistory,
};
