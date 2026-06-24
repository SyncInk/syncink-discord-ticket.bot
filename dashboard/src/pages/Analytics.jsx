import React from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { PageHeader, SectionCard } from '../components/Common';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);

export default function Analytics() {
  const { snapshot } = useOutletContext();

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Live Metrics"
        title="Ticket analytics"
        description="Simple charts based on the same live ticket records and activity history used throughout the dashboard."
      />

      <div className="split-grid">
        <SectionCard title="Last 7 days" description="Ticket volume trend for this guild.">
          <div className="chart-tall">
            <Line
              data={{
                labels: snapshot.analytics.dailyTickets.map((entry) => entry.date.slice(5)),
                datasets: [{
                  label: 'Tickets created',
                  data: snapshot.analytics.dailyTickets.map((entry) => entry.count),
                  borderColor: '#9d7cff',
                  backgroundColor: 'rgba(157, 124, 255, 0.18)',
                  tension: 0.38,
                  fill: true
                }]
              }}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </SectionCard>

        <SectionCard title="Status split" description="Open versus closed tickets.">
          <div className="chart-tall">
            <Doughnut
              data={{
                labels: snapshot.analytics.statusBreakdown.map((entry) => entry.label),
                datasets: [{
                  data: snapshot.analytics.statusBreakdown.map((entry) => entry.value),
                  backgroundColor: ['#8bffb0', '#8d95a7']
                }]
              }}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Category volume" description="How often each panel option is being used.">
        <div className="chart-tall">
          <Bar
            data={{
              labels: snapshot.analytics.typeBreakdown.map((entry) => entry.label),
              datasets: [{
                label: 'Tickets',
                data: snapshot.analytics.typeBreakdown.map((entry) => entry.count),
                backgroundColor: 'rgba(157, 124, 255, 0.75)',
                borderRadius: 10
              }]
            }}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </div>
      </SectionCard>
    </div>
  );
}
