import React from 'react';
import { LayoutDashboard, SlidersHorizontal, Ticket } from 'lucide-react';
import Seo from '../components/Seo';
import MarketingFrame from '../components/MarketingFrame';

const INVITE_URL = 'https://discord.com/oauth2/authorize?client_id=1513075101992747158&permissions=361046068240&integration_type=0&scope=bot+applications.commands';
const SUPPORT_URL = 'https://discord.gg/rB6gNZaK9u';

const commandGroups = [
  {
    title: 'Setup commands',
    copy: 'Quick commands for getting the ticket system placed and organized in your server.',
    commands: [
      {
        name: '/ticket-panel',
        badge: 'Setup',
        usage: 'Use this in the channel where you want the ticket panel to appear.',
        description: 'Sends the ticket creation panel to the current channel.'
      },
      {
        name: '/ticket-config category',
        badge: 'Setup',
        usage: 'Choose where new tickets should open.',
        description: 'Sets the category used for newly created tickets.'
      },
      {
        name: '/ticket-config role',
        badge: 'Setup',
        usage: 'Adjust role access for different ticket flows.',
        description: 'Adds or removes ticket access roles for your team and support structure.'
      },
      {
        name: '/ticket-logs',
        badge: 'Setup',
        usage: 'Pick the channel for closed ticket records.',
        description: 'Chooses where closed ticket transcripts and records are sent.'
      }
    ]
  },
  {
    title: 'Ticket management commands',
    copy: 'Handy tools for staff members working directly inside active tickets.',
    commands: [
      {
        name: '/ticket-add',
        badge: 'Staff',
        usage: 'Add another member into the current ticket when needed.',
        description: 'Adds a selected user to the current ticket conversation.'
      },
      {
        name: '/ticket-remove',
        badge: 'Staff',
        usage: 'Remove a member from the current ticket.',
        description: 'Removes a selected user from the current ticket conversation.'
      },
      {
        name: '/ticket-rename',
        badge: 'Staff',
        usage: 'Rename the current ticket for better clarity.',
        description: 'Changes the current ticket channel name.'
      }
    ]
  }
];

export default function Commands({ user }) {
  const dashboardPath = user ? '/' : '/login';

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
        eyebrow="Commands"
        title="The main commands your team will actually use"
        description="SyncInk Ticket keeps the command set clean and practical, with straightforward tools for setup and everyday ticket handling."
        actions={[
          { label: 'Invite Bot', href: INVITE_URL, external: true, tone: 'primary' },
          { label: 'Open Dashboard', to: dashboardPath, tone: 'secondary' },
          { label: 'Support Server', href: SUPPORT_URL, external: true, tone: 'secondary' }
        ]}
      >
        <section className="mk-meta-grid">
          <div className="mk-meta-item">
            <strong>Simple setup</strong>
            <span>Use a small set of setup commands to place the panel, choose ticket locations, and route records where they belong.</span>
          </div>
          <div className="mk-meta-item">
            <strong>Staff actions</strong>
            <span>Handle common ticket tasks directly inside the ticket without cluttering your workflow.</span>
          </div>
          <div className="mk-meta-item">
            <strong>Dashboard-first flow</strong>
            <span>Most visual settings can also be managed from the dashboard, so your team can choose what feels easiest.</span>
          </div>
        </section>

        {commandGroups.map((group) => (
          <section key={group.title} className="mk-panel">
            <div className="mk-panel-header">
              <div>
                <span className="mk-panel-label">{group.title}</span>
                <h2>{group.title}</h2>
                <p>{group.copy}</p>
              </div>
            </div>
            <div className="mk-command-grid">
              {group.commands.map((command) => (
                <article key={command.name} className="mk-command-card">
                  <div className="mk-command-top">
                    <div className="mk-command-name">{command.name}</div>
                    <span className="mk-command-badge">{command.badge}</span>
                  </div>
                  <p className="mk-command-usage">{command.usage}</p>
                  <p className="mk-command-copy">{command.description}</p>
                </article>
              ))}
            </div>
          </section>
        ))}

        <section className="mk-grid mk-grid-3">
          <article className="mk-card">
            <div className="mk-card-icon"><Ticket size={22} /></div>
            <h3>Channel actions</h3>
            <p>Ticket tools are focused on helping staff act quickly inside the right conversation without extra clutter.</p>
          </article>
          <article className="mk-card">
            <div className="mk-card-icon"><SlidersHorizontal size={22} /></div>
            <h3>Setup flow</h3>
            <p>Get your panel, ticket location, and records channel configured with a clean setup flow that is easy to understand.</p>
          </article>
          <article className="mk-card">
            <div className="mk-card-icon"><LayoutDashboard size={22} /></div>
            <h3>Dashboard pairing</h3>
            <p>Use commands when you are inside Discord and use the dashboard when you want a more visual editing experience.</p>
          </article>
        </section>
      </MarketingFrame>
    </>
  );
}
