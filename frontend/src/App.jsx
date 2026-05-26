import { useState, useEffect, useMemo, useCallback, createContext, useContext } from "react";

// ─── Theme Context ────────────────────────────────────────────────────────────
const ThemeCtx = createContext();
function useTheme() { return useContext(ThemeCtx); }

// ─── Auth Context ────────────────────────────────────────────────────────────
const AuthCtx = createContext();
function useAuth() { return useContext(AuthCtx); }

const API = "http://127.0.0.1:5000";

async function apiFetch(path, options = {}, token = null) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const icons = {
  sun: "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 5a7 7 0 1 0 0 14A7 7 0 0 0 12 5z",
  moon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  students: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z",
  check: "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3",
  attendance: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9l2 2 4-4",
  dashboard: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10",
  plus: "M12 5v14M5 12h14",
  trash: "M3 6h18M8 6V4h8v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  search: "M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
  award: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  alert: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
};

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --font: 'Sora', sans-serif;
  --mono: 'JetBrains Mono', monospace;
  --radius: 12px;
  --radius-sm: 8px;
  --radius-lg: 18px;
  --transition: 200ms cubic-bezier(.4,0,.2,1);
}

body.light {
  --bg: #f0f2f7;
  --bg2: #ffffff;
  --bg3: #e8ecf3;
  --surface: rgba(255,255,255,0.85);
  --surface2: rgba(248,250,255,0.9);
  --border: rgba(120,130,160,0.18);
  --border2: rgba(120,130,160,0.28);
  --text: #0d1117;
  --text2: #4a5270;
  --text3: #8892aa;
  --accent: #5b6ef5;
  --accent2: #7c3aed;
  --accent-soft: rgba(91,110,245,0.1);
  --success: #059669;
  --success-soft: #d1fae5;
  --danger: #dc2626;
  --danger-soft: #fee2e2;
  --warning: #d97706;
  --warning-soft: #fef3c7;
  --shadow: 0 4px 24px rgba(13,17,23,0.08);
  --shadow-lg: 0 12px 48px rgba(13,17,23,0.14);
  --glow: 0 0 0 3px rgba(91,110,245,0.15);
}

body.dark {
  --bg: #080c14;
  --bg2: #0e1420;
  --bg3: #141b2d;
  --surface: rgba(14,20,32,0.92);
  --surface2: rgba(20,27,45,0.95);
  --border: rgba(255,255,255,0.07);
  --border2: rgba(255,255,255,0.12);
  --text: #e8edf8;
  --text2: #8892aa;
  --text3: #4a5270;
  --accent: #7c8fff;
  --accent2: #a78bfa;
  --accent-soft: rgba(124,143,255,0.12);
  --success: #34d399;
  --success-soft: rgba(52,211,153,0.12);
  --danger: #f87171;
  --danger-soft: rgba(248,113,113,0.12);
  --warning: #fbbf24;
  --warning-soft: rgba(251,191,36,0.12);
  --shadow: 0 4px 24px rgba(0,0,0,0.3);
  --shadow-lg: 0 12px 48px rgba(0,0,0,0.5);
  --glow: 0 0 0 3px rgba(124,143,255,0.2);
}

body {
  font-family: var(--font);
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  transition: background var(--transition), color var(--transition);
  -webkit-font-smoothing: antialiased;
}

/* Scrollbar */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 3px; }

/* ── Layout ── */
.sms-root { display: flex; min-height: 100vh; }

/* ── Sidebar ── */
.sidebar {
  width: 240px; flex-shrink: 0;
  background: var(--surface);
  border-right: 1px solid var(--border);
  backdrop-filter: blur(20px);
  display: flex; flex-direction: column;
  padding: 24px 0;
  position: sticky; top: 0; height: 100vh;
  overflow-y: auto;
  transition: background var(--transition);
}
.sidebar-logo {
  padding: 0 20px 28px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 12px;
}
.logo-mark {
  display: flex; align-items: center; gap: 10px;
}
.logo-icon {
  width: 36px; height: 36px; border-radius: 10px;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-weight: 800; font-size: 14px; letter-spacing: -0.5px;
  flex-shrink: 0;
}
.logo-text { font-size: 0.85rem; font-weight: 700; color: var(--text); line-height: 1.2; }
.logo-sub { font-size: 0.7rem; color: var(--text3); font-weight: 500; margin-top: 1px; }

.nav-section { padding: 0 12px; margin-bottom: 4px; }
.nav-label {
  font-size: 0.65rem; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--text3);
  padding: 8px 8px 4px;
}
.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 10px; border-radius: var(--radius-sm);
  color: var(--text2); font-size: 0.88rem; font-weight: 500;
  cursor: pointer; transition: all var(--transition);
  border: none; background: none; width: 100%; text-align: left;
}
.nav-item:hover { background: var(--accent-soft); color: var(--accent); }
.nav-item.active { background: var(--accent-soft); color: var(--accent); font-weight: 600; }

