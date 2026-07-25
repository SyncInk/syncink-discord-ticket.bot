import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/Common';
import { ChevronDown, HelpCircle } from 'lucide-react';
import Seo from '../components/Seo';

const FAQS = [
  {
    question: 'How do I setup the bot for the first time?',
    answerText: "Go to your dashboard, open the Ticket Panels page, configure your categories, and deploy the interactive ticket panel to your Discord server.",
    answer: <>Go to your dashboard, navigate to the <code>Ticket Panels</code> page, configure your categories, and click <code>Deploy Panel</code> to send the interactive ticket menu to your Discord server.</>
  },
  {
    question: 'What permissions does the bot actually need?',
    answerText: 'The bot only asks for the access it needs to open tickets, help staff manage them, and save conversations properly.',
    answer: <>The bot does not need full control of your server. It only asks for the access required to open tickets, help staff manage them, and save conversations properly.</>
  },
  {
    question: "Why aren't my ticket transcripts generating?",
    answerText: 'Make sure the bot can fully access your ticket channels and that you have chosen the correct log channel in the dashboard.',
    answer: <>Make sure the bot can fully access your ticket channels, and verify that you have selected the correct log channel in the dashboard settings.</>
  },
  {
    question: 'How are transcripts generated and stored?',
    answerText: 'When a ticket closes, the bot saves the conversation and sends it to your chosen log channel so your team can review it later.',
    answer: <>When a ticket is closed, the bot saves the conversation and sends it to your chosen log channel so your team can review it later whenever needed.</>
  },
  {
    question: 'Can I customize the ticket categories?',
    answerText: 'Yes. You can rename categories, add emojis, edit descriptions, and assign staff roles for each category from the dashboard.',
    answer: <>Yes. Navigate to the <code>Ticket Categories</code> tab on your dashboard. You can add custom emojis, titles, descriptions, and assign specific staff roles to each category to route users to the right team.</>
  },
  {
    question: 'How do I add staff members?',
    answerText: 'Assign staff roles from Dashboard Access and Ticket Categories. Those roles will be able to handle new tickets automatically.',
    answer: <>You can assign staff roles directly from the dashboard under <code>Dashboard Access</code> and <code>Ticket Categories</code>. Anyone with those roles will automatically be able to handle new tickets.</>
  }
];

export default function FAQ() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);

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

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="dashboard-shell" style={{ display: 'block', height: '100vh', overflowY: 'auto' }}>
      <Seo
        title="FAQ | SyncInk Ticket Bot"
        description="Read answers about SyncInk Ticket setup, access, transcripts, staff roles, and dashboard controls."
        path="/faq"
        keywords="SyncInk Ticket FAQ, Discord ticket bot help, transcript setup, dashboard access"
        schema={faqSchema}
      />
      <main className="main-shell" style={{ margin: '0 auto', maxWidth: '900px', padding: '40px 20px' }}>
        <div className="content-shell page-stack">
          <button type="button" className="action-button tone-secondary" onClick={() => navigate(-1)} style={{ width: 'fit-content' }}>
            Go Back
          </button>

          <PageHeader
            title="Frequently Asked Questions"
            description="Find answers to common questions about using SyncInk Ticket."
            icon={HelpCircle}
          />

          <div className="faq-list">
            {FAQS.map((faq, index) => (
              <div key={faq.question} className="faq-item">
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => toggleAccordion(index)}
                >
                  {faq.question}
                  <ChevronDown
                    size={20}
                    style={{
                      transition: 'transform 0.3s',
                      transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0)'
                    }}
                  />
                </button>
                {openIndex === index && (
                  <div className="faq-answer">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}


