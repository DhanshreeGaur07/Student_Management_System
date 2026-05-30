import { useState, useEffect, useMemo, useCallback } from "react";

const API = "http://127.0.0.1:5000";

async function apiFetch(path, opts = {}, token = null) {
  const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { ...opts, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

const ini = (n = "") => n.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

const Ic = ({ d, s = 16 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0, display: "block", pointerEvents: "none" }}>
    <path d={d} />
  </svg>
);

const P = {
  home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  clip: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9l2 2 4-4",
  out: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  plus: "M12 5v14M5 12h14",
  trash: "M3 6h18M8 6V4h8v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  eyeoff: "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22",
  srch: "M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
  x: "M18 6L6 18M6 6l12 12",
  back: "M19 12H5M12 19l-7-7 7-7",
  award: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  check2: "M20 6L9 17l-5-5",
  alert: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  chart: "M18 20V10M12 20V4M6 20v-6",
  grad: "M22 10v6M2 10l10-5 10 5-10 5z",
  sun: "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 5a7 7 0 1 0 0 14A7 7 0 0 0 12 5z",
  moon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
};

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --f: 'Plus Jakarta Sans', system-ui, sans-serif;
  --mono: 'JetBrains Mono', monospace;
  --r: 10px; --rl: 14px; --rxl: 20px;
  --tr: 180ms cubic-bezier(.4,0,.2,1);
}

/* ══════════ DARK THEME — Navy Black ══════════ */
body.dk {
  --bg:      #020509;   /* pure navy-black base */
  --bg2:     #05091a;   /* dark navy surface */
  --bg3:     #080e24;   /* navy panel */
  --bg4:     #0c1430;   /* elevated navy */
  --glass:   rgba(5,9,26,0.92);
  --glass2:  rgba(8,14,36,0.96);
  /* borders: navy-blue tint */
  --b1: rgba(0,134,143,.06);
  --b2: rgba(0,134,143,.12);
  --b3: rgba(0,134,143,.22);
  /* text */
  --t1: #e4f8f9;   /* near-white with teal tint */
  --t2: #4a9ea6;   /* muted teal */
  --t3: #1e4f55;   /* deep muted teal-navy */
  /* accent: teal #00868f */
  --a1: #00868f;
  --a2: #006f77;
  --a3: #005860;
  --ag: linear-gradient(135deg, #00868f 0%, #006f77 100%);
  /* semantic */
  --ok:     #4ade9e;   --ok-s:  rgba(74,222,158,.1);
  --err:    #f87171;   --err-s: rgba(248,113,113,.1);
  --warn:   #fbbf24;   --warn-s:rgba(251,191,36,.1);
  --info:   #60a5fa;   --info-s:rgba(96,165,250,.1);
  /* shadows / glow */
  --sh:  0 2px 10px rgba(0,0,10,.7), 0 1px 3px rgba(0,0,10,.5);
  --sh2: 0 10px 40px rgba(0,0,10,.85);
  --glow: 0 0 0 3px rgba(0,134,143,.22);
  /* inputs */
  --inp-bg:           #04141a;
  --inp-border:       rgba(0,134,143,.18);
  --inp-focus-border: #00868f;
}

/* ══════════ LIGHT THEME — Snow White + Navy Blue ══════════ */
body.lt {
  --bg:      #f8f9ff;   /* snow white with faint blue */
  --bg2:     #ffffff;   /* pure white surface */
  --bg3:     #eef1fc;   /* soft lavender-white panel */
  --bg4:     #e4e9f8;   /* slightly deeper lavender */
  --glass:   rgba(255,255,255,0.88);
  --glass2:  rgba(248,249,255,0.95);
  /* borders: navy-blue tint */
  --b1: rgba(2,106,112,.07);
  --b2: rgba(2,106,112,.15);
  --b3: rgba(2,106,112,.28);
  /* text */
  --t1: #021a1c;   /* deep teal-black */
  --t2: #2a6b72;   /* medium teal */
  --t3: #7ab0b4;   /* soft muted teal-grey */
  /* accent: deep teal #026a70 */
  --a1: #026a70;
  --a2: #015a60;
  --a3: #014a50;
  --ag: linear-gradient(135deg, #026a70 0%, #015a60 100%);
  /* semantic */
  --ok:     #059669;   --ok-s:  rgba(5,150,105,.1);
  --err:    #dc2626;   --err-s: rgba(220,38,38,.1);
  --warn:   #d97706;   --warn-s:rgba(217,119,6,.1);
  --info:   #2563eb;   --info-s:rgba(37,99,235,.1);
  /* shadows / glow */
  --sh:  0 1px 4px rgba(10,15,46,.08), 0 4px 16px rgba(10,15,46,.06);
  --sh2: 0 8px 32px rgba(10,15,46,.12);
  --glow: 0 0 0 3px rgba(2,106,112,.18);
  /* inputs */
  --inp-bg:           #ffffff;
  --inp-border:       rgba(2,106,112,.22);
  --inp-focus-border: #026a70;
}

html, body { min-height: 100vh; }
body {
  font-family: var(--f);
  background: var(--bg);
  color: var(--t1);
  -webkit-font-smoothing: antialiased;
  transition: background .25s, color .25s;
}

/* ── CRITICAL: inputs must always be interactive ── */
input, select, textarea, button {
  font-family: var(--f);
  position: relative;
  z-index: 1;
}
button { cursor: pointer; border: none; }
button:disabled { opacity: .5; cursor: not-allowed; }

::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--b3); border-radius: 2px; }

/* ══ LOGIN ══ */
.lp {
  min-height: 100vh;
  display: flex;
  align-items: stretch;
  background: var(--bg);
}

/* Left art panel — fully isolated with z-index */
.lp-art {
  width: 44%;
  flex-shrink: 0;
  background: var(--bg3);
  border-right: 1px solid var(--b2);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60px 44px;
  position: relative;
  overflow: hidden;
  z-index: 0;         /* stays below form side */
}

/* decorative elements never intercept clicks — pointer-events:none */
.lp-art-grid {
  position: absolute; inset: 0; pointer-events: none;
  background-image:
    linear-gradient(var(--b1) 1px, transparent 1px),
    linear-gradient(90deg, var(--b1) 1px, transparent 1px);
  background-size: 38px 38px;
  z-index: 0;
}
.lp-art-orb {
  position: absolute; border-radius: 50%;
  pointer-events: none; z-index: 0;
}
.lp-art-orb1 {
  width: 380px; height: 380px;
  top: -100px; left: -80px;
  background: radial-gradient(circle, rgba(0,134,143,.14) 0%, transparent 65%);
}
.lp-art-orb2 {
  width: 300px; height: 300px;
  bottom: -60px; right: -60px;
  background: radial-gradient(circle, rgba(79,115,245,.1) 0%, transparent 65%);
}
.lp-art-content {
  position: relative; z-index: 1; text-align: center;
  pointer-events: none; /* art content non-interactive */
}