.sidebar-bottom {
  margin-top: auto; padding: 12px;
  border-top: 1px solid var(--border);
}
.user-chip {
  display: flex; align-items: center; gap: 10px;
  padding: 10px; border-radius: var(--radius-sm);
  background: var(--bg3);
  margin-bottom: 8px;
}
.user-avatar {
  width: 32px; height: 32px; border-radius: 8px;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 12px; font-weight: 700; flex-shrink: 0;
}
.user-info { min-width: 0; }
.user-name { font-size: 0.82rem; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role { font-size: 0.7rem; color: var(--text3); text-transform: capitalize; }

/* ── Main ── */
.main-area { flex: 1; min-width: 0; display: flex; flex-direction: column; }

.topbar {
  height: 60px; display: flex; align-items: center; justify-content: space-between;
  padding: 0 28px;
  background: var(--surface); border-bottom: 1px solid var(--border);
  backdrop-filter: blur(20px);
  position: sticky; top: 0; z-index: 10;
}
.page-title { font-size: 1rem; font-weight: 700; color: var(--text); }
.topbar-right { display: flex; align-items: center; gap: 10px; }

.content { padding: 28px; flex: 1; }

/* ── Cards / Panels ── */
.panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(20px);
  box-shadow: var(--shadow);
  overflow: hidden;
}
.panel-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
}
.panel-title { font-size: 1rem; font-weight: 700; color: var(--text); }
.panel-sub { font-size: 0.8rem; color: var(--text3); margin-top: 2px; }
.panel-body { padding: 24px; }

/* ── Stat Cards ── */
.stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px 22px;
  box-shadow: var(--shadow);
  transition: transform var(--transition), box-shadow var(--transition);
}
.stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
.stat-icon {
  width: 40px; height: 40px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 14px;
}
.stat-val { font-size: 2rem; font-weight: 800; color: var(--text); line-height: 1; margin-bottom: 4px; font-variant-numeric: tabular-nums; }
.stat-label { font-size: 0.78rem; color: var(--text3); font-weight: 500; }

/* ── Buttons ── */
button { font-family: var(--font); cursor: pointer; border: none; }
button:disabled { opacity: 0.55; cursor: not-allowed; }

.btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 8px 16px; border-radius: var(--radius-sm);
  font-size: 0.83rem; font-weight: 600;
  transition: all var(--transition);
  white-space: nowrap;
}
.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
.btn-ghost { background: var(--bg3); color: var(--text2); border: 1px solid var(--border2); }
.btn-ghost:hover:not(:disabled) { background: var(--accent-soft); color: var(--accent); border-color: var(--accent); }
.btn-danger { background: var(--danger-soft); color: var(--danger); }
.btn-danger:hover:not(:disabled) { opacity: 0.8; }
.btn-success { background: var(--success-soft); color: var(--success); }
.btn-icon {
  width: 34px; height: 34px; padding: 0; border-radius: var(--radius-sm);
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--bg3); color: var(--text2);
  border: 1px solid var(--border);
  transition: all var(--transition);
}
.btn-icon:hover { background: var(--accent-soft); color: var(--accent); border-color: var(--accent); }
.btn-icon.danger:hover { background: var(--danger-soft); color: var(--danger); border-color: var(--danger); }
.theme-btn {
  width: 36px; height: 36px; border-radius: 10px;
  background: var(--bg3); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  color: var(--text2); transition: all var(--transition);
}
.theme-btn:hover { color: var(--accent); border-color: var(--accent); }
.logout-btn {
  width: 100%; display: flex; align-items: center; gap: 8px;
  padding: 9px 10px; border-radius: var(--radius-sm);
  background: var(--danger-soft); color: var(--danger);
  font-size: 0.83rem; font-weight: 600;
  border: none; transition: all var(--transition);
}
.logout-btn:hover { opacity: 0.8; }

/* ── Inputs ── */
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 0.78rem; font-weight: 600; color: var(--text2); }
.input, select.input {
  width: 100%; min-height: 42px; padding: 0 12px;
  background: var(--bg2); border: 1px solid var(--border2);
  border-radius: var(--radius-sm); color: var(--text);
  font-family: var(--font); font-size: 0.88rem;
  transition: border var(--transition), box-shadow var(--transition);
  outline: none; appearance: none;
}
.input:focus { border-color: var(--accent); box-shadow: var(--glow); }
.input::placeholder { color: var(--text3); }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.field-row3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }

/* ── Table ── */
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; min-width: 600px; }
thead th {
  padding: 10px 16px; background: var(--bg3);
  font-size: 0.7rem; font-weight: 700; color: var(--text3);
  text-transform: uppercase; letter-spacing: 0.06em;
  text-align: left; white-space: nowrap;
  border-bottom: 1px solid var(--border);
}
tbody td { padding: 13px 16px; border-bottom: 1px solid var(--border); font-size: 0.875rem; color: var(--text2); vertical-align: middle; }
tbody tr:last-child td { border-bottom: none; }
tbody tr:hover td { background: var(--accent-soft); }
tbody tr { transition: background var(--transition); }

/* ── Badges / Pills ── */
.badge {
  display: inline-flex; align-items: center;
  padding: 3px 9px; border-radius: 999px;
  font-size: 0.7rem; font-weight: 700;
}
.badge-blue { background: var(--accent-soft); color: var(--accent); }
.badge-green { background: var(--success-soft); color: var(--success); }
.badge-red { background: var(--danger-soft); color: var(--danger); }
.badge-yellow { background: var(--warning-soft); color: var(--warning); }

