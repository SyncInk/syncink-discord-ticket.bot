import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, SectionCard } from '../components/Common';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    question: "How do I setup the bot for the first time?",
    answer: <>Go to your Dashboard, navigate to the 'Ticket Panels' page, configure your categories, and click 'Deploy Panel' to send the interactive ticket menu to your Discord server.</>
  },
  {
    question: "What permissions does the bot actually need?",
    answer: <>The bot does NOT require the <code>Administrator</code> permission. For maximum security, it only requests the specific permissions it needs to operate: <code>Manage Channels</code> (to create/close tickets), <code>Create Private Threads</code>, <code>Send Messages</code>, <code>Send Messages in Threads</code>, <code>Read Message History</code>, and <code>View Channels</code>.</>
  },
  {
    question: "Why aren't my ticket transcripts generating?",
    answer: <>Ensure the bot has the <code>Read Message History</code> and <code>View Channels</code> permissions in your ticket categories, and verify that you have configured a valid Log Channel in the Dashboard settings.</>
  },
  {
    question: "How are transcripts generated and stored?",
    answer: <>When a ticket is closed, the bot automatically compiles all messages, attachments, and metadata into a permanent HTML file. This file is sent directly to your designated Discord Log Channel, ensuring you always have a secure backup of the conversation.</>
  },
  {
    question: "Can I customize the ticket categories?",
    answer: <>Yes! Navigate to the 'Ticket Categories' tab on your dashboard. You can add custom emojis, titles, descriptions, and assign specific staff roles to each category to route users to the right team.</>
  },
  {
    question: "How do I add staff members?",
    answer: <>You can assign staff roles directly from the Dashboard under 'Dashboard Access' and 'Ticket Categories'. Anyone with those roles will automatically be granted <code>View Channel</code> and <code>Send Messages</code> access in new tickets.</>
  }
];

export default function FAQ() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="dashboard-shell" style={{ display: 'block', height: '100vh', overflowY: 'auto' }}>
      <main className="main-shell" style={{ margin: '0 auto', maxWidth: '900px', padding: '40px 20px' }}>
        <div className="content-shell page-stack">
          <button type="button" className="action-button tone-secondary" onClick={() => navigate(-1)} style={{ width: 'fit-content' }}>
            ← Go Back
          </button>
          
          <PageHeader 
            title="Frequently Asked Questions" 
            description="Find answers to common questions about using our bot." 
            icon={HelpCircle}
          />

          <div className="faq-list">
            {FAQS.map((faq, index) => (
              <div key={index} className="faq-item">
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => toggleAccordion(index)}
                >
                  {faq.question}
                  <ChevronDown size={20} style={{ 
                    transition: 'transform 0.3s', 
                    transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0)' 
                  }} />
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
