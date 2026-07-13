'use client';

import { Bell, Search } from 'lucide-react';
import { useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  NAV_ITEMS,
  NavKey,
  STATUS_STYLES,
  TAB_WIDGETS,
  TOGGLE_PREFS,
} from '../data/mock/dashboardPreview.data';
import { PARTICLE_COLORS } from '../lib/three/constants';
import { DASHBOARD_SLOTS } from '../lib/three/stage5/dashboardGrid';

// Matches the particle system palette used in the WebGL scene.

function pct(fraction: number): string {
  return `${fraction * 100}%`;
}

interface DashboardPreviewProps {
  /** True once the WebGL->DOM crossfade has meaningfully begun; drives the staggered entrance. */
  revealed: boolean;
}

export default function DashboardPreview({ revealed }: DashboardPreviewProps) {
  const [activeNav, setActiveNav] = useState<NavKey>('overview');
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    email: true,
    pipeline: true,
    weekly: false,
  });

  const widgets = TAB_WIDGETS[activeNav];

  const enter = (delayMs: number) => ({
    className: `transition-all duration-500 ease-out ${
      revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
    }`,
    style: { transitionDelay: `${delayMs}ms` },
  });

  return (
    <div className="relative h-full w-full font-sans text-slate-200">
      {/* Panel background */}
      <div
        className={`absolute ${enter(0).className}`}
        style={{
          left: pct(DASHBOARD_SLOTS.panel.x),
          top: pct(DASHBOARD_SLOTS.panel.y),
          width: pct(DASHBOARD_SLOTS.panel.width),
          height: pct(DASHBOARD_SLOTS.panel.height),
          ...enter(0).style,
        }}
      />

      {/* Sidebar */}
      <div
        className={`absolute flex flex-col gap-1 border-r border-white/10 bg-[#0A1120]/95 px-3 py-6 backdrop-blur-sm ${enter(60).className}`}
        style={{
          left: pct(DASHBOARD_SLOTS.sidebar.x),
          top: pct(DASHBOARD_SLOTS.sidebar.y),
          width: pct(DASHBOARD_SLOTS.sidebar.width),
          height: pct(DASHBOARD_SLOTS.sidebar.height),
          ...enter(60).style,
        }}
      >
        <div className="mb-8 px-3 text-sm font-semibold tracking-wide text-white">
          Xai – Intelligence Workspace
        </div>
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const active = key === activeNav;
          return (
            <button
              key={key}
              onClick={() => setActiveNav(key)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-200 hover:bg-white/5"
              style={
                active
                  ? {
                      backgroundColor: `${PARTICLE_COLORS.primary}1A`,
                      color: PARTICLE_COLORS.primary,
                    }
                  : { color: '#94a3b8' }
              }
            >
              <Icon size={16} strokeWidth={1.75} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Header */}
      <div
        className={`absolute flex items-center justify-between border-b border-white/10 bg-[#0A1120]/90 px-6 backdrop-blur-sm ${enter(120).className}`}
        style={{
          left: pct(DASHBOARD_SLOTS.header.x),
          top: pct(DASHBOARD_SLOTS.header.y),
          width: pct(DASHBOARD_SLOTS.header.width),
          height: pct(DASHBOARD_SLOTS.header.height),
          ...enter(120).style,
        }}
      >
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500">Dashboard</p>
          <h1 className="text-sm font-medium capitalize text-white">{activeNav}</h1>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <Search size={16} strokeWidth={1.75} />
          <Bell size={16} strokeWidth={1.75} />
        </div>
      </div>

      {/* Chart / preferences widget */}
      <div
        className={`absolute rounded-xl border border-white/10 bg-[#101a30] p-5 shadow-lg shadow-black/20 ${enter(200).className}`}
        style={{
          left: pct(DASHBOARD_SLOTS.chart.x),
          top: pct(DASHBOARD_SLOTS.chart.y),
          width: pct(DASHBOARD_SLOTS.chart.width),
          height: pct(DASHBOARD_SLOTS.chart.height),
          ...enter(200).style,
        }}
      >
        {activeNav === 'settings' ? (
          <>
            <p className="mb-1 text-xs uppercase tracking-widest text-slate-500">Preferences</p>
            <p className="mb-4 text-lg font-semibold text-white">Notifications</p>
            <div className="flex flex-col gap-3">
              {TOGGLE_PREFS.map(({ key, label }) => {
                const on = prefs[key];
                return (
                  <button
                    key={key}
                    onClick={() => setPrefs(p => ({ ...p, [key]: !p[key] }))}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5 text-left text-sm text-slate-300 transition-colors hover:bg-white/5"
                  >
                    {label}
                    <span
                      className="relative h-5 w-9 rounded-full transition-colors"
                      style={{
                        backgroundColor: on ? PARTICLE_COLORS.secondary : 'rgba(255,255,255,0.1)',
                      }}
                    >
                      <span
                        className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform"
                        style={{ transform: on ? 'translateX(18px)' : 'translateX(2px)' }}
                      />
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <p className="mb-1 text-xs uppercase tracking-widest text-slate-500">
              {widgets.chart.subtitle}
            </p>
            <p className="mb-4 text-lg font-semibold text-white">{widgets.chart.title}</p>
            <ResponsiveContainer width="100%" height="70%">
              <LineChart
                data={widgets.chart.data}
                margin={{ top: 4, right: 8, left: -18, bottom: 0 }}
              >
                <CartesianGrid stroke="#ffffff10" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#0A1120',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: '#94A3B8' }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={widgets.chart.stroke}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive
                  animationDuration={900}
                />
              </LineChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      {/* Metric card widget */}
      <div
        key={activeNav + '-metric'}
        className={`absolute flex flex-col justify-center rounded-xl border border-white/10 bg-gradient-to-br ${widgets.metric.gradient} p-5 shadow-lg shadow-black/20 ${enter(260).className}`}
        style={{
          left: pct(DASHBOARD_SLOTS.metric.x),
          top: pct(DASHBOARD_SLOTS.metric.y),
          width: pct(DASHBOARD_SLOTS.metric.width),
          height: pct(DASHBOARD_SLOTS.metric.height),
          ...enter(260).style,
        }}
      >
        <p
          className="text-xs uppercase tracking-widest"
          style={{ color: `${widgets.metric.accent}CC` }}
        >
          {widgets.metric.label}
        </p>
        <p className="mt-2 text-4xl font-semibold text-white">{widgets.metric.value}</p>
        <p className="mt-1 text-sm text-slate-400">{widgets.metric.sublabel}</p>
      </div>

      {/* Table widget */}
      <div
        key={activeNav + '-table'}
        className={`absolute overflow-hidden rounded-xl border border-white/10 bg-[#101a30] shadow-lg shadow-black/20 ${enter(320).className}`}
        style={{
          left: pct(DASHBOARD_SLOTS.table.x),
          top: pct(DASHBOARD_SLOTS.table.y),
          width: pct(DASHBOARD_SLOTS.table.width),
          height: pct(DASHBOARD_SLOTS.table.height),
          ...enter(320).style,
        }}
      >
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-500">
              {widgets.table.columns.map(col => (
                <th key={col} className="px-5 py-3 font-medium">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {widgets.table.rows.map(row => (
              <tr
                key={row.c1}
                className="border-b border-white/5 transition-colors duration-150 hover:bg-white/5"
              >
                <td className="px-5 py-3 font-mono text-xs text-slate-300">{row.c1}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      STATUS_STYLES[row.c2] ?? 'bg-white/5 text-slate-300'
                    }`}
                  >
                    {row.c2}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-300">{row.c3}</td>
                <td className="px-5 py-3 text-slate-300">{row.c4}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