.role-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px; border-radius: 6px;
  font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;
}
.role-badge.admin { background: rgba(168,85,247,0.15); color: #a855f7; }
.role-badge.student { background: var(--accent-soft); color: var(--accent); }

/* ── Progress bar ── */
.progress-bar {
  height: 6px; border-radius: 3px;
  background: var(--bg3); overflow: hidden;
  margin-top: 4px;
}
.progress-fill {
  height: 100%; border-radius: 3px;
  transition: width 600ms ease;
}
.progress-fill.green { background: var(--success); }
.progress-fill.yellow { background: var(--warning); }
.progress-fill.red { background: var(--danger); }

/* ── Login ── */
.login-screen {
  min-height: 100vh; display: grid; place-items: center;
  background: var(--bg);
  background-image: radial-gradient(at 20% 20%, rgba(91,110,245,0.15) 0, transparent 50%),
    radial-gradient(at 80% 80%, rgba(124,58,237,0.1) 0, transparent 50%);
}
.login-card {
  width: min(420px, calc(100vw - 40px));
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: var(--radius-lg);
  padding: 40px;
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(24px);
}
.login-logo { text-align: center; margin-bottom: 32px; }
.login-logo .logo-icon { width: 52px; height: 52px; border-radius: 14px; font-size: 20px; margin: 0 auto 12px; }
.login-logo h1 { font-size: 1.35rem; font-weight: 800; color: var(--text); }
.login-logo p { font-size: 0.82rem; color: var(--text3); margin-top: 4px; }
.login-form { display: flex; flex-direction: column; gap: 16px; }
.login-btn {
  margin-top: 4px; width: 100%; min-height: 46px;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  color: #fff; border-radius: var(--radius-sm);
  font-size: 0.9rem; font-weight: 700;
  transition: opacity var(--transition), transform var(--transition);
}
.login-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
.login-hint { text-align: center; margin-top: 16px; font-size: 0.75rem; color: var(--text3); }
.login-hint code { font-family: var(--mono); background: var(--bg3); padding: 2px 6px; border-radius: 4px; color: var(--accent); }

/* ── Modals ── */
.modal-overlay {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
  display: grid; place-items: center; padding: 20px;
  animation: fadeIn 150ms ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.modal {
  width: min(520px, 100%);
  background: var(--surface2);
  border: 1px solid var(--border2);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  animation: slideUp 200ms ease;
  max-height: 90vh; overflow-y: auto;
}
@keyframes slideUp { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.modal-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
}
.modal-title { font-size: 1rem; font-weight: 700; color: var(--text); }
.modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; }
.modal-footer { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 10px; }

/* ── Alert ── */
.alert {
  padding: 11px 14px; border-radius: var(--radius-sm);
  font-size: 0.83rem; font-weight: 500; display: flex; align-items: center; gap: 8px;
}
.alert-error { background: var(--danger-soft); color: var(--danger); border: 1px solid rgba(220,38,38,0.2); }
.alert-success { background: var(--success-soft); color: var(--success); border: 1px solid rgba(5,150,105,0.2); }

/* ── Student avatar ── */
.s-avatar {
  width: 34px; height: 34px; border-radius: 9px;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 12px; font-weight: 800; flex-shrink: 0;
}
.s-cell { display: flex; align-items: center; gap: 10px; }
.s-name { font-size: 0.88rem; font-weight: 600; color: var(--text); }
.s-regno { font-size: 0.75rem; color: var(--text3); font-family: var(--mono); margin-top: 1px; }

/* ── Profile view ── */
.profile-grid { display: grid; grid-template-columns: 260px 1fr; gap: 20px; align-items: start; }
.profile-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 28px 22px; text-align: center; }
.profile-avatar {
  width: 72px; height: 72px; border-radius: 18px; margin: 0 auto 14px;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 26px; font-weight: 800;
}
.profile-name { font-size: 1.1rem; font-weight: 700; margin-bottom: 3px; }
.profile-regno { font-size: 0.78rem; color: var(--text3); font-family: var(--mono); }
.profile-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px; }
.profile-stat { background: var(--bg3); border-radius: 10px; padding: 12px; }
.profile-stat .val { font-size: 1.4rem; font-weight: 800; color: var(--accent); }
.profile-stat .lbl { font-size: 0.68rem; color: var(--text3); font-weight: 600; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.04em; }

/* ── Tabs ── */
.tabs { display: flex; gap: 2px; background: var(--bg3); border-radius: 10px; padding: 3px; }
.tab {
  flex: 1; padding: 7px 14px; border-radius: 8px;
  font-size: 0.8rem; font-weight: 600; color: var(--text3);
  background: none; border: none; cursor: pointer;
  transition: all var(--transition); white-space: nowrap;
}
.tab.active { background: var(--surface); color: var(--accent); box-shadow: var(--shadow); }
.tab:hover:not(.active) { color: var(--text); }

/* ── Search ── */
.search-wrap { position: relative; }
.search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: var(--text3); pointer-events: none; }
.search-wrap .input { padding-left: 36px; }

/* ── Attendance bars ── */
.att-subject { padding: 14px 0; border-bottom: 1px solid var(--border); }
.att-subject:last-child { border-bottom: none; }
.att-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.att-name { font-size: 0.85rem; font-weight: 600; color: var(--text); }
.att-pct { font-size: 0.82rem; font-weight: 700; font-family: var(--mono); }

/* ── Empty state ── */
.empty { padding: 48px 24px; text-align: center; color: var(--text3); }
.empty svg { opacity: 0.3; margin-bottom: 12px; }
.empty p { font-size: 0.88rem; }

