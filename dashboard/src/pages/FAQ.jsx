import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    <div className="transcript-page" style={{ padding: '40px', color: '#dcddde', background: '#36393f', minHeight: '100vh', boxSizing: 'border-box' }}>
      <div className="transcript-header">
        <button className="back-link" onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#00aff4', cursor: 'pointer', padding: 0, fontSize: '14px' }}>
          ← Back
        </button>
        <h1 style={{ marginTop: '20px' }}>Frequently Asked Questions</h1>
        <p>Find answers to common questions about using our bot.</p>
      </div>

      <div style={{ maxWidth: '800px' }}>
        {FAQS.map((faq, index) => (
          <div key={index} style={{ background: '#2f3136', marginBottom: '16px', borderRadius: '8px', overflow: 'hidden' }}>
            <button
              onClick={() => toggleAccordion(index)}
              style={{
                width: '100%',
                padding: '20px',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                textAlign: 'left',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              {faq.question}
              <span style={{ fontSize: '20px', transition: 'transform 0.3s', transform: openIndex === index ? 'rotate(45deg)' : 'rotate(0)' }}>
                +
              </span>
            </button>
            {openIndex === index && (
              <div style={{ padding: '0 20px 20px 20px', color: '#dcddde', lineHeight: '1.6' }}>
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
