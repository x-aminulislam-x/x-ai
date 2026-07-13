import { BarChart3, GitBranch, LayoutDashboard, Settings } from 'lucide-react';
import { PARTICLE_COLORS } from '../../lib/three/constants';

export type NavKey = 'overview' | 'analytics' | 'pipelines' | 'settings';

export type ChartPoint = { name: string; value: number };

export type TabWidgets = {
  chart: { title: string; subtitle: string; data: ChartPoint[]; stroke: string };
  metric: { label: string; value: string; sublabel: string; gradient: string; accent: string };
  table: {
    columns: [string, string, string, string];
    rows: { c1: string; c2: string; c3: string; c4: string }[];
  };
};

export const NAV_ITEMS: { key: NavKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'pipelines', label: 'Pipelines', icon: GitBranch },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export const REQUEST_VOLUME = [
  { name: 'Mon', value: 62 },
  { name: 'Tue', value: 71 },
  { name: 'Wed', value: 68 },
  { name: 'Thu', value: 84 },
  { name: 'Fri', value: 79 },
  { name: 'Sat', value: 91 },
  { name: 'Sun', value: 98 },
];

export const CONVERSION_RATE = [
  { name: 'Mon', value: 2.8 },
  { name: 'Tue', value: 3.1 },
  { name: 'Wed', value: 2.9 },
  { name: 'Thu', value: 3.6 },
  { name: 'Fri', value: 3.4 },
  { name: 'Sat', value: 3.9 },
  { name: 'Sun', value: 4.2 },
];

export const PIPELINE_RUNS = [
  { name: 'Mon', value: 18 },
  { name: 'Tue', value: 22 },
  { name: 'Wed', value: 15 },
  { name: 'Thu', value: 27 },
  { name: 'Fri', value: 24 },
  { name: 'Sat', value: 11 },
  { name: 'Sun', value: 9 },
];

export const ENDPOINT_ROWS = [
  { c1: '/v1/inference', c2: 'Healthy', c3: '42ms', c4: '128K' },
  { c1: '/v1/embeddings', c2: 'Healthy', c3: '18ms', c4: '86K' },
  { c1: '/v1/agents/run', c2: 'Degraded', c3: '210ms', c4: '12K' },
  { c1: '/v1/vector/search', c2: 'Healthy', c3: '31ms', c4: '204K' },
  { c1: '/v1/pipelines/sync', c2: 'Healthy', c3: '55ms', c4: '9.4K' },
];

export const TRAFFIC_ROWS = [
  { c1: 'Organic Search', c2: '48.2K', c3: '31%', c4: '+6.4%' },
  { c1: 'Direct', c2: '22.6K', c3: '24%', c4: '+1.1%' },
  { c1: 'Referral', c2: '14.9K', c3: '38%', c4: '-2.3%' },
  { c1: 'Social', c2: '9.7K', c3: '52%', c4: '+12.8%' },
  { c1: 'Email', c2: '5.3K', c3: '19%', c4: '+3.7%' },
];

export const PIPELINE_ROWS = [
  { c1: 'daily-sync', c2: 'Success', c3: '3m 12s', c4: '2h ago' },
  { c1: 'embed-refresh', c2: 'Running', c3: '1m 48s', c4: 'now' },
  { c1: 'vector-reindex', c2: 'Success', c3: '8m 05s', c4: '5h ago' },
  { c1: 'nightly-backup', c2: 'Failed', c3: '0m 41s', c4: '11h ago' },
  { c1: 'model-eval', c2: 'Success', c3: '14m 22s', c4: '1d ago' },
];

export const TEAM_ROWS = [
  { c1: 'Owner Account', c2: 'Owner', c3: 'owner@insight.io', c4: 'Active' },
  { c1: 'Admin Account', c2: 'Admin', c3: 'admin@insight.io', c4: 'Active' },
  { c1: 'Member Account', c2: 'Member', c3: 'member@insight.io', c4: 'Active' },
  { c1: 'API Key — prod', c2: 'Service', c3: 'sk-••••8f21', c4: 'Active' },
  { c1: 'API Key — staging', c2: 'Service', c3: 'sk-••••2c90', c4: 'Revoked' },
];

export const STATUS_STYLES: Record<string, string> = {
  Healthy: 'bg-emerald-400/10 text-emerald-300',
  Success: 'bg-emerald-400/10 text-emerald-300',
  Active: 'bg-emerald-400/10 text-emerald-300',
  Degraded: 'bg-amber-400/10 text-amber-300',
  Running: 'bg-[#0077FF]/10 text-[#5EA9FF]',
  Failed: 'bg-rose-400/10 text-rose-300',
  Revoked: 'bg-slate-500/10 text-slate-400',
};

export const TAB_WIDGETS: Record<NavKey, TabWidgets> = {
  overview: {
    chart: {
      title: 'Request Volume',
      subtitle: 'Trailing 7 Days',
      data: REQUEST_VOLUME,
      stroke: PARTICLE_COLORS.primary,
    },
    metric: {
      label: 'Sys Latency',
      value: '42ms',
      sublabel: 'Average response time',
      gradient: 'from-[#0a3b38] to-[#0f2942]',
      accent: PARTICLE_COLORS.primary,
    },
    table: {
      columns: ['Endpoint', 'Status', 'Latency', 'Requests'],
      rows: ENDPOINT_ROWS,
    },
  },
  analytics: {
    chart: {
      title: 'Conversion Rate',
      subtitle: 'Trailing 7 Days',
      data: CONVERSION_RATE,
      stroke: PARTICLE_COLORS.secondary,
    },
    metric: {
      label: 'Conversion Rate',
      value: '4.2%',
      sublabel: 'Up 0.6pp week over week',
      gradient: 'from-[#0a2a4d] to-[#101a30]',
      accent: PARTICLE_COLORS.secondary,
    },
    table: {
      columns: ['Source', 'Sessions', 'Bounce Rate', 'Change'],
      rows: TRAFFIC_ROWS,
    },
  },
  pipelines: {
    chart: {
      title: 'Pipeline Runs',
      subtitle: 'Trailing 7 Days',
      data: PIPELINE_RUNS,
      stroke: PARTICLE_COLORS.accent,
    },
    metric: {
      label: 'Active Pipelines',
      value: '14',
      sublabel: '3 running right now',
      gradient: 'from-[#2a0a4d] to-[#101a30]',
      accent: PARTICLE_COLORS.accent,
    },
    table: {
      columns: ['Pipeline', 'Status', 'Duration', 'Last Run'],
      rows: PIPELINE_ROWS,
    },
  },
  settings: {
    chart: {
      title: 'API Usage',
      subtitle: 'Trailing 7 Days',
      data: REQUEST_VOLUME,
      stroke: PARTICLE_COLORS.highlight,
    },
    metric: {
      label: 'Current Plan',
      value: 'Pro',
      sublabel: '68% of monthly quota used',
      gradient: 'from-[#1a1a2e] to-[#101a30]',
      accent: PARTICLE_COLORS.highlight,
    },
    table: {
      columns: ['Member / Key', 'Role', 'Contact', 'Status'],
      rows: TEAM_ROWS,
    },
  },
};

export const TOGGLE_PREFS = [
  { key: 'email', label: 'Email notifications' },
  { key: 'pipeline', label: 'Pipeline failure alerts' },
  { key: 'weekly', label: 'Weekly digest' },
];
