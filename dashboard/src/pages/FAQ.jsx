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
    answerText: 'The bot does not require Administrator. It only needs the permissions required for ticket creation, staff access, threads, messages, and transcript visibility.',
    answer: <>The bot does NOT require the <code>Administrator</code> permission. For maximum security, it only requests the specific permissions it needs to operate: <code>Manage Channels</code>, <code>Manage Roles</code>, <code>Create Private Threads</code>, <code>Send Messages</code>, <code>Send Messages in Threads</code>, <code>Read Message History</code>, and <code>View Channels</code>.</>
  },
  {
    question: "Why aren't my ticket transcripts generating?",
    answerText: 'Make sure the bot can read message history and view ticket channels, then verify that a valid transcript or log destination is configured in the dashboard.',
    answer: <>Ensure the bot has the <code>Read Message History</code> and <code>View Channels</code> permissions in your ticket categories, and verify that you have configured a valid log channel in the dashboard settings.</>
  },
  {
    question: 'How are transcripts generated and stored?',
    answerText: 'When a ticket closes, the bot compiles the conversation into an HTML transcript and sends it to the configured Discord log channel for permanent review.',
    answer: <>When a ticket is closed, the bot automatically compiles all messages, attachments, and metadata into a permanent HTML file. This file is sent directly to your designated Discord log channel, ensuring you always have a secure backup of the conversation.</>
  },
  {
    question: 'Can I customize the ticket categories?',
    answerText: 'Yes. You can rename categories, add emojis, edit descriptions, and assign staff roles for each category from the dashboard.',
    answer: <>Yes. Navigate to the <code>Ticket Categories</code> tab on your dashboard. You can add custom emojis, titles, descriptions, and assign specific staff roles to each category to route users to the right team.</>
  },
  {
    question: 'How do I add staff members?',
    answerText: 'Assign staff roles from Dashboard Access and Ticket Categories. Those roles will be granted ticket access automatically in new tickets.',
    answer: <>You can assign staff roles directly from the dashboard under <code>Dashboard Access</code> and <code>Ticket Categories</code>. Anyone with those roles will automatically be granted <code>View Channel</code> and <code>Send Messages</code> access in new tickets.</>
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
        description="Read answers about SyncInk Ticket setup, permissions, transcripts, staff roles, and Discord dashboard access."
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
