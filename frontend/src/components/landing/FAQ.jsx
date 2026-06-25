/**
 * components/landing/FAQ.jsx
 *
 * Frequently asked questions section.
 */

import { useState } from 'react';

const faqs = [
  {
    question: 'What is phishing?',
    answer: 'Phishing is a cyberattack where attackers impersonate trusted entities to steal credentials, money, or personal data through fake emails, websites, or messages.',
  },
  {
    question: 'How does PhishGuard AI detect threats?',
    answer: 'We use Google Gemini AI to analyze content patterns, domain characteristics, language cues, and visual indicators — then explain the findings in plain language.',
  },
  {
    question: 'Is my data stored securely?',
    answer: 'Yes. Your account credentials are hashed with bcrypt. Scan content handling will follow strict security practices in upcoming milestones.',
  },
  {
    question: 'What can I analyze?',
    answer: 'URLs, emails, SMS/text messages, and website screenshots. Each analyzer will be available in future milestones.',
  },
  {
    question: 'Is PhishGuard AI free to use?',
    answer: 'A free tier with limited daily scans will be available. Pro and Enterprise plans are planned for advanced features.',
  },
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" className="py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="card">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="text-white font-medium">{faq.question}</span>
                <span className="text-cyber-accent text-xl ml-4">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              {openIndex === index && (
                <p className="text-cyber-muted text-sm mt-4 leading-relaxed">
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQ;