/* ── Responsive ── */
@media (max-width: 900px) {
  .sidebar { width: 200px; }
  .profile-grid { grid-template-columns: 1fr; }
}
@media (max-width: 680px) {
  .sms-root { flex-direction: column; }
  .sidebar { width: 100%; height: auto; position: static; flex-direction: row; flex-wrap: wrap; padding: 12px; }
  .sidebar-logo, .sidebar-bottom { display: none; }
  .nav-section { padding: 0; display: flex; }
  .nav-label { display: none; }
  .nav-item { padding: 8px 10px; font-size: 0.8rem; }
  .content { padding: 16px; }
  .field-row, .field-row3 { grid-template-columns: 1fr; }
}
`;

// ─── Inject CSS ───────────────────────────────────────────────────────────────
function StyleTag() {
  useEffect(() => {
    let tag = document.getElementById("sms-css");
    if (!tag) {
      tag = document.createElement("style");
      tag.id = "sms-css";
      document.head.appendChild(tag);
    }
    tag.textContent = CSS;
  }, []);
  return null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function initials(name = "") { return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(); }

function AttBar({ pct }) {
  const color = pct >= 75 ? "green" : pct >= 50 ? "yellow" : "red";
  return (
    <div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%`, background: `var(--${color === "green" ? "success" : color === "yellow" ? "warning" : "danger"})` }} />
      </div>
    </div>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const { theme, toggleTheme } = useTheme();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST", body: JSON.stringify(form)
      });
      onLogin(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  }

  return (
    <div className="login-screen">
      <div style={{ position: "absolute", top: 20, right: 20 }}>
        <button className="theme-btn" onClick={toggleTheme}>
          <Icon d={theme === "dark" ? icons.sun : icons.moon} size={16} />
        </button>
      </div>
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon">SMS</div>
          <h1>Student Portal</h1>
          <p>Sign in to access your dashboard</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="field">
            <label>Username</label>
            <input className="input" placeholder="admin" value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
          </div>
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>
          {error && <div className="alert alert-error"><Icon d={icons.alert} size={15} />{error}</div>}
          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Dashboard (admin) ────────────────────────────────────────────────────────
function Dashboard({ token }) {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    apiFetch("/dashboard/stats", {}, token).then(setStats).catch(() => {});
  }, [token]);

  if (!stats) return <div className="empty"><p>Loading stats…</p></div>;

  const cards = [
    { label: "Total Students", val: stats.total_students, color: "#5b6ef5", bg: "rgba(91,110,245,0.1)" },
    { label: "Avg CGPA", val: stats.avg_cgpa, color: "#34d399", bg: "rgba(52,211,153,0.1)" },
    { label: "Final Year", val: stats.final_year_students, color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
    { label: "Subjects", val: stats.total_subjects, color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
    { label: "Enrollments", val: stats.total_enrollments, color: "#f87171", bg: "rgba(248,113,113,0.1)" },
  ];

  return (
    <div>
      <div className="stats-row">
        {cards.map(c => (
          <div className="stat-card" key={c.label}>
            <div className="stat-icon" style={{ background: c.bg, color: c.color }}>
              <Icon d={icons.dashboard} size={18} />
            </div>
            <div className="stat-val" style={{ color: c.color }}>{c.val}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>
      <div className="panel">
        <div className="panel-header"><div><div className="panel-title">Welcome back, Admin</div><div className="panel-sub">Here's a summary of your institution's academic data</div></div></div>
        <div className="panel-body">
          <p style={{ color: "var(--text2)", fontSize: "0.88rem", lineHeight: 1.7 }}>
            Use the sidebar to navigate between <strong>Students</strong>, <strong>Subjects</strong>, <strong>Attendance</strong>, and <strong>Completed Courses</strong>.
            Students can log in with their registration number as both username and password.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Students List (admin) ────────────────────────────────────────────────────
function StudentModal({ student, onClose, onSaved, token, mode }) {
  const isEdit = mode === "edit";
  const [form, setForm] = useState(student ? {
    regno: student.regno, name: student.name, age: String(student.age),
    cgpa: student.cgpa, year: String(student.year), semester: student.semester,
    email: student.email || "", phone: student.phone || "",
    department: student.department || "", address: student.address || ""
  } : { regno: "", name: "", age: "", cgpa: "", year: "1", semester: "1", email: "", phone: "", department: "", address: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setSaving(true); setError("");
    try {
      if (isEdit) {
        await apiFetch(`/students/${student.id}`, { method: "PATCH", body: JSON.stringify(form) }, token);
      } else {
        await apiFetch("/students", { method: "POST", body: JSON.stringify({ students: [{ ...form, age: Number(form.age), year: Number(form.year) }] }) }, token);
      }
      onSaved();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  }

  const F = ({ label, name, type = "text", placeholder = "" }) => (
    <div className="field">
      <label>{label}</label>
      <input className="input" type={type} placeholder={placeholder} value={form[name]}
        onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))} />
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{isEdit ? "Edit Student" : "Add New Student"}</span>
          <button className="btn-icon" onClick={onClose}><Icon d="M18 6L6 18M6 6l12 12" size={15} /></button>
        </div>
        <div className="modal-body">
          <div className="field-row"><F label="Register No." name="regno" placeholder="REG2026001" /><F label="Full Name" name="name" placeholder="Ananya Sharma" /></div>
          <div className="field-row"><F label="Age" name="age" type="number" placeholder="20" /><F label="CGPA" name="cgpa" type="number" placeholder="8.5" /></div>
          <div className="field-row">
            <div className="field"><label>Year</label>
              <select className="input" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))}>
                {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
              </select></div>
            <div className="field"><label>Semester</label>
              <select className="input" value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
              </select></div>
          </div>
          <div className="field-row"><F label="Email" name="email" type="email" /><F label="Phone" name="phone" /></div>
          <F label="Department" name="department" placeholder="Computer Science" />
          <F label="Address" name="address" placeholder="123 Street, City" />
          {error && <div className="alert alert-error"><Icon d={icons.alert} size={15} />{error}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? "Saving…" : isEdit ? "Save Changes" : "Add Student"}</button>
        </div>
      </div>
    </div>
  );
}

function StudentsPage({ token, isAdmin }) {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [modal, setModal] = useState(null); // null | {mode, student}
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await apiFetch("/students", {}, token); setStudents(d.students); }
    catch (e) {}
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  async function deleteStudent(s) {
    if (!confirm(`Delete ${s.name}?`)) return;
    try { await apiFetch(`/students/${s.id}`, { method: "DELETE" }, token); load(); }
    catch (e) { alert(e.message); }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return students
      .filter(s => !q || [s.name, s.regno, s.department].join(" ").toLowerCase().includes(q))
      .sort((a, b) => sortBy === "cgpa" ? Number(b.cgpa) - Number(a.cgpa) :
        sortBy === "year" ? a.year - b.year :
        sortBy === "regno" ? a.regno.localeCompare(b.regno) : a.name.localeCompare(b.name));
  }, [students, search, sortBy]);

  if (selectedStudent) return <StudentDetail student={selectedStudent} token={token} isAdmin={isAdmin} onBack={() => { setSelectedStudent(null); load(); }} />;

  return (
    <div>
      <div className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">Students</div>
            <div className="panel-sub">{students.length} records</div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div className="search-wrap">
              <span className="search-icon"><Icon d={icons.search} size={15} /></span>
              <input className="input search-wrap" style={{ paddingLeft: 34, width: 200 }} placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input" style={{ width: 150 }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="name">Sort: Name</option>
              <option value="regno">Sort: Reg No</option>
              <option value="cgpa">Sort: CGPA ↓</option>
              <option value="year">Sort: Year</option>
            </select>
            {isAdmin && <button className="btn btn-primary" onClick={() => setModal({ mode: "add", student: null })}><Icon d={icons.plus} size={15} />Add Student</button>}
          </div>
        </div>
        <div className="table-wrap">
          {loading ? <div className="empty"><p>Loading…</p></div> : filtered.length === 0 ? <div className="empty"><Icon d={icons.students} size={36} /><p>No students found</p></div> : (
            <table>
              <thead><tr>
                <th>Student</th><th>Department</th><th>Year / Sem</th>
                <th>CGPA</th><th>Attendance</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td><div className="s-cell"><div className="s-avatar">{initials(s.name)}</div><div><div className="s-name">{s.name}</div><div className="s-regno">{s.regno}</div></div></div></td>
                    <td>{s.department || <span style={{ color: "var(--text3)" }}>—</span>}</td>
                    <td><span className="badge badge-blue">Y{s.year} S{s.semester}</span></td>
                    <td><span className="badge" style={{ background: Number(s.cgpa) >= 8 ? "var(--success-soft)" : Number(s.cgpa) >= 6 ? "var(--warning-soft)" : "var(--danger-soft)", color: Number(s.cgpa) >= 8 ? "var(--success)" : Number(s.cgpa) >= 6 ? "var(--warning)" : "var(--danger)" }}>{s.cgpa}</span></td>
                    <td>
                      <div style={{ minWidth: 80 }}>
                        <span style={{ fontSize: "0.75rem", color: s.attendance_percentage >= 75 ? "var(--success)" : "var(--danger)", fontWeight: 700 }}>{s.attendance_percentage}%</span>
                        <AttBar pct={s.attendance_percentage} />
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn-icon" title="View profile" onClick={() => setSelectedStudent(s)}><Icon d={icons.user} size={14} /></button>
                        {isAdmin && <button className="btn-icon" title="Edit" onClick={() => setModal({ mode: "edit", student: s })}><Icon d={icons.edit} size={14} /></button>}
                        {isAdmin && <button className="btn-icon danger" title="Delete" onClick={() => deleteStudent(s)}><Icon d={icons.trash} size={14} /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {modal && <StudentModal mode={modal.mode} student={modal.student} token={token} onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); }} />}
    </div>
  );
}

// ─── Student Detail / Profile ─────────────────────────────────────────────────
function StudentDetail({ student: initialStudent, token, isAdmin, onBack }) {
  const [student, setStudent] = useState(initialStudent);
  const [tab, setTab] = useState("overview");
  const [attendance, setAttendance] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [attModal, setAttModal] = useState(false);
  const [enrollModal, setEnrollModal] = useState(false);
  const [courseModal, setCourseModal] = useState(false);

  const loadAll = useCallback(async () => {
    const id = student.id;
    const [att, enr, cmp, sub] = await Promise.all([
      apiFetch(`/students/${id}/attendance`, {}, token).catch(() => ({ attendance: [] })),
      apiFetch(`/students/${id}/enrollments`, {}, token).catch(() => ({ enrollments: [] })),
      apiFetch(`/students/${id}/completed-courses`, {}, token).catch(() => ({ completed_courses: [] })),
      isAdmin ? apiFetch("/subjects", {}, token).catch(() => ({ subjects: [] })) : Promise.resolve({ subjects: [] }),
    ]);
    setAttendance(att.attendance);
    setEnrollments(enr.enrollments);
    setCompleted(cmp.completed_courses);
    setSubjects(sub.subjects);
  }, [student.id, token, isAdmin]);

  useEffect(() => { loadAll(); }, [loadAll]);

  return (
    <div>
      <button className="btn btn-ghost" style={{ marginBottom: 18 }} onClick={onBack}>← Back</button>
      <div className="profile-grid">
        <div className="profile-card">
          <div className="profile-avatar">{initials(student.name)}</div>
          <div className="profile-name">{student.name}</div>
          <div className="profile-regno">{student.regno}</div>
          <div style={{ marginTop: 10, display: "flex", justifyContent: "center" }}>
            <span className="badge badge-blue">Year {student.year} · Sem {student.semester}</span>
          </div>
          <div className="profile-stats">
            <div className="profile-stat"><div className="val">{student.cgpa}</div><div className="lbl">CGPA</div></div>
            <div className="profile-stat"><div className="val" style={{ color: student.attendance_percentage >= 75 ? "var(--success)" : "var(--danger)" }}>{student.attendance_percentage}%</div><div className="lbl">Attend.</div></div>
            <div className="profile-stat"><div className="val">{enrollments.length}</div><div className="lbl">Enrolled</div></div>
            <div className="profile-stat"><div className="val">{completed.length}</div><div className="lbl">Done</div></div>
          </div>
          {student.department && <div style={{ marginTop: 14, padding: "8px 12px", background: "var(--bg3)", borderRadius: 8, fontSize: "0.78rem", color: "var(--text2)" }}>{student.department}</div>}
          {student.email && <div style={{ marginTop: 8, fontSize: "0.75rem", color: "var(--text3)" }}>{student.email}</div>}
          {student.phone && <div style={{ fontSize: "0.75rem", color: "var(--text3)" }}>{student.phone}</div>}
        </div>

        <div className="panel" style={{ minWidth: 0 }}>
          <div className="panel-header">
            <div className="tabs">
              {["overview", "attendance", "subjects", "completed"].map(t => (
                <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            {isAdmin && tab === "attendance" && <button className="btn btn-primary" onClick={() => setAttModal(true)}><Icon d={icons.plus} size={14} />Mark</button>}
            {isAdmin && tab === "subjects" && <button className="btn btn-primary" onClick={() => setEnrollModal(true)}><Icon d={icons.plus} size={14} />Enroll</button>}
            {isAdmin && tab === "completed" && <button className="btn btn-primary" onClick={() => setCourseModal(true)}><Icon d={icons.plus} size={14} />Add</button>}
          </div>
          <div className="panel-body">
            {tab === "overview" && <Overview student={student} />}
            {tab === "attendance" && <AttendanceTab data={attendance} />}
            {tab === "subjects" && <SubjectsTab enrollments={enrollments} isAdmin={isAdmin} token={token} studentId={student.id} onRefresh={loadAll} />}
            {tab === "completed" && <CompletedTab courses={completed} isAdmin={isAdmin} token={token} studentId={student.id} onRefresh={loadAll} />}
          </div>
        </div>
      </div>

      {attModal && <AttendanceModal student={student} token={token} subjects={subjects} onClose={() => setAttModal(false)} onSaved={() => { setAttModal(false); loadAll(); }} />}
      {enrollModal && <EnrollModal student={student} token={token} subjects={subjects} enrolled={enrollments} onClose={() => setEnrollModal(false)} onSaved={() => { setEnrollModal(false); loadAll(); }} />}
      {courseModal && <CourseModal student={student} token={token} onClose={() => setCourseModal(false)} onSaved={() => { setCourseModal(false); loadAll(); }} />}
    </div>
  );
}

function Overview({ student }) {
  const fields = [
    ["Age", student.age], ["Email", student.email || "—"], ["Phone", student.phone || "—"],
    ["Department", student.department || "—"], ["Address", student.address || "—"],
  ];
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {fields.map(([k, v]) => (
        <div key={k} style={{ display: "flex", gap: 16, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
          <span style={{ width: 110, fontSize: "0.78rem", fontWeight: 700, color: "var(--text3)", flexShrink: 0 }}>{k}</span>
          <span style={{ fontSize: "0.88rem", color: "var(--text)" }}>{v}</span>
        </div>
      ))}
    </div>
  );
}

function AttendanceTab({ data }) {
  if (!data.length) return <div className="empty"><Icon d={icons.attendance} size={36} /><p>No attendance records</p></div>;
  return (
    <div>
      {data.map(sub => (
        <div className="att-subject" key={sub.subject_code}>
          <div className="att-row">
            <span className="att-name">{sub.subject_code}</span>
            <span className="att-pct" style={{ color: sub.percentage >= 75 ? "var(--success)" : sub.percentage >= 50 ? "var(--warning)" : "var(--danger)" }}>{sub.percentage}%</span>
          </div>
          <AttBar pct={sub.percentage} />
          <div style={{ marginTop: 6, fontSize: "0.72rem", color: "var(--text3)" }}>
            {sub.present} present · {sub.absent} absent · {sub.total} classes
          </div>
        </div>
      ))}
    </div>
  );
}

function SubjectsTab({ enrollments, isAdmin, token, studentId, onRefresh }) {
  if (!enrollments.length) return <div className="empty"><Icon d={icons.book} size={36} /><p>No subjects enrolled</p></div>;
  async function unenroll(id) {
    if (!confirm("Remove enrollment?")) return;
    await apiFetch(`/students/${studentId}/enrollments/${id}`, { method: "DELETE" }, token);
    onRefresh();
  }
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {enrollments.map(e => (
        <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px", background: "var(--bg3)", borderRadius: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>{e.subject?.name}</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text3)", fontFamily: "var(--mono)" }}>{e.subject?.code} · {e.subject?.credits} credits</div>
          </div>
          {e.grade && <span className="badge badge-green">{e.grade}</span>}
          {isAdmin && <button className="btn-icon danger" onClick={() => unenroll(e.id)}><Icon d={icons.trash} size={13} /></button>}
        </div>
      ))}
    </div>
  );
}

function CompletedTab({ courses, isAdmin, token, studentId, onRefresh }) {
  if (!courses.length) return <div className="empty"><Icon d={icons.award} size={36} /><p>No completed courses</p></div>;
  async function del(id) {
    if (!confirm("Delete record?")) return;
    await apiFetch(`/students/${studentId}/completed-courses/${id}`, { method: "DELETE" }, token);
    onRefresh();
  }
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {courses.map(c => (
        <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px", background: "var(--bg3)", borderRadius: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>{c.course_name}</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text3)" }}>{c.completion_date} · {c.credits} credits</div>
          </div>
          {c.grade && <span className="badge badge-green">{c.grade}</span>}
          {isAdmin && <button className="btn-icon danger" onClick={() => del(c.id)}><Icon d={icons.trash} size={13} /></button>}
        </div>
      ))}
    </div>
  );
}

