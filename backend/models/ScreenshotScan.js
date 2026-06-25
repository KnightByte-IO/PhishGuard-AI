/**
 * models/ScreenshotScan.js
 *
 * Stores screenshot-based phishing analysis results.
 * We keep both the uploaded image metadata and the AI explanation.
 */

const mongoose = require('mongoose');

const screenshotScanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    imageData: {
      type: String,
      required: true,
    },
    visualIndicators: {
      type: [String],
      default: [],
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

module.exports = mongoose.model('ScreenshotScan', screenshotScanSchema);
