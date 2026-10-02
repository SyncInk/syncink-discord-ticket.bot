import React, { useState } from 'react';
import { ChevronDown, Search, HelpCircle, MessageSquare, Shield, CheckCircle2 } from 'lucide-react';
import Seo from '../components/Seo';
import MarketingFrame from '../components/MarketingFrame';

const SUPPORT_URL = 'https://discord.gg/rB6gNZaK9u';

const FAQS = [
  {
    category: 'setup',
    question: 'How do I set up SyncInk Ticket for the first time?',
    answer: 'Invite the bot with Administrator permissions to your Discord server. Open the web dashboard, sign in with Discord, select your server, configure your desired ticket categories, and click "Deploy Ticket Panel" in the Ticket Panels tab to post the panel to your support channel.'
  },
  {
    category: 'permissions',
    question: 'What Discord permissions does the bot require?',
    answer: 'The bot requires "Manage Channels" (to create and archive private ticket rooms), "Manage Roles / Overwrite Permissions" (to let ticket creators and support agents view the channels), "Send Messages", "Embed Links", and "Attach Files" (for transcripts and log embeds).'
  },
  {
    category: 'transcripts',
    question: 'How do transcripts work, and why might they fail to appear?',
    answer: 'Whenever a ticket is closed, SyncInk generates a complete HTML transcript with timestamps, user avatars, and attached images. Transcripts are sent to your configured Transcript Channel and uploaded to the dashboard. If they do not appear, ensure the bot has permission to send messages and embed links in your designated transcripts channel.'
  },
  {
    category: 'customization',
    question: 'Can I customize ticket categories, emojis, and roles?',
    answer: 'Yes! You can add unlimited ticket categories, choose custom Discord emojis for dropdown choices, customize embed colors, and assign specific staff roles to each category so only designated team members receive pings.'
  },
  {
    category: 'dashboard',
    question: 'Who is allowed to access and manage the web dashboard?',
    answer: 'Dashboard access is strictly governed by Discord server permissions and tier mappings. By default, the Server Owner and members with Administrator privileges can configure all settings. Staff and Moderator roles can access ticket history and activity feeds without modifying sensitive configurations.'
  },
  {
    category: 'setup',
    question: 'What happens if the bot restarts or my host goes offline?',
    answer: 'All tickets, active sessions, configuration settings, and transcripts are permanently backed up in MongoDB. When the bot restarts or re-establishes its Discord WebSocket connection, all tickets resume automatically without data loss.'
  },
  {
    category: 'customization',
    question: 'Can I customize the bot appearance and embed color?',
    answer: 'Yes. In the "Bot Profile" and "Ticket Panels" tabs, you can customize the bot nickname for your specific server, set custom hex embed colors, change the header image, and tailor the greeting message.'
  },
  {
    category: 'transcripts',
    question: 'Can community members view their closed ticket transcripts?',
    answer: 'Yes! When a ticket is closed, the bot can post a direct "View Online Transcript" link embed or DM the ticket creator with the transcript link if enabled.'
  }
];

export default function FAQ({ user }) {
  const [openIndices, setOpenIndices] = useState([0]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const dashboardPath = user ? '/' : '/login';

  const toggleIndex = (index) => {
    if (openIndices.includes(index)) {
      setOpenIndices(openIndices.filter((i) => i !== index));
    } else {
      setOpenIndices([...openIndices, index]);
    }
  };

  const expandAll = () => {
    setOpenIndices(FAQS.map((_, i) => i));
  };

  const collapseAll = () => {
    setOpenIndices([]);
  };

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCategory = categoryFilter === 'all' || faq.category === categoryFilter;
    const matchesSearch =
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
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
        eyebrow="Frequently Asked Questions"
        title="Everything you need to know"
        description="Quick, accurate answers to the questions Discord server owners, community managers, and support agents ask most."
        actions={[
          { label: 'Open Dashboard', to: dashboardPath, tone: 'primary' },
          { label: 'Support Server', href: SUPPORT_URL, external: true, tone: 'secondary' }
        ]}
      >
        {/* Search Bar */}
        <div className="mk-search-bar">
          <Search size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search questions by topic (e.g. transcripts, permissions, setup, categories)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 12 }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Filters and Expand/Collapse Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div className="mk-filter-pills" style={{ marginBottom: 0 }}>
            <button
              type="button"
              className={`mk-filter-pill ${categoryFilter === 'all' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('all')}
            >
              All Topics ({FAQS.length})
            </button>
            <button
              type="button"
              className={`mk-filter-pill ${categoryFilter === 'setup' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('setup')}
            >
              Setup & Config
            </button>
            <button
              type="button"
              className={`mk-filter-pill ${categoryFilter === 'permissions' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('permissions')}
            >
              Permissions
            </button>
            <button
              type="button"
              className={`mk-filter-pill ${categoryFilter === 'transcripts' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('transcripts')}
            >
              Transcripts
            </button>
            <button
              type="button"
              className={`mk-filter-pill ${categoryFilter === 'customization' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('customization')}
            >
              Customization
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={expandAll}
              style={{ background: 'none', border: 'none', color: 'var(--text-soft)', cursor: 'pointer', fontSize: 12 }}
            >
              Expand All
            </button>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
            <button
              type="button"
              onClick={collapseAll}
              style={{ background: 'none', border: 'none', color: 'var(--text-soft)', cursor: 'pointer', fontSize: 12 }}
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* FAQ Accordion List */}
        <section className="mk-faq-list">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openIndices.includes(index);
            return (
              <article key={faq.question} className={`mk-faq-item ${isOpen ? 'open' : ''}`}>
                <button
                  type="button"
                  className="mk-faq-question"
                  onClick={() => toggleIndex(index)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{faq.question}</span>
                  <ChevronDown
                    size={18}
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      flexShrink: 0,
                      color: isOpen ? 'var(--accent)' : 'rgba(255,255,255,0.6)'
                    }}
                  />
                </button>
                {isOpen ? (
                  <div className="mk-faq-answer" style={{ paddingTop: 0, paddingBottom: 20 }}>
                    <p style={{ fontSize: 13.5, color: 'var(--text-soft)', lineHeight: 1.7 }}>{faq.answer}</p>
                  </div>
                ) : null}
              </article>
            );
          })}
        </section>

        {filteredFaqs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <p>No questions matched your search query "{search}".</p>
            <button
              type="button"
              className="mk-action mk-action-secondary"
              onClick={() => { setSearch(''); setCategoryFilter('all'); }}
              style={{ marginTop: 12 }}
            >
              Reset Search
            </button>
          </div>
        )}

        {/* Direct Contact Callout */}
        <section className="mk-panel" style={{ marginTop: 28 }}>
          <div className="mk-panel-header">
            <div>
              <span className="mk-panel-label">Still Have Questions?</span>
              <h2>Speak Directly With the SyncInk Engineering Team</h2>
              <p>Join our Discord community where server admins share configurations, report issues, and get live assistance.</p>
            </div>
            <div className="mk-card-icon"><HelpCircle size={22} /></div>
          </div>
          <div className="mk-actions-row mk-actions-row-left" style={{ marginTop: 16 }}>
            <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" className="mk-action mk-action-primary">
              Ask in Support Server
            </a>
          </div>
        </section>
      </MarketingFrame>
    </>
  );
}