// ─── Attendance Modal ─────────────────────────────────────────────────────────
function AttendanceModal({ student, token, subjects, onClose, onSaved }) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({ subject_code: subjects[0]?.code || "", date: today, status: "present" });
  const [saving, setSaving] = useState(false);
  async function save() {
    setSaving(true);
    try {
      await apiFetch(`/students/${student.id}/attendance`, { method: "POST", body: JSON.stringify({ records: [form] }) }, token);
      onSaved();
    } catch (e) { alert(e.message); }
    finally { setSaving(false); }
  }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><span className="modal-title">Mark Attendance</span><button className="btn-icon" onClick={onClose}><Icon d="M18 6L6 18M6 6l12 12" size={15} /></button></div>
        <div className="modal-body">
          <div className="field"><label>Subject Code</label>
            {subjects.length > 0
              ? <select className="input" value={form.subject_code} onChange={e => setForm(f => ({ ...f, subject_code: e.target.value }))}>
                  {subjects.map(s => <option key={s.code} value={s.code}>{s.code} — {s.name}</option>)}
                </select>
              : <input className="input" placeholder="CS101" value={form.subject_code} onChange={e => setForm(f => ({ ...f, subject_code: e.target.value }))} />}
          </div>
          <div className="field-row">
            <div className="field"><label>Date</label><input className="input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
            <div className="field"><label>Status</label>
              <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="present">Present</option><option value="absent">Absent</option>
              </select></div>
          </div>
        </div>
        <div className="modal-footer"><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Mark"}</button></div>
      </div>
    </div>
  );
}

