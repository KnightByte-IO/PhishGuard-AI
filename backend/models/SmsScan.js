/**
 * models/SmsScan.js
 *
 * Stores SMS / smishing analysis results for each user.
 */

const mongoose = require('mongoose');

const smsScanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    senderNumber: {
      type: String,
      default: '',
      trim: true,
    },
    message: {
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
    containsShortenedLinks: {
      type: Boolean,
      required: true,
    },
    hasUrgencyLanguage: {
      type: Boolean,
      required: true,
    },
    requestsSensitiveInfo: {
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

module.exports = mongoose.model('SmsScan', smsScanSchema);