.lp-brand {
  width: 60px; height: 60px; border-radius: 16px;
  background: var(--ag);
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; font-weight: 800; color: #000;
  margin: 0 auto 22px;
  box-shadow: 0 8px 24px rgba(52,211,153,.3);
}
body.dk .lp-brand { color: #000; }
body.lt .lp-brand { color: #fff; }

.lp-art h1 {
  font-size: 1.8rem; font-weight: 800; color: var(--t1);
  line-height: 1.2; margin-bottom: 12px;
}
.lp-art-desc {
  font-size: .86rem; color: var(--t2); line-height: 1.75;
  max-width: 260px; margin: 0 auto;
}
.lp-art-pills {
  display: flex; gap: 8px; flex-wrap: wrap;
  justify-content: center; margin-top: 32px; pointer-events: none;
}
.lp-art-pill {
  padding: 6px 14px; border-radius: 999px;
  border: 1px solid var(--b2);
  background: var(--b1);
  font-size: .72rem; font-weight: 700;
  color: var(--a1); letter-spacing: .03em;
}
.lp-art-stats {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
  margin-top: 28px; width: 100%; max-width: 260px;
}
.lp-stat {
  background: var(--glass2);
  border: 1px solid var(--b2);
  border-radius: var(--r);
  padding: 14px 12px; text-align: center;
}
.lp-stat-v { font-size: 1.5rem; font-weight: 800; color: var(--a1); line-height: 1; }
.lp-stat-l { font-size: .68rem; color: var(--t2); font-weight: 600; margin-top: 3px; text-transform: uppercase; letter-spacing: .05em; }

/* Right form side — elevated z-index ensures no overlap from art side */
.lp-form-side {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 40px;
  position: relative;
  z-index: 2;          /* above art panel */
  background: var(--bg2);
}
.lp-card { width: 100%; max-width: 400px; }
.lp-card-head { margin-bottom: 24px; }
.lp-card-head h2 { font-size: 1.45rem; font-weight: 800; color: var(--t1); margin-bottom: 4px; }
.lp-card-head p { font-size: .84rem; color: var(--t2); }

/* Role toggle */
.role-toggle {
  display: flex; background: var(--bg3); border-radius: var(--r);
  padding: 4px; border: 1px solid var(--b2); margin-bottom: 20px;
}
.role-btn {
  flex: 1; padding: 9px 14px; border-radius: 8px;
  font-size: .82rem; font-weight: 700;
  color: var(--t2); display: flex; align-items: center;
  justify-content: center; gap: 7px;
  transition: all var(--tr);
  position: relative; z-index: 1;
}
.role-btn.on { background: var(--ag); color: #000; box-shadow: 0 4px 14px rgba(52,211,153,.25); }
body.dk .role-btn.on { color: #000; }
body.lt .role-btn.on { color: #fff; }

/* Demo quick-fill */
.demo-panel {
  background: var(--bg3); border: 1px solid var(--b2);
  border-radius: var(--r); padding: 11px 12px;
  margin-bottom: 18px;
  position: relative; z-index: 1;
}
.demo-label {
  font-size: .65rem; font-weight: 800; color: var(--t3);
  text-transform: uppercase; letter-spacing: .1em;
  margin-bottom: 8px;
}
.demo-item {
  display: flex; align-items: center; gap: 9px;
  padding: 7px 8px; border-radius: 7px;
  cursor: pointer; transition: background var(--tr);
  position: relative; z-index: 1;
}
.demo-item:hover { background: var(--b2); }
.demo-av {
  width: 28px; height: 28px; border-radius: 7px;
  background: var(--ag); display: flex; align-items: center;
  justify-content: center; font-size: 10px; font-weight: 800;
  flex-shrink: 0; color: #000;
}
body.lt .demo-av { color: #fff; }
.demo-name { font-size: .8rem; font-weight: 600; color: var(--t1); }
.demo-cred { font-size: .7rem; color: var(--t3); font-family: var(--mono); margin-top: 1px; }
.demo-arr { margin-left: auto; color: var(--a1); opacity: .5; flex-shrink: 0; }
.demo-item:hover .demo-arr { opacity: 1; }

/* Fields */
.fld { display: flex; flex-direction: column; gap: 5px; margin-bottom: 13px; }
.fld label { font-size: .74rem; font-weight: 700; color: var(--t2); letter-spacing: .02em; }
.finput-wrap { position: relative; z-index: 1; }

/* THE FIX: explicit z-index and pointer-events on all inputs */
.finput {
  display: block;
  width: 100%; height: 46px;
  padding: 0 42px 0 14px;
  background: var(--inp-bg);
  border: 1px solid var(--inp-border);
  border-radius: var(--r);
  color: var(--t1);
  font-size: .9rem;
  font-family: var(--f);
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  position: relative; z-index: 2;
  pointer-events: all;
  cursor: text;
  transition: border-color var(--tr), box-shadow var(--tr);
}
.finput:focus {
  border-color: var(--inp-focus-border);
  box-shadow: var(--glow);
}
.finput::placeholder { color: var(--t3); }
.finput-ico {
  position: absolute; right: 13px; top: 50%;
  transform: translateY(-50%);
  color: var(--t3); z-index: 3;
  pointer-events: none;
  display: flex; align-items: center;
}
.finput-ico.clickable {
  pointer-events: all; cursor: pointer;
  transition: color var(--tr);
}
.finput-ico.clickable:hover { color: var(--a1); }

.login-btn {
  width: 100%; height: 48px; border-radius: var(--r);
  background: var(--ag); color: #000;
  font-size: .9rem; font-weight: 800;
  font-family: var(--f);
  transition: opacity var(--tr), transform var(--tr);
  margin-top: 2px; cursor: pointer; border: none;
  position: relative; z-index: 1;
  box-shadow: 0 6px 20px rgba(52,211,153,.25);
}
body.lt .login-btn { color: #fff; }
.login-btn:hover:not(:disabled) { opacity: .88; transform: translateY(-1px); }

.err-msg {
  display: flex; align-items: center; gap: 7px;
  padding: 9px 12px; border-radius: 8px;
  background: var(--err-s); border: 1px solid rgba(248,113,113,.2);
  color: var(--err); font-size: .82rem; margin-bottom: 10px;
}

.lp-footer { margin-top: 20px; text-align: center; font-size: .74rem; color: var(--t3); }

/* ══ SHELL ══ */
.shell { display: flex; min-height: 100vh; }

.sb {
  width: 224px; flex-shrink: 0;
  background: var(--glass);
  border-right: 1px solid var(--b2);
  display: flex; flex-direction: column;
  position: sticky; top: 0; height: 100vh;
  overflow-y: auto;
  z-index: 10;
}
.sb-hd { padding: 18px 14px 14px; border-bottom: 1px solid var(--b1); }
.sb-logo { display: flex; align-items: center; gap: 9px; }
.sb-ic {
  width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
  background: var(--ag);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 800; color: #000;
  box-shadow: 0 4px 12px rgba(52,211,153,.2);
}
body.lt .sb-ic { color: #fff; }
.sb-brand { font-size: .86rem; font-weight: 800; color: var(--t1); }
.sb-sub { font-size: .66rem; color: var(--t3); margin-top: 1px; }

.sb-nav { padding: 12px 10px; flex: 1; }
.sb-sec-lbl {
  font-size: .63rem; font-weight: 800; color: var(--t3);
  letter-spacing: .1em; text-transform: uppercase;
  padding: 0 6px; margin-bottom: 5px; margin-top: 14px;
}
.sb-sec-lbl:first-child { margin-top: 0; }

.nb {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px; border-radius: 9px;
  color: var(--t2); font-size: .83rem; font-weight: 600;
  width: 100%; text-align: left; background: none; border: none;
  cursor: pointer; transition: all var(--tr);
  position: relative; z-index: 1;
}
.nb:hover { background: var(--b1); color: var(--t1); }
.nb.on { background: var(--b2); color: var(--a1); }
.nb-pip {
  width: 4px; height: 4px; border-radius: 50%;
  background: var(--a1); margin-left: auto; flex-shrink: 0;
}

.sb-ft { padding: 10px; border-top: 1px solid var(--b1); }
.uc {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 10px; border-radius: 9px;
  background: var(--b1); margin-bottom: 7px;
}
.uc-av {
  width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
  background: var(--ag);
  display: flex; align-items: center; justify-content: center;
  font-size: 9px; font-weight: 800; color: #000;
}
body.lt .uc-av { color: #fff; }
.uc-nm { font-size: .79rem; font-weight: 700; color: var(--t1); }
.uc-rl { font-size: .67rem; color: var(--t3); text-transform: capitalize; margin-top: 1px; }
.sb-logout {
  display: flex; align-items: center; gap: 7px;
  width: 100%; padding: 8px 10px; border-radius: 9px;
  background: var(--err-s); color: var(--err);
  font-size: .81rem; font-weight: 700; font-family: var(--f);
  border: 1px solid rgba(248,113,113,.15); cursor: pointer;
  transition: opacity var(--tr);
  position: relative; z-index: 1;
}
.sb-logout:hover { opacity: .8; }

/* Main area */
.main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.topbar {
  height: 56px; display: flex; align-items: center; justify-content: space-between;
  padding: 0 22px;
  background: var(--glass); border-bottom: 1px solid var(--b1);
  position: sticky; top: 0; z-index: 20;
}
.pg-title { font-size: .95rem; font-weight: 800; color: var(--t1); }
.topbar-r { display: flex; align-items: center; gap: 8px; }

.th-btn {
  width: 33px; height: 33px; border-radius: 9px;
  background: var(--bg3); border: 1px solid var(--b2);
  display: flex; align-items: center; justify-content: center;
  color: var(--t2); cursor: pointer; transition: all var(--tr);
  position: relative; z-index: 1;
}
.th-btn:hover { color: var(--a1); border-color: var(--a1); }

.role-chip {
  padding: 3px 10px; border-radius: 999px;
  font-size: .68rem; font-weight: 800; text-transform: uppercase; letter-spacing: .05em;
}
.role-chip.admin { background: rgba(56,189,248,.12); color: var(--info); }
.role-chip.student { background: var(--ok-s); color: var(--ok); }

.content { padding: 22px; flex: 1; }

/* ══ STAT CARDS ══ */
.stat-row {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(155px,1fr));
  gap: 13px; margin-bottom: 20px;
}
.sc {
  background: var(--bg3); border: 1px solid var(--b2);
  border-radius: var(--rl); padding: 18px;
  position: relative; overflow: hidden;
  transition: transform var(--tr), box-shadow var(--tr);
}
.sc:hover { transform: translateY(-2px); box-shadow: var(--sh2); }
.sc-shine {
  position: absolute; top: -20px; right: -20px;
  width: 80px; height: 80px; border-radius: 50%;
  pointer-events: none;
}
.sc-ico {
  width: 36px; height: 36px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 13px;
}
.sc-v { font-size: 1.8rem; font-weight: 800; line-height: 1; margin-bottom: 3px; font-variant-numeric: tabular-nums; }
.sc-l { font-size: .72rem; font-weight: 600; color: var(--t2); text-transform: uppercase; letter-spacing: .05em; }

/* ══ PANELS ══ */
.panel {
  background: var(--glass); border: 1px solid var(--b2);
  border-radius: var(--rl); overflow: hidden; box-shadow: var(--sh);
}
.ph {
  padding: 16px 20px; border-bottom: 1px solid var(--b1);
  display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap;
}
.ph-t { font-size: .92rem; font-weight: 800; color: var(--t1); }
.ph-s { font-size: .73rem; color: var(--t3); margin-top: 2px; }
.pb { padding: 20px; }

/* ══ BUTTONS ══ */
.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 0 15px; height: 34px; border-radius: 9px;
  font-size: .8rem; font-weight: 700; font-family: var(--f);
  transition: all var(--tr); white-space: nowrap; cursor: pointer;
  border: none; position: relative; z-index: 1;
}
.btn-p { background: var(--ag); color: #000; box-shadow: 0 3px 12px rgba(52,211,153,.2); }
body.lt .btn-p { color: #fff; }
.btn-p:hover:not(:disabled) { opacity: .88; transform: translateY(-1px); }
.btn-s { background: var(--bg4); color: var(--t2); border: 1px solid var(--b2); }
.btn-s:hover:not(:disabled) { background: var(--b1); color: var(--t1); border-color: var(--b3); }
.btn-d { background: var(--err-s); color: var(--err); border: 1px solid rgba(248,113,113,.2); }

.ib {
  width: 31px; height: 31px; border-radius: 8px;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--b1); color: var(--t2); border: 1px solid var(--b2);
  cursor: pointer; transition: all var(--tr); flex-shrink: 0;
  position: relative; z-index: 1;
}
.ib:hover { background: var(--b2); color: var(--a1); border-color: var(--b3); }
.ib.del:hover { background: var(--err-s); color: var(--err); border-color: rgba(248,113,113,.3); }

/* ══ INPUTS (inside app) — same fix ══ */
.inp {
  display: block;
  width: 100%; height: 38px; padding: 0 11px;
  background: var(--inp-bg);
  border: 1px solid var(--inp-border);
  border-radius: var(--r);
  color: var(--t1); font-size: .84rem; font-family: var(--f);
  outline: none; appearance: none; -webkit-appearance: none;
  position: relative; z-index: 1;
  pointer-events: all; cursor: text;
  transition: border-color var(--tr), box-shadow var(--tr);
}
select.inp { cursor: pointer; }
.inp:focus { border-color: var(--inp-focus-border); box-shadow: var(--glow); }
.inp::placeholder { color: var(--t3); }
.fl { display: flex; flex-direction: column; gap: 5px; }
.fl label { font-size: .73rem; font-weight: 700; color: var(--t2); }
.fr2 { display: grid; grid-template-columns: 1fr 1fr; gap: 11px; }

/* ══ TABLE ══ */
.tw { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; min-width: 520px; }
thead th {
  padding: 8px 14px; background: var(--bg4);
  font-size: .67rem; font-weight: 800; color: var(--t3);
  text-transform: uppercase; letter-spacing: .07em;
  text-align: left; white-space: nowrap;
  border-bottom: 1px solid var(--b2);
}
tbody td {
  padding: 12px 14px; border-bottom: 1px solid var(--b1);
  font-size: .84rem; color: var(--t2); vertical-align: middle;
}
tbody tr:last-child td { border-bottom: none; }
tbody tr { transition: background var(--tr); }
tbody tr:hover td { background: var(--b1); }

/* ══ BADGES ══ */
.bdg {
  display: inline-flex; align-items: center;
  padding: 2px 8px; border-radius: 999px;
  font-size: .67rem; font-weight: 800;
}
.bdg-a { background: var(--ok-s); color: var(--ok); }
.bdg-b { background: var(--info-s); color: var(--info); }
.bdg-c { background: var(--warn-s); color: var(--warn); }
.bdg-d { background: var(--err-s); color: var(--err); }
.bdg-e { background: var(--b1); color: var(--a1); }

/* ══ PROGRESS ══ */
.prog { height: 4px; border-radius: 2px; background: var(--b2); overflow: hidden; }
.pf { height: 100%; border-radius: 2px; transition: width 500ms ease; }
.pf-a { background: var(--ok); }
.pf-b { background: var(--warn); }
.pf-c { background: var(--err); }

/* ══ TABS ══ */
.tabs { display: flex; gap: 2px; background: var(--bg4); border-radius: 10px; padding: 3px; border: 1px solid var(--b1); }
.tab {
  flex: 1; padding: 6px 10px; border-radius: 8px;
  font-size: .77rem; font-weight: 700; color: var(--t3);
  background: none; border: none; cursor: pointer;
  transition: all var(--tr); white-space: nowrap;
  position: relative; z-index: 1;
}
.tab.on { background: var(--glass2); color: var(--a1); box-shadow: var(--sh); }
.tab:hover:not(.on) { color: var(--t1); }

/* ══ MODAL ══ */
.ov {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(0,0,0,.7);
  display: grid; place-items: center; padding: 20px;
  animation: fadein .15s ease;
}
@keyframes fadein { from { opacity: 0; } to { opacity: 1; } }
.modal {
  width: min(500px, 100%);
  background: var(--bg2); border: 1px solid var(--b3);
  border-radius: var(--rl); box-shadow: var(--sh2);
  max-height: 90vh; overflow-y: auto;
  animation: slideup .18s ease;
  position: relative; z-index: 201;
}
@keyframes slideup { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.mh {
  padding: 16px 20px 13px; border-bottom: 1px solid var(--b1);
  display: flex; align-items: center; justify-content: space-between;
}
.mt { font-size: .92rem; font-weight: 800; color: var(--t1); }
.mb { padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; }
.mf { padding: 12px 20px; border-top: 1px solid var(--b1); display: flex; justify-content: flex-end; gap: 8px; }

/* ══ PROFILE ══ */
.pfg { display: grid; grid-template-columns: 236px 1fr; gap: 16px; align-items: start; }
.pf-card {
  background: var(--glass); border: 1px solid var(--b2);
  border-radius: var(--rl); padding: 24px 18px; text-align: center;
}
.pf-av {
  width: 68px; height: 68px; border-radius: 16px;
  background: var(--ag); margin: 0 auto 13px;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; font-weight: 800; color: #000;
  box-shadow: 0 6px 20px rgba(52,211,153,.2);
}
body.lt .pf-av { color: #fff; }
.pf-nm { font-size: 1rem; font-weight: 800; color: var(--t1); margin-bottom: 2px; }
.pf-rn { font-size: .73rem; color: var(--t3); font-family: var(--mono); }
.pf-st { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; margin-top: 16px; }
.pf-s { background: var(--b1); border: 1px solid var(--b2); border-radius: 9px; padding: 10px; }
.pf-sv { font-size: 1.3rem; font-weight: 800; color: var(--a1); }
.pf-sl { font-size: .64rem; color: var(--t3); font-weight: 700; text-transform: uppercase; letter-spacing: .05em; margin-top: 2px; }

/* ══ ATT / SUBJECT / COURSE ITEMS ══ */
.att-item { padding: 13px 0; border-bottom: 1px solid var(--b1); }
.att-item:last-child { border-bottom: none; }
.att-r { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.att-code { font-size: .84rem; font-weight: 700; color: var(--t1); }
.att-pct { font-size: .8rem; font-weight: 700; font-family: var(--mono); }

.sub-item {
  display: flex; align-items: center; gap: 11px;
  padding: 11px 13px; background: var(--b1);
  border: 1px solid var(--b2); border-radius: 9px;
}
.sub-code {
  padding: 3px 8px; border-radius: 5px;
  background: var(--bg4); color: var(--a1);
  font-family: var(--mono); font-size: .7rem; font-weight: 700;
  border: 1px solid var(--b3); flex-shrink: 0;
}
.sub-nm { font-size: .83rem; font-weight: 700; color: var(--t1); }
.sub-mt { font-size: .7rem; color: var(--t3); margin-top: 1px; }

.crs-item {
  display: flex; align-items: center; gap: 11px;
  padding: 11px 13px; background: var(--b1);
  border: 1px solid var(--b2); border-radius: 9px;
}
.crs-ic {
  width: 34px; height: 34px; border-radius: 8px;
  background: var(--warn-s); border: 1px solid rgba(251,191,36,.2);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; color: var(--warn);
}

/* ══ OVERVIEW DETAIL ══ */
.ov-r { display: flex; gap: 10px; align-items: flex-start; padding: 9px 0; border-bottom: 1px solid var(--b1); }
.ov-r:last-child { border-bottom: none; }
.ov-k { width: 90px; font-size: .72rem; font-weight: 700; color: var(--t3); flex-shrink: 0; text-transform: uppercase; letter-spacing: .04em; padding-top: 1px; }
.ov-v { font-size: .84rem; color: var(--t1); }

/* ══ EMPTY ══ */
.empty { padding: 48px 24px; text-align: center; color: var(--t3); }
.empty p { font-size: .84rem; margin-top: 10px; }

/* ══ SEARCH ══ */
.sw { position: relative; }
.sw-ic { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--t3); pointer-events: none; z-index: 2; }
.sw .inp { padding-left: 32px; }

/* ══ DASHBOARD HINT CARDS ══ */
.hint-card {
  display: flex; gap: 12px; align-items: flex-start;
  padding: 13px; background: var(--b1);
  border: 1px solid var(--b2); border-radius: 10px;
}
.hint-ic {
  width: 32px; height: 32px; border-radius: 8px;
  background: var(--b2); display: flex; align-items: center;
  justify-content: center; color: var(--a1); flex-shrink: 0;
}
.hint-t { font-size: .84rem; font-weight: 700; color: var(--t1); margin-bottom: 2px; }
.hint-d { font-size: .76rem; color: var(--t2); line-height: 1.6; }

/* ══ RESPONSIVE ══ */
@media (max-width: 860px) {
  .lp-art { display: none; }
  .lp-form-side { padding: 36px 24px; }
  .pfg { grid-template-columns: 1fr; }
  .sb { width: 194px; }
}
@media (max-width: 600px) {
  .shell { flex-direction: column; }
  .sb { width: 100%; height: auto; position: static; flex-direction: row; flex-wrap: wrap; padding: 8px; z-index: 5; }
  .sb-hd, .sb-ft { display: none; }
  .sb-nav { padding: 4px; display: flex; flex-wrap: wrap; gap: 2px; }
  .sb-sec-lbl { display: none; }
  .nb { padding: 7px 10px; font-size: .78rem; }
  .content { padding: 14px; }
  .fr2 { grid-template-columns: 1fr; }
  .stat-row { grid-template-columns: 1fr 1fr; }
}
`;

function StyleTag() {
  useEffect(() => {
    let t = document.getElementById("sms-styles");
    if (!t) { t = document.createElement("style"); t.id = "sms-styles"; document.head.appendChild(t); }
    t.textContent = CSS;
  }, []);
  return null;
}

// ─── Login Page ───────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("sms-theme") || "dk");
  const [role, setRole]   = useState("admin");
  const [user, setUser]   = useState("");
  const [pass, setPass]   = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]    = useState("");

  useEffect(() => { document.body.className = theme; localStorage.setItem("sms-theme", theme); }, [theme]);

  function pickRole(r) {
    setRole(r); setError(""); setUser(""); setPass("");
  }

  async function submit(e) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const d = await apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ username: user, password: pass }) });
      onLogin(d.token, d.user);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="lp">
      {/* Left art panel */}
      <div className="lp-art">
        <div className="lp-art-grid" />
        <div className="lp-art-orb lp-art-orb1" />
        <div className="lp-art-orb lp-art-orb2" />
        <div className="lp-art-content">
          <div className="lp-brand">AP</div>
          <h1>AcadPortal<br/>Management</h1>
          <p className="lp-art-desc">A complete student information system for modern academic institutions.</p>
          <div className="lp-art-pills">
            {["Attendance", "CGPA Tracking", "Enrollments", "Courses", "Roles"].map(l => (
              <span key={l} className="lp-art-pill">{l}</span>
            ))}
          </div>
          <div className="lp-art-stats">
            <div className="lp-stat"><div className="lp-stat-v">10</div><div className="lp-stat-l">Students</div></div>
            <div className="lp-stat"><div className="lp-stat-v">10</div><div className="lp-stat-l">Subjects</div></div>
            <div className="lp-stat"><div className="lp-stat-v">4</div><div className="lp-stat-l">Depts.</div></div>
            <div className="lp-stat"><div className="lp-stat-v">JWT</div><div className="lp-stat-l">Auth</div></div>
          </div>
        </div>
      </div>

      {/* Right form side — z-index: 2 ensures no overlap */}
      <div className="lp-form-side">
        <div className="lp-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div className="lp-card-head" style={{ marginBottom: 0 }}>
              <h2>Sign in</h2>
              <p>Access your AcadPortal dashboard</p>
            </div>
            <button className="th-btn" onClick={() => setTheme(t => t === "dk" ? "lt" : "dk")} title="Toggle theme">
              <Ic d={theme === "dk" ? P.sun : P.moon} s={14} />
            </button>
          </div>

          {/* Role toggle */}
          <div className="role-toggle">
            <button type="button" className={`role-btn ${role === "admin" ? "on" : ""}`} onClick={() => pickRole("admin")}>
              <Ic d={P.shield} s={13} /> Admin
            </button>
            <button type="button" className={`role-btn ${role === "student" ? "on" : ""}`} onClick={() => pickRole("student")}>
              <Ic d={P.grad} s={13} /> Student
            </button>
          </div>

          {/* Form */}
          <form onSubmit={submit} style={{ position: "relative", zIndex: 1 }}>
            <div className="fld">
              <label htmlFor="lp-user">{role === "admin" ? "Username" : "Register No. (lowercase)"}</label>
              <div className="finput-wrap">
                <input
                  id="lp-user"
                  className="finput"
                  placeholder={role === "admin" ? "admin" : "cs2021001"}
                  value={user}
                  onChange={e => setUser(e.target.value)}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                />
                <span className="finput-ico"><Ic d={P.user} s={14} /></span>
              </div>
            </div>

            <div className="fld">
              <label htmlFor="lp-pass">Password</label>
              <div className="finput-wrap">
                <input
                  id="lp-pass"
                  className="finput"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                  autoComplete="off"
                />
                <span className="finput-ico clickable" onClick={() => setShowPw(v => !v)}>
                  <Ic d={showPw ? P.eyeoff : P.eye} s={14} />
                </span>
              </div>
            </div>

            {error && <div className="err-msg"><Ic d={P.alert} s={14} />{error}</div>}

            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? "Signing in…" : `Sign in as ${role === "admin" ? "Admin" : "Student"}`}
            </button>
          </form>

          <p className="lp-footer">Student credentials: regno lowercase as both username &amp; password</p>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ token }) {
  const [stats, setStats] = useState(null);
  useEffect(() => { apiFetch("/dashboard/stats", {}, token).then(setStats).catch(() => {}); }, [token]);
  if (!stats) return <div className="empty"><p>Loading…</p></div>;

  const cards = [
    { l: "Total Students", v: stats.total_students,    ic: P.users, col: "var(--ok)",   bg: "var(--ok-s)" },
    { l: "Average CGPA",   v: stats.avg_cgpa,          ic: P.chart, col: "var(--info)", bg: "var(--info-s)" },
    { l: "Final Year",     v: stats.final_year_students,ic: P.grad, col: "var(--warn)", bg: "var(--warn-s)" },
    { l: "Subjects",       v: stats.total_subjects,    ic: P.book,  col: "var(--a1)",   bg: "var(--b2)" },
    { l: "Enrollments",    v: stats.total_enrollments, ic: P.clip,  col: "var(--ok)",   bg: "var(--ok-s)" },
  ];

  const hints = [
    ["Students", "Add, edit, view and delete student records. Click a row to view the full profile.", P.users],
    ["Subjects & Enrollment", "Create subjects and enroll students. Grades can be assigned per enrollment.", P.book],
    ["Attendance", "Mark daily per-subject attendance. Green ≥75%, amber ≥50%, red below.", P.clip],
    ["Completed Courses", "Log extra courses with grades and credits. Shown on student profile.", P.award],
  ];

  return (
    <div>
      <div className="stat-row">
        {cards.map(c => (
          <div className="sc" key={c.l}>
            <div className="sc-shine" style={{ background: `radial-gradient(circle, ${c.bg} 0%, transparent 70%)` }} />
            <div className="sc-ico" style={{ background: c.bg, color: c.col }}><Ic d={c.ic} s={17} /></div>
            <div className="sc-v" style={{ color: c.col }}>{c.v}</div>
            <div className="sc-l">{c.l}</div>
          </div>
        ))}
      </div>
      <div className="panel">
        <div className="ph"><div><div className="ph-t">Quick Guide</div><div className="ph-s">What you can do as admin</div></div></div>
        <div className="pb" style={{ display: "grid", gap: 10 }}>
          {hints.map(([t, d, ic]) => (
            <div key={t} className="hint-card">
              <div className="hint-ic"><Ic d={ic} s={15} /></div>
              <div><div className="hint-t">{t}</div><div className="hint-d">{d}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Shared field helpers (defined outside any component so they are stable) ───
function MField({ lbl, fkey, type = "text", ph = "", form, onChange }) {
  return (
    <div className="fl">
      <label htmlFor={`sf-${fkey}`}>{lbl}</label>
      <input
        id={`sf-${fkey}`}
        className="inp"
        type={type}
        placeholder={ph}
        value={form[fkey]}
        onChange={e => onChange(fkey, e.target.value)}
        autoComplete="off"
      />
    </div>
  );
}
function MSelect({ lbl, fkey, opts, form, onChange }) {
  return (
    <div className="fl">
      <label htmlFor={`sf-${fkey}`}>{lbl}</label>
      <select
        id={`sf-${fkey}`}
        className="inp"
        value={form[fkey]}
        onChange={e => onChange(fkey, e.target.value)}
      >
        {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );
}

// ─── Student Modal ────────────────────────────────────────────────────────────
function StudentModal({ student, onClose, onSaved, token, mode }) {
  const isEdit = mode === "edit";
  const blank = { regno: "", name: "", age: "", cgpa: "", year: "1", semester: "1", email: "", phone: "", department: "", address: "" };
  const [form, setForm] = useState(student
    ? { ...student, age: String(student.age), year: String(student.year), semester: String(student.semester) }
    : blank);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [creds, setCreds] = useState(null); // { username, password } shown after add

  const sf = useCallback((k, v) => setForm(p => ({ ...p, [k]: v })), []);

  async function save() {
    setSaving(true); setErr("");
    try {
      if (isEdit) {
        await apiFetch(`/students/${student.id}`, { method: "PATCH", body: JSON.stringify(form) }, token);
        onSaved();
      } else {
        const res = await apiFetch("/students", { method: "POST", body: JSON.stringify({ students: [{ ...form, age: +form.age, year: +form.year }] }) }, token);
        const added = res.added?.[0];
        setCreds({ username: added?.login_username || form.regno.toLowerCase(), password: added?.login_password || form.regno.toLowerCase() });
        onSaved();
      }
    } catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  }

  return (
    <div className="ov" onClick={creds ? undefined : onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="mh">
          <span className="mt">{creds ? "Student Added" : isEdit ? "Edit Student" : "Add Student"}</span>
          <button className="ib" onClick={onClose}><Ic d={P.x} s={13} /></button>
        </div>

        {creds ? (
          <div className="mb">
            <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--ok-s)", border: "1px solid var(--ok)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <Ic d={P.check2} s={22} c="var(--ok)" />
              </div>
              <div style={{ fontWeight: 700, fontSize: ".95rem", color: "var(--t1)", marginBottom: 4 }}>Account created successfully</div>
              <div style={{ fontSize: ".8rem", color: "var(--t2)" }}>Share these login credentials with the student</div>
            </div>
            <div style={{ background: "var(--bg3)", border: "1px solid var(--b3)", borderRadius: 10, padding: "16px 18px", display: "grid", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: ".75rem", fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: ".05em" }}>Username</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: ".88rem", color: "var(--a1)", fontWeight: 600 }}>{creds.username}</span>
              </div>
              <div style={{ height: 1, background: "var(--b1)" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: ".75rem", fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: ".05em" }}>Password</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: ".88rem", color: "var(--a1)", fontWeight: 600 }}>{creds.password}</span>
              </div>
            </div>
            <p style={{ fontSize: ".76rem", color: "var(--t3)", textAlign: "center", lineHeight: 1.6 }}>Password is the registration number in lowercase.<br/>The student can log in immediately.</p>
          </div>
        ) : (
        <div className="mb">
          <div className="fr2">
            <MField lbl="Register No." fkey="regno" ph="CS2021001" form={form} onChange={sf} />
            <MField lbl="Full Name" fkey="name" ph="Ananya Sharma" form={form} onChange={sf} />
          </div>
          <div className="fr2">
            <MField lbl="Age" fkey="age" type="number" ph="20" form={form} onChange={sf} />
            <MField lbl="CGPA" fkey="cgpa" type="number" ph="8.5" form={form} onChange={sf} />
          </div>
          <div className="fr2">
            <MSelect lbl="Year" fkey="year" opts={[1,2,3,4].map(y => ({ v: y, l: `Year ${y}` }))} form={form} onChange={sf} />
            <MSelect lbl="Semester" fkey="semester" opts={[1,2,3,4,5,6,7,8].map(s => ({ v: s, l: `Sem ${s}` }))} form={form} onChange={sf} />
          </div>
          <div className="fr2">
            <MField lbl="Email" fkey="email" type="email" form={form} onChange={sf} />
            <MField lbl="Phone" fkey="phone" form={form} onChange={sf} />
          </div>
          <MField lbl="Department" fkey="department" ph="Computer Science" form={form} onChange={sf} />
          <MField lbl="Address" fkey="address" ph="123 Street, City" form={form} onChange={sf} />
          {err && <div className="err-msg"><Ic d={P.alert} s={13} />{err}</div>}
        </div>
        )}

        <div className="mf">
          {creds ? (
            <button className="btn btn-p" onClick={onClose}>Done</button>
          ) : (
            <><button className="btn btn-s" onClick={onClose}>Cancel</button>
            <button className="btn btn-p" onClick={save} disabled={saving}>{saving ? "Saving…" : isEdit ? "Save Changes" : "Add Student"}</button></>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Students Page ────────────────────────────────────────────────────────────
function StudentsPage({ token, isAdmin }) {
  const [students, setStudents] = useState([]);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("name");
  const [modal, setModal] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await apiFetch("/students", {}, token); setStudents(d.students); } catch {}
    finally { setLoading(false); }
  }, [token]);
  useEffect(() => { load(); }, [load]);

  async function del(s) {
    if (!confirm(`Delete ${s.name}?`)) return;
    try { await apiFetch(`/students/${s.id}`, { method: "DELETE" }, token); load(); } catch (e) { alert(e.message); }
  }

  const list = useMemo(() => {
    const qq = q.toLowerCase();
    return students
      .filter(s => !qq || [s.name, s.regno, s.department].join(" ").toLowerCase().includes(qq))
      .sort((a, b) => sort === "cgpa" ? +b.cgpa - +a.cgpa : sort === "year" ? a.year - b.year : sort === "regno" ? a.regno.localeCompare(b.regno) : a.name.localeCompare(b.name));
  }, [students, q, sort]);

  const cgBdg = v => +v >= 8.5 ? "bdg-a" : +v >= 7 ? "bdg-c" : "bdg-d";

  if (detail) return <ProfilePage student={detail} token={token} isAdmin={isAdmin} onBack={() => { setDetail(null); load(); }} />;

  return (
    <div>
      <div className="panel">
        <div className="ph">
          <div><div className="ph-t">All Students</div><div className="ph-s">{students.length} records</div></div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <div className="sw" style={{ width: 190 }}>
              <span className="sw-ic"><Ic d={P.srch} s={13} /></span>
              <input className="inp" style={{ paddingLeft: 30 }} placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} />
            </div>
            <select className="inp" style={{ width: 130 }} value={sort} onChange={e => setSort(e.target.value)}>
              <option value="name">Name</option>
              <option value="regno">Reg No</option>
              <option value="cgpa">CGPA ↓</option>
              <option value="year">Year</option>
            </select>
            {isAdmin && (
              <button className="btn btn-p" onClick={() => setModal({ mode: "add", s: null })}>
                <Ic d={P.plus} s={13} /> Add Student
              </button>
            )}
          </div>
        </div>
        <div className="tw">
          {loading ? <div className="empty"><p>Loading…</p></div> : list.length === 0
            ? <div className="empty"><Ic d={P.users} s={34} /><p>No students found</p></div>
            : (
              <table>
                <thead>
                  <tr>
                    <th>Student</th><th>Department</th><th>Year</th>
                    <th>CGPA</th><th>Attendance</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--ag)", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontSize: 10, fontWeight: 800, flexShrink: 0 }}>
                            {ini(s.name)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: ".84rem", color: "var(--t1)" }}>{s.name}</div>
                            <div style={{ fontSize: ".7rem", color: "var(--t3)", fontFamily: "var(--mono)" }}>{s.regno}</div>
                          </div>
                        </div>
                      </td>
                      <td>{s.department || <span style={{ color: "var(--t3)" }}>—</span>}</td>
                      <td><span className="bdg bdg-b">Y{s.year}·S{s.semester}</span></td>
                      <td><span className={`bdg ${cgBdg(s.cgpa)}`}>{s.cgpa}</span></td>
                      <td>
                        <div style={{ minWidth: 80 }}>
                          <span style={{ fontSize: ".7rem", fontFamily: "var(--mono)", fontWeight: 700, color: s.attendance_percentage >= 75 ? "var(--ok)" : "var(--err)" }}>
                            {s.attendance_percentage}%
                          </span>
                          <div className="prog" style={{ marginTop: 3 }}>
                            <div className={`pf ${s.attendance_percentage >= 75 ? "pf-a" : s.attendance_percentage >= 50 ? "pf-b" : "pf-c"}`}
                              style={{ width: `${s.attendance_percentage}%` }} />
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 5 }}>
                          <button className="ib" title="View" onClick={() => setDetail(s)}><Ic d={P.user} s={12} /></button>
                          {isAdmin && <>
                            <button className="ib" title="Edit" onClick={() => setModal({ mode: "edit", s })}><Ic d={P.edit} s={12} /></button>
                            <button className="ib del" title="Delete" onClick={() => del(s)}><Ic d={P.trash} s={12} /></button>
                          </>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>
      </div>
      {modal && (
        <StudentModal mode={modal.mode} student={modal.s} token={token}
          onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); }} />
      )}
    </div>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────
function ProfilePage({ student, token, isAdmin, onBack }) {
  const [tab, setTab] = useState("overview");
  const [att, setAtt] = useState([]);
  const [enr, setEnr] = useState([]);
  const [cmp, setCmp] = useState([]);
  const [subs, setSubs] = useState([]);
  const [aModal, setAModal] = useState(false);
  const [eModal, setEModal] = useState(false);
  const [cModal, setCModal] = useState(false);

  const load = useCallback(async () => {
    const id = student.id;
    const [a, e, c, s] = await Promise.all([
      apiFetch(`/students/${id}/attendance`, {}, token).catch(() => ({ attendance: [] })),
      apiFetch(`/students/${id}/enrollments`, {}, token).catch(() => ({ enrollments: [] })),
      apiFetch(`/students/${id}/completed-courses`, {}, token).catch(() => ({ completed_courses: [] })),
      isAdmin ? apiFetch("/subjects", {}, token).catch(() => ({ subjects: [] })) : Promise.resolve({ subjects: [] }),
    ]);
    setAtt(a.attendance); setEnr(e.enrollments); setCmp(c.completed_courses); setSubs(s.subjects);
  }, [student.id, token, isAdmin]);
  useEffect(() => { load(); }, [load]);

  const TABS = ["overview", "attendance", "subjects", "completed"];

  return (
    <div>
      {onBack && (
        <button className="btn btn-s" style={{ marginBottom: 14 }} onClick={onBack}>
          <Ic d={P.back} s={13} /> Back
        </button>
      )}
      <div className="pfg">
        {/* Side card */}
        <div className="pf-card">
          <div className="pf-av">{ini(student.name)}</div>
          <div className="pf-nm">{student.name}</div>
          <div className="pf-rn">{student.regno}</div>
          <div style={{ marginTop: 8, display: "flex", justifyContent: "center" }}>
            <span className="bdg bdg-b">Year {student.year} · Sem {student.semester}</span>
          </div>
          {student.department && (
            <div style={{ marginTop: 9, padding: "5px 10px", background: "var(--b1)", border: "1px solid var(--b2)", borderRadius: 7, fontSize: ".73rem", color: "var(--t2)" }}>
              {student.department}
            </div>
          )}
          <div className="pf-st">
            <div className="pf-s"><div className="pf-sv">{student.cgpa}</div><div className="pf-sl">CGPA</div></div>
            <div className="pf-s">
              <div className="pf-sv" style={{ color: student.attendance_percentage >= 75 ? "var(--ok)" : "var(--err)" }}>{student.attendance_percentage}%</div>
              <div className="pf-sl">Attend.</div>
            </div>
            <div className="pf-s"><div className="pf-sv">{enr.length}</div><div className="pf-sl">Enrolled</div></div>
            <div className="pf-s"><div className="pf-sv">{cmp.length}</div><div className="pf-sl">Done</div></div>
          </div>
          {student.email && <div style={{ marginTop: 10, fontSize: ".72rem", color: "var(--t3)" }}>{student.email}</div>}
          {student.phone && <div style={{ fontSize: ".72rem", color: "var(--t3)", marginTop: 2 }}>{student.phone}</div>}
        </div>

        {/* Tab panel */}
        <div className="panel">
          <div className="ph" style={{ gap: 8 }}>
            <div className="tabs" style={{ flex: 1 }}>
              {TABS.map(t => (
                <button key={t} className={`tab ${tab === t ? "on" : ""}`} onClick={() => setTab(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            {isAdmin && tab === "attendance" && <button className="btn btn-p" onClick={() => setAModal(true)}><Ic d={P.plus} s={12} />Mark</button>}
            {isAdmin && tab === "subjects"   && <button className="btn btn-p" onClick={() => setEModal(true)}><Ic d={P.plus} s={12} />Enroll</button>}
            {isAdmin && tab === "completed"  && <button className="btn btn-p" onClick={() => setCModal(true)}><Ic d={P.plus} s={12} />Add</button>}
          </div>
          <div className="pb">
            {tab === "overview" && (
              <div>
                {[["Age", student.age], ["Email", student.email || "—"], ["Phone", student.phone || "—"], ["Dept.", student.department || "—"], ["Address", student.address || "—"]].map(([k, v]) => (
                  <div key={k} className="ov-r"><span className="ov-k">{k}</span><span className="ov-v">{v}</span></div>
                ))}
              </div>
            )}
            {tab === "attendance" && (
              att.length === 0
                ? <div className="empty"><Ic d={P.clip} s={32} /><p>No attendance recorded yet</p></div>
                : att.map(s => (
                  <div key={s.subject_code} className="att-item">
                    <div className="att-r">
                      <span className="att-code">{s.subject_code}</span>
                      <span className="att-pct" style={{ color: s.percentage >= 75 ? "var(--ok)" : s.percentage >= 50 ? "var(--warn)" : "var(--err)" }}>{s.percentage}%</span>
                    </div>
                    <div className="prog"><div className={`pf ${s.percentage >= 75 ? "pf-a" : s.percentage >= 50 ? "pf-b" : "pf-c"}`} style={{ width: `${s.percentage}%` }} /></div>
                    <div style={{ marginTop: 4, fontSize: ".7rem", color: "var(--t3)" }}>{s.present} present · {s.absent} absent · {s.total} classes</div>
                  </div>
                ))
            )}
            {tab === "subjects" && (
              enr.length === 0
                ? <div className="empty"><Ic d={P.book} s={32} /><p>No subjects enrolled</p></div>
                : <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {enr.map(e => (
                      <div key={e.id} className="sub-item">
                        <span className="sub-code">{e.subject?.code}</span>
                        <div style={{ flex: 1 }}>
                          <div className="sub-nm">{e.subject?.name}</div>
                          <div className="sub-mt">{e.subject?.department} · {e.subject?.credits} credits</div>
                        </div>
                        {e.grade && <span className="bdg bdg-a">{e.grade}</span>}
                        {isAdmin && (
                          <button className="ib del" onClick={async () => { await apiFetch(`/students/${student.id}/enrollments/${e.id}`, { method: "DELETE" }, token); load(); }}>
                            <Ic d={P.trash} s={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
            )}
            {tab === "completed" && (
              cmp.length === 0
                ? <div className="empty"><Ic d={P.award} s={32} /><p>No completed courses</p></div>
                : <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {cmp.map(c => (
                      <div key={c.id} className="crs-item">
                        <div className="crs-ic"><Ic d={P.award} s={16} /></div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: ".84rem", color: "var(--t1)" }}>{c.course_name}</div>
                          <div style={{ fontSize: ".7rem", color: "var(--t3)", marginTop: 1 }}>{c.completion_date} · {c.credits} credits</div>
                        </div>
                        {c.grade && <span className="bdg bdg-c">{c.grade}</span>}
                        {isAdmin && (
                          <button className="ib del" onClick={async () => { await apiFetch(`/students/${student.id}/completed-courses/${c.id}`, { method: "DELETE" }, token); load(); }}>
                            <Ic d={P.trash} s={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
            )}
          </div>
        </div>
      </div>

      {aModal && <AttModal student={student} token={token} subjects={subs} onClose={() => setAModal(false)} onSaved={() => { setAModal(false); load(); }} />}
      {eModal && <EnrModal student={student} token={token} subjects={subs} enrolled={enr} onClose={() => setEModal(false)} onSaved={() => { setEModal(false); load(); }} />}
      {cModal && <CrsModal student={student} token={token} onClose={() => setCModal(false)} onSaved={() => { setCModal(false); load(); }} />}
    </div>
  );
}

// ─── Small modals ─────────────────────────────────────────────────────────────
function AttModal({ student, token, subjects, onClose, onSaved }) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({ subject_code: subjects[0]?.code || "", date: today, status: "present" });
  const sf = (k, v) => setForm(p => ({ ...p, [k]: v }));
  async function save() {
    try { await apiFetch(`/students/${student.id}/attendance`, { method: "POST", body: JSON.stringify({ records: [form] }) }, token); onSaved(); }
    catch (e) { alert(e.message); }
  }
  return (
    <div className="ov" onClick={onClose}><div className="modal" onClick={e => e.stopPropagation()}>
      <div className="mh"><span className="mt">Mark Attendance</span><button className="ib" onClick={onClose}><Ic d={P.x} s={13} /></button></div>
      <div className="mb">
        <div className="fl"><label>Subject</label>
          {subjects.length > 0
            ? <select className="inp" value={form.subject_code} onChange={e => sf("subject_code", e.target.value)}>
                {subjects.map(s => <option key={s.code} value={s.code}>{s.code} — {s.name}</option>)}
              </select>
            : <input className="inp" placeholder="CS301" value={form.subject_code} onChange={e => sf("subject_code", e.target.value)} />}
        </div>
        <div className="fr2">
          <div className="fl"><label>Date</label><input className="inp" type="date" value={form.date} onChange={e => sf("date", e.target.value)} /></div>
          <div className="fl"><label>Status</label>
            <select className="inp" value={form.status} onChange={e => sf("status", e.target.value)}>
              <option value="present">Present</option><option value="absent">Absent</option>
            </select>
          </div>
        </div>
      </div>
      <div className="mf"><button className="btn btn-s" onClick={onClose}>Cancel</button><button className="btn btn-p" onClick={save}>Mark</button></div>
    </div></div>
  );
}

function EnrModal({ student, token, subjects, enrolled, onClose, onSaved }) {
  const ids = new Set(enrolled.map(e => e.subject?.id));
  const avail = subjects.filter(s => !ids.has(s.id));
  const [sel, setSel] = useState(avail[0]?.id || "");
  async function save() {
    try { await apiFetch(`/students/${student.id}/enrollments`, { method: "POST", body: JSON.stringify({ subject_id: sel }) }, token); onSaved(); }
    catch (e) { alert(e.message); }
  }
  return (
    <div className="ov" onClick={onClose}><div className="modal" onClick={e => e.stopPropagation()}>
      <div className="mh"><span className="mt">Enroll in Subject</span><button className="ib" onClick={onClose}><Ic d={P.x} s={13} /></button></div>
      <div className="mb">
        {avail.length === 0
          ? <p style={{ color: "var(--t2)", fontSize: ".84rem" }}>All subjects already enrolled.</p>
          : <div className="fl"><label>Select Subject</label>
              <select className="inp" value={sel} onChange={e => setSel(e.target.value)}>
                {avail.map(s => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}
              </select>
            </div>}
      </div>
      <div className="mf"><button className="btn btn-s" onClick={onClose}>Cancel</button><button className="btn btn-p" onClick={save} disabled={!avail.length}>Enroll</button></div>
    </div></div>
  );
}

function CrsModal({ student, token, onClose, onSaved }) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({ course_name: "", completion_date: today, grade: "", credits: "3" });
  const sf = (k, v) => setForm(p => ({ ...p, [k]: v }));
  async function save() {
    try { await apiFetch(`/students/${student.id}/completed-courses`, { method: "POST", body: JSON.stringify(form) }, token); onSaved(); }
    catch (e) { alert(e.message); }
  }
  return (
    <div className="ov" onClick={onClose}><div className="modal" onClick={e => e.stopPropagation()}>
      <div className="mh"><span className="mt">Add Completed Course</span><button className="ib" onClick={onClose}><Ic d={P.x} s={13} /></button></div>
      <div className="mb">
        <div className="fl"><label>Course Name</label><input className="inp" placeholder="Data Structures" value={form.course_name} onChange={e => sf("course_name", e.target.value)} /></div>
        <div className="fr2">
          <div className="fl"><label>Completion Date</label><input className="inp" type="date" value={form.completion_date} onChange={e => sf("completion_date", e.target.value)} /></div>
          <div className="fl"><label>Grade</label><input className="inp" placeholder="A+" value={form.grade} onChange={e => sf("grade", e.target.value)} /></div>
        </div>
        <div className="fl"><label>Credits</label><input className="inp" type="number" value={form.credits} onChange={e => sf("credits", e.target.value)} /></div>
      </div>
      <div className="mf"><button className="btn btn-s" onClick={onClose}>Cancel</button><button className="btn btn-p" onClick={save}>Add</button></div>
    </div></div>
  );
}

// ─── Subjects Page ────────────────────────────────────────────────────────────
function SubjectsPage({ token, isAdmin }) {
  const [subs, setSubs] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", department: "", credits: "3", year: "1", semester: "1" });
  const sf = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const load = useCallback(async () => {
    const d = await apiFetch("/subjects", {}, token).catch(() => ({ subjects: [] }));
    setSubs(d.subjects);
  }, [token]);
  useEffect(() => { load(); }, [load]);

  async function add() {
    try { await apiFetch("/subjects", { method: "POST", body: JSON.stringify({ ...form, credits: +form.credits, year: +form.year }) }, token); setModal(false); setForm({ code: "", name: "", department: "", credits: "3", year: "1", semester: "1" }); load(); }
    catch (e) { alert(e.message); }
  }
  async function del(id) {
    if (!confirm("Delete subject?")) return;
    await apiFetch(`/subjects/${id}`, { method: "DELETE" }, token); load();
  }

  return (
    <div>
      <div className="panel">
        <div className="ph">
          <div><div className="ph-t">Subjects</div><div className="ph-s">{subs.length} subjects</div></div>
          {isAdmin && <button className="btn btn-p" onClick={() => setModal(true)}><Ic d={P.plus} s={13} />Add</button>}
        </div>
        <div className="tw">
          {subs.length === 0
            ? <div className="empty"><Ic d={P.book} s={32} /><p>No subjects yet</p></div>
            : <table>
                <thead><tr><th>Code</th><th>Name</th><th>Dept.</th><th>Credits</th><th>Year/Sem</th>{isAdmin && <th></th>}</tr></thead>
                <tbody>
                  {subs.map(s => (
                    <tr key={s.id}>
                      <td><span style={{ fontFamily: "var(--mono)", fontSize: ".72rem", color: "var(--a1)", background: "var(--b1)", padding: "2px 7px", borderRadius: 5, border: "1px solid var(--b3)" }}>{s.code}</span></td>
                      <td style={{ fontWeight: 700, color: "var(--t1)" }}>{s.name}</td>
                      <td>{s.department || "—"}</td>
                      <td><span className="bdg bdg-b">{s.credits} cr</span></td>
                      <td><span className="bdg bdg-e">Y{s.year}·S{s.semester}</span></td>
                      {isAdmin && <td><button className="ib del" onClick={() => del(s.id)}><Ic d={P.trash} s={12} /></button></td>}
                    </tr>
                  ))}
                </tbody>
              </table>}
        </div>
      </div>
      {modal && (
        <div className="ov" onClick={() => setModal(false)}><div className="modal" onClick={e => e.stopPropagation()}>
          <div className="mh"><span className="mt">Add Subject</span><button className="ib" onClick={() => setModal(false)}><Ic d={P.x} s={13} /></button></div>
          <div className="mb">
            <div className="fr2">
              <div className="fl"><label>Code</label><input className="inp" placeholder="CS301" value={form.code} onChange={e => sf("code", e.target.value)} /></div>
              <div className="fl"><label>Name</label><input className="inp" placeholder="Data Structures" value={form.name} onChange={e => sf("name", e.target.value)} /></div>
            </div>
            <div className="fr2">
              <div className="fl"><label>Department</label><input className="inp" value={form.department} onChange={e => sf("department", e.target.value)} /></div>
              <div className="fl"><label>Credits</label><input className="inp" type="number" value={form.credits} onChange={e => sf("credits", e.target.value)} /></div>
            </div>
            <div className="fr2">
              <div className="fl"><label>Year</label><select className="inp" value={form.year} onChange={e => sf("year", e.target.value)}>{[1,2,3,4].map(y=><option key={y} value={y}>Year {y}</option>)}</select></div>
              <div className="fl"><label>Sem</label><select className="inp" value={form.semester} onChange={e => sf("semester", e.target.value)}>{[1,2,3,4,5,6,7,8].map(s=><option key={s} value={s}>Sem {s}</option>)}</select></div>
            </div>
          </div>
          <div className="mf"><button className="btn btn-s" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-p" onClick={add}>Add Subject</button></div>
        </div></div>
      )}
    </div>
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────
function AppShell({ user, token, onLogout }) {
  const isAdmin = user.role === "admin";
  const [theme, setTheme] = useState(() => localStorage.getItem("sms-theme") || "dk");
  const [page, setPage]   = useState(isAdmin ? "dashboard" : "profile");

  useEffect(() => { document.body.className = theme; localStorage.setItem("sms-theme", theme); }, [theme]);

  const nav = isAdmin
    ? [{ id: "dashboard", l: "Dashboard", ic: P.home }, { id: "students", l: "Students", ic: P.users }, { id: "subjects", l: "Subjects", ic: P.book }]
    : [{ id: "profile", l: "My Profile", ic: P.user }, { id: "subjects", l: "Subjects", ic: P.book }];

  const titles = { dashboard: "Dashboard", students: "Students", subjects: "Subjects", profile: "My Profile" };

  return (
    <div className="shell">
      <aside className="sb">
        <div className="sb-hd">
          <div className="sb-logo">
            <div className="sb-ic">AP</div>
            <div><div className="sb-brand">AcadPortal</div><div className="sb-sub">Management System</div></div>
          </div>
        </div>
        <nav className="sb-nav">
          <div className="sb-sec-lbl">Menu</div>
          {nav.map(n => (
            <button key={n.id} className={`nb ${page === n.id ? "on" : ""}`} onClick={() => setPage(n.id)}>
              <Ic d={n.ic} s={14} />{n.l}
              {page === n.id && <span className="nb-pip" />}
            </button>
          ))}
        </nav>
        <div className="sb-ft">
          <div className="uc">
            <div className="uc-av">{ini(user.username)}</div>
            <div><div className="uc-nm">{user.username}</div><div className="uc-rl">{user.role}</div></div>
          </div>
          <button className="sb-logout" onClick={onLogout}><Ic d={P.out} s={13} />Sign Out</button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <span className="pg-title">{titles[page]}</span>
          <div className="topbar-r">
            <span className={`role-chip ${user.role}`}>{user.role}</span>
            <button className="th-btn" onClick={() => setTheme(t => t === "dk" ? "lt" : "dk")} title="Toggle theme">
              <Ic d={theme === "dk" ? P.sun : P.moon} s={14} />
            </button>
          </div>
        </header>
        <main className="content">
          {page === "dashboard" && isAdmin && <Dashboard token={token} />}
          {page === "students"  && <StudentsPage token={token} isAdmin={isAdmin} />}
          {page === "subjects"  && <SubjectsPage token={token} isAdmin={isAdmin} />}
          {page === "profile"   && !isAdmin && user.student
            ? <ProfilePage student={user.student} token={token} isAdmin={false} onBack={null} />
            : page === "profile" && !isAdmin && <div className="empty"><p>No student record linked.</p></div>}
        </main>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function SMSApp() {
  const [token, setToken] = useState(null);
  const [user, setUser]   = useState(null);

  useEffect(() => {
    document.body.className = localStorage.getItem("sms-theme") || "dk";
  }, []);

  function login(tok, usr) {
    setToken(tok); setUser(usr);
    localStorage.setItem("sms-token", tok);
    localStorage.setItem("sms-user", JSON.stringify(usr));
  }
  function logout() {
    setToken(null); setUser(null);
    localStorage.removeItem("sms-token");
    localStorage.removeItem("sms-user");
  }

  return (
    <>
      <StyleTag />
      {!token || !user
        ? <LoginPage onLogin={login} />
        : <AppShell user={user} token={token} onLogout={logout} />}
    </>
  );
}