// ─── Enroll Modal ─────────────────────────────────────────────────────────────
function EnrollModal({ student, token, subjects, enrolled, onClose, onSaved }) {
  const enrolledIds = new Set(enrolled.map(e => e.subject?.id));
  const available = subjects.filter(s => !enrolledIds.has(s.id));
  const [subjectId, setSubjectId] = useState(available[0]?.id || "");
  async function save() {
    try {
      await apiFetch(`/students/${student.id}/enrollments`, { method: "POST", body: JSON.stringify({ subject_id: subjectId }) }, token);
      onSaved();
    } catch (e) { alert(e.message); }
  }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><span className="modal-title">Enroll in Subject</span><button className="btn-icon" onClick={onClose}><Icon d="M18 6L6 18M6 6l12 12" size={15} /></button></div>
        <div className="modal-body">
          {available.length === 0 ? <p style={{ color: "var(--text2)", fontSize: "0.88rem" }}>All subjects already enrolled.</p> :
            <div className="field"><label>Select Subject</label>
              <select className="input" value={subjectId} onChange={e => setSubjectId(e.target.value)}>
                {available.map(s => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}
              </select></div>}
        </div>
        <div className="modal-footer"><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={save} disabled={!available.length}>Enroll</button></div>
      </div>
    </div>
  );
}

