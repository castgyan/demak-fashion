import { useState, useEffect, useCallback } from "react";

// ── Glassmorphism + Orange theme ──────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --orange: #FF6B00;
    --orange-light: #FF8C38;
    --orange-glow: rgba(255,107,0,0.18);
    --orange-dark: #CC5500;
    --glass-bg: rgba(255,255,255,0.08);
    --glass-border: rgba(255,255,255,0.15);
    --glass-hover: rgba(255,255,255,0.13);
    --surface: rgba(255,255,255,0.05);
    --surface-2: rgba(255,255,255,0.10);
    --text-primary: #FFFFFF;
    --text-secondary: rgba(255,255,255,0.7);
    --text-muted: rgba(255,255,255,0.45);
    --success: #22c55e;
    --danger: #ef4444;
    --warning: #f59e0b;
    --font: 'Sora', sans-serif;
    --mono: 'JetBrains Mono', monospace;
  }

  body {
    font-family: var(--font);
    background: linear-gradient(135deg, #0d0d0d 0%, #1a0800 40%, #0d0500 70%, #0a0a0a 100%);
    min-height: 100vh;
    color: var(--text-primary);
    overflow-x: hidden;
  }

  .app-root { min-height: 100vh; position: relative; }

  .bg-orb {
    position: fixed; border-radius: 50%; pointer-events: none; z-index: 0;
    filter: blur(80px); opacity: 0.12;
  }
  .bg-orb-1 { width: 600px; height: 600px; background: #FF6B00; top: -200px; right: -100px; }
  .bg-orb-2 { width: 400px; height: 400px; background: #FF4400; bottom: 100px; left: -150px; }

  /* ── Login ── */
  .login-wrap {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    position: relative; z-index: 1; padding: 1rem;
  }
  .login-card {
    background: rgba(255,255,255,0.06);
    backdrop-filter: blur(24px);
    border: 1px solid var(--glass-border);
    border-radius: 24px;
    padding: 2.5rem 2rem;
    width: 100%; max-width: 400px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12);
  }
  .login-logo { text-align: center; margin-bottom: 2rem; }
  .login-logo-icon {
    width: 64px; height: 64px; border-radius: 16px;
    background: linear-gradient(135deg, var(--orange), var(--orange-dark));
    display: flex; align-items: center; justify-content: center;
    font-size: 1.8rem; margin: 0 auto 1rem;
    box-shadow: 0 8px 24px rgba(255,107,0,0.4);
  }
  .login-title { font-size: 1.3rem; font-weight: 700; color: var(--orange-light); letter-spacing: 0.5px; }
  .login-sub { font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; letter-spacing: 1px; text-transform: uppercase; }

  .form-group { margin-bottom: 1rem; }
  .form-label { font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 6px; display: block; text-transform: uppercase; letter-spacing: 0.8px; }
  .form-input {
    width: 100%; padding: 0.75rem 1rem;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 10px;
    color: var(--text-primary);
    font-family: var(--font);
    font-size: 0.9rem;
    outline: none; transition: all 0.2s;
  }
  .form-input:focus { border-color: var(--orange); background: rgba(255,107,0,0.08); box-shadow: 0 0 0 3px rgba(255,107,0,0.12); }
  .form-input::placeholder { color: var(--text-muted); }

  .btn-primary {
    width: 100%; padding: 0.85rem;
    background: linear-gradient(135deg, var(--orange), var(--orange-dark));
    border: none; border-radius: 10px;
    color: white; font-family: var(--font); font-size: 0.9rem; font-weight: 600;
    cursor: pointer; transition: all 0.2s; letter-spacing: 0.5px;
    box-shadow: 0 4px 16px rgba(255,107,0,0.3);
  }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(255,107,0,0.4); }
  .btn-primary:active { transform: translateY(0); }

  /* ── App layout ── */
  .app-layout { display: flex; min-height: 100vh; position: relative; z-index: 1; }

  /* ── Sidebar ── */
  .sidebar {
    width: 240px; min-height: 100vh;
    background: rgba(255,255,255,0.04);
    backdrop-filter: blur(20px);
    border-right: 1px solid var(--glass-border);
    display: flex; flex-direction: column;
    position: fixed; left: 0; top: 0; z-index: 100;
    transition: transform 0.3s;
  }
  .sidebar.mobile-hidden { transform: translateX(-100%); }
  .sidebar-logo {
    padding: 1.5rem 1.25rem;
    border-bottom: 1px solid var(--glass-border);
    display: flex; align-items: center; gap: 10px;
  }
  .sidebar-logo-icon {
    width: 36px; height: 36px; border-radius: 8px;
    background: linear-gradient(135deg, var(--orange), var(--orange-dark));
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem; flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(255,107,0,0.3);
  }
  .sidebar-logo-text { font-size: 0.8rem; font-weight: 700; color: var(--orange-light); line-height: 1.2; }
  .sidebar-logo-sub { font-size: 0.6rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }

  .sidebar-nav { flex: 1; padding: 1rem 0.75rem; display: flex; flex-direction: column; gap: 4px; overflow-y: auto; }
  .nav-section-title { font-size: 0.6rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1.2px; padding: 0.75rem 0.5rem 0.25rem; }
  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 0.6rem 0.75rem; border-radius: 10px;
    cursor: pointer; transition: all 0.15s;
    color: var(--text-secondary); font-size: 0.82rem; font-weight: 500;
    border: 1px solid transparent;
  }
  .nav-item:hover { background: var(--glass-hover); color: var(--text-primary); }
  .nav-item.active {
    background: linear-gradient(135deg, rgba(255,107,0,0.2), rgba(255,107,0,0.08));
    border-color: rgba(255,107,0,0.3);
    color: var(--orange-light);
  }
  .nav-icon { font-size: 1rem; width: 20px; text-align: center; }

  .sidebar-footer {
    padding: 1rem 0.75rem;
    border-top: 1px solid var(--glass-border);
  }
  .user-badge {
    display: flex; align-items: center; gap: 10px; padding: 0.5rem;
    background: rgba(255,255,255,0.05); border-radius: 10px;
  }
  .user-avatar {
    width: 32px; height: 32px; border-radius: 8px;
    background: linear-gradient(135deg, var(--orange), var(--orange-dark));
    display: flex; align-items: center; justify-content: center;
    font-size: 0.75rem; font-weight: 700; flex-shrink: 0;
  }
  .user-name { font-size: 0.78rem; font-weight: 600; color: var(--text-primary); }
  .user-role { font-size: 0.65rem; color: var(--text-muted); }

  /* ── Main content ── */
  .main-content { flex: 1; margin-left: 240px; min-height: 100vh; display: flex; flex-direction: column; }
  .main-content.full-width { margin-left: 0; }

  .topbar {
    padding: 1rem 1.5rem;
    background: rgba(255,255,255,0.03);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--glass-border);
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 50;
  }
  .topbar-title { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); }
  .topbar-date { font-size: 0.75rem; color: var(--text-muted); font-family: var(--mono); }
  .hamburger {
    display: none; background: none; border: none; color: var(--text-primary);
    font-size: 1.3rem; cursor: pointer; padding: 4px;
  }

  .page-body { padding: 1.5rem; flex: 1; }

  /* ── Cards ── */
  .glass-card {
    background: var(--glass-bg);
    backdrop-filter: blur(16px);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
    padding: 1.25rem;
    transition: all 0.2s;
  }
  .glass-card:hover { border-color: rgba(255,107,0,0.25); background: var(--glass-hover); }

  .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
  .stat-card {
    background: rgba(255,255,255,0.06);
    backdrop-filter: blur(16px);
    border: 1px solid var(--glass-border);
    border-radius: 16px; padding: 1.25rem;
    position: relative; overflow: hidden;
  }
  .stat-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, var(--orange), transparent);
  }
  .stat-label { font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.5rem; }
  .stat-value { font-size: 1.6rem; font-weight: 700; color: var(--text-primary); font-family: var(--mono); }
  .stat-sub { font-size: 0.7rem; color: var(--success); margin-top: 4px; }
  .stat-icon { position: absolute; top: 1rem; right: 1rem; font-size: 1.5rem; opacity: 0.25; }

  /* ── Grid layouts ── */
  .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; }
  .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }

  /* ── Section header ── */
  .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
  .section-title { font-size: 0.9rem; font-weight: 700; color: var(--text-primary); }
  .section-sub { font-size: 0.72rem; color: var(--text-muted); margin-top: 2px; }

  /* ── Tables ── */
  .table-wrap { overflow-x: auto; border-radius: 12px; border: 1px solid var(--glass-border); }
  table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
  thead tr { background: rgba(255,107,0,0.08); }
  th { padding: 0.75rem 1rem; text-align: left; font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.8px; color: var(--orange-light); font-weight: 600; border-bottom: 1px solid var(--glass-border); }
  td { padding: 0.7rem 1rem; color: var(--text-secondary); border-bottom: 1px solid rgba(255,255,255,0.04); }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: rgba(255,255,255,0.03); color: var(--text-primary); }

  /* ── Badges ── */
  .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 0.65rem; font-weight: 600; letter-spacing: 0.5px; }
  .badge-success { background: rgba(34,197,94,0.15); color: #4ade80; border: 1px solid rgba(34,197,94,0.25); }
  .badge-danger { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.25); }
  .badge-warning { background: rgba(245,158,11,0.15); color: #fbbf24; border: 1px solid rgba(245,158,11,0.25); }
  .badge-orange { background: rgba(255,107,0,0.15); color: var(--orange-light); border: 1px solid rgba(255,107,0,0.25); }
  .badge-blue { background: rgba(59,130,246,0.15); color: #93c5fd; border: 1px solid rgba(59,130,246,0.25); }

  /* ── Buttons ── */
  .btn { padding: 0.5rem 1rem; border-radius: 8px; font-family: var(--font); font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; border: none; }
  .btn-sm { padding: 0.35rem 0.75rem; font-size: 0.72rem; }
  .btn-orange { background: linear-gradient(135deg, var(--orange), var(--orange-dark)); color: white; box-shadow: 0 2px 8px rgba(255,107,0,0.3); }
  .btn-orange:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(255,107,0,0.4); }
  .btn-ghost { background: rgba(255,255,255,0.07); color: var(--text-secondary); border: 1px solid var(--glass-border); }
  .btn-ghost:hover { background: rgba(255,255,255,0.12); color: var(--text-primary); }
  .btn-danger { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.25); }

  /* ── Form elements ── */
  .input-group { margin-bottom: 1rem; }
  .input-label { font-size: 0.72rem; color: var(--text-secondary); margin-bottom: 6px; display: block; text-transform: uppercase; letter-spacing: 0.8px; }
  .input, .select { width: 100%; padding: 0.6rem 0.875rem; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; color: var(--text-primary); font-family: var(--font); font-size: 0.82rem; outline: none; transition: all 0.2s; }
  .input:focus, .select:focus { border-color: var(--orange); background: rgba(255,107,0,0.07); }
  .input::placeholder { color: var(--text-muted); }
  .select option { background: #1a0800; color: var(--text-primary); }

  /* ── POS ── */
  .pos-layout { display: grid; grid-template-columns: 1fr 320px; gap: 1rem; height: calc(100vh - 160px); }
  .pos-products { overflow-y: auto; }
  .pos-product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 0.75rem; }
  .product-card {
    background: rgba(255,255,255,0.06); border: 1px solid var(--glass-border);
    border-radius: 12px; padding: 1rem; cursor: pointer; transition: all 0.2s; text-align: center;
  }
  .product-card:hover { background: rgba(255,107,0,0.1); border-color: rgba(255,107,0,0.3); transform: translateY(-2px); }
  .product-emoji { font-size: 2rem; margin-bottom: 0.5rem; }
  .product-name { font-size: 0.78rem; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
  .product-price { font-size: 0.82rem; color: var(--orange-light); font-family: var(--mono); font-weight: 600; }
  .product-stock { font-size: 0.65rem; color: var(--text-muted); }

  .pos-cart { background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); border-radius: 16px; display: flex; flex-direction: column; overflow: hidden; }
  .cart-header { padding: 1rem; border-bottom: 1px solid var(--glass-border); }
  .cart-items { flex: 1; overflow-y: auto; padding: 0.75rem; display: flex; flex-direction: column; gap: 8px; }
  .cart-item { background: rgba(255,255,255,0.05); border-radius: 10px; padding: 0.6rem 0.75rem; display: flex; align-items: center; gap: 8px; }
  .cart-item-name { flex: 1; font-size: 0.78rem; color: var(--text-primary); }
  .qty-btn { width: 24px; height: 24px; border-radius: 6px; border: none; background: rgba(255,107,0,0.2); color: var(--orange-light); cursor: pointer; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; }
  .qty-btn:hover { background: rgba(255,107,0,0.35); }
  .cart-item-price { font-size: 0.75rem; color: var(--orange-light); font-family: var(--mono); min-width: 55px; text-align: right; }
  .cart-footer { padding: 1rem; border-top: 1px solid var(--glass-border); }
  .cart-total-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
  .cart-total-label { font-size: 0.75rem; color: var(--text-secondary); }
  .cart-total-value { font-family: var(--mono); font-weight: 700; }
  .cart-grand { font-size: 1.1rem; color: var(--orange-light); }

  /* ── Charts (CSS bars) ── */
  .bar-chart { display: flex; align-items: flex-end; gap: 8px; height: 120px; padding: 0 4px; }
  .bar-col { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; height: 100%; justify-content: flex-end; }
  .bar { width: 100%; border-radius: 4px 4px 0 0; background: linear-gradient(180deg, var(--orange-light), var(--orange-dark)); transition: height 0.5s; min-height: 4px; }
  .bar-label { font-size: 0.6rem; color: var(--text-muted); white-space: nowrap; }
  .bar-val { font-size: 0.6rem; color: var(--orange-light); font-family: var(--mono); }

  /* ── Pie (CSS) ── */
  .pie-legend { display: flex; flex-direction: column; gap: 8px; margin-top: 1rem; }
  .legend-item { display: flex; align-items: center; gap: 8px; }
  .legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .legend-label { font-size: 0.75rem; color: var(--text-secondary); flex: 1; }
  .legend-pct { font-size: 0.75rem; color: var(--text-primary); font-family: var(--mono); font-weight: 600; }

  /* ── Modal ── */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.7);
    backdrop-filter: blur(6px); z-index: 200;
    display: flex; align-items: center; justify-content: center; padding: 1rem;
  }
  .modal {
    background: rgba(20,8,0,0.9);
    backdrop-filter: blur(24px);
    border: 1px solid var(--glass-border);
    border-radius: 20px; padding: 1.5rem;
    width: 100%; max-width: 480px;
    max-height: 90vh; overflow-y: auto;
    box-shadow: 0 24px 64px rgba(0,0,0,0.6);
  }
  .modal-title { font-size: 1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: space-between; }
  .modal-close { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.2rem; }
  .modal-close:hover { color: var(--text-primary); }

  /* ── Toast ── */
  .toast {
    position: fixed; top: 1rem; right: 1rem; z-index: 300;
    background: rgba(20,8,0,0.95); backdrop-filter: blur(16px);
    border: 1px solid var(--orange); border-radius: 12px;
    padding: 0.75rem 1.25rem;
    display: flex; align-items: center; gap: 10px;
    font-size: 0.82rem; color: var(--text-primary);
    animation: slideIn 0.3s ease; max-width: 320px;
    box-shadow: 0 8px 24px rgba(255,107,0,0.2);
  }
  @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .sidebar { width: 260px; }
    .main-content { margin-left: 0; }
    .hamburger { display: block; }
    .pos-layout { grid-template-columns: 1fr; height: auto; }
    .pos-cart { height: 400px; }
    .sidebar-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 99; display: none; }
    .sidebar-overlay.show { display: block; }
  }

  .profit-positive { color: var(--success); }
  .profit-negative { color: var(--danger); }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,107,0,0.3); border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(255,107,0,0.5); }

  /* ── Print ── */
  .receipt-box { background: white; color: #111; border-radius: 12px; padding: 1.5rem; font-family: var(--mono); font-size: 0.78rem; }
  .receipt-box h3 { color: #CC5500; text-align: center; font-size: 1rem; margin-bottom: 0.5rem; }
  .receipt-box .r-line { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed #ddd; }

  .tabs { display: flex; gap: 4px; background: rgba(255,255,255,0.05); padding: 4px; border-radius: 10px; margin-bottom: 1.25rem; }
  .tab { flex: 1; padding: 0.5rem; border-radius: 7px; border: none; background: none; color: var(--text-muted); font-family: var(--font); font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: all 0.2s; text-align: center; }
  .tab.active { background: rgba(255,107,0,0.2); color: var(--orange-light); }
`;

// ── Seed data ─────────────────────────────────────────────────────────────────
const INITIAL_PRODUCTS = [
  { id: 1, name: "Ankara Dress", price: 180, cost: 80, stock: 24, emoji: "👗", category: "Dress" },
  { id: 2, name: "Kente Gown", price: 320, cost: 140, stock: 12, emoji: "👘", category: "Gown" },
  { id: 3, name: "Lace Blouse", price: 95, cost: 40, stock: 38, emoji: "👚", category: "Blouse" },
  { id: 4, name: "Embroidered Kaftan", price: 250, cost: 110, stock: 8, emoji: "🥻", category: "Kaftan" },
  { id: 5, name: "Chiffon Skirt", price: 75, cost: 30, stock: 45, emoji: "🩱", category: "Skirt" },
  { id: 6, name: "Damask Suit", price: 420, cost: 180, stock: 6, emoji: "🧥", category: "Suit" },
  { id: 7, name: "Aso-Oke Set", price: 550, cost: 230, stock: 5, emoji: "🎽", category: "Set" },
  { id: 8, name: "Casual Shirt", price: 60, cost: 22, stock: 60, emoji: "👕", category: "Shirt" },
];

const INITIAL_DESIGNERS = [
  { id: 1, name: "Amina Kofi", role: "Senior Designer", weeklyTarget: 15, phone: "+233-24-111-0001" },
  { id: 2, name: "Fatima Mensah", role: "Senior Designer", weeklyTarget: 12, phone: "+233-24-111-0002" },
  { id: 3, name: "Grace Osei", role: "Mid Designer", weeklyTarget: 10, phone: "+233-24-111-0003" },
  { id: 4, name: "Esi Darko", role: "Junior Designer", weeklyTarget: 8, phone: "+233-24-111-0004" },
];

const INITIAL_EXPENSES = [
  { id: 1, category: "Raw Materials", amount: 2400, date: "2025-05-01", note: "Fabric purchase" },
  { id: 2, category: "Utilities", amount: 320, date: "2025-05-03", note: "Electricity & water" },
  { id: 3, category: "Salaries", amount: 1800, date: "2025-05-05", note: "Designer salaries" },
  { id: 4, category: "Equipment", amount: 650, date: "2025-05-10", note: "Sewing machine repair" },
  { id: 5, category: "Marketing", amount: 300, date: "2025-05-12", note: "Social media ads" },
];

const WEEK_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const GHS = (n) => `GHS ${Number(n).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmt = (n) => Number(n).toLocaleString();

// ── Seeded revenue data ───────────────────────────────────────────────────────
const SEED_WEEKLY = [4200, 3800, 5100, 6200, 4900, 7300, 5500];
const SEED_MONTHLY = [18000, 22000, 19500, 26000, 24000, 31000, 28000, 35000, 29000, 38000, 33000, 42000];

const SEED_WORK_RECORDS = [
  { id: 1, designerId: 1, week: "2025-W18", items: 14, pricePerItem: 40, total: 560 },
  { id: 2, designerId: 2, week: "2025-W18", items: 11, pricePerItem: 40, total: 440 },
  { id: 3, designerId: 3, week: "2025-W18", items: 9, pricePerItem: 35, total: 315 },
  { id: 4, designerId: 4, week: "2025-W18", items: 7, pricePerItem: 30, total: 210 },
  { id: 5, designerId: 1, week: "2025-W19", items: 16, pricePerItem: 40, total: 640 },
  { id: 6, designerId: 2, week: "2025-W19", items: 13, pricePerItem: 40, total: 520 },
];

const SEED_SALES = [
  { id: 1, productId: 1, qty: 3, total: 540, date: "2025-05-10", payment: "Cash" },
  { id: 2, productId: 4, qty: 1, total: 250, date: "2025-05-11", payment: "Mobile Money" },
  { id: 3, productId: 7, qty: 2, total: 1100, date: "2025-05-12", payment: "Card" },
  { id: 4, productId: 2, qty: 1, total: 320, date: "2025-05-13", payment: "Cash" },
  { id: 5, productId: 3, qty: 5, total: 475, date: "2025-05-14", payment: "Mobile Money" },
];

// ── Main App ──────────────────────────────────────────────────────────────────
export default function DemakFashionSystem() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "", pin: "" });
  const [loginStep, setLoginStep] = useState(1);
  const [loginError, setLoginError] = useState("");
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Data state
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [designers, setDesigners] = useState(INITIAL_DESIGNERS);
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [workRecords, setWorkRecords] = useState(SEED_WORK_RECORDS);
  const [sales, setSales] = useState(SEED_SALES);
  const [cartItems, setCartItems] = useState([]);

  const showToast = useCallback((msg, icon = "✅") => {
    setToast({ msg, icon });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Login logic
  const handleLogin = () => {
    if (loginStep === 1) {
      if (loginData.username === "CEO" && loginData.password === "DEMAK2024") {
        setLoginStep(2);
        setLoginError("");
      } else {
        setLoginError("Invalid credentials. Try ***** / *******");
      }
    } else {
      if (loginData.pin === "1234") {
        setAuthenticated(true);
        setLoginError("");
      } else {
        setLoginError("Invalid PIN. Try *****");
      }
    }
  };

  const totalRevenue = sales.reduce((s, r) => s + r.total, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const grossProfit = totalRevenue - totalExpenses;

  if (!authenticated) {
    return (
      <>
        <style>{CSS}</style>
        <div className="app-root">
          <div className="bg-orb bg-orb-1" />
          <div className="bg-orb bg-orb-2" />
          <div className="login-wrap">
            <div className="login-card">
              <div className="login-logo">
                <div className="login-logo-icon">👗</div>
                <div className="login-title">DEMAK FASHION</div>
                <div className="login-sub">INDUSTRY • CEO PORTAL</div>
              </div>

              {loginStep === 1 ? (
                <>
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input className="form-input" placeholder="Enter username" value={loginData.username}
                      onChange={e => setLoginData(p => ({ ...p, username: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input className="form-input" type="password" placeholder="Enter password" value={loginData.password}
                      onChange={e => setLoginData(p => ({ ...p, password: e.target.value }))}
                      onKeyDown={e => e.key === "Enter" && handleLogin()} />
                  </div>
                </>
              ) : (
                <div className="form-group">
                  <label className="form-label">🔐 Security PIN</label>
                  <input className="form-input" type="password" maxLength={4} placeholder="Enter 4-digit PIN"
                    value={loginData.pin} onChange={e => setLoginData(p => ({ ...p, pin: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && handleLogin()} style={{ letterSpacing: "0.4rem", fontSize: "1.2rem" }} />
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 6 }}>
                    Two-factor security verification
                  </div>
                </div>
              )}

              {loginError && (
                <div style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, padding: "0.6rem 0.875rem", fontSize: "0.78rem", color: "#f87171", marginBottom: "1rem" }}>
                  {loginError}
                </div>
              )}

              <button className="btn-primary" onClick={handleLogin}>
                {loginStep === 1 ? "Continue →" : "Access System"}
              </button>

              <div style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.68rem", color: "var(--text-muted)" }}>
                🔒 Secured CEO-Only Access • Demak Fashion Industry
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="app-root">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />

        {toast && (
          <div className="toast">
            <span>{toast.icon}</span>
            <span>{toast.msg}</span>
          </div>
        )}

        <div className="app-layout">
          {/* Sidebar overlay for mobile */}
          <div className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`} onClick={() => setSidebarOpen(false)} />

          {/* Sidebar */}
          <aside className={`sidebar ${sidebarOpen ? "" : "mobile-hidden"}`} style={{ transform: sidebarOpen ? "translateX(0)" : undefined }}>
            <div className="sidebar-logo">
              <div className="sidebar-logo-icon">👗</div>
              <div>
                <div className="sidebar-logo-text">DEMAK FASHION</div>
                <div className="sidebar-logo-sub">Industry</div>
              </div>
            </div>

            <nav className="sidebar-nav">
              {[
                { id: "dashboard", icon: "📊", label: "Dashboard" },
                { id: "pos", icon: "🛒", label: "Point of Sale" },
                { id: "products", icon: "👗", label: "Products" },
                { id: "designers", icon: "✂️", label: "Designer Tracker" },
                { id: "finance", icon: "💰", label: "Financial Records" },
                { id: "expenses", icon: "📋", label: "Expenditure" },
                { id: "reports", icon: "📈", label: "Monthly Reports" },
                { id: "settings", icon: "⚙️", label: "Settings" },
              ].map(item => (
                <div key={item.id}
                  className={`nav-item ${currentPage === item.id ? "active" : ""}`}
                  onClick={() => { setCurrentPage(item.id); setSidebarOpen(false); }}>
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </nav>

            <div className="sidebar-footer">
              <div className="user-badge">
                <div className="user-avatar">CEO</div>
                <div>
                  <div className="user-name">Chief Executive</div>
                  <div className="user-role">Full Access</div>
                </div>
              </div>
              <button className="btn btn-ghost" style={{ width: "100%", marginTop: 8, fontSize: "0.72rem" }}
                onClick={() => setAuthenticated(false)}>
                🔒 Lock System
              </button>
            </div>
          </aside>

          {/* Main content */}
          <main className="main-content">
            <div className="topbar">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
                <div>
                  <div className="topbar-title">
                    {{ dashboard: "Dashboard", pos: "Point of Sale", products: "Products", designers: "Designer Tracker", finance: "Financial Records", expenses: "Expenditure", reports: "Monthly Reports", settings: "Settings" }[currentPage]}
                  </div>
                  <div className="topbar-date">{new Date().toLocaleDateString("en-GH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div className="badge badge-success">● Live</div>
              </div>
            </div>

            <div className="page-body">
              {currentPage === "dashboard" && <DashboardPage sales={sales} expenses={expenses} products={products} workRecords={workRecords} designers={designers} />}
              {currentPage === "pos" && <POSPage products={products} setProducts={setProducts} cartItems={cartItems} setCartItems={setCartItems} sales={sales} setSales={setSales} showToast={showToast} />}
              {currentPage === "products" && <ProductsPage products={products} setProducts={setProducts} showToast={showToast} />}
              {currentPage === "designers" && <DesignersPage designers={designers} setDesigners={setDesigners} workRecords={workRecords} setWorkRecords={setWorkRecords} showToast={showToast} />}
              {currentPage === "finance" && <FinancePage sales={sales} products={products} />}
              {currentPage === "expenses" && <ExpensesPage expenses={expenses} setExpenses={setExpenses} showToast={showToast} />}
              {currentPage === "reports" && <ReportsPage sales={sales} expenses={expenses} workRecords={workRecords} designers={designers} products={products} />}
              {currentPage === "settings" && <SettingsPage showToast={showToast} />}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function DashboardPage({ sales, expenses, products, workRecords, designers }) {
  const totalRev = sales.reduce((s, r) => s + r.total, 0);
  const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
  const profit = totalRev - totalExp;
  const totalItems = workRecords.reduce((s, r) => s + r.items, 0);
  const lowStock = products.filter(p => p.stock < 10).length;
  const maxWeek = Math.max(...SEED_WEEKLY);

  return (
    <div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value" style={{ fontSize: "1.1rem" }}>{GHS(totalRev)}</div>
          <div className="stat-sub">▲ +12.4% this month</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-label">Total Expenses</div>
          <div className="stat-value" style={{ fontSize: "1.1rem" }}>{GHS(totalExp)}</div>
          <div className="stat-sub" style={{ color: "var(--danger)" }}>▼ -3.2% vs last</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-label">Net Profit</div>
          <div className="stat-value" style={{ fontSize: "1.1rem", color: profit > 0 ? "var(--success)" : "var(--danger)" }}>{GHS(profit)}</div>
          <div className="stat-sub">Margin: {totalRev ? ((profit / totalRev) * 100).toFixed(1) : 0}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✂️</div>
          <div className="stat-label">Items Sewn (Total)</div>
          <div className="stat-value">{fmt(totalItems)}</div>
          <div className="stat-sub">{designers.length} active designers</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: "1rem" }}>
        <div className="glass-card">
          <div className="section-header">
            <div>
              <div className="section-title">Weekly Revenue</div>
              <div className="section-sub">Current week performance</div>
            </div>
          </div>
          <div className="bar-chart">
            {SEED_WEEKLY.map((val, i) => (
              <div className="bar-col" key={i}>
                <div className="bar-val">{(val / 1000).toFixed(1)}k</div>
                <div className="bar" style={{ height: `${(val / maxWeek) * 90}%` }} />
                <div className="bar-label">{WEEK_LABELS[i]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card">
          <div className="section-header">
            <div>
              <div className="section-title">Revenue Breakdown</div>
              <div className="section-sub">By payment method</div>
            </div>
          </div>
          {[
            { label: "Cash", pct: 38, color: "#FF6B00" },
            { label: "Mobile Money", pct: 42, color: "#22c55e" },
            { label: "Card", pct: 20, color: "#3b82f6" },
          ].map(item => (
            <div key={item.label} style={{ marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: 4 }}>
                <span style={{ color: "var(--text-secondary)" }}>{item.label}</span>
                <span style={{ color: "var(--text-primary)", fontFamily: "var(--mono)" }}>{item.pct}%</span>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${item.pct}%`, background: item.color, borderRadius: 4, transition: "width 0.8s" }} />
              </div>
            </div>
          ))}

          <div style={{ marginTop: "1rem", padding: "0.75rem", background: "rgba(255,107,0,0.08)", borderRadius: 10, border: "1px solid rgba(255,107,0,0.15)" }}>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: 4 }}>Low Stock Alert</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: lowStock > 0 ? "var(--warning)" : "var(--success)" }}>
              {lowStock} product{lowStock !== 1 ? "s" : ""} low
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card">
        <div className="section-header">
          <div className="section-title">Recent Sales</div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th>Date</th><th>Product</th><th>Qty</th><th>Total</th><th>Payment</th>
            </tr></thead>
            <tbody>
              {sales.slice(-6).reverse().map(s => {
                const prod = INITIAL_PRODUCTS.find(p => p.id === s.productId) || {};
                return (
                  <tr key={s.id}>
                    <td style={{ fontFamily: "var(--mono)", fontSize: "0.72rem" }}>{s.date}</td>
                    <td>{prod.emoji} {prod.name}</td>
                    <td>{s.qty}</td>
                    <td style={{ color: "var(--orange-light)", fontFamily: "var(--mono)" }}>{GHS(s.total)}</td>
                    <td><span className={`badge ${s.payment === "Cash" ? "badge-warning" : s.payment === "Card" ? "badge-blue" : "badge-success"}`}>{s.payment}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── POS Page ──────────────────────────────────────────────────────────────────
function POSPage({ products, setProducts, cartItems, setCartItems, sales, setSales, showToast }) {
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [discount, setDiscount] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState(null);
  const [search, setSearch] = useState("");

  const addToCart = (product) => {
    if (product.stock < 1) { showToast("Out of stock!", "⚠️"); return; }
    setCartItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCartItems(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i).filter(i => i.qty > 0));
  };

  const removeItem = (id) => setCartItems(prev => prev.filter(i => i.id !== id));

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const discountAmt = (subtotal * discount) / 100;
  const total = subtotal - discountAmt;

  const checkout = () => {
    if (cartItems.length === 0) { showToast("Cart is empty", "⚠️"); return; }
    const newSale = {
      id: Date.now(),
      productId: cartItems[0].id,
      qty: cartItems.reduce((s, i) => s + i.qty, 0),
      total,
      date: new Date().toISOString().split("T")[0],
      payment: paymentMethod,
      items: [...cartItems],
    };
    setSales(prev => [...prev, newSale]);
    setProducts(prev => prev.map(p => {
      const ci = cartItems.find(i => i.id === p.id);
      return ci ? { ...p, stock: p.stock - ci.qty } : p;
    }));
    setLastSale(newSale);
    setCartItems([]);
    setDiscount(0);
    setShowReceipt(true);
    showToast("Sale completed!", "🎉");
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <input className="input" placeholder="🔍 Search products..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 300 }} />
      </div>

      <div className="pos-layout">
        <div className="pos-products">
          <div className="pos-product-grid">
            {filtered.map(p => (
              <div key={p.id} className="product-card" onClick={() => addToCart(p)}>
                <div className="product-emoji">{p.emoji}</div>
                <div className="product-name">{p.name}</div>
                <div className="product-price">{GHS(p.price)}</div>
                <div className="product-stock">{p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="pos-cart">
          <div className="cart-header">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="section-title">🛒 Cart ({cartItems.length})</div>
              {cartItems.length > 0 && (
                <button className="btn btn-sm btn-ghost" onClick={() => setCartItems([])}>Clear</button>
              )}
            </div>
          </div>

          <div className="cart-items">
            {cartItems.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem 0", fontSize: "0.82rem" }}>
                <div style={{ fontSize: "2rem", marginBottom: 8 }}>🛍️</div>
                Tap a product to add it
              </div>
            ) : cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <span>{item.emoji}</span>
                <div className="cart-item-name">{item.name}</div>
                <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>−</button>
                <span style={{ fontSize: "0.78rem", minWidth: 20, textAlign: "center" }}>{item.qty}</span>
                <button className="qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
                <div className="cart-item-price">{GHS(item.price * item.qty)}</div>
                <button style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.8rem" }} onClick={() => removeItem(item.id)}>✕</button>
              </div>
            ))}
          </div>

          <div className="cart-footer">
            <div className="cart-total-row">
              <span className="cart-total-label">Subtotal</span>
              <span className="cart-total-value" style={{ fontFamily: "var(--mono)", fontSize: "0.82rem" }}>{GHS(subtotal)}</span>
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
              <label className="input-label">Discount (%)</label>
              <input type="number" className="input" min={0} max={100} value={discount}
                onChange={e => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                style={{ marginBottom: 0 }} />
            </div>

            {discount > 0 && (
              <div className="cart-total-row">
                <span className="cart-total-label" style={{ color: "var(--success)" }}>Discount</span>
                <span style={{ color: "var(--success)", fontFamily: "var(--mono)", fontSize: "0.82rem" }}>-{GHS(discountAmt)}</span>
              </div>
            )}

            <div className="cart-total-row" style={{ paddingTop: 8, borderTop: "1px solid var(--glass-border)", marginTop: 8 }}>
              <span className="cart-total-label" style={{ fontWeight: 700, color: "var(--text-primary)" }}>TOTAL</span>
              <span className="cart-grand cart-total-value">{GHS(total)}</span>
            </div>

            <div style={{ marginBottom: "0.75rem", marginTop: "0.75rem" }}>
              <label className="input-label">Payment Method</label>
              <select className="select" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                <option>Cash</option>
                <option>Mobile Money</option>
                <option>Card</option>
                <option>Bank Transfer</option>
              </select>
            </div>

            <button className="btn btn-orange" style={{ width: "100%" }} onClick={checkout}>
              ✅ Complete Sale
            </button>
          </div>
        </div>
      </div>

      {showReceipt && lastSale && (
        <div className="modal-overlay" onClick={() => setShowReceipt(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">
              Sale Receipt
              <button className="modal-close" onClick={() => setShowReceipt(false)}>✕</button>
            </div>
            <div className="receipt-box">
              <h3>DEMAK FASHION INDUSTRY</h3>
              <div style={{ textAlign: "center", fontSize: "0.68rem", color: "#666", marginBottom: "1rem" }}>
                {new Date().toLocaleString()}
              </div>
              {lastSale.items?.map(item => (
                <div className="r-line" key={item.id}>
                  <span>{item.emoji} {item.name} ×{item.qty}</span>
                  <span>{GHS(item.price * item.qty)}</span>
                </div>
              ))}
              <div className="r-line" style={{ fontWeight: 700, borderBottom: "2px solid #CC5500", paddingTop: 8, marginTop: 4 }}>
                <span>TOTAL PAID ({lastSale.payment})</span>
                <span>{GHS(lastSale.total)}</span>
              </div>
              <div style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.68rem", color: "#999" }}>
                Thank you for shopping with Demak Fashion!
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: "1rem" }}>
              <button className="btn btn-orange" style={{ flex: 1 }} onClick={() => setShowReceipt(false)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Products Page ─────────────────────────────────────────────────────────────
function ProductsPage({ products, setProducts, showToast }) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", price: "", cost: "", stock: "", emoji: "👗", category: "" });

  const openAdd = () => { setEditing(null); setForm({ name: "", price: "", cost: "", stock: "", emoji: "👗", category: "" }); setShowModal(true); };
  const openEdit = (p) => { setEditing(p.id); setForm({ name: p.name, price: p.price, cost: p.cost, stock: p.stock, emoji: p.emoji, category: p.category }); setShowModal(true); };

  const save = () => {
    if (!form.name || !form.price || !form.cost || !form.stock) { showToast("Fill all fields", "⚠️"); return; }
    if (editing) {
      setProducts(prev => prev.map(p => p.id === editing ? { ...p, ...form, price: +form.price, cost: +form.cost, stock: +form.stock } : p));
      showToast("Product updated");
    } else {
      setProducts(prev => [...prev, { id: Date.now(), ...form, price: +form.price, cost: +form.cost, stock: +form.stock }]);
      showToast("Product added");
    }
    setShowModal(false);
  };

  const del = (id) => { setProducts(prev => prev.filter(p => p.id !== id)); showToast("Product removed", "🗑️"); };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <button className="btn btn-orange" onClick={openAdd}>+ Add Product</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Item</th><th>Category</th><th>Selling Price</th><th>Cost Price</th><th>Profit</th><th>Stock</th><th>Actions</th></tr></thead>
          <tbody>
            {products.map(p => {
              const profit = p.price - p.cost;
              return (
                <tr key={p.id}>
                  <td><span style={{ marginRight: 6 }}>{p.emoji}</span>{p.name}</td>
                  <td><span className="badge badge-orange">{p.category}</span></td>
                  <td style={{ fontFamily: "var(--mono)", color: "var(--orange-light)" }}>{GHS(p.price)}</td>
                  <td style={{ fontFamily: "var(--mono)" }}>{GHS(p.cost)}</td>
                  <td style={{ fontFamily: "var(--mono)" }} className={profit > 0 ? "profit-positive" : "profit-negative"}>{GHS(profit)}</td>
                  <td><span className={`badge ${p.stock < 10 ? "badge-danger" : p.stock < 20 ? "badge-warning" : "badge-success"}`}>{p.stock}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="btn btn-sm btn-ghost" onClick={() => openEdit(p)}>✏️</button>
                      <button className="btn btn-sm btn-danger" onClick={() => del(p.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">
              {editing ? "Edit Product" : "Add Product"}
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {[["name", "Product Name", "text"], ["emoji", "Emoji", "text"], ["category", "Category", "text"], ["price", "Selling Price (GHS)", "number"], ["cost", "Cost Price (GHS)", "number"], ["stock", "Stock Quantity", "number"]].map(([key, lbl, type]) => (
              <div className="input-group" key={key}>
                <label className="input-label">{lbl}</label>
                <input className="input" type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
              </div>
            ))}
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
              <button className="btn btn-orange" onClick={save} style={{ flex: 1 }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Designers Tracker ─────────────────────────────────────────────────────────
function DesignersPage({ designers, setDesigners, workRecords, setWorkRecords, showToast }) {
  const [tab, setTab] = useState("records");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ designerId: "", week: "", items: "", pricePerItem: "" });

  const currentWeek = "2025-W20";
  const weeks = [...new Set(workRecords.map(r => r.week))].sort().reverse();

  const addRecord = () => {
    if (!form.designerId || !form.week || !form.items || !form.pricePerItem) { showToast("Fill all fields", "⚠️"); return; }
    const total = Number(form.items) * Number(form.pricePerItem);
    setWorkRecords(prev => [...prev, { id: Date.now(), designerId: Number(form.designerId), week: form.week, items: Number(form.items), pricePerItem: Number(form.pricePerItem), total }]);
    setShowModal(false);
    showToast("Work record added");
  };

  const weeklyTotals = designers.map(d => {
    const records = workRecords.filter(r => r.designerId === d.id);
    const latestWeek = workRecords.filter(r => r.designerId === d.id).sort((a, b) => b.week.localeCompare(a.week))[0];
    return {
      ...d,
      totalItems: records.reduce((s, r) => s + r.items, 0),
      totalEarned: records.reduce((s, r) => s + r.total, 0),
      thisWeekItems: latestWeek?.items || 0,
      thisWeekEarned: latestWeek?.total || 0,
      weeklyTarget: d.weeklyTarget,
    };
  });

  return (
    <div>
      <div className="tabs">
        <button className={`tab ${tab === "records" ? "active" : ""}`} onClick={() => setTab("records")}>📋 Work Records</button>
        <button className={`tab ${tab === "weekly" ? "active" : ""}`} onClick={() => setTab("weekly")}>📊 Weekly Revenue</button>
        <button className={`tab ${tab === "summary" ? "active" : ""}`} onClick={() => setTab("summary")}>👤 Designer Summary</button>
      </div>

      {tab === "records" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
            <button className="btn btn-orange" onClick={() => { setForm({ designerId: "", week: currentWeek, items: "", pricePerItem: "" }); setShowModal(true); }}>
              + Log Work
            </button>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Designer</th><th>Week</th><th>Items Sewn</th><th>Rate/Item</th><th>Total Earned</th><th>vs Target</th></tr></thead>
              <tbody>
                {workRecords.sort((a, b) => b.week.localeCompare(a.week)).map(r => {
                  const d = designers.find(x => x.id === r.designerId);
                  const hitTarget = r.items >= (d?.weeklyTarget || 0);
                  return (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600 }}>{d?.name}</td>
                      <td style={{ fontFamily: "var(--mono)", fontSize: "0.72rem" }}>{r.week}</td>
                      <td style={{ fontFamily: "var(--mono)", color: "var(--orange-light)", fontWeight: 700 }}>{r.items}</td>
                      <td style={{ fontFamily: "var(--mono)" }}>{GHS(r.pricePerItem)}</td>
                      <td style={{ fontFamily: "var(--mono)", color: "var(--success)", fontWeight: 700 }}>{GHS(r.total)}</td>
                      <td><span className={`badge ${hitTarget ? "badge-success" : "badge-danger"}`}>{hitTarget ? "✓ Met" : "✗ Below"}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "weekly" && (
        <div>
          <div className="section-title" style={{ marginBottom: "1rem" }}>Weekly Revenue by Designer</div>
          {weeks.map(week => {
            const weekData = workRecords.filter(r => r.week === week);
            const weekTotal = weekData.reduce((s, r) => s + r.total, 0);
            return (
              <div key={week} className="glass-card" style={{ marginBottom: "1rem" }}>
                <div className="section-header">
                  <div>
                    <div className="section-title">{week}</div>
                    <div className="section-sub">Week Total: {GHS(weekTotal)}</div>
                  </div>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Designer</th><th>Items</th><th>Rate</th><th>Earnings</th></tr></thead>
                    <tbody>
                      {weekData.map(r => {
                        const d = designers.find(x => x.id === r.designerId);
                        return (
                          <tr key={r.id}>
                            <td>{d?.name}</td>
                            <td style={{ fontFamily: "var(--mono)" }}>{r.items} pcs</td>
                            <td style={{ fontFamily: "var(--mono)" }}>{GHS(r.pricePerItem)}</td>
                            <td style={{ color: "var(--success)", fontFamily: "var(--mono)", fontWeight: 700 }}>{GHS(r.total)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "summary" && (
        <div className="grid-2">
          {weeklyTotals.map(d => (
            <div key={d.id} className="glass-card">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1rem" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, var(--orange), var(--orange-dark))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.85rem" }}>
                  {d.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{d.name}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{d.role}</div>
                </div>
              </div>
              {[
                ["Total Items Sewn", d.totalItems + " pcs"],
                ["Total Earned", GHS(d.totalEarned)],
                ["Latest Week Items", d.thisWeekItems + " / " + d.weeklyTarget + " target"],
                ["Latest Week Pay", GHS(d.thisWeekEarned)],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: "0.78rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>{label}</span>
                  <span style={{ fontFamily: "var(--mono)", color: "var(--text-primary)", fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">Log Designer Work<button className="modal-close" onClick={() => setShowModal(false)}>✕</button></div>
            <div className="input-group">
              <label className="input-label">Designer</label>
              <select className="select" value={form.designerId} onChange={e => setForm(p => ({ ...p, designerId: e.target.value }))}>
                <option value="">Select designer...</option>
                {designers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Week (e.g. 2025-W20)</label>
              <input className="input" value={form.week} onChange={e => setForm(p => ({ ...p, week: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Items Sewn</label>
              <input className="input" type="number" value={form.items} onChange={e => setForm(p => ({ ...p, items: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Price Per Item (GHS)</label>
              <input className="input" type="number" value={form.pricePerItem} onChange={e => setForm(p => ({ ...p, pricePerItem: e.target.value }))} />
            </div>
            {form.items && form.pricePerItem && (
              <div style={{ background: "rgba(255,107,0,0.1)", borderRadius: 10, padding: "0.75rem", marginBottom: "1rem", fontSize: "0.82rem" }}>
                💰 Total to pay: <strong style={{ color: "var(--orange-light)" }}>{GHS(Number(form.items) * Number(form.pricePerItem))}</strong>
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
              <button className="btn btn-orange" onClick={addRecord} style={{ flex: 1 }}>Save Record</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Finance Page ──────────────────────────────────────────────────────────────
function FinancePage({ sales, products }) {
  const enriched = sales.map(s => {
    const prod = products.find(p => p.id === s.productId) || {};
    const cost = (prod.cost || 0) * s.qty;
    const profit = s.total - cost;
    return { ...s, product: prod, cost, profit };
  });
  const totalRev = enriched.reduce((s, r) => s + r.total, 0);
  const totalCost = enriched.reduce((s, r) => s + r.cost, 0);
  const totalProfit = enriched.reduce((s, r) => s + r.profit, 0);
  const margin = totalRev ? ((totalProfit / totalRev) * 100).toFixed(1) : 0;

  return (
    <div>
      <div className="stat-grid" style={{ marginBottom: "1.5rem" }}>
        {[
          ["💵 Total Revenue", GHS(totalRev), "var(--orange-light)"],
          ["📦 Total COGS", GHS(totalCost), "var(--danger)"],
          ["📈 Gross Profit", GHS(totalProfit), "var(--success)"],
          ["% Profit Margin", margin + "%", "var(--warning)"],
        ].map(([label, value, color]) => (
          <div key={label} className="stat-card">
            <div className="stat-label">{label}</div>
            <div className="stat-value" style={{ fontSize: "1rem", color }}>{value}</div>
          </div>
        ))}
      </div>

      <div className="glass-card">
        <div className="section-title" style={{ marginBottom: "1rem" }}>Sales & Profit Analysis</div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Date</th><th>Product</th><th>Qty</th><th>Selling Price</th><th>Cost Price</th><th>Profit</th><th>Margin</th><th>Method</th></tr></thead>
            <tbody>
              {enriched.sort((a, b) => b.date.localeCompare(a.date)).map(s => {
                const margin = s.total ? ((s.profit / s.total) * 100).toFixed(0) : 0;
                return (
                  <tr key={s.id}>
                    <td style={{ fontFamily: "var(--mono)", fontSize: "0.72rem" }}>{s.date}</td>
                    <td>{s.product.emoji} {s.product.name || "—"}</td>
                    <td>{s.qty}</td>
                    <td style={{ fontFamily: "var(--mono)", color: "var(--orange-light)" }}>{GHS(s.total)}</td>
                    <td style={{ fontFamily: "var(--mono)", color: "var(--danger)" }}>{GHS(s.cost)}</td>
                    <td style={{ fontFamily: "var(--mono)" }} className={s.profit >= 0 ? "profit-positive" : "profit-negative"}>{GHS(s.profit)}</td>
                    <td><span className={`badge ${margin > 40 ? "badge-success" : margin > 20 ? "badge-warning" : "badge-danger"}`}>{margin}%</span></td>
                    <td><span className="badge badge-blue">{s.payment}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Expenses Page ─────────────────────────────────────────────────────────────
function ExpensesPage({ expenses, setExpenses, showToast }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ category: "", amount: "", date: "", note: "" });
  const CATEGORIES = ["Raw Materials", "Utilities", "Salaries", "Equipment", "Marketing", "Rent", "Transport", "Miscellaneous"];
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const byCategory = CATEGORIES.map(cat => ({
    cat, total: expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0)
  })).filter(x => x.total > 0).sort((a, b) => b.total - a.total);

  const save = () => {
    if (!form.category || !form.amount || !form.date) { showToast("Fill required fields", "⚠️"); return; }
    setExpenses(prev => [...prev, { id: Date.now(), ...form, amount: Number(form.amount) }]);
    setShowModal(false);
    showToast("Expense recorded");
  };

  const del = (id) => { setExpenses(prev => prev.filter(e => e.id !== id)); showToast("Expense deleted", "🗑️"); };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "0.75rem 1.25rem" }}>
          <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginBottom: 4 }}>TOTAL EXPENDITURE</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: "1.3rem", fontWeight: 700, color: "#f87171" }}>{GHS(total)}</div>
        </div>
        <button className="btn btn-orange" onClick={() => { setForm({ category: "", amount: "", date: new Date().toISOString().split("T")[0], note: "" }); setShowModal(true); }}>
          + Add Expense
        </button>
      </div>

      <div className="grid-2" style={{ marginBottom: "1.5rem" }}>
        <div className="glass-card">
          <div className="section-title" style={{ marginBottom: "1rem" }}>By Category</div>
          {byCategory.map(({ cat, total: catTotal }) => (
            <div key={cat} style={{ marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: 4 }}>
                <span style={{ color: "var(--text-secondary)" }}>{cat}</span>
                <span style={{ color: "var(--text-primary)", fontFamily: "var(--mono)" }}>{GHS(catTotal)}</span>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(catTotal / total) * 100}%`, background: "var(--danger)", borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card">
          <div className="section-title" style={{ marginBottom: "1rem" }}>Expense Summary</div>
          {byCategory.map(({ cat, total: catTotal }) => (
            <div key={cat} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: "0.78rem" }}>
              <span style={{ color: "var(--text-muted)" }}>{cat}</span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontFamily: "var(--mono)", color: "#f87171" }}>{GHS(catTotal)}</span>
                <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{((catTotal / total) * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Note</th><th></th></tr></thead>
          <tbody>
            {expenses.sort((a, b) => b.date.localeCompare(a.date)).map(e => (
              <tr key={e.id}>
                <td style={{ fontFamily: "var(--mono)", fontSize: "0.72rem" }}>{e.date}</td>
                <td><span className="badge badge-warning">{e.category}</span></td>
                <td style={{ fontFamily: "var(--mono)", color: "#f87171", fontWeight: 700 }}>{GHS(e.amount)}</td>
                <td style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{e.note}</td>
                <td><button className="btn btn-sm btn-danger" onClick={() => del(e.id)}>🗑️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">Add Expense<button className="modal-close" onClick={() => setShowModal(false)}>✕</button></div>
            <div className="input-group">
              <label className="input-label">Category</label>
              <select className="select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                <option value="">Select...</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Amount (GHS)</label>
              <input className="input" type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Date</label>
              <input className="input" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Note (optional)</label>
              <input className="input" value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} placeholder="Short description..." />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
              <button className="btn btn-orange" onClick={save} style={{ flex: 1 }}>Record</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Reports Page ──────────────────────────────────────────────────────────────
function ReportsPage({ sales, expenses, workRecords, designers, products }) {
  const [month, setMonth] = useState(4);
  const totalRev = sales.reduce((s, r) => s + r.total, 0);
  const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalRev - totalExp;
  const margin = totalRev ? ((netProfit / totalRev) * 100).toFixed(1) : 0;
  const designerPay = workRecords.reduce((s, r) => s + r.total, 0);
  const maxMonth = Math.max(...SEED_MONTHLY);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
        <div className="section-title">Monthly Report</div>
        <select className="select" value={month} onChange={e => setMonth(Number(e.target.value))} style={{ width: "auto" }}>
          {MONTHS.map((m, i) => <option key={i} value={i}>{m} 2025</option>)}
        </select>
      </div>

      <div className="glass-card" style={{ marginBottom: "1rem", borderColor: "rgba(255,107,0,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.25rem" }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, var(--orange), var(--orange-dark))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>📊</div>
          <div>
            <div className="section-title">DEMAK FASHION INDUSTRY</div>
            <div className="section-sub">Official Monthly Report — {MONTHS[month]} 2025</div>
          </div>
        </div>

        <div className="stat-grid">
          {[
            ["Gross Revenue", GHS(totalRev), "var(--orange-light)"],
            ["Total Expenses", GHS(totalExp), "#f87171"],
            ["Net Profit", GHS(netProfit), netProfit >= 0 ? "var(--success)" : "var(--danger)"],
            ["Profit Margin", margin + "%", "var(--warning)"],
            ["Designer Payroll", GHS(designerPay), "var(--text-primary)"],
            ["Total Sales", sales.length + " orders", "var(--text-primary)"],
          ].map(([label, value, color]) => (
            <div key={label} className="stat-card">
              <div className="stat-label">{label}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: "0.95rem", fontWeight: 700, color, marginTop: 4 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card" style={{ marginBottom: "1rem" }}>
        <div className="section-title" style={{ marginBottom: "1rem" }}>12-Month Revenue Trend</div>
        <div className="bar-chart" style={{ height: 140 }}>
          {SEED_MONTHLY.map((val, i) => (
            <div className="bar-col" key={i}>
              <div className="bar-val" style={{ fontSize: "0.55rem" }}>{(val / 1000).toFixed(0)}k</div>
              <div className="bar" style={{ height: `${(val / maxMonth) * 100}%`, background: i === month ? "var(--orange-light)" : "linear-gradient(180deg, var(--orange-dark), #331100)" }} />
              <div className="bar-label">{MONTHS[i].slice(0, 3)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: "1rem" }}>
        <div className="glass-card">
          <div className="section-title" style={{ marginBottom: "1rem" }}>P&L Statement</div>
          {[
            ["(+) Sales Revenue", GHS(totalRev), "var(--success)"],
            ["(-) Cost of Goods", GHS(expenses.filter(e => e.category === "Raw Materials").reduce((s, e) => s + e.amount, 0)), "#f87171"],
            ["(-) Salaries & Wages", GHS(designerPay), "#f87171"],
            ["(-) Operating Costs", GHS(totalExp - expenses.filter(e => e.category === "Raw Materials").reduce((s, e) => s + e.amount, 0)), "#f87171"],
            ["= NET PROFIT", GHS(netProfit), netProfit >= 0 ? "var(--success)" : "var(--danger)"],
          ].map(([label, value, color], i) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.05)" : "2px solid var(--orange)", fontWeight: i === 4 ? 700 : 400 }}>
              <span style={{ fontSize: "0.78rem", color: i === 4 ? "var(--text-primary)" : "var(--text-secondary)" }}>{label}</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: "0.78rem", color }}>{value}</span>
            </div>
          ))}
        </div>

        <div className="glass-card">
          <div className="section-title" style={{ marginBottom: "1rem" }}>Designer Performance</div>
          {designers.map(d => {
            const dRecords = workRecords.filter(r => r.designerId === d.id);
            const totalItems = dRecords.reduce((s, r) => s + r.items, 0);
            const totalPay = dRecords.reduce((s, r) => s + r.total, 0);
            return (
              <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-primary)" }}>{d.name}</div>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{totalItems} pcs sewn</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: "0.78rem", color: "var(--success)", fontWeight: 700 }}>{GHS(totalPay)}</div>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>earned</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "1rem", fontSize: "0.68rem", color: "var(--text-muted)", borderTop: "1px solid var(--glass-border)" }}>
        Generated by Demak Fashion Industry Management System • CEO Report • {new Date().toLocaleDateString()}
      </div>
    </div>
  );
}

// ── Settings Page ─────────────────────────────────────────────────────────────
function SettingsPage({ showToast }) {
  const [companyName, setCompanyName] = useState("DEMAK FASHION INDUSTRY");
  const [currency, setCurrency] = useState("GHS");
  const [taxRate, setTaxRate] = useState(12.5);
  const [notifications, setNotifications] = useState(true);
  const [lowStockAlert, setLowStockAlert] = useState(10);

  return (
    <div>
      <div className="grid-2">
        <div className="glass-card">
          <div className="section-title" style={{ marginBottom: "1.25rem" }}>🏢 Company Settings</div>
          <div className="input-group">
            <label className="input-label">Company Name</label>
            <input className="input" value={companyName} onChange={e => setCompanyName(e.target.value)} />
          </div>
          <div className="input-group">
            <label className="input-label">Currency</label>
            <select className="select" value={currency} onChange={e => setCurrency(e.target.value)}>
              <option>GHS</option><option>USD</option><option>EUR</option><option>NGN</option>
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Tax Rate (%)</label>
            <input className="input" type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)} />
          </div>
          <button className="btn btn-orange" onClick={() => showToast("Settings saved!")}>Save Settings</button>
        </div>

        <div className="glass-card">
          <div className="section-title" style={{ marginBottom: "1.25rem" }}>🔔 Alert Settings</div>
          <div className="input-group">
            <label className="input-label">Low Stock Alert Level (units)</label>
            <input className="input" type="number" value={lowStockAlert} onChange={e => setLowStockAlert(e.target.value)} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0", borderBottom: "1px solid var(--glass-border)" }}>
            <div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>Push Notifications</div>
              <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>Sales & expense alerts</div>
            </div>
            <div style={{ width: 44, height: 24, borderRadius: 12, background: notifications ? "var(--orange)" : "rgba(255,255,255,0.1)", cursor: "pointer", position: "relative", transition: "background 0.2s" }} onClick={() => setNotifications(!notifications)}>
              <div style={{ position: "absolute", top: 3, left: notifications ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: "white", transition: "left 0.2s" }} />
            </div>
          </div>
          <button className="btn btn-orange" style={{ marginTop: "1rem" }} onClick={() => showToast("Alerts configured!")}>Save Alerts</button>
        </div>

        <div className="glass-card">
          <div className="section-title" style={{ marginBottom: "1.25rem" }}>🔐 Security</div>
          <div style={{ padding: "0.75rem", background: "rgba(34,197,94,0.08)", borderRadius: 10, border: "1px solid rgba(34,197,94,0.2)", marginBottom: "1rem" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--success)", fontWeight: 600 }}>✅ 2-Factor Authentication Active</div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: 4 }}>Username + Password + PIN</div>
          </div>
          {[["Change Password", "🔑"], ["Change PIN", "🔢"], ["Active Sessions", "📱"]].map(([label, icon]) => (
            <button key={label} className="btn btn-ghost" style={{ width: "100%", marginBottom: 8, justifyContent: "flex-start" }}
              onClick={() => showToast(`${label} — contact IT admin`)}>
              {icon} {label}
            </button>
          ))}
        </div>

        <div className="glass-card">
          <div className="section-title" style={{ marginBottom: "1.25rem" }}>📱 Mobile Access</div>
          <div style={{ textAlign: "center", padding: "1.5rem 1rem", background: "rgba(255,107,0,0.06)", borderRadius: 12, marginBottom: "1rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: 8 }}>📱</div>
            <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--orange-light)", marginBottom: 4 }}>CEO Mobile Portal</div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Accessible on any device browser</div>
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", lineHeight: 1.8 }}>
            ✅ Fully responsive design<br />
            ✅ Touch-optimized interface<br />
            ✅ Secure 2-factor login<br />
            ✅ Real-time data access<br />
            ✅ Works offline (cached data)
          </div>
        </div>
      </div>
    </div>
  );
}
