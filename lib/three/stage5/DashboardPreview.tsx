'use client';

import { BarChart3, Bell, GitBranch, LayoutDashboard, Search, Settings } from 'lucide-react';
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
import { DASHBOARD_SLOTS } from './dashboardGrid';

type NavKey = 'overview' | 'analytics' | 'pipelines' | 'settings';

const NAV_ITEMS: { key: NavKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'pipelines', label: 'Pipelines', icon: GitBranch },
  { key: 'settings', label: 'Settings', icon: Settings },
];

const CHART_DATA: Record<'overview' | 'analytics', { name: string; value: number }[]> = {
  overview: [
    { name: 'Mon', value: 62 },
    { name: 'Tue', value: 71 },
    { name: 'Wed', value: 68 },
    { name: 'Thu', value: 84 },
    { name: 'Fri', value: 79 },
    { name: 'Sat', value: 91 },
    { name: 'Sun', value: 98 },
  ],
  analytics: [
    { name: 'Mon', value: 1.0 },
    { name: 'Tue', value: 1.1 },
    { name: 'Wed', value: 0.9 },
    { name: 'Thu', value: 1.3 },
    { name: 'Fri', value: 1.2 },
    { name: 'Sat', value: 1.4 },
    { name: 'Sun', value: 1.6 },
  ],
};

const TABLE_ROWS = [
  { endpoint: '/v1/inference', status: 'Healthy', latency: '42ms', requests: '128K' },
  { endpoint: '/v1/embeddings', status: 'Healthy', latency: '18ms', requests: '86K' },
  { endpoint: '/v1/agents/run', status: 'Degraded', latency: '210ms', requests: '12K' },
  { endpoint: '/v1/vector/search', status: 'Healthy', latency: '31ms', requests: '204K' },
  { endpoint: '/v1/pipelines/sync', status: 'Healthy', latency: '55ms', requests: '9.4K' },
];

function pct(fraction: number): string {
  return `${fraction * 100}%`;
}

interface DashboardPreviewProps {
  /** True once the WebGL->DOM crossfade has meaningfully begun; drives the staggered entrance. */
  revealed: boolean;
}

export default function DashboardPreview({ revealed }: DashboardPreviewProps) {
  const [activeNav, setActiveNav] = useState<NavKey>('overview');
  const chartKey = activeNav === 'analytics' ? 'analytics' : 'overview';

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
        className={`absolute bg-[#0D1526]/60 ${enter(0).className}`}
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
        <div className="mb-8 px-3 text-sm font-semibold tracking-wide text-white">Insight</div>
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const active = key === activeNav;
          return (
            <button
              key={key}
              onClick={() => setActiveNav(key)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-200 ${
                active
                  ? 'bg-teal-400/10 text-teal-300'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
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

      {/* Chart widget */}
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
        <p className="mb-1 text-xs uppercase tracking-widest text-slate-500">Request Volume</p>
        <p className="mb-4 text-lg font-semibold text-white">Trailing 7 Days</p>
        <ResponsiveContainer width="100%" height="70%">
          <LineChart
            data={CHART_DATA[chartKey]}
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
              stroke="#5EEAD4"
              strokeWidth={2}
              dot={false}
              isAnimationActive
              animationDuration={900}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Metric card widget */}
      <div
        className={`absolute flex flex-col justify-center rounded-xl border border-white/10 bg-gradient-to-br from-[#134e4a] to-[#0f2942] p-5 shadow-lg shadow-black/20 ${enter(260).className}`}
        style={{
          left: pct(DASHBOARD_SLOTS.metric.x),
          top: pct(DASHBOARD_SLOTS.metric.y),
          width: pct(DASHBOARD_SLOTS.metric.width),
          height: pct(DASHBOARD_SLOTS.metric.height),
          ...enter(260).style,
        }}
      >
        <p className="text-xs uppercase tracking-widest text-teal-300/80">Sys Latency</p>
        <p className="mt-2 text-4xl font-semibold text-white">42ms</p>
        <p className="mt-1 text-sm text-slate-400">Average response time</p>
      </div>

      {/* Table widget */}
      <div
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
              <th className="px-5 py-3 font-medium">Endpoint</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Latency</th>
              <th className="px-5 py-3 font-medium">Requests</th>
            </tr>
          </thead>
          <tbody>
            {TABLE_ROWS.map(row => (
              <tr
                key={row.endpoint}
                className="border-b border-white/5 transition-colors duration-150 hover:bg-white/5"
              >
                <td className="px-5 py-3 font-mono text-xs text-slate-300">{row.endpoint}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      row.status === 'Healthy'
                        ? 'bg-emerald-400/10 text-emerald-300'
                        : 'bg-amber-400/10 text-amber-300'
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-300">{row.latency}</td>
                <td className="px-5 py-3 text-slate-300">{row.requests}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
