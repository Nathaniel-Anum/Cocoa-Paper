import React from 'react';
import { Button } from 'antd';
import { LockOutlined, DownloadOutlined } from '@ant-design/icons';

export function SummaryTile({ label, value, caption, tone = 'default' }) {
  const tones = {
    default: { bg: '#fffaf7', border: '#f0e6db', text: '#582f08', caption: '#7a6859' },
    highlight: { bg: '#582f08', border: '#582f08', text: '#fff4e8', caption: '#ead9cb' },
    info: { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8', caption: '#5b6b85' },
    success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', caption: '#4d7c57' },
    warning: { bg: '#fffbeb', border: '#fde68a', text: '#b45309', caption: '#8a6a38' },
    danger: { bg: '#fff1f2', border: '#fecdd3', text: '#be123c', caption: '#8a5b66' },
    violet: { bg: '#f5f3ff', border: '#ddd6fe', text: '#6d28d9', caption: '#6f65a8' },
  };
  const style = tones[tone] ?? tones.default;

  return (
    <div className="rounded-2xl border p-4" style={{ background: style.bg, borderColor: style.border }}>
      <p className="m-0 text-xs font-bold uppercase tracking-[0.16em]" style={{ color: style.caption }}>
        {label}
      </p>
      <p className="m-0 mt-2 text-2xl font-extrabold" style={{ color: style.text }}>
        {value}
      </p>
      {caption && (
        <p className="m-0 mt-1 text-sm" style={{ color: style.caption }}>
          {caption}
        </p>
      )}
    </div>
  );
}

export function LockBanner({ title, description, tone = 'warning' }) {
  const styles = {
    warning: { bg: '#fff4e8', border: '#fdd9b0', icon: '#9D4D01', title: '#7c3200', text: '#7a6859' },
    success: { bg: '#f0fdf4', border: '#bbf7d0', icon: '#16a34a', title: '#15803d', text: '#4d7c57' },
    violet: { bg: '#f5f3ff', border: '#ddd6fe', icon: '#7c3aed', title: '#6d28d9', text: '#6f65a8' },
  };
  const s = styles[tone] ?? styles.warning;

  return (
    <div
      className="flex items-start gap-3 rounded-2xl border p-4"
      style={{ background: s.bg, borderColor: s.border }}
    >
      <LockOutlined className="mt-1 text-lg" style={{ color: s.icon }} />
      <div>
        <p className="m-0 text-base font-bold" style={{ color: s.title }}>
          {title}
        </p>
        <p className="m-0 mt-1 text-sm leading-6" style={{ color: s.text }}>
          {description}
        </p>
      </div>
    </div>
  );
}

export function TotalAmountCard({ label, amount, subtitle, badge }) {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl bg-[#582f08] p-6 text-[#fff4e8]">
      <p className="m-0 text-xs font-bold uppercase tracking-[0.18em] opacity-70">{label}</p>
      <div className="mt-4">
        <span className="text-3xl font-extrabold tracking-tight">{amount}</span>
        {subtitle && <p className="m-0 mt-1 text-sm opacity-60">{subtitle}</p>}
      </div>
      {badge && (
        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
          <span className="text-xs font-bold uppercase tracking-wider">{badge.label}</span>
          <span className="rounded bg-white/10 px-2 py-1 text-xs font-bold uppercase">{badge.value}</span>
        </div>
      )}
    </div>
  );
}

export function StickyActionBar({ children, className = '' }) {
  return (
    <div
      className={`sticky bottom-0 z-20 mt-6 flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-[#ead9cb] bg-[#fffdfb]/95 px-5 py-4 shadow-[0_-8px_30px_rgba(88,47,8,0.08)] backdrop-blur ${className}`}
    >
      {children}
    </div>
  );
}

export function ReadOnlyPanel({ title, icon, children }) {
  return (
    <div className="rounded-2xl border border-[#ead9cb] bg-[#f7ece5] p-6">
      <h4 className="m-0 mb-4 flex items-center gap-2 text-lg font-bold text-[#582f08]">
        {icon}
        {title}
      </h4>
      {children}
    </div>
  );
}

export function BudgetWorkflowTimeline({ events }) {
  if (!events?.length) {
    return (
      <p className="m-0 text-sm italic text-[#7a6859]">No audit events recorded for this budget yet.</p>
    );
  }

  const grouped = events.reduce((acc, event) => {
    const day = event.dateLabel ?? 'Timeline';
    if (!acc[day]) acc[day] = [];
    acc[day].push(event);
    return acc;
  }, {});

  return (
    <div className="relative ml-3 space-y-8 before:absolute before:bottom-0 before:left-[7px] before:top-0 before:w-0.5 before:bg-[#d6c3b7]">
      {Object.entries(grouped).map(([day, dayEvents]) => (
        <div key={day}>
          <div className="relative z-10 mb-4 inline-block rounded bg-[#582f08] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            {day}
          </div>
          <div className="space-y-4">
            {dayEvents.map((event) => (
              <div key={event.id} className="relative pl-8">
                <div
                  className="absolute left-0 top-3 z-10 h-4 w-4 rounded-full border-4 border-[#fff8f5]"
                  style={{ background: event.accent ?? '#9D4D01' }}
                />
                <div className="rounded-xl border border-[#ead9cb] bg-[#fdf1eb] p-4 transition-colors hover:bg-[#f7ece5]">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="m-0 text-sm font-bold text-[#582f08]">{event.title}</p>
                      <p className="m-0 mt-1 text-xs text-[#7a6859]">{event.timestamp}</p>
                    </div>
                    {event.tag && (
                      <span className="rounded bg-[#ffdcc7] px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter text-[#723600]">
                        {event.tag}
                      </span>
                    )}
                  </div>
                  {event.detail && (
                    <p className="m-0 mt-3 border-t border-[#ead9cb] pt-3 text-sm leading-6 text-[#7a6859]">
                      {event.detail}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function buildBudgetAuditEvents(budget, fmtDate) {
  if (!budget) return [];
  const events = [];

  if (budget.approvedAt) {
    events.push({
      id: 'approved',
      title: 'Budget Finalized & Sealed',
      timestamp: fmtDate(budget.approvedAt),
      detail: budget.approvedBy?.name ? `Approved by ${budget.approvedBy.name}` : undefined,
      tag: 'Status Change',
      accent: '#16a34a',
      sortAt: new Date(budget.approvedAt),
    });
  }
  if (budget.workflowNote && ['RETURNED', 'REJECTED', 'RECOMMENDED'].includes(budget.status)) {
    events.push({
      id: 'workflow-note',
      title: 'Workflow Decision Note',
      timestamp: fmtDate(budget.updatedAt),
      detail: budget.workflowNote,
      tag: 'Governance',
      accent: '#9D4D01',
      sortAt: new Date(budget.updatedAt ?? budget.createdAt),
    });
  }
  if (budget.submittedAt) {
    events.push({
      id: 'submitted',
      title: 'Submitted for Review',
      timestamp: fmtDate(budget.submittedAt),
      detail: budget.submittedBy?.name ? `Submitted by ${budget.submittedBy.name}` : undefined,
      tag: 'Status Change',
      accent: '#582f08',
      sortAt: new Date(budget.submittedAt),
    });
  }
  events.push({
    id: 'created',
    title: 'Budget Draft Created',
    timestamp: fmtDate(budget.createdAt),
    tag: 'Creation',
    accent: '#84746a',
    sortAt: new Date(budget.createdAt),
  });

  return events
    .sort((a, b) => b.sortAt - a.sortAt)
    .map((event) => ({
      ...event,
      dateLabel: event.sortAt.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    }));
}

export function ExportReportButton({ onClick }) {
  return (
    <Button icon={<DownloadOutlined />} onClick={onClick} className="rounded-xl border-[#9D4D01] text-[#9D4D01]">
      Download Report
    </Button>
  );
}