// ─── Course Modal ────────────────────────────────────────────────────────────
function CourseModal({ student, token, onClose, onSaved }) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({ course_name: "", completion_date: today, grade: "", credits: "3" });
  const [saving, setSaving] = useState(false);
  async function save() {
    setSaving(true);
    try {
      await apiFetch(`/students/${student.id}/completed-courses`, { method: "POST", body: JSON.stringify(form) }, token);
      onSaved();
    } catch (e) { alert(e.message); }
    finally { setSaving(false); }
  }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><span className="modal-title">Add Completed Course</span><button className="btn-icon" onClick={onClose}><Icon d="M18 6L6 18M6 6l12 12" size={15} /></button></div>
        <div className="modal-body">
          <div className="field"><label>Course Name</label><input className="input" placeholder="Data Structures" value={form.course_name} onChange={e => setForm(f => ({ ...f, course_name: e.target.value }))} /></div>
          <div className="field-row">
            <div className="field"><label>Completion Date</label><input className="input" type="date" value={form.completion_date} onChange={e => setForm(f => ({ ...f, completion_date: e.target.value }))} /></div>
            <div className="field"><label>Grade</label><input className="input" placeholder="A+" value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))} /></div>
          </div>
          <div className="field"><label>Credits</label><input className="input" type="number" value={form.credits} onChange={e => setForm(f => ({ ...f, credits: e.target.value }))} /></div>
        </div>
        <div className="modal-footer"><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Add"}</button></div>
      </div>
    </div>
  );
}

