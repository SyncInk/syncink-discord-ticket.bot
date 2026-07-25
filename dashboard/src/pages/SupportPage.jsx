import React from 'react';
import { BookOpen, LifeBuoy, ShieldCheck } from 'lucide-react';
import Seo from '../components/Seo';
import MarketingFrame from '../components/MarketingFrame';

const SUPPORT_URL = 'https://discord.gg/rB6gNZaK9u';
const INVITE_URL = 'https://discord.com/oauth2/authorize?client_id=1513075101992747158&permissions=361046068240&integration_type=0&scope=bot+applications.commands';

export default function SupportPage() {
  return (
    <>
      <Seo
        title="Support | SyncInk Ticket Bot"
        description="Join the official SyncInk Ticket support server for help with setup, ticket panels, categories, and dashboard questions."
        path="/support"
        keywords="SyncInk Ticket support, Discord support server, ticket bot help"
      />
      <MarketingFrame
        active="support"
        eyebrow="Support"
        title="Need help? Join the official support server"
        description="If you need setup help, want advice on your ticket flow, or just want quick answers, the support server is the fastest place to reach us."
        actions={[
          { label: 'Join Support Server', href: SUPPORT_URL, external: true, tone: 'primary' },
          { label: 'Invite Bot', href: INVITE_URL, external: true, tone: 'secondary' },
          { label: 'Open Dashboard', to: '/login', tone: 'secondary' }
        ]}
      >
        <section className="mk-grid mk-grid-3">
          <article className="mk-card">
            <div className="mk-card-icon"><LifeBuoy size={22} /></div>
            <h3>Fast help</h3>
            <p>Reach out when you need help with setup, category layout, transcripts, or general dashboard questions.</p>
          </article>
          <article className="mk-card">
            <div className="mk-card-icon"><BookOpen size={22} /></div>
            <h3>Guided setup</h3>
            <p>Get pointed in the right direction if you are still deciding how to structure your support categories and panel flow.</p>
          </article>
          <article className="mk-card">
            <div className="mk-card-icon"><ShieldCheck size={22} /></div>
            <h3>Official updates</h3>
            <p>Stay close to the official project space for announcements, improvements, and new dashboard additions.</p>
          </article>
        </section>

        <section className="mk-panel">
          <div className="mk-panel-header">
            <div>
              <span className="mk-panel-label">What to ask about</span>
              <h2>Common reasons people join the support server</h2>
              <p>The support server is a good place for both quick questions and deeper setup help.</p>
            </div>
          </div>
          <div className="mk-pill-grid">
            <span className="mk-pill">Panel setup help</span>
            <span className="mk-pill">Category ideas</span>
            <span className="mk-pill">Transcript questions</span>
            <span className="mk-pill">Staff access guidance</span>
            <span className="mk-pill">Dashboard navigation</span>
            <span className="mk-pill">General troubleshooting</span>
          </div>
        </section>
      </MarketingFrame>
    </>
  );
}
