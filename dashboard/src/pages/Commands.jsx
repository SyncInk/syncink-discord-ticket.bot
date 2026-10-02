import React, { useState } from 'react';
import { LayoutDashboard, SlidersHorizontal, Ticket, Search, Copy, Check, Terminal, Shield, UserCheck, Wrench, Sparkles } from 'lucide-react';
import Seo from '../components/Seo';
import MarketingFrame from '../components/MarketingFrame';

const INVITE_URL = 'https://discord.com/oauth2/authorize?client_id=1513075101992747158&permissions=361046068240&integration_type=0&scope=bot+applications.commands';
const SUPPORT_URL = 'https://discord.gg/rB6gNZaK9u';

const ALL_COMMANDS = [
  {
    name: '/ticket-panel',
    category: 'setup',
    badge: 'Admin Only',
    permission: 'Administrator',
    syntax: '/ticket-panel [channel]',
    usage: 'Deploy your customized support ticket panel directly into the current or selected Discord channel.',
    description: 'Renders the live interactive dropdown ticket panel with configured categories, colors, and button handlers.'
  },
  {
    name: '/ticket-config category',
    category: 'setup',
    badge: 'Admin Only',
    permission: 'Administrator',
    syntax: '/ticket-config category [target_channel]',
    usage: 'Specify the Discord parent category where newly generated ticket channels should be spawned.',
    description: 'Sets or updates the designated category parent for organization and permission synchronization.'
  },
  {
    name: '/ticket-config role',
    category: 'setup',
    badge: 'Admin Only',
    permission: 'Administrator',
    syntax: '/ticket-config role [action: add|remove] [role: @Role]',
    usage: 'Add or remove staff support roles that are granted access to view and reply to opened tickets.',
    description: 'Updates your server role whitelist so support personnel can immediately manage incoming requests.'
  },
  {
    name: '/ticket-logs',
    category: 'setup',
    badge: 'Admin Only',
    permission: 'Administrator',
    syntax: '/ticket-logs channel [channel: #channel]',
    usage: 'Set the dedicated archive channel where closed ticket transcript links and summaries are posted.',
    description: 'Routes all closed ticket event embeds and downloadable transcript records to a private audit channel.'
  },
  {
    name: '/ticket-add',
    category: 'management',
    badge: 'Staff',
    permission: 'Support Staff',
    syntax: '/ticket-add [user: @User]',
    usage: 'Invite another server member or specialist into the current active ticket channel.',
    description: 'Adjusts ticket channel permissions to grant the specified user read and send message access.'
  },
  {
    name: '/ticket-remove',
    category: 'management',
    badge: 'Staff',
    permission: 'Support Staff',
    syntax: '/ticket-remove [user: @User]',
    usage: 'Remove an invited user from the current ticket when their assistance is no longer required.',
    description: 'Revokes channel overrides for the target user without affecting original ticket creators.'
  },
  {
    name: '/ticket-rename',
    category: 'management',
    badge: 'Staff',
    permission: 'Support Staff',
    syntax: '/ticket-rename [new_name: string]',
    usage: 'Rename the current ticket channel for better organization or issue categorization.',
    description: 'Updates the Discord channel name while keeping database ticket IDs and transcript history linked.'
  },
  {
    name: '/ticket-claim',
    category: 'management',
    badge: 'Staff',
    permission: 'Support Staff',
    syntax: '/ticket-claim',
    usage: 'Claim ownership of the active ticket so other agents know who is handling the user request.',
    description: 'Notifies the channel and assigns your user profile as the designated primary support responder.'
  },
  {
    name: '/ticket-close',
    category: 'management',
    badge: 'Staff / Creator',
    permission: 'Staff & Creator',
    syntax: '/ticket-close [reason: optional]',
    usage: 'Initiate ticket closure, generate the online transcript, and archive the conversation history.',
    description: 'Posts confirmation modal, generates transcript URL, logs event to database, and deletes channel.'
  }
];

