import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, SectionCard } from '../components/Common';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    question: "How do I setup the bot for the first time?",
    answer: "Go to your Dashboard, navigate to the 'Ticket Panels' page, configure your categories, and click 'Deploy Panel' to send the interactive ticket menu to your Discord server."
  },
  {
    question: "Why aren't my ticket transcripts generating?",
    answer: "Ensure the bot has the 'Read Message History' and 'View Channels' permissions in the ticket categories, and that you have configured a valid Log Channel in the Dashboard."
  },
  {
    question: "Can I customize the ticket categories?",
    answer: "Yes! Navigate to the 'Ticket Categories' tab on your dashboard. You can add custom emojis, titles, descriptions, and assign specific staff roles to each category."
  },
  {
    question: "How do I add staff members?",
    answer: "You can assign staff roles directly from the Dashboard under 'Dashboard Access' and 'Ticket Categories'. Anyone with those roles will be able to claim and manage tickets."
  },
  {
    question: "Is the bot free to use?",
    answer: "Yes, the core ticketing functionality and web dashboard are completely free to use."
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