// ─── Subjects Page ────────────────────────────────────────────────────────────
function SubjectsPage({ token, isAdmin }) {
  const [subjects, setSubjects] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", department: "", credits: "3", year: "1", semester: "1" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const d = await apiFetch("/subjects", {}, token).catch(() => ({ subjects: [] }));
    setSubjects(d.subjects);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  async function addSubject() {
    setSaving(true);
    try {
      await apiFetch("/subjects", { method: "POST", body: JSON.stringify({ ...form, credits: Number(form.credits), year: Number(form.year) }) }, token);
      setModal(false); setForm({ code: "", name: "", department: "", credits: "3", year: "1", semester: "1" }); load();
    } catch (e) { alert(e.message); }
    finally { setSaving(false); }
  }

  async function del(id) {
    if (!confirm("Delete subject?")) return;
    await apiFetch(`/subjects/${id}`, { method: "DELETE" }, token);
    load();
  }

  return (
    <div>
      <div className="panel">
        <div className="panel-header">
          <div><div className="panel-title">Subjects</div><div className="panel-sub">{subjects.length} subjects</div></div>
          {isAdmin && <button className="btn btn-primary" onClick={() => setModal(true)}><Icon d={icons.plus} size={15} />Add Subject</button>}
        </div>
        <div className="table-wrap">
          {subjects.length === 0 ? <div className="empty"><Icon d={icons.book} size={36} /><p>No subjects yet</p></div> : (
            <table>
              <thead><tr><th>Code</th><th>Name</th><th>Department</th><th>Credits</th><th>Year / Sem</th>{isAdmin && <th>Actions</th>}</tr></thead>
              <tbody>
                {subjects.map(s => (
                  <tr key={s.id}>
                    <td><span style={{ fontFamily: "var(--mono)", fontSize: "0.82rem", color: "var(--accent)" }}>{s.code}</span></td>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td>{s.department || "—"}</td>
                    <td><span className="badge badge-blue">{s.credits} cr</span></td>
                    <td><span className="badge badge-blue">Y{s.year} S{s.semester}</span></td>
                    {isAdmin && <td><button className="btn-icon danger" onClick={() => del(s.id)}><Icon d={icons.trash} size={14} /></button></td>}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><span className="modal-title">Add Subject</span><button className="btn-icon" onClick={() => setModal(false)}><Icon d="M18 6L6 18M6 6l12 12" size={15} /></button></div>
            <div className="modal-body">
              <div className="field-row">
                <div className="field"><label>Code</label><input className="input" placeholder="CS101" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} /></div>
                <div className="field"><label>Name</label><input className="input" placeholder="Data Structures" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              </div>
              <div className="field-row">
                <div className="field"><label>Department</label><input className="input" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} /></div>
                <div className="field"><label>Credits</label><input className="input" type="number" value={form.credits} onChange={e => setForm(f => ({ ...f, credits: e.target.value }))} /></div>
              </div>
              <div className="field-row">
                <div className="field"><label>Year</label><select className="input" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))}>{[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}</select></div>
                <div className="field"><label>Semester</label><select className="input" value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}>{[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}</select></div>
              </div>
            </div>
            <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-primary" onClick={addSubject} disabled={saving}>{saving ? "Saving…" : "Add"}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Student Self View ────────────────────────────────────────────────────────
function StudentSelfView({ user, token }) {
  if (!user.student) return <div className="empty"><p>No student record linked to your account.</p></div>;
  return <StudentDetail student={user.student} token={token} isAdmin={false} onBack={() => {}} />;
}

// ─── App Shell ────────────────────────────────────────────────────────────────
function AppShell({ user, token, onLogout }) {
  const { theme, toggleTheme } = useTheme();
  const isAdmin = user.role === "admin";
  const [page, setPage] = useState(isAdmin ? "dashboard" : "profile");

  const adminNav = [
    { id: "dashboard", label: "Dashboard", icon: icons.dashboard },
    { id: "students", label: "Students", icon: icons.students },
    { id: "subjects", label: "Subjects", icon: icons.book },
  ];
  const studentNav = [
    { id: "profile", label: "My Profile", icon: icons.user },
    { id: "subjects", label: "Subjects", icon: icons.book },
  ];
  const navItems = isAdmin ? adminNav : studentNav;

  const titles = { dashboard: "Dashboard", students: "Students", subjects: "Subjects", profile: "My Profile" };

  return (
    <div className="sms-root">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">
            <div className="logo-icon">SMS</div>
            <div>
              <div className="logo-text">AcadPortal</div>
              <div className="logo-sub">Academic Management</div>
            </div>
          </div>
        </div>
        <div className="nav-section">
          <div className="nav-label">Navigation</div>
          {navItems.map(n => (
            <button key={n.id} className={`nav-item ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)}>
              <Icon d={n.icon} size={16} />{n.label}
            </button>
          ))}
        </div>
        <div className="sidebar-bottom">
          <div className="user-chip">
            <div className="user-avatar">{initials(user.username)}</div>
            <div className="user-info">
              <div className="user-name">{user.username}</div>
              <div className="user-role">{user.role}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={onLogout}><Icon d={icons.logout} size={15} />Sign Out</button>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <span className="page-title">{titles[page] || page}</span>
          <div className="topbar-right">
            <span className={`role-badge ${user.role}`}>{user.role}</span>
            <button className="theme-btn" onClick={toggleTheme} title="Toggle theme">
              <Icon d={theme === "dark" ? icons.sun : icons.moon} size={16} />
            </button>
          </div>
        </header>

        <main className="content">
          {page === "dashboard" && isAdmin && <Dashboard token={token} />}
          {page === "students" && <StudentsPage token={token} isAdmin={isAdmin} />}
          {page === "subjects" && <SubjectsPage token={token} isAdmin={isAdmin} />}
          {page === "profile" && !isAdmin && <StudentSelfView user={user} token={token} />}
        </main>
      </div>
    </div>
  );
}

// ─── Root App ────────────────────────────────────────────────────────────────
export default function SMSApp() {
  const [theme, setTheme] = useState(() => localStorage.getItem("sms-theme") || "dark");
  const [token, setToken] = useState(() => localStorage.getItem("sms-token") || null);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("sms-user") || "null"); } catch { return null; }
  });

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem("sms-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  function handleLogin(tok, usr) {
    setToken(tok); setUser(usr);
    localStorage.setItem("sms-token", tok);
    localStorage.setItem("sms-user", JSON.stringify(usr));
  }

  function handleLogout() {
    setToken(null); setUser(null);
    localStorage.removeItem("sms-token");
    localStorage.removeItem("sms-user");
  }

  return (
    <ThemeCtx.Provider value={{ theme, toggleTheme }}>
      <StyleTag />
      {!token || !user
        ? <LoginPage onLogin={handleLogin} />
        : <AppShell user={user} token={token} onLogout={handleLogout} />}
    </ThemeCtx.Provider>
  );
}