/**
 * models/EmailScan.js
 *
 * Stores email phishing analysis results for each user.
 * Separate model keeps email history independent from URL scans.
 */

const mongoose = require('mongoose');

const emailScanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sender: {
      type: String,
      default: '',
      trim: true,
    },
    subject: {
      type: String,
      default: '',
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    suspiciousKeywords: {
      type: [String],
      default: [],
    },
    urgentPhrases: {
      type: [String],
      default: [],
    },
    extractedLinks: {
      type: [String],
      default: [],
    },
    containsSuspiciousLinks: {
      type: Boolean,
      required: true,
    },
    hasUrgencyLanguage: {
      type: Boolean,
      required: true,
    },
    senderLooksSuspicious: {
      type: Boolean,
      required: true,
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    riskLevel: {
      type: String,
      required: true,
      enum: ['Safe', 'Low', 'Medium', 'High', 'Critical'],
    },
    reasons: {
      type: [String],
      default: [],
    },
    recommendations: {
      type: [String],
      default: [],
    },
    summary: {
      type: String,
      default: null,
    },
    attackType: {
      type: String,
      default: null,
    },
    securityTips: {
      type: [String],
      default: [],
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    analyzedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EmailScan', emailScanSchema);
