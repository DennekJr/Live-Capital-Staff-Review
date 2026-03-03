"use client";

import { useEffect, useMemo, useState } from "react";

const METRICS = [
  { id: "goalAchievement", label: "Goal Achievement & KPIs", desc: "Delivery against individual and departmental KPIs", category: "Core Performance", weight: 20 },
  { id: "qualityOfWork", label: "Quality of Work", desc: "Accuracy, depth, and value of outputs", category: "Core Performance", weight: 15 },
  { id: "efficiency", label: "Efficiency & Timeliness", desc: "Meeting deadlines, managing resources effectively", category: "Core Performance", weight: 10 },
  { id: "crossDeptSupport", label: "Cross-Department Support", desc: "Support and collaboration with other teams", category: "Collaboration & Teamwork", weight: 10 },
  { id: "knowledgeSharing", label: "Knowledge Sharing", desc: "Internal contributions — memos, insights, trainings", category: "Collaboration & Teamwork", weight: 5 },
  { id: "conflictMgmt", label: "Conflict Management", desc: "Constructive resolution and cooperation", category: "Collaboration & Teamwork", weight: 5 },
  { id: "decisionMaking", label: "Decision-Making & Accountability", desc: "Owning outcomes and taking responsibility", category: "Leadership & Ownership", weight: 10 },
  { id: "mentorship", label: "Mentorship & Team Development", desc: "Supporting growth of junior colleagues", category: "Leadership & Ownership", weight: 5 },
  { id: "proactivity", label: "Proactivity", desc: "Anticipating needs and driving improvements", category: "Leadership & Ownership", weight: 5 },
  { id: "integrity", label: "Integrity & Professionalism", desc: "Ethical conduct, compliance, transparency", category: "Cultural Alignment & Values", weight: 5 },
  { id: "adaptability", label: "Adaptability & Resilience", desc: "Handling pressure, change, and setbacks", category: "Cultural Alignment & Values", weight: 5 },
  { id: "brandRep", label: "Representation of Brand", desc: "How staff represent Live Capital internally and externally", category: "Cultural Alignment & Values", weight: 5 },
];

const CATEGORIES = [
  { name: "Core Performance", weight: 45, color: "#C9A84C" },
  { name: "Collaboration & Teamwork", weight: 20, color: "#7B9EA8" },
  { name: "Leadership & Ownership", weight: 20, color: "#8B7EC8" },
  { name: "Cultural Alignment & Values", weight: 15, color: "#7BAF8A" },
];

const SCORE_LABELS = ["", "Poor", "Below Average", "Meets Expectations", "Strong", "Exceptional"];

const STAFF_LIST = [
  { id: "s01", name: "Tolu Adeniji", role: "Product Designer" },
  { id: "s02", name: "Chiamaka Chidebere Okwara", role: "Social Media Associate" },
  { id: "s03", name: "Funmilola Adeniyi", role: "Content Marketing Manager" },
  { id: "s04", name: "Daniel Ezeh", role: "Brand/Graphic Designer" },
  { id: "s05", name: "Peter Ajanwachukwu", role: "Product Designer" },
  { id: "s06", name: "Milton Doibo", role: "Product Designer" },
  { id: "s07", name: "Omolayo Junaid", role: "Product Manager" },
  { id: "s08", name: "Emmanuel Teniola Dada", role: "Web Developer" },
  { id: "s09", name: "Blessing Ibileke", role: "Content Marketing Associate" },
  { id: "s10", name: "Oloruntosin Ibrahim", role: "Accounting Associate" },
  { id: "s11", name: "David Onuigbo", role: "Engineering Intern" },
  { id: "s12", name: "Olayemi Femi Davidson", role: "Operational Logistics Manager" },
  { id: "s13", name: "Dumebi Ohiri", role: "Frontend Engineer" },
  { id: "s14", name: "Philip Olamelaken", role: "Product Designer/Manager" },
  { id: "s15", name: "Jinad David", role: "Mobile Engineer" },
  { id: "s16", name: "Ebube Onyema", role: "Head of Motion Graphics" },
];

const ADMIN_EMAIL = "vekong@livecapital.fund";
const ADMIN_PASSWORD = "Vickie94@";