export default function Commands({ user }) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [copiedCmd, setCopiedCmd] = useState(null);
  const dashboardPath = user ? '/' : '/login';

  const handleCopy = (commandName) => {
    navigator.clipboard?.writeText(commandName);
    setCopiedCmd(commandName);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const filteredCommands = ALL_COMMANDS.filter((cmd) => {
    const matchesCategory = categoryFilter === 'all' || cmd.category === categoryFilter;
    const matchesSearch =
      cmd.name.toLowerCase().includes(search.toLowerCase()) ||
      cmd.usage.toLowerCase().includes(search.toLowerCase()) ||
      cmd.description.toLowerCase().includes(search.toLowerCase()) ||
      cmd.syntax.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <Seo
        title="Commands | SyncInk Ticket Bot"
        description="View the main SyncInk Ticket slash commands for setup, ticket management, and staff workflows."
        path="/commands"
        keywords="SyncInk Ticket commands, Discord ticket bot commands, slash commands"
      />
      <MarketingFrame
        active="commands"
        user={user}
        eyebrow="Command Reference"
        title="Intuitive slash commands for Discord and web"
        description="SyncInk Ticket provides an organized set of Discord slash commands designed for quick keyboard actions and effortless ticket handling."
        actions={[
          { label: 'Invite Bot', href: INVITE_URL, external: true, tone: 'primary' },
          { label: 'Open Dashboard', to: dashboardPath, tone: 'secondary' },
          { label: 'Support Server', href: SUPPORT_URL, external: true, tone: 'secondary' }
        ]}
      >
        {/* Search Bar */}
        <div className="mk-search-bar">
          <Search size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search commands by name, syntax, or keywords (e.g. /ticket-panel, role, add, rename)..."
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

        {/* Filter Pills */}
        <div className="mk-filter-pills">
          <button
            type="button"
            className={`mk-filter-pill ${categoryFilter === 'all' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('all')}
          >
            All Commands ({ALL_COMMANDS.length})
          </button>
          <button
            type="button"
            className={`mk-filter-pill ${categoryFilter === 'setup' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('setup')}
          >
            <Wrench size={13} style={{ marginRight: 6 }} /> Server Setup ({ALL_COMMANDS.filter(c => c.category === 'setup').length})
          </button>
          <button
            type="button"
            className={`mk-filter-pill ${categoryFilter === 'management' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('management')}
          >
            <UserCheck size={13} style={{ marginRight: 6 }} /> Ticket Management ({ALL_COMMANDS.filter(c => c.category === 'management').length})
          </button>
        </div>

        {/* Commands Grid */}
        <section className="mk-command-grid">
          {filteredCommands.map((command) => (
            <article key={command.name} className="mk-command-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="mk-command-top">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Terminal size={18} style={{ color: 'var(--accent)' }} />
                  <span className="mk-command-name" style={{ fontFamily: 'monospace', fontSize: 16 }}>{command.name}</span>
                </div>
                <button
                  type="button"
                  className={`mk-copy-btn ${copiedCmd === command.name ? 'copied' : ''}`}
                  onClick={() => handleCopy(command.name)}
                  title="Copy command to clipboard"
                >
                  {copiedCmd === command.name ? (
                    <>
                      <Check size={13} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Syntax Box */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 10,
                padding: '8px 12px',
                fontFamily: 'monospace',
                fontSize: 12,
                color: '#c4b5fd',
                marginBottom: 12,
                overflowX: 'auto',
                whiteSpace: 'nowrap'
              }}>
                {command.syntax}
              </div>

              <p className="mk-command-usage" style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.85)', marginBottom: 6, fontWeight: 500 }}>
                {command.usage}
              </p>
              <p className="mk-command-copy" style={{ fontSize: 12, color: 'var(--text-muted)', flexGrow: 1, lineHeight: 1.5 }}>
                {command.description}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 10, borderTop: '1px solid rgba(255, 255, 255, 0.05)', fontSize: 11, color: 'var(--text-muted)' }}>
                <span>Required: <strong style={{ color: '#fff' }}>{command.permission}</strong></span>
                <span className="mk-command-badge" style={{ fontSize: 10, padding: '2px 8px' }}>{command.badge}</span>
              </div>
            </article>
          ))}
        </section>

        {filteredCommands.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <p>No commands matched your search query "{search}".</p>
            <button
              type="button"
              className="mk-action mk-action-secondary"
              onClick={() => { setSearch(''); setCategoryFilter('all'); }}
              style={{ marginTop: 12 }}
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Quick Tips Grid */}
        <section className="mk-grid mk-grid-3" style={{ marginTop: 28 }}>
          <article className="mk-card">
            <div className="mk-card-icon"><Ticket size={22} /></div>
            <h3 style={{ fontSize: 16 }}>Discord Autocomplete</h3>
            <p style={{ fontSize: 13 }}>All slash commands feature rich autocomplete choices for categories, roles, and text channels to eliminate syntax mistakes.</p>
          </article>
          <article className="mk-card">
            <div className="mk-card-icon"><SlidersHorizontal size={22} /></div>
            <h3 style={{ fontSize: 16 }}>Instant Web Sync</h3>
            <p style={{ fontSize: 13 }}>Any changes made via Discord slash commands are instantly synchronized live to your SyncInk web dashboard in real time.</p>
          </article>
          <article className="mk-card">
            <div className="mk-card-icon"><LayoutDashboard size={22} /></div>
            <h3 style={{ fontSize: 16 }}>Visual Dashboard Mode</h3>
            <p style={{ fontSize: 13 }}>Prefer visual forms? You can configure ticket embeds, categories, and permissions entirely through the web interface.</p>
          </article>
        </section>
      </MarketingFrame>
    </>
  );
}
