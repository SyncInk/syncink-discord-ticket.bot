import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Seo from '../components/Seo';
import MarketingFrame from '../components/MarketingFrame';

const SUPPORT_URL = 'https://discord.gg/rB6gNZaK9u';

const FAQS = [
  {
    question: 'How do I set up the bot for the first time?',
    answerText: 'Open the dashboard, configure your categories, and deploy the ticket panel to your chosen Discord channel.',
    answer: 'Open the dashboard, configure your categories, and deploy the ticket panel to your chosen Discord channel.'
  },
  {
    question: 'What permissions does the bot need?',
    answerText: 'The bot only needs the access required to open tickets, help staff manage them, and save conversations correctly.',
    answer: 'The bot only needs the access required to open tickets, help staff manage them, and save conversations correctly.'
  },
  {
    question: 'Why are my transcripts not appearing?',
    answerText: 'Double-check that the bot can access ticket channels and that the transcript destination has been selected correctly.',
    answer: 'Double-check that the bot can access ticket channels and that the transcript destination has been selected correctly.'
  },
  {
    question: 'Can I customize ticket categories and staff routing?',
    answerText: 'Yes. You can rename categories, change descriptions, add emojis, and assign support roles directly from the dashboard.',
    answer: 'Yes. You can rename categories, change descriptions, add emojis, and assign support roles directly from the dashboard.'
  },
  {
    question: 'Who can access the dashboard?',
    answerText: 'Only the server owner and members with administrator access are allowed into the dashboard.',
    answer: 'Only the server owner and members with administrator access are allowed into the dashboard.'
  },
  {
    question: 'Can I manage panel appearance without affecting ticket behavior?',
    answerText: 'Yes. The dashboard focuses on appearance, routing, and safe configuration while keeping the underlying support flow intact.',
    answer: 'Yes. The dashboard focuses on appearance, routing, and safe configuration while keeping the underlying support flow intact.'
  }
];

export default function FAQ({ user }) {
  const [openIndex, setOpenIndex] = useState(0);
  const dashboardPath = user ? '/' : '/login';

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answerText
      }
    }))
  };

  return (
    <>
      <Seo
        title="FAQ | SyncInk Ticket Bot"
        description="Read answers about SyncInk Ticket setup, access, transcripts, staff roles, and dashboard controls."
        path="/faq"
        keywords="SyncInk Ticket FAQ, Discord ticket bot help, transcript setup, dashboard access"
        schema={faqSchema}
      />

      <MarketingFrame
        active="faq"
        user={user}
        eyebrow="FAQ"
        title="Quick answers to the questions teams ask most"
        description="If you want the short version before you jump into setup, this page covers the things server owners and staff usually want to know first."
        actions={[
          { label: 'Open Dashboard', to: dashboardPath, tone: 'primary' },
          { label: 'Support Server', href: SUPPORT_URL, external: true, tone: 'secondary' }
        ]}
      >
        <section className="mk-faq-list">
          {FAQS.map((faq, index) => (
            <article key={faq.question} className={`mk-faq-item ${openIndex === index ? 'open' : ''}`}>
              <button
                type="button"
                className="mk-faq-question"
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
              >
                <span>{faq.question}</span>
                <ChevronDown size={18} />
              </button>
              {openIndex === index ? (
                <div className="mk-faq-answer">
                  <p>{faq.answer}</p>
                </div>
              ) : null}
            </article>
          ))}
        </section>
      </MarketingFrame>
    </>
  );
}
