/**
 * models/UrlScan.js
 *
 * MongoDB schema for storing URL analysis results.
 * Every scan is linked to a user so history stays private per account.
 */

const mongoose = require('mongoose');

const urlScanSchema = new mongoose.Schema(
  {
    /**
     * userId — Links this scan to the user who ran it.
     * Required for per-user history and dashboard statistics.
     */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    /**
     * originalUrl — Exact URL string submitted by the user.
     * Preserved for audit trail and history display.
     */
    originalUrl: {
      type: String,
      required: true,
      trim: true,
    },

    /**
     * normalizedUrl — Cleaned URL after adding protocol, lowercasing host, etc.
     * Used for consistent comparison and duplicate detection.
     */
    normalizedUrl: {
      type: String,
      required: true,
    },

    /**
     * protocol — http: or https:
     * HTTP sites lack encryption — a common phishing indicator.
     */
    protocol: {
      type: String,
      required: true,
    },

    /**
     * hostname — Domain or IP extracted from the URL (e.g. "google.com").
     * Core identifier for most security checks.
     */
    hostname: {
      type: String,
      required: true,
    },

    /**
     * domainLength — Character count of the hostname.
     * Very long domains are often used for typosquatting or hiding intent.
     */
    domainLength: {
      type: Number,
      required: true,
    },

    /**
     * isHttps — True if the URL uses HTTPS (encrypted connection).
     * Phishing sites sometimes skip HTTPS or use invalid certificates.
     */
    isHttps: {
      type: Boolean,
      required: true,
    },

    /**
     * hasIPAddress — True if hostname is an IP instead of a domain name.
     * Legitimate sites rarely use raw IPs in user-facing links.
     */
    hasIPAddress: {
      type: Boolean,
      required: true,
    },

    /**
     * subdomainCount — Number of subdomains (e.g. secure.login.bank.com = 3).
     * Excessive subdomains can mimic trusted brands.
     */
    subdomainCount: {
      type: Number,
      required: true,
    },

    /**
     * containsSuspiciousKeywords — True if URL path/query contains phishing words.
     * Attackers use words like "login", "verify", "password" to lure victims.
     */
    containsSuspiciousKeywords: {
      type: Boolean,
      required: true,
    },

    /**
     * containsSpecialCharacters — True if URL has @, %, .. or similar obfuscation.
     * The @ symbol can hide the real destination in some browsers.
     */
    containsSpecialCharacters: {
      type: Boolean,
      required: true,
    },

    /**
     * containsPunycode — True if domain uses xn-- encoding (internationalized domains).
     * Punycode can make malicious domains look like trusted brands (homograph attacks).
     */
    containsPunycode: {
      type: Boolean,
      required: true,
    },

    /**
     * isShortenedUrl — True if hostname is a known URL shortener.
     * Shorteners hide the final destination from the user.
     */
    isShortenedUrl: {
      type: Boolean,
      required: true,
    },

    /**
     * riskScore — Calculated threat score from 0 (safe) to 100 (critical).
     * Sum of weighted security check results, capped at 100.
     */
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    /**
     * riskLevel — Human-readable category: Safe, Low, Medium, High, Critical.
     * Derived from riskScore for quick UI display.
     */
    riskLevel: {
      type: String,
      required: true,
      enum: ['Safe', 'Low', 'Medium', 'High', 'Critical'],
    },

    /**
     * analysisDate — When this scan was performed.
     * Explicit field for sorting history (also have createdAt from timestamps).
     */
    analysisDate: {
      type: Date,
      default: Date.now,
    },

    /**
     * reasons — Plain-language explanations of why the URL was flagged.
     * Stored so history page can show full context without re-computing.
     */
    reasons: {
      type: [String],
      default: [],
    },

    /**
     * suggestions — Actionable advice for the user based on findings.
     */
    suggestions: {
      type: [String],
      default: [],
    },

    /**
     * matchedKeywords — Which suspicious keywords were found (for detail view).
     */
    matchedKeywords: {
      type: [String],
      default: [],
    },

    /**
     * summary — AI-generated plain-language overview of the scan findings.
     * Written by Gemini based on rule-based scanner data (not independent analysis).
     */
    summary: {
      type: String,
      default: null,
    },

    /**
     * attackType — AI-labeled threat category (e.g. "Phishing", "Credential Harvesting").
     * Derived from scanner indicators — Gemini explains, does not decide risk.
     */
    attackType: {
      type: String,
      default: null,
    },

    /**
     * aiReasons — AI-generated explanations for each scanner finding.
     * Separate from rule-based `reasons` so both reports are preserved.
     */
    aiReasons: {
      type: [String],
      default: [],
    },

    /**
     * recommendations — AI-suggested immediate actions for the user.
     */
    recommendations: {
      type: [String],
      default: [],
    },

    /**
     * securityTips — Educational cybersecurity tips from AI based on this scan.
     */
    securityTips: {
      type: [String],
      default: [],
    },

    /**
     * aiGenerated — True if Gemini successfully generated an explanation.
     * False if only rule-based analysis is available.
     */
    aiGenerated: {
      type: Boolean,
      default: false,
    },

    /**
     * aiGeneratedAt — Timestamp when the AI explanation was created.
     * Used for timeline display on the Threat Report page.
     */
    aiGeneratedAt: {
      type: Date,
      default: null,
    },

    // ─── Threat Intelligence Engine (Milestone 4) ───────────────────────────

    /**
     * virusTotal — Multi-vendor URL reputation from VirusTotal API.
     * Includes malicious/suspicious counts and which vendors flagged the URL.
     */
    virusTotal: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    /**
     * whois — Domain registration data from RDAP/WHOIS lookup.
     * Registrar, dates, country, and domain age help spot newly registered phishing domains.
     */
    whois: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    /**
     * safeBrowsing — Google Safe Browsing threat check results.
     * Flags for phishing, malware, and unwanted software.
     */
    safeBrowsing: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    /**
     * urlScan — Live page analysis from URLScan.io.
     * Final URL, page title, IP, hosting provider, and redirect chain.
     */
    urlScan: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    /**
     * confidence — How many intelligence sources responded (0–100%).
     * 100% = all 5 sources (rule + 4 APIs) contributed to the final score.
     */
    confidence: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },

    /**
     * finalRiskScore — Aggregated risk score combining all intelligence sources.
     * Different from rule-based riskScore which is scanner-only.
     */
    finalRiskScore: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },

    /**
     * finalThreatLevel — Threat level derived from finalRiskScore.
     */
    finalThreatLevel: {
      type: String,
      default: null,
    },

    /**
     * intelligenceRecommendation — Actionable advice from aggregated analysis.
     */
    intelligenceRecommendation: {
      type: [String],
      default: [],
    },

    /**
     * intelligenceGenerated — True when threat intelligence scan has been run.
     */
    intelligenceGenerated: {
      type: Boolean,
      default: false,
    },

    /**
     * intelligenceGeneratedAt — When the intelligence scan was performed.
     */
    intelligenceGeneratedAt: {
      type: Date,
      default: null,
    },

    intelligenceSourcesUsed: {
      type: [String],
      default: [],
    },

    intelligenceSourcesFailed: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('UrlScan', urlScanSchema);