const ADMIN_USERS = [
  { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  { email: "yvonne@livecapital.fund", password: "egbon" },
  { email: "s.i@livecapital.fund", password: "seniorman" },
  { email: "josh@livecapital.fund", password: "joshc" },
];

const staffTableKey = (staffId) => `lc_reviews_${staffId}`;
const ALL_INDEX_KEY = "lc_all_index";
const reviewerProgressKey = (reviewerId) => `lc_reviewer_progress_${reviewerId}`;
const EXTRA_STAFF_KEY = "lc_extra_staff";
const QUESTIONS_KEY = "lc_admin_questions";

function calcScore(scores) {
  return METRICS.reduce((sum, m) => sum + (scores?.[m.id] || 0) * m.weight, 0) / 5;
}

function getTier(score) {
  if (score >= 90) return { label: "Exceptional Performer", color: "#C9A84C", tier: 1 };
  if (score >= 75) return { label: "Strong Performer", color: "#7BAF8A", tier: 2 };
  if (score >= 60) return { label: "Meets Expectations", color: "#7B9EA8", tier: 3 };
  if (score >= 40) return { label: "Needs Improvement", color: "#D4896A", tier: 4 };
  return { label: "Underperforming", color: "#C26B6B", tier: 5 };
}

function formatDate(ts, format = "short") {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "—";
  if (format === "long") return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function createLocalFallbackStorage() {
  const prefix = (shared) => (shared ? "shared:" : "private:");
  return {
    async get(key, shared) {
      const value = window.localStorage.getItem(prefix(shared) + key);
      return value == null ? null : { key, value, shared: !!shared };
    },
    async set(key, value, shared) {
      window.localStorage.setItem(prefix(shared) + key, String(value));
    },
    async delete(key, shared) {
      window.localStorage.removeItem(prefix(shared) + key);
    },
    async list(prefixArg = "", shared) {
      const pfx = prefix(shared) + (prefixArg || "");
      const out = [];
      for (let i = 0; i < window.localStorage.length; i += 1) {
        const k = window.localStorage.key(i);
        if (!k || !k.startsWith(pfx)) continue;
        out.push(k.slice(prefix(shared).length));
      }
      return out;
    },
  };
}

function getStorage() {
  if (typeof window === "undefined") return null;
  if (window.storage && typeof window.storage.get === "function") return window.storage;
  return createLocalFallbackStorage();
}

async function safeGet(key, shared) {
  try {
    const s = getStorage();
    if (!s) return null;
    return await s.get(key, shared);
  } catch {
    return null;
  }
}

async function safeSet(key, value, shared) {
  try {
    const s = getStorage();
    if (!s) return;
    await s.set(key, value, shared);
  } catch {
    // ignore
  }
}

async function loadStaffTable(staffId) {
  const res = await safeGet(staffTableKey(staffId), true);
  if (!res) return [];
  try {
    const parsed = JSON.parse(res.value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function injectRowIntoStaffTable(staffId, row) {
  const table = await loadStaffTable(staffId);
  table.push(row);
  await safeSet(staffTableKey(staffId), JSON.stringify(table), true);
  return table;
}

async function loadAllIndex() {
  const res = await safeGet(ALL_INDEX_KEY, true);
  if (!res) return [];
  try {
    const parsed = JSON.parse(res.value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function appendToAllIndex(entry) {
  const idx = await loadAllIndex();
  idx.push(entry);
  await safeSet(ALL_INDEX_KEY, JSON.stringify(idx), true);
  return idx;
}

async function hasExistingReviewForPair(reviewerId, staffId) {
  if (!reviewerId || !staffId) return false;
  const table = await loadStaffTable(staffId);
  return table.some((row) => row.reviewerId === reviewerId);
}

async function loadReviewerProgress(reviewerId) {
  const res = await safeGet(reviewerProgressKey(reviewerId), false);
  if (!res) return [];
  try {
    const parsed = JSON.parse(res.value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveReviewerProgress(reviewerId, reviewedIds) {
  await safeSet(reviewerProgressKey(reviewerId), JSON.stringify(reviewedIds), false);
}

async function loadExtraStaff() {
  const res = await safeGet(EXTRA_STAFF_KEY, true);
  if (!res) return [];
  try {
    const parsed = JSON.parse(res.value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveExtraStaff(list) {
  await safeSet(EXTRA_STAFF_KEY, JSON.stringify(list), true);
}

async function loadQuestions() {
  const res = await safeGet(QUESTIONS_KEY, true);
  if (!res) return [];
  try {
    const parsed = JSON.parse(res.value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveQuestions(list) {
  await safeSet(QUESTIONS_KEY, JSON.stringify(list), true);
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=DM+Sans:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0C0E14;
    --surface: #13151E;
    --surface2: #1A1D28;
    --border: #252836;
    --gold: #C9A84C;
    --gold-dim: rgba(201,168,76,0.15);
    --text: #E8E6E0;
    --muted: #7A7A8A;
    --dim: #4A4A5A;
    --success: #7BAF8A;
    --danger: #C26B6B;
  }

  body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; }

  .app { min-height: 100vh; display: flex; flex-direction: column; }

  .topbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 40px; border-bottom: 1px solid var(--border);
    background: rgba(12,14,20,0.95); backdrop-filter: blur(12px);
    position: sticky; top: 0; z-index: 100;
  }
  .topbar-logo { font-family: 'Cormorant Garamond', serif; font-size: 18px; font-weight: 500; letter-spacing: 0.08em; color: var(--gold); }
  .topbar-sub { font-size: 11px; color: var(--muted); letter-spacing: 0.15em; text-transform: uppercase; margin-top: 2px; }
  .topbar-right { display: flex; gap: 12px; align-items: center; }
  .pill {
    font-size: 11px; color: var(--muted);
    border: 1px solid var(--border); background: rgba(19,21,30,0.6);
    padding: 7px 10px; border-radius: 999px;
  }
  .pill strong { color: var(--gold); font-weight: 600; }

  .btn {
    padding: 10px 22px; border-radius: 4px; font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; border: none; letter-spacing: 0.02em;
  }
  .btn-ghost { background: transparent; color: var(--muted); border: 1px solid var(--border); }
  .btn-ghost:hover { border-color: var(--gold); color: var(--gold); }
  .btn-gold { background: var(--gold); color: #0C0E14; }
  .btn-gold:hover { background: #DDB955; transform: translateY(-1px); box-shadow: 0 4px 20px rgba(201,168,76,0.3); }
  .btn-sm { padding: 7px 16px; font-size: 12px; }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; }

  /* HOME */
  .home { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 24px; }
  .home-hero { text-align: center; max-width: 640px; }
  .home-eyebrow { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); margin-bottom: 20px; }
  .home-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(42px, 6vw, 64px); font-weight: 300; line-height: 1.1; color: var(--text); margin-bottom: 16px; }
  .home-title span { color: var(--gold); font-style: italic; }
  .home-desc { font-size: 15px; color: var(--muted); line-height: 1.7; margin-bottom: 48px; max-width: 520px; margin-left: auto; margin-right: auto; }
  .home-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; width: 100%; max-width: 560px; margin: 0 auto;}
  .home-card {
    padding: 32px 28px; border: 1px solid var(--border); border-radius: 8px;
    background: var(--surface); cursor: pointer; transition: all 0.25s; text-align: left;
  }
  .home-card:hover { border-color: var(--gold); background: var(--surface2); transform: translateY(-2px); box-shadow: 0 8px 40px rgba(0,0,0,0.4); }
  .home-card-icon { font-size: 28px; margin-bottom: 16px; }
  .home-card-title { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 500; margin-bottom: 8px; }
  .home-card-desc { font-size: 13px; color: var(--muted); line-height: 1.6; }
  .home-notice { margin-top: 40px; padding: 16px 24px; border: 1px solid var(--gold-dim); border-radius: 6px; background: var(--gold-dim); max-width: 560px; margin: 24px auto; }
  .home-notice p { font-size: 13px; color: var(--muted); text-align: center; line-height: 1.6; }
  .home-notice strong { color: var(--gold); }

  /* FORM */
  .form-page { flex: 1; padding: 48px 24px; max-width: 800px; margin: 0 auto; width: 100%; }
  .page-header { margin-bottom: 40px; }
  .page-eyebrow { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); margin-bottom: 12px; }
  .page-title { font-family: 'Cormorant Garamond', serif; font-size: 36px; font-weight: 400; }
  .page-desc { font-size: 14px; color: var(--muted); margin-top: 8px; line-height: 1.6; }

  .step-indicator { display: flex; gap: 8px; align-items: center; margin-bottom: 20px; }
  .step-chip { font-size: 11px; padding: 6px 10px; border-radius: 999px; border: 1px solid var(--border); color: var(--muted); background: rgba(19,21,30,0.4); }
  .step-chip.active { border-color: rgba(201,168,76,0.35); color: var(--gold); background: rgba(201,168,76,0.10); }

  .form-section { margin-bottom: 40px; }
  .form-section-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
  .form-section-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .form-section-title { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 500; }
  .form-section-weight { font-size: 12px; color: var(--muted); margin-left: auto; }

  .metric-row { margin-bottom: 28px; padding: 20px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; transition: border-color 0.2s; }
  .metric-row.rated { border-color: rgba(201,168,76,0.3); }
  .metric-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; gap: 10px; }
  .metric-label { font-size: 14px; font-weight: 500; }
  .metric-weight { font-size: 11px; color: var(--muted); background: var(--surface2); padding: 3px 8px; border-radius: 12px; white-space: nowrap; }
  .metric-desc { font-size: 12px; color: var(--muted); margin-bottom: 16px; }
  .star-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .star { font-size: 24px; cursor: pointer; transition: all 0.15s; filter: grayscale(1) opacity(0.3); }
  .star.active { filter: none; transform: scale(1.1); }
  .star:hover { transform: scale(1.2); }
  .star-label { font-size: 12px; color: var(--gold); margin-left: 10px; font-weight: 500; }

  .select-wrapper { position: relative; }
  .select-wrapper select {
    width: 100%; padding: 14px 18px; background: var(--surface); border: 1px solid var(--border);
    border-radius: 6px; color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 14px;
    cursor: pointer; appearance: none; outline: none; transition: border-color 0.2s;
  }
  .select-wrapper select:focus { border-color: var(--gold); }
  .select-wrapper::after { content: '▾'; position: absolute; right: 16px; top: 50%; transform: translateY(-50%); color: var(--muted); pointer-events: none; }
  .form-label { font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; display: block; }

  textarea {
    width: 100%; padding: 14px 18px; background: var(--surface); border: 1px solid var(--border);
    border-radius: 6px; color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 14px;
    resize: vertical; min-height: 100px; outline: none; transition: border-color 0.2s;
  }
  textarea:focus { border-color: var(--gold); }

  .score-preview { padding: 20px 24px; background: var(--gold-dim); border: 1px solid rgba(201,168,76,0.3); border-radius: 8px; margin-bottom: 32px; display: flex; align-items: center; gap: 20px; }
  .score-preview-num { font-family: 'Cormorant Garamond', serif; font-size: 48px; font-weight: 300; color: var(--gold); line-height: 1; }
  .score-preview-info { flex: 1; min-width: 220px; }
  .score-preview-label { font-size: 13px; color: var(--muted); margin-bottom: 4px; }
  .score-preview-tier { font-size: 15px; font-weight: 500; }
  .progress-bar-wrap { margin-top: 8px; height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; }
  .progress-bar-fill { height: 100%; border-radius: 2px; background: var(--gold); transition: width 0.4s; }

  .submit-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 24px; border-top: 1px solid var(--border); gap: 16px; flex-wrap: wrap; }
  .submit-footer-note { font-size: 12px; color: var(--muted); }

  /* SUCCESS */
  .success-page { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 24px; text-align: center; }
  .success-icon { font-size: 56px; margin-bottom: 24px; }
  .success-title { font-family: 'Cormorant Garamond', serif; font-size: 40px; font-weight: 400; margin-bottom: 12px; }
  .success-desc { font-size: 15px; color: var(--muted); max-width: 520px; line-height: 1.7; margin-bottom: 16px; }
  .success-kpi { margin-top: 8px; font-size: 12px; color: var(--muted); }
  .success-kpi strong { color: var(--gold); }

  /* ADMIN LOGIN */
  .login-page { flex: 1; display: flex; align-items: center; justify-content: center; padding: 48px 24px; }
  .login-card { width: 100%; max-width: 420px; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 40px; }
  .login-title { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 400; margin-bottom: 6px; }
  .login-sub { font-size: 13px; color: var(--muted); margin-bottom: 32px; }
  .input-group { margin-bottom: 20px; }
  input[type="password"], input[type="text"], input[type="email"] {
    width: 100%; padding: 13px 16px; background: var(--bg); border: 1px solid var(--border);
    border-radius: 6px; color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none;
    transition: border-color 0.2s;
  }
  input:focus { border-color: var(--gold); }
  .error-msg { font-size: 12px; color: var(--danger); margin-top: 8px; }

  /* ADMIN DASHBOARD */
  .admin-page { flex: 1; padding: 40px; max-width: 1200px; margin: 0 auto; width: 100%; }
  .admin-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 40px; }
  .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 24px; }
  .stat-num { font-family: 'Cormorant Garamond', serif; font-size: 36px; font-weight: 300; color: var(--gold); }
  .stat-label { font-size: 12px; color: var(--muted); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.08em; }

  .section-title { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 400; margin-bottom: 20px; }
  .staff-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-bottom: 40px; }
  .staff-card {
    background: var(--surface); border: 1px solid var(--border); border-radius: 8px;
    padding: 24px; cursor: pointer; transition: all 0.2s;
  }
  .staff-card:hover { border-color: var(--gold); transform: translateY(-2px); }
  .staff-card-name { font-size: 16px; font-weight: 500; margin-bottom: 4px; }
  .staff-card-role { font-size: 12px; color: var(--muted); margin-bottom: 16px; }
  .staff-card-score { display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px; }
  .staff-card-score-num { font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 300; }
  .staff-card-score-label { font-size: 12px; color: var(--muted); }
  .staff-card-tier { font-size: 12px; font-weight: 500; margin-bottom: 12px; }
  .staff-card-bar { height: 3px; background: var(--border); border-radius: 2px; overflow: hidden; }
  .staff-card-bar-fill { height: 100%; border-radius: 2px; transition: width 0.4s; }
  .staff-card-reviews { font-size: 11px; color: var(--dim); margin-top: 10px; }
  .no-reviews { font-size: 13px; color: var(--dim); font-style: italic; }

  /* SUBMISSIONS TABLE */
  .tab-row { display: flex; gap: 0; border-bottom: 1px solid var(--border); margin-bottom: 32px; }
  .tab { padding: 12px 24px; font-size: 13px; cursor: pointer; color: var(--muted); border-bottom: 2px solid transparent; transition: all 0.2s; background: none; border-top: none; border-left: none; border-right: none; font-family: 'DM Sans', sans-serif; }
  .tab.active { color: var(--gold); border-bottom-color: var(--gold); }
  .tab:hover { color: var(--text); }
  .table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-bottom: 40px; }
  .table { width: 100%; border-collapse: collapse; }
  .table th { padding: 14px 20px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); border-bottom: 1px solid var(--border); background: var(--surface2); }
  .table td { padding: 16px 20px; font-size: 13px; border-bottom: 1px solid var(--border); vertical-align: top; }
  .table tr:last-child td { border-bottom: none; }
  .table tr:hover td { background: var(--surface2); }
  .tier-badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 500; }
  .empty-state { text-align: center; padding: 48px; color: var(--muted); font-size: 14px; }
  .empty-state-icon { font-size: 40px; margin-bottom: 16px; }

  /* STAFF DETAIL */
  .detail-page { flex: 1; padding: 40px; max-width: 1000px; margin: 0 auto; width: 100%; }
  .detail-score-hero { display: flex; align-items: center; gap: 32px; padding: 32px; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 32px; flex-wrap: wrap; }
  .detail-score-big { font-family: 'Cormorant Garamond', serif; font-size: 80px; font-weight: 300; line-height: 1; color: var(--gold); }
  .detail-score-info { flex: 1; min-width: 260px; }
  .detail-tier { font-size: 20px; font-weight: 500; margin-bottom: 8px; }
  .detail-reviews-count { font-size: 13px; color: var(--muted); margin-bottom: 16px; }
  .detail-bar { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; max-width: 420px; }
  .detail-bar-fill { height: 100%; border-radius: 3px; background: var(--gold); transition: width 0.6s; }

  .category-breakdown { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 32px; }
  .cat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 20px; }
  .cat-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; gap: 10px; }
  .cat-card-name { font-size: 13px; font-weight: 500; }
  .cat-card-score { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 300; color: var(--gold); }
  .cat-bar { height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; }
  .cat-bar-fill { height: 100%; border-radius: 2px; transition: width 0.5s; }

  .metric-breakdown { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-bottom: 32px; }
  .metric-breakdown-row { display: flex; align-items: center; gap: 16px; padding: 14px 20px; border-bottom: 1px solid var(--border); }
  .metric-breakdown-row:last-child { border-bottom: none; }
  .metric-breakdown-name { font-size: 13px; flex: 1; min-width: 240px; }
  .metric-breakdown-bar-wrap { width: 180px; height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; }
  .metric-breakdown-bar-fill { height: 100%; background: var(--gold); border-radius: 2px; }
  .metric-breakdown-score { font-size: 13px; font-weight: 500; width: 36px; text-align: right; color: var(--gold); }

  .reviews-list { display: flex; flex-direction: column; gap: 16px; }
  .review-item { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 24px; }
  .review-item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; gap: 16px; flex-wrap: wrap; }
  .review-item-score { font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 300; color: var(--gold); }
  .review-item-date { font-size: 12px; color: var(--muted); }
  .review-item-meta { font-size: 12px; color: var(--muted); margin-top: 6px; }
  .review-item-comment { font-size: 13px; color: var(--muted); line-height: 1.6; border-left: 2px solid var(--gold); padding-left: 14px; margin-top: 12px; font-style: italic; }
  .review-scores-mini { display: flex; flex-wrap: wrap; gap: 8px; }
  .score-chip { font-size: 11px; background: var(--surface2); border: 1px solid var(--border); border-radius: 4px; padding: 4px 10px; color: var(--muted); }
  .score-chip span { color: var(--text); font-weight: 500; }

  @media (max-width: 900px) {
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
    .category-breakdown { grid-template-columns: 1fr; }
    .home-cards { grid-template-columns: 1fr; margin: 0 auto; }
    .admin-page, .detail-page { padding: 20px; }
    .topbar { padding: 16px 20px; }
  }
`;

export default function PerformanceReviewApp() {
  const [view, setView] = useState("home");
  const [adminTab, setAdminTab] = useState("overview");
  const [selectedStaffId, setSelectedStaffId] = useState(null);

  const [tablesByStaff, setTablesByStaff] = useState({});
  const [allIndex, setAllIndex] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  const [reviewerContext, setReviewerContext] = useState(null); // { reviewerId, reviewedIds }

  const [extraStaff, setExtraStaff] = useState([]);
  const [questions, setQuestions] = useState([]);

  const allStaff = useMemo(() => [...STAFF_LIST, ...extraStaff], [extraStaff]);
  const staffById = useMemo(() => Object.fromEntries(allStaff.map((s) => [s.id, s])), [allStaff]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const [idx, extra, qs] = await Promise.all([loadAllIndex(), loadExtraStaff(), loadQuestions()]);

      const combinedStaff = [...STAFF_LIST, ...extra];
      const tables = await Promise.all(combinedStaff.map((s) => loadStaffTable(s.id)));
      if (cancelled) return;
      const map = {};
      combinedStaff.forEach((s, i) => {
        map[s.id] = tables[i];
      });
      setAllIndex(idx);
      setTablesByStaff(map);
      setExtraStaff(extra);
      setQuestions(qs);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const allSubmissions = useMemo(() => {
    const out = [];
    for (const staff of allStaff) {
      const rows = tablesByStaff?.[staff.id] || [];
      for (const row of rows) {
        out.push({ staffId: staff.id, row });
      }
    }
    out.sort((a, b) => new Date(b.row?.timestamp || 0).getTime() - new Date(a.row?.timestamp || 0).getTime());
    return out;
  }, [tablesByStaff]);

  const staffStats = useMemo(() => {
    const perStaff = {};
    for (const staff of allStaff) {
      const rows = tablesByStaff?.[staff.id] || [];
      const count = rows.length;
      const avg = count ? rows.reduce((s, r) => s + (typeof r.weightedScore === "number" ? r.weightedScore : calcScore(r.scores)), 0) / count : null;
      perStaff[staff.id] = { count, avg };
    }
    const reviewedStaff = allStaff.filter((s) => (perStaff[s.id]?.count || 0) > 0).length;
    const avgs = allStaff.map((s) => perStaff[s.id].avg).filter((v) => typeof v === "number");
    const companyAvg = avgs.length ? avgs.reduce((a, b) => a + b, 0) / avgs.length : 0;
    return {
      totalSubmissions: allIndex.length || allSubmissions.length,
      reviewedStaff,
      companyAvg,
      perStaff,
    };
  }, [tablesByStaff, allIndex, allSubmissions.length]);

  const selectedStaff = selectedStaffId ? staffById[selectedStaffId] : null;

  function signOut() {
    setView("home");
    setSelectedStaffId(null);
    setAdminTab("overview");
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0C0E14", color: "#C9A84C", fontFamily: "Cormorant Garamond, serif", fontSize: 24 }}>
        Loading…
      </div>
    );
  }

  const reviewerProgressPill = reviewerContext?.reviewerId
    ? (() => {
        const total = allStaff.length - 1;
        const done = reviewerContext.reviewedIds?.length || 0;
        return (
          <div className="pill">
            Reviewer progress: <strong>{done}/{total}</strong>
          </div>
        );
      })()
    : null;

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="topbar">
          <div>
            <div className="topbar-logo">Live Capital</div>
            <div className="topbar-sub">Staff Performance Review Portal</div>
          </div>
          <div className="topbar-right">
            {reviewerProgressPill}
            {view !== "home" && (
              <button className="btn btn-ghost btn-sm" onClick={() => setView("home")}>
                ← Home
              </button>
            )}
            {view === "admin" || view === "staff-detail" ? (
              <button className="btn btn-ghost btn-sm" onClick={signOut}>
                Sign Out
              </button>
            ) : view === "home" ? (
              <button className="btn btn-ghost btn-sm" onClick={() => setView("admin-login")}>
                Admin
              </button>
            ) : null}
          </div>
        </div>

        {view === "home" && <HomeView setView={setView} />}

        {view === "review" && (
          <ReviewWizard
            staffList={allStaff}
            onCycleState={(ctx) => setReviewerContext(ctx)}
            onSubmitted={() => setReloadToken((t) => t + 1)}
            onDone={() => setView("home")}
          />
        )}

        {view === "admin-login" && <AdminLogin onSuccess={() => setView("admin")} />}

        {view === "admin" && (
          <AdminDashboard
            staffList={allStaff}
            staffStats={staffStats}
            adminTab={adminTab}
            setAdminTab={setAdminTab}
            tablesByStaff={tablesByStaff}
            allSubmissions={allSubmissions}
            staffById={staffById}
            questions={questions}
            onAddQuestion={async (text) => {
              const q = { id: makeId("q"), text: text.trim(), createdAt: new Date().toISOString() };
              const next = [...questions, q];
              setQuestions(next);
              await saveQuestions(next);
            }}
            onAddStaff={async (name, role) => {
              const newStaff = { id: makeId("s"), name: name.trim(), role: role.trim() || "Staff" };
              const next = [...extraStaff, newStaff];
              setExtraStaff(next);
              await saveExtraStaff(next);
              setReloadToken((t) => t + 1);
            }}
            onDeleteStaff={async (id) => {
              // Only deletable staff are those added via the admin UI (extraStaff)
              const next = extraStaff.filter((s) => s.id !== id);
              setExtraStaff(next);
              await saveExtraStaff(next);
              setTablesByStaff((prev) => {
                const clone = { ...prev };
                delete clone[id];
                return clone;
              });
              setReloadToken((t) => t + 1);
            }}
            onDeleteQuestion={async (id) => {
              const next = questions.filter((q) => q.id !== id);
              setQuestions(next);
              await saveQuestions(next);
            }}
            baseStaffIds={STAFF_LIST.map((s) => s.id)}
            onViewStaff={(staffId) => {
              setSelectedStaffId(staffId);
              setView("staff-detail");
            }}
          />
        )}

        {view === "staff-detail" && selectedStaff && (
          <StaffDetail
            staff={selectedStaff}
            rows={tablesByStaff[selectedStaff.id] || []}
            staffById={staffById}
            onBack={() => setView("admin")}
          />
        )}
      </div>
    </>
  );
}

function HomeView({ setView }) {
  return (
    <div className="home">
      <div className="home-hero">
        <div className="home-eyebrow">Annual Review · 2025</div>
        <h1 className="home-title">
          Staff <span>Performance</span> Review
        </h1>
        <p className="home-desc">
          Submit constructive peer feedback across 12 metrics. Reviews are anonymous to colleagues, while admin can see reviewer identity for integrity purposes.
        </p>
        <div className="home-cards">
          <div className="home-card" onClick={() => setView("review")}>
            <div className="home-card-icon">📝</div>
            <div className="home-card-title">Submit Reviews</div>
            <div className="home-card-desc">Pick yourself, then complete reviews for every other staff member.</div>
          </div>
          <div className="home-card" onClick={() => setView("admin-login")}>
            <div className="home-card-icon">📊</div>
            <div className="home-card-title">Admin Dashboard</div>
            <div className="home-card-desc">Analytics, submissions, and per-staff breakdowns. Restricted access.</div>
          </div>
        </div>
        <div className="home-notice">
          <p>
            <strong>Important</strong>: Each staff member must submit a review for <strong>every other staff member</strong> (15 reviews total).
          </p>
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ step }) {
  return (
    <div className="step-indicator">
      <div className={`step-chip ${step === 1 ? "active" : ""}`}>Step 1 · Identify Yourself</div>
      <div className={`step-chip ${step === 2 ? "active" : ""}`}>Step 2 · Select Colleague</div>
      <div className={`step-chip ${step === 3 ? "active" : ""}`}>Step 3 · Rate & Submit</div>
    </div>
  );
}

function ReviewWizard({ staffList, onSubmitted, onCycleState, onDone }) {
  const [step, setStep] = useState(1);
  const [reviewerId, setReviewerId] = useState("");
  const [revieweeId, setRevieweeId] = useState("");
  const [reviewedIds, setReviewedIds] = useState([]);

  const [scores, setScores] = useState({});
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const reviewer = staffList.find((s) => s.id === reviewerId) || null;
  const totalToDo = staffList.length - 1;

  useEffect(() => {
    onCycleState?.(reviewerId ? { reviewerId, reviewedIds } : null);
  }, [reviewerId, reviewedIds, onCycleState]);

  useEffect(() => {
    let cancelled = false;
    async function loadProgress() {
      if (!reviewerId) return;
      const done = await loadReviewerProgress(reviewerId);
      if (cancelled) return;
      const normalized = Array.from(new Set(done)).filter((id) => id && id !== reviewerId);
      setReviewedIds(normalized);
    }
    loadProgress();
    return () => {
      cancelled = true;
    };
  }, [reviewerId]);

  const remaining = useMemo(() => {
    if (!reviewerId) return [];
    return staffList.filter((s) => s.id !== reviewerId && !reviewedIds.includes(s.id));
  }, [staffList, reviewerId, reviewedIds]);

  useEffect(() => {
    if (step !== 2) return;
    if (!reviewerId) return;
    if (revieweeId && remaining.some((s) => s.id === revieweeId)) return;
    setRevieweeId(remaining[0]?.id || "");
  }, [step, reviewerId, remaining, revieweeId]);

  const ratedCount = Object.keys(scores).length;
  const totalMetrics = METRICS.length;
  const currentScore = ratedCount > 0 ? calcScore(scores) : 0;
  const tier = getTier(currentScore);
  const canSubmit = reviewerId && revieweeId && ratedCount === totalMetrics && !submitting;

  const grouped = useMemo(
    () =>
      CATEGORIES.map((cat) => ({
        ...cat,
        metrics: METRICS.filter((m) => m.category === cat.name),
      })),
    []
  );

  async function handleSubmit() {
    if (!canSubmit) return;
    setError("");

    // Hard guard against duplicates using both local progress and staff table data
    if (reviewedIds.includes(revieweeId)) {
      setError("You have already submitted a review for this colleague. Please select another colleague to continue.");
      setStep(2);
      return;
    }

    const alreadyInTable = await hasExistingReviewForPair(reviewerId, revieweeId);
    if (alreadyInTable) {
      const nextReviewedSync = Array.from(new Set([...reviewedIds, revieweeId]));
      setReviewedIds(nextReviewedSync);
      await saveReviewerProgress(reviewerId, nextReviewedSync);
      setError("You have already submitted a review for this colleague (from a previous session). Please select another colleague to continue.");
      setStep(2);
      return;
    }

    setSubmitting(true);
    const ts = new Date().toISOString();
    const weightedScore = calcScore(scores);

    const row = {
      rowId: makeId("r"),
      reviewerId,
      scores,
      comment: comment.trim(),
      timestamp: ts,
      weightedScore,
    };

    await injectRowIntoStaffTable(revieweeId, row);
    await appendToAllIndex({ staffId: revieweeId, rowId: row.rowId, timestamp: ts, score: weightedScore });

    // Also persist into a physical monthly file via API route (server-side fs)
    try {
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId: revieweeId, row }),
      });
    } catch {
      // Non-fatal – storage-backed tables remain source of truth
    }

    const nextReviewed = Array.from(new Set([...reviewedIds, revieweeId]));
    setReviewedIds(nextReviewed);
    await saveReviewerProgress(reviewerId, nextReviewed);

    setSubmitting(false);
    onSubmitted?.();

    setScores({});
    setComment("");
    setStep(4);
  }

  if (step === 4) {
    const doneCount = reviewedIds.length;
    const remainingCount = Math.max(0, totalToDo - doneCount);
    const next = remaining[0] || null;

    return (
      <div className="success-page">
        <div className="success-icon">✅</div>
        <h2 className="success-title">Review Submitted</h2>
        <p className="success-desc">
          Thank you for your feedback. To complete the cycle, you must submit reviews for all colleagues.
        </p>
        <div className="success-kpi">
          Progress for <strong>{reviewer?.name || "Reviewer"}</strong>: <strong>{doneCount}</strong> of <strong>{totalToDo}</strong> completed ·{" "}
          <strong>{remainingCount}</strong> remaining
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap", justifyContent: "center" }}>
          {next ? (
            <button
              className="btn btn-gold"
              onClick={() => {
                setStep(2);
              }}
            >
              Continue to Next Colleague
            </button>
          ) : (
            <button className="btn btn-gold" onClick={onDone}>
              Finish & Return Home
            </button>
          )}
          <button className="btn btn-ghost" onClick={onDone}>
            Exit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="page-header">
        <div className="page-eyebrow">Peer Review Cycle</div>
        <h2 className="page-title">Submit Staff Performance Reviews</h2>
        <p className="page-desc">This flow is intentionally structured: identify yourself → choose a colleague → rate all 12 metrics → submit.</p>
      </div>

      <StepIndicator step={step} />

      {error && (
        <div style={{ margin: "0 0 16px", fontSize: 12, color: "var(--danger)" }}>
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="form-section">
          <label className="form-label">Select your name</label>
          <div className="select-wrapper">
            <select
              value={reviewerId}
              onChange={(e) => {
                setReviewerId(e.target.value);
                setReviewedIds([]);
                setRevieweeId("");
                setScores({});
                setComment("");
                setError("");
              }}
            >
              <option value="">Select your name…</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.role}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div className="submit-footer-note">You will need to complete {totalToDo} reviews (everyone except yourself).</div>
            <button className="btn btn-gold" disabled={!reviewerId} onClick={() => setStep(2)}>
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="form-section">
          <label className="form-label">Select a colleague to review</label>
          <div className="select-wrapper">
            <select value={revieweeId} onChange={(e) => setRevieweeId(e.target.value)} disabled={!reviewerId || remaining.length === 0}>
              {!reviewerId ? (
                <option value="">Select yourself first…</option>
              ) : remaining.length === 0 ? (
                <option value="">All colleagues completed ✅</option>
              ) : (
                <>
                  <option value="">Select a colleague…</option>
                  {remaining.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.role}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
          {reviewerId && (
            <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted)" }}>
              Progress: <span style={{ color: "var(--gold)", fontWeight: 600 }}>{reviewedIds.length}</span> / {totalToDo} completed ·{" "}
              {Math.max(0, totalToDo - reviewedIds.length)} remaining
            </div>
          )}
          <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <button
              className="btn btn-ghost"
              onClick={() => {
                setError("");
                setStep(1);
              }}
            >
              ← Back
            </button>
            {remaining.length === 0 ? (
              <button className="btn btn-gold" onClick={onDone}>
                Finish
              </button>
            ) : (
              <button
                className="btn btn-gold"
                disabled={!revieweeId}
                onClick={() => {
                  setScores({});
                  setComment("");
                  setStep(3);
                }}
              >
                Start Rating
              </button>
            )}
          </div>
        </div>
      )}

      {step === 3 && (
        <>
          <div className="form-section">
            <label className="form-label">Reviewer</label>
            <div style={{ padding: "14px 18px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6 }}>
              <div style={{ fontWeight: 600 }}>{reviewer?.name || "—"}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{reviewer?.role || ""}</div>
            </div>
          </div>

          <div className="form-section">
            <label className="form-label">Reviewing</label>
            <div style={{ padding: "14px 18px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6 }}>
              <div style={{ fontWeight: 600 }}>{staffList.find((s) => s.id === revieweeId)?.name || "—"}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{staffList.find((s) => s.id === revieweeId)?.role || ""}</div>
            </div>
            <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <button className="btn btn-ghost" onClick={() => setStep(2)}>
                ← Change Colleague
              </button>
              <div className="submit-footer-note">Submit is enabled once all 12 metrics are rated.</div>
            </div>
          </div>

          {ratedCount > 0 && (
            <div className="score-preview">
              <div className="score-preview-num">{currentScore.toFixed(1)}</div>
              <div className="score-preview-info">
                <div className="score-preview-label">
                  {ratedCount}/{totalMetrics} metrics rated
                </div>
                <div className="score-preview-tier" style={{ color: tier.color }}>
                  {tier.label}
                </div>
                <div className="progress-bar-wrap">
                  <div className="progress-bar-fill" style={{ width: `${currentScore}%`, background: tier.color }} />
                </div>
              </div>
            </div>
          )}

          {grouped.map((cat) => (
            <div className="form-section" key={cat.name}>
              <div className="form-section-header">
                <div className="form-section-dot" style={{ background: cat.color }} />
                <div className="form-section-title">{cat.name}</div>
                <div className="form-section-weight">{cat.weight}% of total score</div>
              </div>
              {cat.metrics.map((m) => (
                <MetricRater key={m.id} metric={m} value={scores[m.id] || 0} onChange={(v) => setScores((prev) => ({ ...prev, [m.id]: v }))} />
              ))}
            </div>
          ))}

          <div className="form-section">
            <label className="form-label">
              Additional Comments <span style={{ color: "var(--dim)" }}>(Optional)</span>
            </label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share any specific observations, examples, or context that would be helpful…" />
          </div>

          <div className="submit-footer">
            <div className="submit-footer-note">
              Your review is anonymous to staff. Admin can see reviewer identity for integrity purposes.
            </div>
            <button className="btn btn-gold" onClick={handleSubmit} disabled={!canSubmit}>
              {submitting ? "Submitting…" : "Submit Review"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function MetricRater({ metric, value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className={`metric-row ${value > 0 ? "rated" : ""}`}>
      <div className="metric-top">
        <div className="metric-label">{metric.label}</div>
        <div className="metric-weight">{metric.weight}%</div>
      </div>
      <div className="metric-desc">{metric.desc}</div>
      <div className="star-row">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`star ${i <= (hovered || value) ? "active" : ""}`}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(i)}
          >
            ⭐
          </span>
        ))}
        {(hovered || value) > 0 && <span className="star-label">{SCORE_LABELS[hovered || value]}</span>}
      </div>
    </div>
  );
}

function AdminLogin({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  function tryLogin() {
    const normalized = email.trim().toLowerCase();
    const ok = ADMIN_USERS.some((u) => u.email.toLowerCase() === normalized && u.password === pw);
    if (ok) onSuccess?.();
    else setError("Incorrect email or password. Please try again.");
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-title">Admin Access</div>
        <div className="login-sub">This area is restricted to authorized administrators only.</div>

        <div className="input-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            placeholder="Enter admin email"
            onKeyDown={(e) => e.key === "Enter" && tryLogin()}
          />
        </div>

        <div className="input-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            value={pw}
            onChange={(e) => {
              setPw(e.target.value);
              setError("");
            }}
            placeholder="Enter admin password"
            onKeyDown={(e) => e.key === "Enter" && tryLogin()}
          />
          {error && <div className="error-msg">{error}</div>}
        </div>

        <button className="btn btn-gold" style={{ width: "100%" }} onClick={tryLogin}>
          Sign In
        </button>
      </div>
    </div>
  );
}

function AdminDashboard({
  staffList,
  staffStats,
  adminTab,
  setAdminTab,
  tablesByStaff,
  allSubmissions,
  staffById,
  questions,
  onAddQuestion,
  onAddStaff,
  onDeleteStaff,
  onDeleteQuestion,
  baseStaffIds,
  onViewStaff,
}) {
  const { totalSubmissions, reviewedStaff, companyAvg, perStaff } = staffStats;

  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffRole, setNewStaffRole] = useState("");
  const [newQuestion, setNewQuestion] = useState("");

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <div className="page-eyebrow">Admin Dashboard</div>
          <h2 className="page-title">Performance Analytics</h2>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-num">{totalSubmissions}</div>
          <div className="stat-label">Total Submissions</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{staffList.length}</div>
          <div className="stat-label">Staff Members</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{reviewedStaff}</div>
          <div className="stat-label">Staff Reviewed</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ fontSize: 28 }}>
            {companyAvg ? companyAvg.toFixed(1) : "—"}
          </div>
          <div className="stat-label">Company Avg Score</div>
        </div>
      </div>

      <div className="tab-row">
        {[
          { id: "overview", label: "Staff Overview" },
          { id: "submissions", label: "All Submissions" },
          { id: "manage", label: "Manage & Questions" },
        ].map((t) => (
          <button key={t.id} className={`tab ${adminTab === t.id ? "active" : ""}`} onClick={() => setAdminTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {adminTab === "overview" && (
        <>
          <div className="section-title">Staff Performance</div>
          <div className="staff-grid">
            {staffList.map((s) => {
              const sc = perStaff[s.id]?.avg ?? null;
              const count = perStaff[s.id]?.count ?? 0;
              const tier = typeof sc === "number" ? getTier(sc) : null;
              return (
                <div className="staff-card" key={s.id} onClick={() => onViewStaff(s.id)}>
                  <div className="staff-card-name">{s.name}</div>
                  <div className="staff-card-role">{s.role}</div>
                  {typeof sc === "number" ? (
                    <>
                      <div className="staff-card-score">
                        <div className="staff-card-score-num" style={{ color: tier.color }}>
                          {sc.toFixed(1)}
                        </div>
                        <div className="staff-card-score-label">/ 100</div>
                      </div>
                      <div className="staff-card-tier" style={{ color: tier.color }}>
                        {tier.label}
                      </div>
                      <div className="staff-card-bar">
                        <div className="staff-card-bar-fill" style={{ width: `${sc}%`, background: tier.color }} />
                      </div>
                    </>
                  ) : (
                    <div className="no-reviews">No reviews yet</div>
                  )}
                  <div className="staff-card-reviews">
                    {count} review{count !== 1 ? "s" : ""} · Click to view detail
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {adminTab === "submissions" && (
        <>
          <div className="section-title">All Submissions ({allSubmissions.length})</div>
          {allSubmissions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>No submissions yet.
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Reviewee</th>
                    <th>Reviewed By</th>
                    <th>Score</th>
                    <th>Tier</th>
                    <th>Date Submitted</th>
                    <th>Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {allSubmissions.map(({ staffId, row }) => {
                    const staff = staffById[staffId];
                    const reviewer = staffById[row.reviewerId];
                    const sc = typeof row.weightedScore === "number" ? row.weightedScore : calcScore(row.scores);
                    const tier = getTier(sc);
                    return (
                      <tr key={`${staffId}:${row.rowId}`}>
                        <td>
                          <div style={{ fontWeight: 500 }}>{staff?.name || "Unknown"}</div>
                          <div style={{ fontSize: 11, color: "var(--muted)" }}>{staff?.role}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{reviewer?.name || "Unknown"}</div>
                          <div style={{ fontSize: 11, color: "var(--muted)" }}>{reviewer?.role}</div>
                        </td>
                        <td style={{ color: tier.color, fontWeight: 600 }}>{sc.toFixed(1)}</td>
                        <td>
                          <span className="tier-badge" style={{ background: `${tier.color}20`, color: tier.color }}>
                            {tier.label}
                          </span>
                        </td>
                        <td style={{ color: "var(--muted)" }}>{formatDate(row.timestamp, "short")}</td>
                        <td style={{ color: "var(--muted)", maxWidth: 260 }}>{row.comment || <span style={{ color: "var(--dim)" }}>—</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {adminTab === "manage" && (
        <>
          <div className="section-title">Add Staff Member</div>
          <div className="table-wrap" style={{ padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Create additional staff profiles</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <input
                type="text"
                placeholder="Full name"
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: 180,
                  padding: "10px 12px",
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  color: "var(--text)",
                  fontSize: 14,
                }}
              />
              <input
                type="text"
                placeholder="Role / Title"
                value={newStaffRole}
                onChange={(e) => setNewStaffRole(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: 180,
                  padding: "10px 12px",
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  color: "var(--text)",
                  fontSize: 14,
                }}
              />
              <button
                className="btn btn-gold"
                disabled={!newStaffName.trim()}
                onClick={async () => {
                  if (!newStaffName.trim()) return;
                  await onAddStaff(newStaffName, newStaffRole);
                  setNewStaffName("");
                  setNewStaffRole("");
                }}
              >
                Add Staff
              </button>
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 8 }}>
              New staff will appear in the staff overview and in future review cycles.
            </div>
          </div>

          <div className="section-title">Existing Added Staff</div>
          <div className="table-wrap" style={{ padding: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th style={{ width: 80 }}></th>
                </tr>
              </thead>
              <tbody>
                {staffList.filter((s) => !baseStaffIds?.includes(s.id)).length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ fontSize: 13, color: "var(--muted)", padding: 16 }}>
                      No additional staff have been added yet.
                    </td>
                  </tr>
                ) : (
                  staffList
                    .filter((s) => !baseStaffIds?.includes(s.id))
                    .map((s) => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 500 }}>{s.name}</td>
                        <td style={{ color: "var(--muted)" }}>{s.role}</td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: "var(--danger)", borderColor: "var(--danger)" }}
                            onClick={() => onDeleteStaff(s.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>

          <div className="section-title">Custom Questions</div>
          <div className="table-wrap" style={{ padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Add guidance questions for reviewers</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
              <input
                type="text"
                placeholder="Type a question (e.g. “What did this colleague do particularly well this year?”)"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: 260,
                  padding: "10px 12px",
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  color: "var(--text)",
                  fontSize: 14,
                }}
              />
              <button
                className="btn btn-gold"
                disabled={!newQuestion.trim()}
                onClick={async () => {
                  const text = newQuestion.trim();
                  if (!text) return;
                  await onAddQuestion(text);
                  setNewQuestion("");
                }}
              >
                Add Question
              </button>
            </div>
            {questions?.length ? (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {questions.map((q) => (
                  <li
                    key={q.id}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 6,
                      border: "1px solid var(--border)",
                      background: "var(--surface)",
                      fontSize: 13,
                      color: "var(--text)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div>
                      <div>{q.text}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
                        {formatDate(q.createdAt || q.created_at || new Date().toISOString(), "short")}
                      </div>
                    </div>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: "var(--danger)", borderColor: "var(--danger)" }}
                      onClick={() => onDeleteQuestion(q.id)}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ fontSize: 13, color: "var(--muted)" }}>No custom questions added yet.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StaffDetail({ staff, rows, staffById, onBack }) {
  const hasData = rows.length > 0;

  const avgMetricScores = useMemo(() => {
    const out = {};
    if (!hasData) return out;
    for (const m of METRICS) {
      out[m.id] = rows.reduce((s, r) => s + (r.scores?.[m.id] || 0), 0) / rows.length;
    }
    return out;
  }, [hasData, rows]);

  const overall = useMemo(() => {
    if (!hasData) return 0;
    const pseudoScores = {};
    for (const m of METRICS) pseudoScores[m.id] = avgMetricScores[m.id] || 0;
    return calcScore(pseudoScores);
  }, [hasData, avgMetricScores]);

  const tier = getTier(overall);

  const catScores = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const ms = METRICS.filter((m) => m.category === cat.name);
      const weightSum = ms.reduce((s, m) => s + m.weight, 0) || 1;
      const weighted = ms.reduce((s, m) => s + (avgMetricScores[m.id] || 0) * m.weight, 0);
      const score = (weighted / weightSum / 5) * 100;
      return { ...cat, score };
    });
  }, [avgMetricScores]);

  return (
    <div className="detail-page">
      <div style={{ marginBottom: 24 }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack}>
          ← Back to Dashboard
        </button>
      </div>

      <div className="page-header">
        <div className="page-eyebrow">Staff Detail</div>
        <h2 className="page-title">{staff.name}</h2>
        <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>{staff.role}</p>
      </div>

      {!hasData ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>No reviews submitted for this staff member yet.
        </div>
      ) : (
        <>
          <div className="detail-score-hero">
            <div className="detail-score-big" style={{ color: tier.color }}>
              {overall.toFixed(1)}
            </div>
            <div className="detail-score-info">
              <div className="detail-tier" style={{ color: tier.color }}>
                {tier.label}
              </div>
              <div className="detail-reviews-count">
                {rows.length} review{rows.length !== 1 ? "s" : ""} submitted
              </div>
              <div className="detail-bar">
                <div className="detail-bar-fill" style={{ width: `${overall}%`, background: tier.color }} />
              </div>
            </div>
          </div>

          <div className="section-title">Category Breakdown</div>
          <div className="category-breakdown">
            {catScores.map((cat) => (
              <div className="cat-card" key={cat.name}>
                <div className="cat-card-header">
                  <div className="cat-card-name">
                    {cat.name} <span style={{ color: "var(--dim)", fontSize: 11 }}>({cat.weight}%)</span>
                  </div>
                  <div className="cat-card-score" style={{ color: cat.color }}>
                    {cat.score.toFixed(1)}
                  </div>
                </div>
                <div className="cat-bar">
                  <div className="cat-bar-fill" style={{ width: `${cat.score}%`, background: cat.color }} />
                </div>
              </div>
            ))}
          </div>

          <div className="section-title">Metric Breakdown</div>
          <div className="metric-breakdown">
            {METRICS.map((m) => (
              <div className="metric-breakdown-row" key={m.id}>
                <div className="metric-breakdown-name">
                  {m.label}
                  <div style={{ fontSize: 11, color: "var(--dim)" }}>{m.weight}% weight</div>
                </div>
                <div className="metric-breakdown-bar-wrap">
                  <div className="metric-breakdown-bar-fill" style={{ width: `${((avgMetricScores[m.id] || 0) / 5) * 100}%` }} />
                </div>
                <div className="metric-breakdown-score">{(avgMetricScores[m.id] || 0).toFixed(1)}</div>
              </div>
            ))}
          </div>

          <div className="section-title">Individual Reviews ({rows.length})</div>
          <div className="reviews-list">
            {[...rows]
              .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
              .map((row) => {
                const sc = typeof row.weightedScore === "number" ? row.weightedScore : calcScore(row.scores);
                const t = getTier(sc);
                const reviewer = staffById[row.reviewerId];
                return (
                  <div className="review-item" key={row.rowId}>
                    <div className="review-item-header">
                      <div>
                        <div className="review-item-score" style={{ color: t.color }}>
                          {sc.toFixed(1)}
                        </div>
                        <span className="tier-badge" style={{ background: `${t.color}20`, color: t.color, fontSize: 11 }}>
                          {t.label}
                        </span>
                        <div className="review-item-meta">
                          Reviewed by <strong style={{ color: "var(--text)" }}>{reviewer?.name || "Unknown"}</strong>
                        </div>
                      </div>
                      <div className="review-item-date">{formatDate(row.timestamp, "long")}</div>
                    </div>
                    <div className="review-scores-mini">
                      {METRICS.map((m) => (
                        <div className="score-chip" key={m.id}>
                          {m.label.split(" ")[0]} <span>{row.scores?.[m.id] || 0}/5</span>
                        </div>
                      ))}
                    </div>
                    {row.comment ? <div className="review-item-comment">{row.comment}</div> : null}
                  </div>
                );
              })}
          </div>
        </>
      )}
    </div>
  );
}

