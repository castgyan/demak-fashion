import { useState, useCallback, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// ─── CSS ────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  :root{
    --o:#FF6B00;--ol:#FF8C38;--od:#CC5500;
    --g:rgba(255,255,255,0.07);--gb:rgba(255,255,255,0.13);--gh:rgba(255,255,255,0.11);
    --tp:#fff;--ts:rgba(255,255,255,0.7);--tm:rgba(255,255,255,0.42);
    --ok:#22c55e;--bad:#ef4444;--warn:#f59e0b;
    --gold:#FFD700;--silver:#C0C0C0;--bronze:#CD7F32;
    --font:'Sora',sans-serif;--mono:'JetBrains Mono',monospace;
  }
  body{font-family:var(--font);background:linear-gradient(135deg,#0a0a0a 0%,#1a0600 45%,#0d0300 75%,#080808 100%);min-height:100vh;color:var(--tp);overflow-x:hidden;}
  .bg1,.bg2{position:fixed;border-radius:50%;pointer-events:none;z-index:0;filter:blur(90px);opacity:.1;}
  .bg1{width:700px;height:700px;background:#FF6B00;top:-250px;right:-150px;}
  .bg2{width:450px;height:450px;background:#FF3300;bottom:50px;left:-180px;}
  .login-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;position:relative;z-index:1;padding:1rem;}
  .login-card{background:rgba(255,255,255,0.06);backdrop-filter:blur(28px);border:1px solid var(--gb);border-radius:24px;padding:2.5rem 2rem;width:100%;max-width:400px;box-shadow:0 24px 64px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.1);}
  .l-icon{width:68px;height:68px;border-radius:18px;background:linear-gradient(135deg,var(--o),var(--od));display:flex;align-items:center;justify-content:center;font-size:2rem;margin:0 auto 1rem;box-shadow:0 8px 28px rgba(255,107,0,.4);}
  .l-title{text-align:center;font-size:1.35rem;font-weight:800;color:var(--ol);}
  .l-sub{text-align:center;font-size:.7rem;color:var(--tm);margin-top:4px;letter-spacing:1.2px;text-transform:uppercase;}
  .app-layout{display:flex;min-height:100vh;position:relative;z-index:1;}
  .sidebar{width:248px;min-height:100vh;background:rgba(255,255,255,0.04);backdrop-filter:blur(20px);border-right:1px solid var(--gb);display:flex;flex-direction:column;position:fixed;left:0;top:0;z-index:100;transition:transform .3s;transform:translateX(0)!important;}
  .sb-logo{padding:1.4rem 1.2rem;border-bottom:1px solid var(--gb);display:flex;align-items:center;gap:10px;}
  .sb-li{width:38px;height:38px;border-radius:10px;background:linear-gradient(135deg,var(--o),var(--od));display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;}
  .sb-lt{font-size:.82rem;font-weight:800;color:var(--ol);line-height:1.2;}
  .sb-ls{font-size:.6rem;color:var(--tm);text-transform:uppercase;letter-spacing:1px;}
  .sb-nav{flex:1;padding:1rem .75rem;display:flex;flex-direction:column;gap:3px;overflow-y:auto;}
  .ni{display:flex;align-items:center;gap:10px;padding:.58rem .75rem;border-radius:10px;cursor:pointer;transition:all .15s;color:var(--ts);font-size:.8rem;font-weight:500;border:1px solid transparent;}
  .ni:hover{background:var(--gh);color:var(--tp);}
  .ni.act{background:linear-gradient(135deg,rgba(255,107,0,.22),rgba(255,107,0,.09));border-color:rgba(255,107,0,.32);color:var(--ol);}
  .ni-ic{font-size:1rem;width:20px;text-align:center;}
  .sb-footer{padding:1rem .75rem;border-top:1px solid var(--gb);}
  .u-badge{display:flex;align-items:center;gap:10px;padding:.5rem;background:rgba(255,255,255,0.05);border-radius:10px;}
  .u-av{width:34px;height:34px;border-radius:9px;background:linear-gradient(135deg,var(--o),var(--od));display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:700;flex-shrink:0;}
  .main{flex:1;margin-left:248px;min-height:100vh;display:flex;flex-direction:column;}
  .topbar{padding:.9rem 1.5rem;background:rgba(255,255,255,0.03);backdrop-filter:blur(16px);border-bottom:1px solid var(--gb);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50;}
  .tb-title{font-size:1.05rem;font-weight:700;}
  .tb-date{font-size:.7rem;color:var(--tm);font-family:var(--mono);}
  .hamburger{display:none;background:none;border:none;color:var(--tp);font-size:1.3rem;cursor:pointer;padding:4px;}
  .page{padding:1.4rem;}
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:99;display:none;}
  .overlay.show{display:block;}
  .gc{background:var(--g);backdrop-filter:blur(16px);border:1px solid var(--gb);border-radius:16px;padding:1.2rem;transition:border-color .2s;}
  .gc:hover{border-color:rgba(255,107,0,.22);}
  .sg{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:1rem;margin-bottom:1.4rem;}
  .sc{background:rgba(255,255,255,0.06);backdrop-filter:blur(16px);border:1px solid var(--gb);border-radius:16px;padding:1.2rem;position:relative;overflow:hidden;}
  .sc::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--o),transparent);}
  .sl{font-size:.65rem;color:var(--tm);text-transform:uppercase;letter-spacing:1px;margin-bottom:.4rem;}
  .sv{font-size:1.45rem;font-weight:700;color:var(--tp);font-family:var(--mono);}
  .ss{font-size:.68rem;color:var(--ok);margin-top:3px;}
  .sic{position:absolute;top:1rem;right:1rem;font-size:1.4rem;opacity:.22;}
  .g2{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem;}
  .g3{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;}
  .sh{display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;}
  .st{font-size:.88rem;font-weight:700;}
  .ss2{font-size:.7rem;color:var(--tm);margin-top:2px;}
  .tw{overflow-x:auto;border-radius:12px;border:1px solid var(--gb);}
  table{width:100%;border-collapse:collapse;font-size:.78rem;}
  thead tr{background:rgba(255,107,0,.08);}
  th{padding:.7rem .9rem;text-align:left;font-size:.65rem;text-transform:uppercase;letter-spacing:.8px;color:var(--ol);font-weight:600;border-bottom:1px solid var(--gb);}
  td{padding:.65rem .9rem;color:var(--ts);border-bottom:1px solid rgba(255,255,255,0.04);}
  tr:last-child td{border-bottom:none;}
  tr:hover td{background:rgba(255,255,255,.03);color:var(--tp);}
  .b{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:.62rem;font-weight:600;letter-spacing:.5px;}
  .bok{background:rgba(34,197,94,.15);color:#4ade80;border:1px solid rgba(34,197,94,.25);}
  .bbad{background:rgba(239,68,68,.15);color:#f87171;border:1px solid rgba(239,68,68,.25);}
  .bwarn{background:rgba(245,158,11,.15);color:#fbbf24;border:1px solid rgba(245,158,11,.25);}
  .borg{background:rgba(255,107,0,.15);color:var(--ol);border:1px solid rgba(255,107,0,.25);}
  .bblue{background:rgba(59,130,246,.15);color:#93c5fd;border:1px solid rgba(59,130,246,.25);}
  .bgold{background:rgba(255,215,0,.15);color:#FFD700;border:1px solid rgba(255,215,0,.3);}
  .bsilver{background:rgba(192,192,192,.15);color:#C0C0C0;border:1px solid rgba(192,192,192,.3);}
  .bbronze{background:rgba(205,127,50,.15);color:#CD7F32;border:1px solid rgba(205,127,50,.3);}
  .bpurple{background:rgba(168,85,247,.15);color:#c084fc;border:1px solid rgba(168,85,247,.3);}
  .bteal{background:rgba(20,184,166,.15);color:#2dd4bf;border:1px solid rgba(20,184,166,.3);}
  .bpink{background:rgba(236,72,153,.15);color:#f472b6;border:1px solid rgba(236,72,153,.3);}
  .btn{padding:.48rem .95rem;border-radius:8px;font-family:var(--font);font-size:.76rem;font-weight:600;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:6px;border:none;}
  .btn-sm{padding:.32rem .7rem;font-size:.7rem;}
  .bo{background:linear-gradient(135deg,var(--o),var(--od));color:#fff;box-shadow:0 2px 8px rgba(255,107,0,.3);}
  .bo:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(255,107,0,.4);}
  .bg2x{background:rgba(255,255,255,.07);color:var(--ts);border:1px solid var(--gb);}
  .bg2x:hover{background:rgba(255,255,255,.12);color:var(--tp);}
  .bd{background:rgba(239,68,68,.13);color:#f87171;border:1px solid rgba(239,68,68,.25);}
  .ig{margin-bottom:.9rem;}
  .lbl{font-size:.7rem;color:var(--ts);margin-bottom:5px;display:block;text-transform:uppercase;letter-spacing:.8px;}
  .inp,.sel{width:100%;padding:.58rem .85rem;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:8px;color:var(--tp);font-family:var(--font);font-size:.8rem;outline:none;transition:all .2s;}
  .inp:focus,.sel:focus{border-color:var(--o);background:rgba(255,107,0,.07);}
  .inp::placeholder{color:var(--tm);}
  .sel option{background:#1a0600;}
  .pos-wrap{display:grid;grid-template-columns:1fr 310px;gap:1rem;height:calc(100vh - 155px);}
  .pos-prods{overflow-y:auto;}
  .prod-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(135px,1fr));gap:.7rem;}
  .pc{background:rgba(255,255,255,0.06);border:1px solid var(--gb);border-radius:12px;padding:.9rem;cursor:pointer;transition:all .2s;text-align:center;}
  .pc:hover{background:rgba(255,107,0,.1);border-color:rgba(255,107,0,.3);transform:translateY(-2px);}
  .pe{font-size:1.9rem;margin-bottom:.45rem;}
  .pn{font-size:.74rem;font-weight:600;color:var(--tp);margin-bottom:3px;}
  .pp{font-size:.8rem;color:var(--ol);font-family:var(--mono);font-weight:600;}
  .pst{font-size:.62rem;color:var(--tm);}
  .pos-cart{background:rgba(255,255,255,.05);border:1px solid var(--gb);border-radius:16px;display:flex;flex-direction:column;overflow:hidden;}
  .ch{padding:.9rem;border-bottom:1px solid var(--gb);}
  .ci{flex:1;overflow-y:auto;padding:.7rem;display:flex;flex-direction:column;gap:7px;}
  .cit{background:rgba(255,255,255,.05);border-radius:10px;padding:.55rem .7rem;display:flex;align-items:center;gap:7px;}
  .cin{flex:1;font-size:.74rem;color:var(--tp);}
  .qb{width:24px;height:24px;border-radius:6px;border:none;background:rgba(255,107,0,.2);color:var(--ol);cursor:pointer;font-size:.9rem;display:flex;align-items:center;justify-content:center;}
  .qb:hover{background:rgba(255,107,0,.35);}
  .cf{padding:.9rem;border-top:1px solid var(--gb);}
  .mo{position:fixed;inset:0;background:rgba(0,0,0,.72);backdrop-filter:blur(6px);z-index:200;display:flex;align-items:center;justify-content:center;padding:1rem;}
  .md{background:rgba(18,6,0,.92);backdrop-filter:blur(28px);border:1px solid var(--gb);border-radius:20px;padding:1.4rem;width:100%;max-width:520px;max-height:90vh;overflow-y:auto;}
  .mt{font-size:.95rem;font-weight:700;margin-bottom:1.2rem;display:flex;align-items:center;justify-content:space-between;}
  .mx{background:none;border:none;color:var(--tm);cursor:pointer;font-size:1.2rem;}
  .mx:hover{color:var(--tp);}
  .toast{position:fixed;top:1rem;right:1rem;z-index:300;background:rgba(18,6,0,.96);backdrop-filter:blur(16px);border:1px solid var(--o);border-radius:12px;padding:.7rem 1.2rem;display:flex;align-items:center;gap:10px;font-size:.8rem;color:var(--tp);animation:sIn .3s;max-width:320px;}
  @keyframes sIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
  .rg{background:rgba(255,215,0,.18);color:#FFD700;border:1.5px solid rgba(255,215,0,.4);border-radius:8px;padding:4px 12px;font-size:.72rem;font-weight:700;cursor:pointer;transition:all .2s;}
  .rs{background:rgba(192,192,192,.18);color:#C0C0C0;border:1.5px solid rgba(192,192,192,.35);border-radius:8px;padding:4px 12px;font-size:.72rem;font-weight:700;cursor:pointer;transition:all .2s;}
  .rb{background:rgba(205,127,50,.18);color:#CD7F32;border:1.5px solid rgba(205,127,50,.35);border-radius:8px;padding:4px 12px;font-size:.72rem;font-weight:700;cursor:pointer;transition:all .2s;}
  .rg.sel{background:rgba(255,215,0,.35);box-shadow:0 0 10px rgba(255,215,0,.3);}
  .rs.sel{background:rgba(192,192,192,.35);}
  .rb.sel{background:rgba(205,127,50,.35);}
  .rp{background:rgba(168,85,247,.18);color:#c084fc;border:1.5px solid rgba(168,85,247,.35);border-radius:8px;padding:4px 12px;font-size:.72rem;font-weight:700;cursor:pointer;transition:all .2s;}
  .rp.sel{background:rgba(168,85,247,.35);box-shadow:0 0 10px rgba(168,85,247,.3);}
  .icon{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;}
  .logo-upload-wrap{position:relative;cursor:pointer;}
  .logo-upload-wrap input{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;}
  .rank-card{background:rgba(255,255,255,0.06);backdrop-filter:blur(16px);border:1px solid var(--gb);border-radius:20px;padding:1.5rem;position:relative;overflow:hidden;transition:all .2s;}
  .rank-card:hover{border-color:rgba(255,107,0,.3);transform:translateY(-2px);}
  .rank-card.rank-1{border-color:rgba(255,215,0,.4);background:rgba(255,215,0,.05);}
  .rank-card.rank-2{border-color:rgba(192,192,192,.35);background:rgba(192,192,192,.04);}
  .rank-card.rank-3{border-color:rgba(205,127,50,.35);background:rgba(205,127,50,.04);}
  .rank-medal{position:absolute;top:1rem;right:1rem;font-size:2rem;opacity:.8;}
  .rank-avatar{width:72px;height:72px;border-radius:50%;margin:0 auto .75rem;border:3px solid;overflow:hidden;}
  .rank-name{font-size:.9rem;font-weight:800;text-align:center;margin-bottom:3px;}
  .rank-role{font-size:.65rem;color:var(--tm);text-align:center;margin-bottom:1rem;}
  .rank-stats{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:1rem;}
  .rank-stat{background:rgba(255,255,255,.05);border-radius:8px;padding:6px 8px;text-align:center;}
  .rank-stat-label{font-size:.55rem;color:var(--tm);text-transform:uppercase;letter-spacing:.8px;}
  .rank-stat-value{font-size:.82rem;font-weight:700;font-family:var(--mono);color:var(--ol);margin-top:2px;}
  .progress-wrap{margin-top:.5rem;}
  .progress-label{display:flex;justify-content:space-between;font-size:.62rem;color:var(--tm);margin-bottom:3px;}
  .progress-bar{height:5px;background:rgba(255,255,255,.08);border-radius:4px;overflow:hidden;}
  .progress-fill{height:100%;border-radius:4px;transition:width .8s;}
  .podium{display:flex;align-items:flex-end;justify-content:center;gap:12px;height:160px;margin:1rem 0;}
  .pod-col{display:flex;flex-direction:column;align-items:center;gap:6px;width:90px;}
  .pod-bar{width:100%;border-radius:8px 8px 0 0;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:8px;}
  .tabs{display:flex;gap:3px;background:rgba(255,255,255,.05);padding:4px;border-radius:10px;margin-bottom:1.2rem;}
  .tab{flex:1;padding:.48rem;border-radius:7px;border:none;background:none;color:var(--tm);font-family:var(--font);font-size:.72rem;font-weight:600;cursor:pointer;transition:all .2s;text-align:center;}
  .tab.act{background:rgba(255,107,0,.2);color:var(--ol);}
  .rbx{background:#fff;color:#111;border-radius:12px;padding:1.4rem;font-family:var(--mono);font-size:.76rem;}
  .rbx h3{color:#CC5500;text-align:center;font-size:.95rem;margin-bottom:.5rem;}
  .rl{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px dashed #ddd;}
  .fund-bar{height:10px;border-radius:6px;margin-top:4px;transition:width .6s;}
  .savings-glow{box-shadow:0 0 18px rgba(34,197,94,.18);}
  .profile-card{background:var(--g);border:1px solid var(--gb);border-radius:16px;padding:1.2rem;cursor:pointer;transition:all .22s;position:relative;overflow:hidden;}
  .profile-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--o),var(--od));}
  .profile-card:hover{border-color:rgba(255,107,0,.4);transform:translateY(-3px);box-shadow:0 8px 24px rgba(255,107,0,.15);}
  .avatar-wrap{width:80px;height:80px;border-radius:50%;margin:0 auto 1rem;border:3px solid rgba(255,107,0,.35);overflow:hidden;background:linear-gradient(135deg,#1a0600,#0a0a0a);display:flex;align-items:center;justify-content:center;}
  .avatar-svg{width:80px;height:80px;}
  .profile-modal-avatar{width:100px;height:100px;border-radius:50%;border:3px solid rgba(255,107,0,.4);overflow:hidden;margin:0 auto 1rem;background:linear-gradient(135deg,#1a0600,#0a0a0a);display:flex;align-items:center;justify-content:center;}
  .upload-btn{position:relative;overflow:hidden;display:inline-block;}
  .upload-btn input[type=file]{position:absolute;inset:0;opacity:0;cursor:pointer;font-size:100px;}
  .info-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:.76rem;}
  .info-row:last-child{border-bottom:none;}
  ::-webkit-scrollbar{width:4px;height:4px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:rgba(255,107,0,.3);border-radius:4px;}
  @media(max-width:768px){
    .sidebar{transform:translateX(-100%)!important;}
    .sidebar.open{transform:translateX(0)!important;}
    .main{margin-left:0!important;}
    .hamburger{display:block!important;}
    .pos-wrap{grid-template-columns:1fr;height:auto;}
    .pos-cart{height:380px;}
  }
  @media(min-width:769px){
    .sidebar{transform:translateX(0)!important;}
    .hamburger{display:none!important;}
    .overlay{display:none!important;}
  }
`;

// ─── Constants ────────────────────────────────────────────────────────────────
const GHS = n=>`GHS ${Number(n).toLocaleString("en-GH",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const fmt = n=>Number(n).toLocaleString();

// 3 piece-rate tiers (percentage of base applied to item rate)
// Piece-rate cuts: worker earns this % of the item's sewing price
// e.g. item costs GHS 50 → 40% cut = GHS 20 for worker
const PIECE_RATES = {
  40: { pct:40, label:"40%", desc:"Standard Cut",  color:"#CD7F32", cls:"rb", badge:"bbronze" },
  34: { pct:34, label:"34%", desc:"Mid Cut",        color:"#C0C0C0", cls:"rs", badge:"bsilver" },
  25: { pct:25, label:"25%", desc:"Junior Cut",     color:"#a855f7", cls:"rp", badge:"bpurple" },
};
const BASE_RATE   = 1;    // multiplier: rate = itemPrice * pct/100
const WEEKLY_SAVINGS = 50; // GHS deducted weekly per designer into savings
// Get piece rate info safely — falls back to 40% if key not found
const getPR = (pct) => PIECE_RATES[pct] || PIECE_RATES[40];

// Company profit allocation percentages
const PROFIT_ALLOC = [
  { key:"aob",     label:"AOB",                  pct:20, color:"#a855f7", badge:"bpurple", icon:"🏦", desc:"Administrative & Operational Buffer" },
  { key:"project", label:"Project Fund",          pct:5,  color:"#14b8a6", badge:"bteal",   icon:"🚀", desc:"Future projects & business expansion"  },
  { key:"machines",label:"Machines & Accessories",pct:10, color:"#ec4899", badge:"bpink",   icon:"⚙️",  desc:"Equipment maintenance & upgrades"     },
];
// remaining 65% → Salary, expenses, operations

const RATINGS = {
  Gold:   {label:"Gold",   desc:"Standard Cut (40%)", pct:40, color:"#FFD700", cls:"rb", badge:"bgold"  },
  Silver: {label:"Silver", desc:"Mid Cut (34%)",       pct:34, color:"#C0C0C0", cls:"rs", badge:"bsilver"},
  Bronze: {label:"Bronze", desc:"Junior Cut (25%)",    pct:25, color:"#a855f7", cls:"rp", badge:"bpurple"},
};

const PCOLS  = ["#FF6B00","#FF8C38","#FFB366","#CC5500","#a855f7","#14b8a6","#22c55e","#3b82f6"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MREV   = [18000,22000,19500,26000,24000,31000,28000,35000,29000,38000,33000,42000];
const WREV   = [4200,3800,5100,6200,4900,7300,5500];
const WDAYS  = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

// Compute designer rate from piece-rate percentage
// Worker earns pct% of item sewing price. With 1 arg returns pct (for display). With 2 args returns GHS earned.
const designerRate = (pct, itemPrice) => itemPrice == null ? pct : parseFloat((itemPrice * pct / 100).toFixed(2));

const IP = [
  {id:1,name:"Ankara Dress",      price:180,cost:80, stock:24,emoji:"👗",category:"Dress" },
  {id:2,name:"Kente Gown",        price:320,cost:140,stock:12,emoji:"👘",category:"Gown"  },
  {id:3,name:"Lace Blouse",       price:95, cost:40, stock:38,emoji:"👚",category:"Blouse"},
  {id:4,name:"Embroidered Kaftan",price:250,cost:110,stock:8, emoji:"🥻",category:"Kaftan"},
  {id:5,name:"Chiffon Skirt",     price:75, cost:30, stock:45,emoji:"🩱",category:"Skirt" },
  {id:6,name:"Damask Suit",       price:420,cost:180,stock:6, emoji:"🧥",category:"Suit"  },
  {id:7,name:"Aso-Oke Set",       price:550,cost:230,stock:5, emoji:"🎽",category:"Set"   },
  {id:8,name:"Casual Shirt",      price:60, cost:22, stock:60,emoji:"👕",category:"Shirt" },
];

const ID = [
  {id:1,name:"Bernard Adu Gyamfi",      role:"Production Designer",rating:"Gold",  piecePct:40,weeklyTarget:15,phone:"0556295829",email:"adugyamfibernard87@gmail.com", startWeek:"2025-W01",gender:"Male",  joinDate:"2025-01-06",bio:"Senior production designer specialising in Ankara and Kente styles."},
  {id:2,name:"Augustina Boakye",         role:"Production Designer",rating:"Silver",piecePct:34,weeklyTarget:12,phone:"0536925642",email:"aaaabo@gmail.com",              startWeek:"2025-W01",gender:"Female",joinDate:"2025-01-06",bio:"Skilled in lace finishing and embroidery detailing."},
  {id:3,name:"Yakubu Dalhatu",           role:"Production Designer",rating:"Silver",piecePct:34,weeklyTarget:12,phone:"0205939872",email:"yyyyda@gmail.com",              startWeek:"2025-W01",gender:"Male",  joinDate:"2025-01-06",bio:"Specialises in Damask suits and traditional menswear."},
  {id:4,name:"Omenogor Prince Destiny",  role:"Production Designer",rating:"Bronze",piecePct:25,weeklyTarget:10,phone:"0279462151",email:"omenogordestiny4@gmail.com",    startWeek:"2025-W01",gender:"Male",  joinDate:"2025-01-06",bio:"Junior designer with a strong eye for pattern cutting."},
  {id:5,name:"Mmadueke Uzondu Salvation",role:"Production Designer",rating:"Bronze",piecePct:25,weeklyTarget:10,phone:"0269633958",email:"Mmaduekeuzondu@gmail.com",      startWeek:"2025-W01",gender:"Male",  joinDate:"2025-01-06",bio:"Focused on Kaftan and casual wear production."},
  {id:6,name:"Dorcas Onyinyechi Anthony",role:"Production Designer",rating:"Silver",piecePct:34,weeklyTarget:12,phone:"0559610282",email:"ehidorcas98@gmail.com",          startWeek:"2025-W01",gender:"Female",joinDate:"2025-01-06",bio:"Expert in chiffon work, skirts, and blouse finishing."},
];

const IW_RAW = [
  {id:1, designerId:1,week:"2025-W16",month:"May",items:14},
  {id:2, designerId:2,week:"2025-W16",month:"May",items:11},
  {id:3, designerId:3,week:"2025-W16",month:"May",items:9 },
  {id:4, designerId:4,week:"2025-W16",month:"May",items:7 },
  {id:5, designerId:5,week:"2025-W16",month:"May",items:8 },
  {id:6, designerId:6,week:"2025-W16",month:"May",items:10},
  {id:7, designerId:1,week:"2025-W17",month:"May",items:16},
  {id:8, designerId:2,week:"2025-W17",month:"May",items:13},
  {id:9, designerId:3,week:"2025-W17",month:"May",items:10},
  {id:10,designerId:4,week:"2025-W17",month:"May",items:6 },
  {id:11,designerId:5,week:"2025-W17",month:"May",items:11},
  {id:12,designerId:6,week:"2025-W17",month:"May",items:12},
  {id:13,designerId:1,week:"2025-W18",month:"May",items:18},
  {id:14,designerId:2,week:"2025-W18",month:"May",items:15},
  {id:15,designerId:3,week:"2025-W18",month:"May",items:12},
  {id:16,designerId:4,week:"2025-W18",month:"May",items:8 },
  {id:17,designerId:5,week:"2025-W18",month:"May",items:9 },
  {id:18,designerId:6,week:"2025-W18",month:"May",items:11},
];

const IE = [
  {id:1,category:"Raw Materials",amount:2400,date:"2025-05-01",note:"Fabric purchase"     },
  {id:2,category:"Utilities",    amount:320, date:"2025-05-03",note:"Electricity & water" },
  {id:3,category:"Salaries",     amount:1800,date:"2025-05-05",note:"Designer salaries"   },
  {id:4,category:"Equipment",    amount:650, date:"2025-05-10",note:"Sewing machine repair"},
  {id:5,category:"Marketing",    amount:300, date:"2025-05-12",note:"Social media ads"    },
  {id:6,category:"Rent",         amount:1200,date:"2025-05-01",note:"Workshop rent"       },
];

const IS = [
  {id:1,productId:1,qty:3,total:540, date:"2025-05-10",payment:"Cash"        },
  {id:2,productId:4,qty:1,total:250, date:"2025-05-11",payment:"Mobile Money"},
  {id:3,productId:7,qty:2,total:1100,date:"2025-05-12",payment:"Card"        },
  {id:4,productId:2,qty:1,total:320, date:"2025-05-13",payment:"Cash"        },
  {id:5,productId:3,qty:5,total:475, date:"2025-05-14",payment:"Mobile Money"},
  {id:6,productId:6,qty:1,total:420, date:"2025-05-15",payment:"Card"        },
  {id:7,productId:1,qty:2,total:360, date:"2025-05-16",payment:"Cash"        },
  {id:8,productId:5,qty:4,total:300, date:"2025-05-17",payment:"Mobile Money"},
];

const calcWork = (recs,designers)=>recs.map(r=>{
  const d=designers.find(x=>x.id===r.designerId);
  const pct=d?.piecePct||40;
  const itemPrice=r.itemPrice||50;
  const rate=parseFloat((itemPrice*pct/100).toFixed(2));
  const gross=parseFloat((r.items*rate).toFixed(2));
  const savings=WEEKLY_SAVINGS;
  const net=parseFloat(Math.max(0,gross-savings).toFixed(2));
  return{...r,pct,rate,gross,savings,net,total:net,itemPrice};
});

// ─── Customer seed data ───────────────────────────────────────────────────────
const IC = [
  {id:1,name:"Abena Asante",    phone:"+233244000001",email:"abena@email.com",birthday:"1992-03-15",location:"Accra",gender:"Female",joinDate:"2025-04-10",totalSpent:1640,visits:4,notes:"Loves Ankara prints"},
  {id:2,name:"Kwame Boateng",   phone:"+233244000002",email:"kwame@email.com",birthday:"1988-07-22",location:"Kumasi",gender:"Male",  joinDate:"2025-04-18",totalSpent:320, visits:1,notes:""},
  {id:3,name:"Efua Mensah",     phone:"+233244000003",email:"efua@email.com", birthday:"1995-12-05",location:"Accra",gender:"Female",joinDate:"2025-05-02",totalSpent:775, visits:2,notes:"Birthday gift customer"},
  {id:4,name:"Kofi Adjei",      phone:"+233244000004",email:"",               birthday:"1990-05-30",location:"Takoradi",gender:"Male",joinDate:"2025-05-10",totalSpent:420, visits:1,notes:""},
  {id:5,name:"Ama Owusu",       phone:"+233244000005",email:"ama@email.com",  birthday:"1998-08-14",location:"Accra",gender:"Female",joinDate:"2025-05-14",totalSpent:300, visits:1,notes:"Referred by Abena"},
];

// Thank-you message templates
const THANK_YOU_TEMPLATES = [
  { id:1, name:"Standard Thank You", body:`Hi {name}! 🧡 Thank you so much for shopping at Demak Fashion Industry! Your purchase of {items} (Total: {total}) has been confirmed. We truly appreciate your support and can't wait to see you again! 🛍️ — Demak Fashion Team` },
  { id:2, name:"VIP Customer",       body:`Dear {name}, 👑 Thank you for being a valued Demak Fashion customer! Your order of {items} totalling {total} is greatly appreciated. As one of our special customers, we look forward to serving you again soon. Stay stylish! — Demak Fashion 🧡` },
  { id:3, name:"Birthday Month",     body:`Hi {name}! 🎂 Happy Birthday Month from all of us at Demak Fashion! Thank you for celebrating with us — your purchase of {items} ({total}) means the world. Enjoy your special month! 🎉 — Demak Fashion Team` },
  { id:4, name:"First-Time Buyer",   body:`Welcome to the Demak Fashion Family, {name}! 🎊 Thank you for your first purchase ({items} — {total}). We're so happy to have you and promise to keep delivering quality fashion you'll love. See you again soon! — Demak Fashion 🧡` },
];

// ─── Tooltip ─────────────────────────────────────────────────────────────────
const TT=({active,payload,label})=>{
  if(!active||!payload?.length)return null;
  return <div style={{background:"rgba(18,6,0,.92)",border:"1px solid rgba(255,107,0,.3)",borderRadius:10,padding:".6rem .9rem",fontSize:".74rem"}}>
    <div style={{color:"#FF8C38",fontWeight:700,marginBottom:3}}>{label}</div>
    {payload.map((p,i)=><div key={i} style={{color:p.color||"#fff"}}>{p.name}: {typeof p.value==="number"&&p.value>200?GHS(p.value):p.value}</div>)}
  </div>;
};

// ─── SVG Vector Icons (replaces all emojis) ───────────────────────────────────
const ICONS = {
  dashboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  pos:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  customers: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  products:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>,
  designers: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><path d="M12 2v2M12 18v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41"/></svg>,
  savings:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/><path d="M12 11v4"/><circle cx="12" cy="9" r="1" fill="currentColor"/></svg>,
  rankings:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  finance:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  profitalloc:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 118 2.83"/><path d="M22 12A10 10 0 0012 2v10z"/></svg>,
  expenses:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  reports:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  settings:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M20 12h-2M6 12H4M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M12 20v-2M12 6V4"/></svg>,
  lock:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  plus:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  edit:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
  whatsapp:  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
  call:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.72 6.72l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
  camera:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  trophy:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 21 12 21 16 21"/><line x1="12" y1="17" x2="12" y2="21"/><path d="M7 4H17v7a5 5 0 01-10 0V4z"/><path d="M7 9H4a1 1 0 01-1-1V6a1 1 0 011-1h3"/><path d="M17 9h3a1 1 0 001-1V6a1 1 0 00-1-1h-3"/></svg>,
  medal1:    <svg viewBox="0 0 24 24" fill="#FFD700" stroke="#CC9900" strokeWidth="1"><circle cx="12" cy="8" r="6"/><text x="12" y="12" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#5C4400" fontFamily="Sora,sans-serif">1</text><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" fill="#FFD700" stroke="#CC9900"/></svg>,
  medal2:    <svg viewBox="0 0 24 24" fill="#C0C0C0" stroke="#999" strokeWidth="1"><circle cx="12" cy="8" r="6"/><text x="12" y="12" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#444" fontFamily="Sora,sans-serif">2</text><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" fill="#C0C0C0" stroke="#999"/></svg>,
  medal3:    <svg viewBox="0 0 24 24" fill="#CD7F32" stroke="#9E6020" strokeWidth="1"><circle cx="12" cy="8" r="6"/><text x="12" y="12" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#3A2000" fontFamily="Sora,sans-serif">3</text><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" fill="#CD7F32" stroke="#9E6020"/></svg>,
};

function Icon({name,size=18,color="currentColor",style={}}){
  const svg = ICONS[name];
  if(!svg) return null;
  return <span className="icon" style={{width:size,height:size,color,...style}}>{svg}</span>;
}

// ─── Logo Upload Helper ───────────────────────────────────────────────────────
function LogoUpload(){
  const [logo,setLogo]=useState(()=>{ try{return localStorage.getItem("demak_logo")||null;}catch{return null;} });
  const handle=e=>{
    const file=e.target.files[0];
    if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>{localStorage.setItem("demak_logo",ev.target.result);setLogo(ev.target.result);};
    reader.readAsDataURL(file);
  };
  return(
    <div className="logo-upload-wrap" title="Click to upload your logo">
      <div className="sb-li" style={{overflow:"hidden",padding:0,cursor:"pointer"}}>
        {logo?<img src={logo} alt="logo" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:10}}/>
              :<span style={{fontSize:".75rem",fontWeight:800,color:"#fff"}}>DF</span>}
      </div>
      <input type="file" accept="image/*" onChange={handle} title="Upload company logo"/>
    </div>
  );
}

// ─── Professional Avatar Generator ───────────────────────────────────────────
const AVATAR_COLORS = [
  ["#FF6B00","#CC5500"],["#a855f7","#7c3aed"],["#14b8a6","#0d9488"],
  ["#3b82f6","#1d4ed8"],["#ec4899","#be185d"],["#22c55e","#15803d"],
];

function DesignerAvatar({designer, size=80, fontSize=28}){
  const initials = designer.name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();
  const [c1,c2] = AVATAR_COLORS[(designer.id-1) % AVATAR_COLORS.length];
  const isFemale = designer.gender==="Female";
  const r = size/2;

  if(designer.photo){
    return <img src={designer.photo} alt={designer.name}
      style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",display:"block"}}/>;
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`ag-${designer.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c1}/>
          <stop offset="100%" stopColor={c2}/>
        </linearGradient>
        <clipPath id={`clip-${designer.id}`}>
          <circle cx={r} cy={r} r={r}/>
        </clipPath>
      </defs>
      {/* Background */}
      <circle cx={r} cy={r} r={r} fill={`url(#ag-${designer.id})`}/>
      {/* Subtle pattern overlay */}
      <circle cx={r} cy={r} r={r*0.85} fill="rgba(255,255,255,0.06)"/>
      {/* Body silhouette */}
      <ellipse cx={r} cy={size*0.78} rx={r*0.55} ry={r*0.38} fill="rgba(0,0,0,0.25)" clipPath={`url(#clip-${designer.id})`}/>
      {/* Head */}
      <circle cx={r} cy={size*0.38} r={r*0.28} fill="rgba(255,255,255,0.22)"/>
      {/* Initials */}
      <text x={r} y={size*0.42} textAnchor="middle" dominantBaseline="middle"
        fill="white" fontSize={fontSize*0.7} fontWeight="800"
        fontFamily="Sora, sans-serif" letterSpacing="1">
        {initials}
      </text>
      {/* Gender icon badge */}
      <circle cx={size*0.82} cy={size*0.18} r={size*0.13} fill="rgba(0,0,0,0.35)"/>
      <text x={size*0.82} y={size*0.185} textAnchor="middle" dominantBaseline="middle"
        fontSize={size*0.13} fontFamily="Arial">
        {isFemale?"♀":"♂"}
      </text>
    </svg>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
// ─── Cache version — bump this whenever data shape changes ───────────────────
const CACHE_VERSION = "v5";

function loadCache(key, fallback){
  try{
    const ver = localStorage.getItem("demak_cache_ver");
    if(ver !== CACHE_VERSION){ return fallback; }
    const raw = localStorage.getItem(key);
    if(!raw) return fallback;
    const parsed = JSON.parse(raw);
    if(!Array.isArray(parsed) || parsed.length === 0) return fallback;
    return parsed;
  } catch(e){ return fallback; }
}

function saveCache(key, value){
  try{
    localStorage.setItem("demak_cache_ver", CACHE_VERSION);
    localStorage.setItem(key, JSON.stringify(value));
  } catch(e){}
}

// Validate & sanitise work records so no field is undefined/NaN
function sanitiseWork(recs, designers){
  return recs.map(r=>{
    const d = designers.find(x=>x.id===r.designerId) || {};
    const pct = r.pct || d.piecePct || 40;
    const itemPrice = r.itemPrice || 50;
    const rate = parseFloat((itemPrice * pct / 100).toFixed(2));
    const gross = parseFloat(((r.items||0) * rate).toFixed(2));
    const savings = WEEKLY_SAVINGS;
    const net = parseFloat(Math.max(0, gross - savings).toFixed(2));
    return {...r, pct, itemPrice, rate, gross, savings, net, total: net};
  });
}

export default function App(){
  const [auth,setAuth]=useState(false);
  const [step,setStep]=useState(1);
  const [cr,setCr]=useState({u:"",p:"",pin:""});
  const [err,setErr]=useState("");
  const [page,setPage]=useState("dashboard");
  const [sb,setSb]=useState(false);
  const [toast,setToast]=useState(null);

  // Load from cache — if version mismatch, use fresh seed data
  const [products,setProducts]   = useState(()=>loadCache("demak_products", IP));
  const [designers,setDesigners] = useState(()=>loadCache("demak_designers", ID));
  const [expenses,setExpenses]   = useState(()=>loadCache("demak_expenses",  IE));
  const [sales,setSales]         = useState(()=>loadCache("demak_sales",     IS));
  const [customers,setCustomers] = useState(()=>loadCache("demak_customers", IC));
  const [workRecs,setWorkRecs]   = useState(()=>{
    const raw = loadCache("demak_workrecs", null);
    const base = raw || calcWork(IW_RAW, ID);
    return sanitiseWork(base, loadCache("demak_designers", ID));
  });
  const [cart,setCart]=useState([]);

  useEffect(()=>{saveCache("demak_products",  products);},[products]);
  useEffect(()=>{saveCache("demak_designers", designers);},[designers]);
  useEffect(()=>{saveCache("demak_expenses",  expenses);},[expenses]);
  useEffect(()=>{saveCache("demak_workrecs",  workRecs);},[workRecs]);
  useEffect(()=>{saveCache("demak_sales",     sales);},[sales]);
  useEffect(()=>{saveCache("demak_customers", customers);},[customers]);

  const t$=useCallback((msg,icon="✅")=>{setToast({msg,icon});setTimeout(()=>setToast(null),3200);},[]);
  const login=()=>{
    if(step===1){if(cr.u==="CEO ZONE"&&cr.p==="DEMAK739373"){setStep(2);setErr("");}else setErr("Invalid. Try **** / ******");}
    else{if(cr.pin==="7393"){setAuth(true);setErr("");}else setErr("Wrong PIN. Try ****");}
  };

  const tRev=sales.reduce((s,r)=>s+r.total,0);
  const tExp=expenses.reduce((s,e)=>s+e.amount,0);
  const netProfit=tRev-tExp;

  if(!auth) return <>
    <style>{CSS}</style>
    <div style={{position:"relative"}}><div className="bg1"/><div className="bg2"/>
      <div className="login-wrap">
        <div className="login-card">
          <div className="l-icon">DFI</div>
          <div className="l-title">DEMAK FASHION</div>
          <div className="l-sub">Industry · CEO Portal</div><br/>
          {step===1?<>
            <div className="ig"><label className="lbl">Username</label><input className="inp" placeholder="Enter username" value={cr.u} onChange={e=>setCr(p=>({...p,u:e.target.value}))}/></div>
            <div className="ig"><label className="lbl">Password</label><input className="inp" type="password" placeholder="Enter password" value={cr.p} onChange={e=>setCr(p=>({...p,p:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&login()}/></div>
          </>:<div className="ig"><label className="lbl">🔐 Security PIN</label>
            <input className="inp" type="password" maxLength={4} placeholder="4-digit PIN" value={cr.pin} onChange={e=>setCr(p=>({...p,pin:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&login()} style={{letterSpacing:".5rem",fontSize:"1.2rem"}}/>
            <div style={{fontSize:".68rem",color:"var(--tm)",marginTop:5}}>2-Factor verification</div>
          </div>}
          {err&&<div style={{background:"rgba(239,68,68,.12)",border:"1px solid rgba(239,68,68,.25)",borderRadius:8,padding:".58rem .85rem",fontSize:".76rem",color:"#f87171",marginBottom:"1rem"}}>{err}</div>}
          <button className="btn bo" style={{width:"100%",padding:".82rem",fontSize:".88rem"}} onClick={login}>{step===1?"Continue →":"Access System"}</button>
          <div style={{textAlign:"center",marginTop:"1.2rem",fontSize:".65rem",color:"var(--tm)"}}>🔒 CEO-Only Secured Access</div>
        </div>
      </div>
    </div>
  </>;

  const NAV=[
    {id:"dashboard",icon:"dashboard",label:"Dashboard"},
    {id:"pos",icon:"pos",label:"Point of Sale"},
    {id:"customers",icon:"customers",label:"Customers CRM"},
    {id:"products",icon:"products",label:"Products"},
    {id:"designers",icon:"designers",label:"Designer Tracker"},
    {id:"savings",icon:"savings",label:"Staff Savings"},
    {id:"rankings",icon:"rankings",label:"Worker Rankings"},
    {id:"finance",icon:"finance",label:"Financial Records"},
    {id:"profitalloc",icon:"profitalloc",label:"Profit Allocation"},
    {id:"expenses",icon:"expenses",label:"Expenditure"},
    {id:"reports",icon:"reports",label:"Monthly Reports"},
    {id:"settings",icon:"settings",label:"Settings"},
  ];

  return <>
    <style>{CSS}</style>
    <div style={{position:"relative"}}><div className="bg1"/><div className="bg2"/>
      {toast&&<div className="toast"><span>{toast.icon}</span><span>{toast.msg}</span></div>}
      <div className="app-layout">
        <div className={`overlay ${sb?"show":""}`} onClick={()=>setSb(false)}/>
        <aside className={`sidebar ${sb?"open":""}`}>
          <div className="sb-logo">
            <LogoUpload/>
            <div><div className="sb-lt">DEMAK FASHION</div><div className="sb-ls">Industry</div></div>
          </div>
          <nav className="sb-nav">
            {NAV.map(n=><div key={n.id} className={`ni ${page===n.id?"act":""}`} onClick={()=>{setPage(n.id);setSb(false);}}>
              <span className="ni-ic" style={{display:"flex",alignItems:"center",justifyContent:"center"}}><Icon name={n.icon} size={16}/></span>{n.label}
            </div>)}
          </nav>
          <div className="sb-footer">
            <div className="u-badge">
              <div className="u-av">CEO</div>
              <div><div style={{fontSize:".76rem",fontWeight:600}}>Chief Executive</div><div style={{fontSize:".62rem",color:"var(--tm)"}}>Full Access</div></div>
            </div>
            <button className="btn bg2x" style={{width:"100%",marginTop:8,fontSize:".7rem"}} onClick={()=>setAuth(false)}><Icon name="lock" size={14}/> Lock System</button>
          </div>
        </aside>
        <main className="main">
          <div className="topbar">
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <button className="hamburger" onClick={()=>setSb(!sb)}>☰</button>
              <div>
                <div className="tb-title">{NAV.find(n=>n.id===page)?.label||page}</div>
                <div className="tb-date">{new Date().toLocaleDateString("en-GH",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <span className="b bok">● Live</span>
              <span style={{fontSize:".68rem",color:"var(--tm)",fontFamily:"var(--mono)"}}>{GHS(netProfit)} profit</span>
            </div>
          </div>
          <div className="page">
            {page==="dashboard"   && <Dashboard sales={sales} expenses={expenses} products={products} workRecs={workRecs} designers={designers} netProfit={netProfit}/>}
            {page==="pos"         && <POS products={products} setProducts={setProducts} cart={cart} setCart={setCart} sales={sales} setSales={setSales} customers={customers} setCustomers={setCustomers} t$={t$}/>}
            {page==="customers"   && <Customers customers={customers} setCustomers={setCustomers} sales={sales} t$={t$}/>}
            {page==="products"    && <Products products={products} setProducts={setProducts} t$={t$}/>}
            {page==="designers"   && <Designers designers={designers} setDesigners={setDesigners} workRecs={workRecs} setWorkRecs={setWorkRecs} t$={t$}/>}
            {page==="savings"     && <Savings designers={designers} workRecs={workRecs}/>}
            {page==="rankings"    && <Rankings designers={designers} workRecs={workRecs}/>}
            {page==="finance"     && <Finance sales={sales} products={products}/>}
            {page==="profitalloc" && <ProfitAlloc netProfit={netProfit} expenses={expenses} workRecs={workRecs}/>}
            {page==="expenses"    && <Expenses expenses={expenses} setExpenses={setExpenses} t$={t$}/>}
            {page==="reports"     && <Reports sales={sales} expenses={expenses} workRecs={workRecs} designers={designers} netProfit={netProfit}/>}
            {page==="settings"    && <Settings t$={t$}/>}
          </div>
        </main>
      </div>
    </div>
  </>;
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({sales,expenses,products,workRecs,designers,netProfit}){
  const tRev=sales.reduce((s,r)=>s+r.total,0);
  const tExp=expenses.reduce((s,e)=>s+e.amount,0);
  const tItems=workRecs.reduce((s,r)=>s+r.items,0);
  const low=products.filter(p=>p.stock<10).length;
  const totalSavings=designers.length * workRecs.filter((r,i,arr)=>arr.findIndex(x=>x.designerId===r.designerId&&x.week===r.week)===i).length * WEEKLY_SAVINGS;
  const allocTotal=PROFIT_ALLOC.reduce((s,a)=>s+(netProfit>0?netProfit*a.pct/100:0),0);
  const expPie=[...new Set(expenses.map(e=>e.category))].map(c=>({name:c,value:expenses.filter(e=>e.category===c).reduce((s,e)=>s+e.amount,0)}));
  const payPie=[...new Set(sales.map(s=>s.payment))].map(m=>({name:m,value:sales.filter(s=>s.payment===m).reduce((s,r)=>s+r.total,0)}));
  const wData=WDAYS.map((d,i)=>({day:d,revenue:WREV[i]}));
  return <div>
    <div className="sg">
      {[["💰","Total Revenue",GHS(tRev),"var(--ol)"],["📋","Total Expenses",GHS(tExp),"#f87171"],["📈","Net Profit",GHS(netProfit),netProfit>=0?"var(--ok)":"var(--bad)"],
        ["✂️","Items Sewn",fmt(tItems),"var(--ok)"],["🏦","Staff Savings Pool",GHS(totalSavings),"var(--ok)"],["📐","Funds Allocated",GHS(allocTotal),"#c084fc"]
      ].map(([icon,label,val,color],i)=><div key={i} className="sc">
        <div className="sic">{icon}</div><div className="sl">{label}</div>
        <div style={{fontFamily:"var(--mono)",fontSize:".95rem",fontWeight:700,color,marginTop:4}}>{val}</div>
      </div>)}
    </div>
    {/* profit allocation summary strip */}
    {netProfit>0&&<div className="gc" style={{marginBottom:"1rem",background:"rgba(168,85,247,.07)",borderColor:"rgba(168,85,247,.25)"}}>
      <div className="st" style={{marginBottom:".75rem"}}>📐 Profit Allocation Overview</div>
      <div style={{display:"flex",gap:"1rem",flexWrap:"wrap"}}>
        {PROFIT_ALLOC.map(a=><div key={a.key} style={{flex:1,minWidth:120,background:"rgba(255,255,255,.05)",borderRadius:10,padding:".65rem .9rem",border:`1px solid ${a.color}33`}}>
          <div style={{fontSize:".65rem",color:"var(--tm)",marginBottom:3}}>{a.icon} {a.label}</div>
          <div style={{fontFamily:"var(--mono)",fontWeight:700,color:a.color,fontSize:".9rem"}}>{GHS(netProfit*a.pct/100)}</div>
          <div style={{fontSize:".62rem",color:"var(--tm)"}}>{a.pct}% of profit</div>
        </div>)}
        <div style={{flex:1,minWidth:120,background:"rgba(255,255,255,.05)",borderRadius:10,padding:".65rem .9rem",border:"1px solid rgba(255,107,0,.25)"}}>
          <div style={{fontSize:".65rem",color:"var(--tm)",marginBottom:3}}>💼 Salary & Ops</div>
          <div style={{fontFamily:"var(--mono)",fontWeight:700,color:"var(--ol)",fontSize:".9rem"}}>{GHS(netProfit*0.65)}</div>
          <div style={{fontSize:".62rem",color:"var(--tm)"}}>65% of profit</div>
        </div>
      </div>
    </div>}
    <div className="g2" style={{marginBottom:"1rem"}}>
      <div className="gc"><div className="st" style={{marginBottom:"1rem"}}>Weekly Revenue</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={wData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)"/>
            <XAxis dataKey="day" tick={{fill:"rgba(255,255,255,.5)",fontSize:11}}/>
            <YAxis tick={{fill:"rgba(255,255,255,.5)",fontSize:10}} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
            <Tooltip content={<TT/>}/><Bar dataKey="revenue" fill="#FF6B00" radius={[4,4,0,0]} name="Revenue"/>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="gc"><div className="st" style={{marginBottom:"1rem"}}>Expenses by Category</div>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart><Pie data={expPie} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value">
            {expPie.map((_,i)=><Cell key={i} fill={PCOLS[i%PCOLS.length]}/>)}
          </Pie>
          <Tooltip formatter={v=>GHS(v)} contentStyle={{background:"rgba(18,6,0,.9)",border:"1px solid rgba(255,107,0,.3)",borderRadius:8,fontSize:".74rem"}}/>
          <Legend iconType="circle" wrapperStyle={{fontSize:".68rem",color:"rgba(255,255,255,.7)"}}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
    <div className="g2" style={{marginBottom:"1rem"}}>
      <div className="gc"><div className="st" style={{marginBottom:"1rem"}}>Sales by Payment Method</div>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart><Pie data={payPie} cx="50%" cy="50%" outerRadius={85} paddingAngle={3} dataKey="value">
            {payPie.map((_,i)=><Cell key={i} fill={PCOLS[i%PCOLS.length]}/>)}
          </Pie>
          <Tooltip formatter={v=>GHS(v)} contentStyle={{background:"rgba(18,6,0,.9)",border:"1px solid rgba(255,107,0,.3)",borderRadius:8,fontSize:".74rem"}}/>
          <Legend iconType="circle" wrapperStyle={{fontSize:".68rem",color:"rgba(255,255,255,.7)"}}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="gc"><div className="st" style={{marginBottom:"1rem"}}>Recent Transactions</div>
        <div className="tw"><table>
          <thead><tr><th>Date</th><th>Product</th><th>Revenue</th><th>Method</th></tr></thead>
          <tbody>{sales.slice(-5).reverse().map(s=>{const p=IP.find(x=>x.id===s.productId)||{};return<tr key={s.id}>
            <td style={{fontFamily:"var(--mono)",fontSize:".7rem"}}>{s.date}</td>
            <td>{p.emoji} {p.name}</td>
            <td style={{color:"var(--ol)",fontFamily:"var(--mono)"}}>{GHS(s.total)}</td>
            <td><span className={`b ${s.payment==="Cash"?"bwarn":s.payment==="Card"?"bblue":"bok"}`}>{s.payment}</span></td>
          </tr>;})}
          </tbody>
        </table></div>
      </div>
    </div>
  </div>;
}

// ─── POS (CRM-AWARE) ──────────────────────────────────────────────────────────
function POS({products,setProducts,cart,setCart,sales,setSales,customers,setCustomers,t$}){
  const [pm,setPm]=useState("Cash");
  const [disc,setDisc]=useState(0);
  const [receipt,setReceipt]=useState(null);
  const [search,setSearch]=useState("");
  const [custSearch,setCustSearch]=useState("");
  const [selCust,setSelCust]=useState(null);
  const [showNewCust,setShowNewCust]=useState(false);
  const [showThankYou,setShowThankYou]=useState(false);
  const [thankMsg,setThankMsg]=useState("");
  const [selTemplate,setSelTemplate]=useState(0);
  const [nc,setNc]=useState({name:"",phone:"",email:"",birthday:"",location:"",gender:"Female",notes:""});

  const add=p=>{if(p.stock<1){t$("Out of stock!","⚠️");return;}setCart(prev=>{const ex=prev.find(i=>i.id===p.id);return ex?prev.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i):[...prev,{...p,qty:1}];});};
  const upd=(id,d)=>setCart(prev=>prev.map(i=>i.id===id?{...i,qty:Math.max(1,i.qty+d)}:i).filter(i=>i.qty>0));
  const rem=id=>setCart(prev=>prev.filter(i=>i.id!==id));
  const sub=cart.reduce((s,i)=>s+i.price*i.qty,0);
  const dAmt=sub*disc/100;
  const total=sub-dAmt;

  const filteredCusts=customers.filter(c=>c.name.toLowerCase().includes(custSearch.toLowerCase())||c.phone.includes(custSearch));
  const isNewCust=selCust&&selCust.visits===0;

  const buildThankMsg=(cust,tmpl,items,tot)=>{
    const itemStr=items.map(i=>`${i.emoji}${i.name}×${i.qty}`).join(", ");
    return tmpl.body
      .replace(/{name}/g,cust.name)
      .replace(/{items}/g,itemStr)
      .replace(/{total}/g,GHS(tot));
  };

  const checkout=()=>{
    if(!cart.length){t$("Cart is empty","⚠️");return;}
    const sale={id:Date.now(),productId:cart[0].id,qty:cart.reduce((s,i)=>s+i.qty,0),total,date:new Date().toISOString().split("T")[0],payment:pm,items:[...cart],customerId:selCust?.id||null};
    setSales(p=>[...p,sale]);
    setProducts(p=>p.map(x=>{const ci=cart.find(i=>i.id===x.id);return ci?{...x,stock:x.stock-ci.qty}:x;}));

    // Update customer record
    if(selCust){
      setCustomers(p=>p.map(c=>c.id===selCust.id?{...c,totalSpent:(c.totalSpent||0)+total,visits:(c.visits||0)+1,lastVisit:new Date().toISOString().split("T")[0]}:c));
    }

    // Pick template — first-time buyer, birthday month, or standard
    const today=new Date();
    const bMonth=selCust?.birthday?new Date(selCust.birthday).getMonth():null;
    const tmplIdx=!selCust||selCust.visits===0?3:bMonth===today.getMonth()?2:0;
    const tmpl=THANK_YOU_TEMPLATES[tmplIdx];
    const custForMsg=selCust||{name:"Valued Customer"};
    const msg=buildThankMsg(custForMsg,tmpl,[...cart],total);
    setThankMsg(msg);
    setSelTemplate(tmplIdx);

    setReceipt({...sale,customer:selCust});
    setCart([]);setDisc(0);
    t$("Sale completed!","💰");
    setTimeout(()=>setShowThankYou(true),600);
  };

  const saveNewCustomer=()=>{
    if(!nc.name||!nc.phone){t$("Name and phone required","⚠️");return;}
    const newC={id:Date.now(),...nc,joinDate:new Date().toISOString().split("T")[0],totalSpent:0,visits:0};
    setCustomers(p=>[...p,newC]);
    setSelCust(newC);
    setShowNewCust(false);
    t$("Customer added!","👤");
  };

  const copyMsg=()=>{navigator.clipboard.writeText(thankMsg).then(()=>t$("Message copied!","📋"));};
  const whatsapp=()=>{if(selCust?.phone){window.open(`https://wa.me/${selCust.phone.replace(/\D/g,"")}?text=${encodeURIComponent(thankMsg)}`,"_blank");}};

  const filtered=products.filter(p=>p.name.toLowerCase().includes(search.toLowerCase()));

  return <div>
    {/* Customer selection bar */}
    <div className="gc" style={{marginBottom:"1rem",background:"rgba(59,130,246,.06)",borderColor:"rgba(59,130,246,.22)"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
        <div style={{fontSize:"1rem"}}>👤</div>
        <div style={{flex:1,minWidth:200}}>
          <div style={{fontSize:".7rem",color:"var(--tm)",marginBottom:4,textTransform:"uppercase",letterSpacing:".8px"}}>Select Customer (optional)</div>
          {selCust?<div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#3b82f6,#1d4ed8)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:".7rem",color:"#fff"}}>{selCust.name.split(" ").map(n=>n[0]).join("")}</div>
            <div><div style={{fontWeight:700,fontSize:".82rem"}}>{selCust.name}</div><div style={{fontSize:".68rem",color:"var(--tm)"}}>{selCust.phone} · {selCust.visits} past visits · {GHS(selCust.totalSpent||0)} spent</div></div>
            <button className="btn btn-sm bg2x" style={{marginLeft:"auto"}} onClick={()=>setSelCust(null)}>Change</button>
          </div>:<div style={{display:"flex",gap:8}}>
            <input className="inp" placeholder="Search customer by name or phone..." value={custSearch} onChange={e=>setCustSearch(e.target.value)} style={{flex:1}}/>
            <button className="btn bo btn-sm" onClick={()=>setShowNewCust(true)}>+ New</button>
          </div>}
        </div>
      </div>
      {!selCust&&custSearch&&<div style={{marginTop:8,display:"flex",flexDirection:"column",gap:4,maxHeight:160,overflowY:"auto"}}>
        {filteredCusts.map(c=><div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:".5rem .75rem",background:"rgba(255,255,255,.06)",borderRadius:8,cursor:"pointer"}} onClick={()=>{setSelCust(c);setCustSearch("");}}>
          <div style={{width:28,height:28,borderRadius:7,background:"linear-gradient(135deg,#3b82f6,#1d4ed8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:".65rem",fontWeight:700,color:"#fff"}}>{c.name.split(" ").map(n=>n[0]).join("")}</div>
          <div style={{flex:1}}><div style={{fontSize:".78rem",fontWeight:600}}>{c.name}</div><div style={{fontSize:".65rem",color:"var(--tm)"}}>{c.phone} · {c.visits} visits</div></div>
          <span className="b borg">{GHS(c.totalSpent||0)}</span>
        </div>)}
        {filteredCusts.length===0&&<div style={{fontSize:".76rem",color:"var(--tm)",padding:".5rem"}}>No customer found — <span style={{color:"var(--ol)",cursor:"pointer"}} onClick={()=>setShowNewCust(true)}>add new</span></div>}
      </div>}
    </div>

    <div style={{marginBottom:"1rem"}}><input className="inp" placeholder="🔍 Search products..." value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth:300}}/></div>

    <div className="pos-wrap">
      <div className="pos-prods"><div className="prod-grid">
        {filtered.map(p=><div key={p.id} className="pc" onClick={()=>add(p)}>
          <div className="pe">{p.emoji}</div><div className="pn">{p.name}</div>
          <div className="pp">{GHS(p.price)}</div><div className="pst">{p.stock>0?`${p.stock} in stock`:"Out of stock"}</div>
        </div>)}
      </div></div>
      <div className="pos-cart">
        <div className="ch"><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div className="st">🛒 Cart ({cart.length})</div>
          {cart.length>0&&<button className="btn btn-sm bg2x" onClick={()=>setCart([])}>Clear</button>}
        </div></div>
        <div className="ci">
          {cart.length===0?<div style={{textAlign:"center",color:"var(--tm)",padding:"2rem 0",fontSize:".8rem"}}><div style={{fontSize:"2rem",marginBottom:8}}>🛍️</div>Tap a product to add</div>
          :cart.map(item=><div key={item.id} className="cit">
            <span>{item.emoji}</span><div className="cin">{item.name}</div>
            <button className="qb" onClick={()=>upd(item.id,-1)}>−</button>
            <span style={{fontSize:".74rem",minWidth:18,textAlign:"center"}}>{item.qty}</span>
            <button className="qb" onClick={()=>upd(item.id,1)}>+</button>
            <span style={{fontSize:".72rem",color:"var(--ol)",fontFamily:"var(--mono)",minWidth:55,textAlign:"right"}}>{GHS(item.price*item.qty)}</span>
            <button style={{background:"none",border:"none",color:"var(--tm)",cursor:"pointer",fontSize:".78rem"}} onClick={()=>rem(item.id)}>✕</button>
          </div>)}
        </div>
        <div className="cf">
          <div style={{display:"flex",justifyContent:"space-between",fontSize:".76rem",marginBottom:8}}><span style={{color:"var(--ts)"}}>Subtotal</span><span style={{fontFamily:"var(--mono)"}}>{GHS(sub)}</span></div>
          <div className="ig"><label className="lbl">Discount %</label><input type="number" className="inp" min={0} max={100} value={disc} onChange={e=>setDisc(Math.min(100,Math.max(0,+e.target.value)))} style={{marginBottom:0}}/></div>
          {disc>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:".74rem",marginBottom:6}}><span style={{color:"var(--ok)"}}>Discount</span><span style={{color:"var(--ok)",fontFamily:"var(--mono)"}}>-{GHS(dAmt)}</span></div>}
          <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderTop:"1px solid var(--gb)",marginTop:4,marginBottom:8}}>
            <span style={{fontWeight:700}}>TOTAL</span>
            <span style={{fontFamily:"var(--mono)",fontSize:"1.05rem",color:"var(--ol)",fontWeight:700}}>{GHS(total)}</span>
          </div>
          <div className="ig"><label className="lbl">Payment Method</label>
            <select className="sel" value={pm} onChange={e=>setPm(e.target.value)}>
              <option>Cash</option><option>Mobile Money</option><option>Card</option><option>Bank Transfer</option>
            </select>
          </div>
          {selCust&&<div style={{background:"rgba(59,130,246,.1)",border:"1px solid rgba(59,130,246,.2)",borderRadius:8,padding:".5rem .75rem",marginBottom:8,fontSize:".72rem",color:"#93c5fd"}}>👤 Selling to: <strong>{selCust.name}</strong></div>}
          <button className="btn bo" style={{width:"100%"}} onClick={checkout}>✅ Complete Sale</button>
        </div>
      </div>
    </div>

    {/* Receipt modal */}
    {receipt&&!showThankYou&&<div className="mo" onClick={()=>setReceipt(null)}><div className="md" onClick={e=>e.stopPropagation()}>
      <div className="mt">Receipt<button className="mx" onClick={()=>setReceipt(null)}>✕</button></div>
      <div className="rbx"><h3>DEMAK FASHION INDUSTRY</h3>
        <div style={{textAlign:"center",fontSize:".65rem",color:"#666",marginBottom:6}}>{new Date().toLocaleString()}</div>
        {receipt.customer&&<div style={{textAlign:"center",fontSize:".68rem",color:"#CC5500",marginBottom:"1rem"}}>Customer: {receipt.customer.name}</div>}
        {receipt.items?.map(item=><div className="rl" key={item.id}><span>{item.emoji} {item.name} ×{item.qty}</span><span>{GHS(item.price*item.qty)}</span></div>)}
        <div className="rl" style={{fontWeight:700,borderBottom:"2px solid #CC5500",paddingTop:8,marginTop:4}}><span>TOTAL ({receipt.payment})</span><span>{GHS(receipt.total)}</span></div>
        <div style={{textAlign:"center",marginTop:"1rem",fontSize:".65rem",color:"#999"}}>Thank you for shopping at Demak Fashion!</div>
      </div>
      <button className="btn bo" style={{width:"100%",marginTop:"1rem"}} onClick={()=>setReceipt(null)}>Done</button>
    </div></div>}

    {/* Thank-you message modal */}
    {showThankYou&&<div className="mo"><div className="md">
      <div className="mt">
        <span>💌 Thank-You Message</span>
        <button className="mx" onClick={()=>setShowThankYou(false)}>✕</button>
      </div>
      <div style={{marginBottom:"1rem"}}>
        <label className="lbl">Message Template</label>
        <select className="sel" value={selTemplate} onChange={e=>{const idx=+e.target.value;setSelTemplate(idx);if(receipt?.customer||selCust)setThankMsg(buildThankMsg(receipt?.customer||selCust||{name:"Valued Customer"},THANK_YOU_TEMPLATES[idx],receipt?.items||[],receipt?.total||0));}}>
          {THANK_YOU_TEMPLATES.map((t,i)=><option key={i} value={i}>{t.name}</option>)}
        </select>
      </div>
      <div style={{background:"rgba(255,255,255,.05)",border:"1px solid var(--gb)",borderRadius:12,padding:"1rem",marginBottom:"1rem",fontSize:".82rem",lineHeight:1.7,color:"var(--ts)",whiteSpace:"pre-wrap"}}>{thankMsg}</div>
      {selCust?.phone&&<div style={{background:"rgba(34,197,94,.07)",border:"1px solid rgba(34,197,94,.2)",borderRadius:10,padding:".75rem",marginBottom:"1rem",fontSize:".76rem",color:"var(--ts)"}}>
        📱 Send to: <strong style={{color:"var(--ok)"}}>{selCust.phone}</strong>
      </div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <button className="btn bg2x" onClick={copyMsg}>📋 Copy Message</button>
        {selCust?.phone&&<button className="btn bo" style={{background:"linear-gradient(135deg,#25D366,#128C7E)"}} onClick={whatsapp}>💬 Send on WhatsApp</button>}
      </div>
      <button className="btn bg2x" style={{width:"100%",marginTop:8}} onClick={()=>setShowThankYou(false)}>Skip</button>
    </div></div>}

    {/* New customer modal */}
    {showNewCust&&<div className="mo"><div className="md">
      <div className="mt">👤 Add New Customer<button className="mx" onClick={()=>setShowNewCust(false)}>✕</button></div>
      {[["name","Full Name *","text"],["phone","Phone Number *","text"],["email","Email Address","email"],["birthday","Birthday","date"],["location","City / Location","text"]].map(([k,lbl,t])=><div className="ig" key={k}><label className="lbl">{lbl}</label><input className="inp" type={t} value={nc[k]} onChange={e=>setNc(p=>({...p,[k]:e.target.value}))}/></div>)}
      <div className="ig"><label className="lbl">Gender</label><select className="sel" value={nc.gender} onChange={e=>setNc(p=>({...p,gender:e.target.value}))}><option>Female</option><option>Male</option><option>Other</option></select></div>
      <div className="ig"><label className="lbl">Notes</label><input className="inp" placeholder="e.g. Prefers Ankara, referred by..." value={nc.notes} onChange={e=>setNc(p=>({...p,notes:e.target.value}))}/></div>
      <div style={{display:"flex",gap:8}}><button className="btn bg2x" onClick={()=>setShowNewCust(false)} style={{flex:1}}>Cancel</button><button className="btn bo" onClick={saveNewCustomer} style={{flex:1}}>Save Customer</button></div>
    </div></div>}
  </div>;
}

// ─── PRODUCTS ────────────────────────────────────────────────────────────────
function Products({products,setProducts,t$}){
  const [show,setShow]=useState(false);const [edit,setEdit]=useState(null);
  const [f,setF]=useState({name:"",price:"",cost:"",stock:"",emoji:"👗",category:""});
  const save=()=>{if(!f.name||!f.price||!f.cost||!f.stock){t$("Fill all fields","⚠️");return;}
    if(edit)setProducts(p=>p.map(x=>x.id===edit?{...x,...f,price:+f.price,cost:+f.cost,stock:+f.stock}:x));
    else setProducts(p=>[...p,{id:Date.now(),...f,price:+f.price,cost:+f.cost,stock:+f.stock}]);
    t$(edit?"Updated":"Added");setShow(false);};
  return <div>
    <div style={{display:"flex",justifyContent:"flex-end",marginBottom:"1rem"}}><button className="btn bo" onClick={()=>{setEdit(null);setF({name:"",price:"",cost:"",stock:"",emoji:"👗",category:""});setShow(true);}}>+ Add Product</button></div>
    <div className="tw"><table>
      <thead><tr><th>Product</th><th>Category</th><th>Selling Price</th><th>Cost Price</th><th>Profit/Item</th><th>Margin</th><th>Stock</th><th></th></tr></thead>
      <tbody>{products.map(p=>{const profit=p.price-p.cost,m=(profit/p.price*100).toFixed(0);return<tr key={p.id}>
        <td><span style={{marginRight:5}}>{p.emoji}</span>{p.name}</td>
        <td><span className="b borg">{p.category}</span></td>
        <td style={{fontFamily:"var(--mono)",color:"var(--ol)"}}>{GHS(p.price)}</td>
        <td style={{fontFamily:"var(--mono)"}}>{GHS(p.cost)}</td>
        <td style={{fontFamily:"var(--mono)",color:"var(--ok)"}}>{GHS(profit)}</td>
        <td><span className={`b ${m>40?"bok":m>20?"bwarn":"bbad"}`}>{m}%</span></td>
        <td><span className={`b ${p.stock<10?"bbad":p.stock<20?"bwarn":"bok"}`}>{p.stock}</span></td>
        <td><div style={{display:"flex",gap:4}}>
          <button className="btn btn-sm bg2x" onClick={()=>{setEdit(p.id);setF({name:p.name,price:p.price,cost:p.cost,stock:p.stock,emoji:p.emoji,category:p.category});setShow(true);}}>✏️</button>
          <button className="btn btn-sm bd" onClick={()=>{const pid=p.id;setProducts(prev=>prev.filter(x=>x.id!==pid));t$("Removed","🗑️");}}>🗑️</button>
        </div></td>
      </tr>;})}
      </tbody>
    </table></div>
    {show&&<div className="mo"><div className="md">
      <div className="mt">{edit?"Edit":"Add"} Product<button className="mx" onClick={()=>setShow(false)}>✕</button></div>
      {[["name","Product Name","text"],["emoji","Emoji","text"],["category","Category","text"],["price","Selling Price (GHS)","number"],["cost","Cost Price (GHS)","number"],["stock","Stock Qty","number"]].map(([k,lbl,t])=><div className="ig" key={k}><label className="lbl">{lbl}</label><input className="inp" type={t} value={f[k]} onChange={e=>setF(p=>({...p,[k]:e.target.value}))}/></div>)}
      <div style={{display:"flex",gap:8}}><button className="btn bg2x" onClick={()=>setShow(false)} style={{flex:1}}>Cancel</button><button className="btn bo" onClick={save} style={{flex:1}}>Save</button></div>
    </div></div>}
  </div>;
}

// ─── DESIGNERS ────────────────────────────────────────────────────────────────
function Designers({designers,setDesigners,workRecs,setWorkRecs,t$}){
  const [tab,setTab]=useState("team");
  const [show,setShow]=useState(false);
  const [showAdd,setShowAdd]=useState(false);
  const [selProfile,setSelProfile]=useState(null);
  const [f,setF]=useState({designerId:"",week:"2025-W19",month:"May",items:"",itemPrice:""});
  const [nd,setNd]=useState({name:"",role:"Production Designer",piecePct:40,weeklyTarget:"12",phone:"",email:"",gender:"Male",bio:""});

  const getRate=(id,itemPrice=0)=>{const d=designers.find(x=>x.id===+id);return designerRate(d?.piecePct||40,+itemPrice);};

  const addRecord=()=>{
    if(!f.designerId||!f.week||!f.items||!f.itemPrice){t$("Fill all fields including item price","⚠️");return;}
    const d=designers.find(x=>x.id===+f.designerId);
    const pct=d?.piecePct||40;
    const rate=designerRate(pct,+f.itemPrice);  // worker earns pct% of item price
    const gross=+f.items*rate;
    const net=Math.max(0,gross-WEEKLY_SAVINGS);
    setWorkRecs(p=>[...p,{id:Date.now(),designerId:+f.designerId,week:f.week,month:f.month,items:+f.items,itemPrice:+f.itemPrice,pct,rate,gross,savings:WEEKLY_SAVINGS,net,total:net}]);
    setShow(false);t$("Work record added ✔");
  };

  const addDes=()=>{
    if(!nd.name){t$("Name required","⚠️");return;}
    const rating=nd.piecePct>=40?"Gold":nd.piecePct>=34?"Silver":"Bronze";
    setDesigners(p=>[...p,{id:Date.now(),...nd,rating,piecePct:+nd.piecePct,weeklyTarget:+nd.weeklyTarget,joinDate:new Date().toISOString().split("T")[0],startWeek:"2025-W01"}]);
    setShowAdd(false);t$("Designer added 🎉");
  };

  const changePct=(id,pct)=>{
    const rating=pct>=40?"Gold":pct>=34?"Silver":"Bronze";
    setDesigners(p=>p.map(d=>d.id===id?{...d,piecePct:pct,rating}:d));
    setWorkRecs(p=>p.map(r=>{if(r.designerId!==id)return r;const ip=r.itemPrice||50;const rate=parseFloat((ip*pct/100).toFixed(2));const gross=parseFloat((r.items*rate).toFixed(2));const net=parseFloat(Math.max(0,gross-WEEKLY_SAVINGS).toFixed(2));return{...r,pct,rate,gross,net,total:net};}));
    if(selProfile?.id===id)setSelProfile(p=>({...p,piecePct:pct,rating}));
    t$(`Rate → ${pct}%`,"⭐");
  };

  const handlePhoto=(id,e)=>{
    const file=e.target.files[0];
    if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>{
      setDesigners(p=>p.map(d=>d.id===id?{...d,photo:ev.target.result}:d));
      if(selProfile?.id===id)setSelProfile(p=>({...p,photo:ev.target.result}));
      t$("Photo updated 📸");
    };
    reader.readAsDataURL(file);
  };

  const weeks=[...new Set(workRecs.map(r=>r.week))].sort().reverse();
  const enriched=designers.map(d=>{
    const recs=workRecs.filter(r=>r.designerId===d.id);
    return{...d,tItems:recs.reduce((s,r)=>s+r.items,0),tGross:recs.reduce((s,r)=>s+(r.gross||r.total),0),tSavings:recs.reduce((s,r)=>s+(r.savings||WEEKLY_SAVINGS),0),tNet:recs.reduce((s,r)=>s+(r.net||r.total),0),rate:d.piecePct||40,weeksWorked:[...new Set(recs.map(r=>r.week))].length};
  });

  return <div>
    <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginBottom:"1rem"}}>
      <button className="btn bg2x" onClick={()=>setShowAdd(true)}>+ Add Designer</button>
      <button className="btn bo" onClick={()=>{setF({designerId:"",week:"2025-W19",month:"May",items:""});setShow(true);}}>+ Log Work</button>
    </div>
    <div className="tabs">
      <button className={`tab ${tab==="team"?"act":""}`}    onClick={()=>setTab("team")}>👥 Team Profiles</button>
      <button className={`tab ${tab==="records"?"act":""}`} onClick={()=>setTab("records")}>📋 Work Records</button>
      <button className={`tab ${tab==="weekly"?"act":""}`}  onClick={()=>setTab("weekly")}>📅 Weekly Pay</button>
    </div>

    {tab==="team"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"1rem"}}>
      {enriched.map(d=>(
        <div key={d.id} className="profile-card" onClick={()=>setSelProfile(d)}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:RATINGS[d.rating||"Silver"].color,borderRadius:"16px 16px 0 0"}}/>
          <div className="avatar-wrap" style={{borderColor:RATINGS[d.rating||"Silver"].color+"66"}}>
            <DesignerAvatar designer={d} size={80}/>
          </div>
          <div style={{textAlign:"center",marginBottom:".75rem"}}>
            <div style={{fontWeight:700,fontSize:".82rem",color:"var(--tp)",lineHeight:1.3}}>{d.name}</div>
            <div style={{fontSize:".65rem",color:"var(--tm)",marginTop:2}}>{d.role}</div>
          </div>
          <div style={{textAlign:"center",marginBottom:".75rem"}}>
            <span className={`b ${RATINGS[d.rating||"Silver"].badge}`}>{d.piecePct}% cut rate</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
            {[["Items",fmt(d.tItems)],["Net Pay",GHS(d.tNet).replace("GHS ","₵")]].map(([l,v])=>(
              <div key={l} style={{background:"rgba(255,255,255,.05)",borderRadius:8,padding:"5px 8px",textAlign:"center"}}>
                <div style={{fontSize:".58rem",color:"var(--tm)"}}>{l}</div>
                <div style={{fontSize:".74rem",fontWeight:700,color:"var(--ol)",fontFamily:"var(--mono)"}}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{textAlign:"center",marginTop:".75rem",fontSize:".62rem",color:"rgba(255,107,0,.6)"}}>Tap to view full profile →</div>
        </div>
      ))}
    </div>}

    {tab==="records"&&<div className="tw"><table>
      <thead><tr><th>Designer</th><th>Rate Tier</th><th>Week</th><th>Items</th><th>Rate/Item</th><th>Gross Pay</th><th>Savings (-)</th><th>Net Pay</th><th>vs Target</th></tr></thead>
      <tbody>{workRecs.sort((a,b)=>b.week.localeCompare(a.week)).map(r=>{
        const d=designers.find(x=>x.id===r.designerId);
        const hit=r.items>=(d?.weeklyTarget||0);
        return<tr key={r.id}>
          <td><div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>setSelProfile(enriched.find(x=>x.id===r.designerId))}>
            <div style={{width:28,height:28,borderRadius:"50%",overflow:"hidden",flexShrink:0}}><DesignerAvatar designer={d||{id:r.designerId,name:"?",gender:"Male"}} size={28} fontSize={10}/></div>
            <span style={{fontWeight:600,fontSize:".8rem"}}>{d?.name}</span>
          </div></td>
          <td><span className={`b ${RATINGS[d?.rating||"Silver"].badge}`}>{r.pct||d?.piecePct||40}%</span></td>
          <td style={{fontFamily:"var(--mono)",fontSize:".7rem"}}>{r.week}</td>
          <td style={{fontFamily:"var(--mono)",color:"var(--ol)",fontWeight:700}}>{r.items}</td>
          <td style={{fontFamily:"var(--mono)"}}>{GHS(r.rate)}</td>
          <td style={{fontFamily:"var(--mono)",color:"var(--ts)"}}>{GHS(r.gross||r.total)}</td>
          <td style={{fontFamily:"var(--mono)",color:"var(--ok)"}}>-{GHS(r.savings||WEEKLY_SAVINGS)}</td>
          <td style={{fontFamily:"var(--mono)",color:"var(--ok)",fontWeight:700}}>{GHS(r.net||r.total)}</td>
          <td><span className={`b ${hit?"bok":"bbad"}`}>{hit?"✓ Met":"✗ Below"}</span></td>
        </tr>;})}
      </tbody>
    </table></div>}

    {tab==="weekly"&&weeks.map(week=>{
      const wd=workRecs.filter(r=>r.week===week);
      const wGross=wd.reduce((s,r)=>s+(r.gross||r.total),0);
      const wSav=wd.reduce((s,r)=>s+(r.savings||WEEKLY_SAVINGS),0);
      const wNet=wd.reduce((s,r)=>s+(r.net||r.total),0);
      return<div key={week} className="gc" style={{marginBottom:"1rem"}}>
        <div className="sh"><div>
          <div className="st">{week}</div>
          <div className="ss2">Gross: <strong style={{color:"var(--ts)"}}>{GHS(wGross)}</strong> · Savings: <strong style={{color:"var(--ok)"}}>{GHS(wSav)}</strong> · Net Pay: <strong style={{color:"var(--ol)"}}>{GHS(wNet)}</strong></div>
        </div></div>
        <div className="tw"><table>
          <thead><tr><th>Designer</th><th>Tier</th><th>Items</th><th>Rate/Item</th><th>Gross</th><th>Savings</th><th>Net Pay</th></tr></thead>
          <tbody>{wd.map(r=>{const d=designers.find(x=>x.id===r.designerId);return<tr key={r.id}>
            <td><div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>setSelProfile(enriched.find(x=>x.id===r.designerId))}>
              <div style={{width:26,height:26,borderRadius:"50%",overflow:"hidden",flexShrink:0}}><DesignerAvatar designer={d||{id:r.designerId,name:"?",gender:"Male"}} size={26} fontSize={9}/></div>
              {d?.name}
            </div></td>
            <td><span className={`b ${RATINGS[d?.rating||"Silver"].badge}`}>{r.pct||d?.piecePct||40}%</span></td>
            <td style={{fontFamily:"var(--mono)"}}>{r.items} pcs</td>
            <td style={{fontFamily:"var(--mono)"}}>{GHS(r.rate)}</td>
            <td style={{fontFamily:"var(--mono)",color:"var(--ts)"}}>{GHS(r.gross||r.total)}</td>
            <td style={{fontFamily:"var(--mono)",color:"var(--ok)"}}>-{GHS(r.savings||WEEKLY_SAVINGS)}</td>
            <td style={{fontFamily:"var(--mono)",color:"var(--ol)",fontWeight:700}}>{GHS(r.net||r.total)}</td>
          </tr>;})}
          </tbody>
        </table></div>
      </div>;})}

    {selProfile&&<div className="mo" onClick={()=>setSelProfile(null)}><div className="md" style={{maxWidth:520}} onClick={e=>e.stopPropagation()}>
      <div className="mt"><span>👤 Designer Profile</span><button className="mx" onClick={()=>setSelProfile(null)}>✕</button></div>
      <div style={{textAlign:"center",marginBottom:"1.2rem"}}>
        <div className="profile-modal-avatar" style={{borderColor:RATINGS[selProfile.rating||"Silver"].color+"66",margin:"0 auto .75rem"}}>
          <DesignerAvatar designer={selProfile} size={100} fontSize={32}/>
        </div>
        <div className="upload-btn">
          <button className="btn bg2x btn-sm">📷 Upload Photo</button>
          <input type="file" accept="image/*" onChange={e=>handlePhoto(selProfile.id,e)}/>
        </div>
        <div style={{fontSize:".62rem",color:"var(--tm)",marginTop:4}}>Upload a real photo to replace the avatar</div>
      </div>
      <div style={{textAlign:"center",marginBottom:"1.2rem",padding:"1rem",background:"rgba(255,255,255,.04)",borderRadius:12,border:`1px solid ${RATINGS[selProfile.rating||"Silver"].color}33`}}>
        <div style={{fontSize:"1.1rem",fontWeight:800,color:"var(--tp)"}}>{selProfile.name}</div>
        <div style={{fontSize:".74rem",color:"var(--tm)",marginTop:3}}>{selProfile.role}</div>
        {selProfile.bio&&<div style={{fontSize:".74rem",color:"var(--ts)",marginTop:8,fontStyle:"italic"}}>"{selProfile.bio}"</div>}
      </div>
      <div style={{marginBottom:"1.2rem"}}>
        <div className="lbl">Piece-Rate Tier</div>
        <div style={{display:"flex",gap:8}}>
          {[40,34,25].map(pct=><button key={pct} className={`${getPR(pct).cls} ${selProfile.piecePct===pct?"sel":""}`}
            onClick={()=>changePct(selProfile.id,pct)} style={{flex:1,textAlign:"center"}}>{pct}%</button>)}
        </div>
        <div style={{fontSize:".68rem",color:"var(--tm)",marginTop:5}}>Cut: <strong style={{color:"var(--ol)"}}>{selProfile.piecePct||40}% of item price</strong> · {getPR(selProfile.piecePct||40)?.desc}</div>
      </div>
      <div style={{background:"rgba(255,255,255,.04)",borderRadius:12,padding:".9rem",marginBottom:"1.2rem"}}>
        {[["📞","Phone",selProfile.phone||"—"],["📧","Email",selProfile.email||"—"],["⚥","Gender",selProfile.gender||"—"],["📅","Joined",selProfile.joinDate||"—"],["🎯","Weekly Target",`${selProfile.weeklyTarget} pcs/week`],["✂️","Items Sewn",`${fmt(selProfile.tItems)} pcs`],["💵","Gross Pay",GHS(selProfile.tGross||0)],["🏦","Total Saved",GHS(selProfile.tSavings||0)],["💰","Net Pay",GHS(selProfile.tNet||0)],["📆","Weeks Worked",`${selProfile.weeksWorked||0} wks`]].map(([icon,label,val])=>(
          <div key={label} className="info-row">
            <span style={{color:"var(--tm)"}}>{icon} {label}</span>
            <span style={{fontFamily:"var(--mono)",color:label==="Net Pay"?"var(--ol)":label==="Total Saved"?"var(--ok)":"var(--tp)",fontWeight:600,fontSize:".76rem"}}>{val}</span>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
        {selProfile.phone&&<button className="btn bo" style={{background:"linear-gradient(135deg,#25D366,#128C7E)"}} onClick={()=>window.open(`https://wa.me/${selProfile.phone.replace(/\D/g,"")}`,"_blank")}>💬 WhatsApp</button>}
        {selProfile.phone&&<button className="btn bg2x" onClick={()=>window.open(`tel:${selProfile.phone}`)}>📞 Call</button>}
      </div>
      <button className="btn bg2x" style={{width:"100%"}} onClick={()=>setSelProfile(null)}>Close</button>
    </div></div>}

    {show&&<div className="mo"><div className="md">
      <div className="mt">Log Work<button className="mx" onClick={()=>setShow(false)}>✕</button></div>
      <div className="ig"><label className="lbl">Designer</label><select className="sel" value={f.designerId} onChange={e=>setF(p=>({...p,designerId:e.target.value}))}>
        <option value="">Select...</option>{designers.map(d=><option key={d.id} value={d.id}>{d.name} ({d.piecePct}%)</option>)}
      </select></div>
      <div className="ig"><label className="lbl">Week</label><input className="inp" value={f.week} onChange={e=>setF(p=>({...p,week:e.target.value}))}/></div>
      <div className="ig"><label className="lbl">Month</label><select className="sel" value={f.month} onChange={e=>setF(p=>({...p,month:e.target.value}))}>{MONTHS.map(m=><option key={m}>{m}</option>)}</select></div>
      <div className="ig"><label className="lbl">Items Sewn</label><input className="inp" type="number" placeholder="e.g. 10" value={f.items} onChange={e=>setF(p=>({...p,items:e.target.value}))}/></div>
      <div className="ig"><label className="lbl">Sewing Price Per Item (GHS)</label><input className="inp" type="number" placeholder="e.g. 50" value={f.itemPrice} onChange={e=>setF(p=>({...p,itemPrice:e.target.value}))}/></div>
      {f.designerId&&f.items&&f.itemPrice&&(()=>{
        const d=designers.find(x=>x.id===+f.designerId);
        const pct=d?.piecePct||40;
        const rate=designerRate(pct,+f.itemPrice);
        const gross=+f.items*rate;
        const net=Math.max(0,gross-WEEKLY_SAVINGS);
        return<div style={{background:"rgba(255,107,0,.1)",borderRadius:10,padding:".75rem",marginBottom:"1rem",fontSize:".8rem"}}>
          <div style={{marginBottom:6,fontWeight:700,color:"var(--ol)"}}>Pay Calculation</div>
          <div>Worker Cut: <span className={`b ${RATINGS[d?.rating||"Silver"].badge}`}>{pct}% of GHS {f.itemPrice}</span></div>
          <div style={{marginTop:4}}>Rate/item: <strong style={{color:"var(--ol)"}}>{GHS(rate)}</strong> (GHS {f.itemPrice} × {pct}%)</div>
          <div style={{marginTop:4}}>Items × Rate: <strong>{f.items} × {GHS(rate)} = {GHS(gross)}</strong></div>
          <div style={{marginTop:4}}>Weekly Savings: <strong style={{color:"var(--ok)"}}>-{GHS(WEEKLY_SAVINGS)}</strong></div>
          <div style={{marginTop:6,paddingTop:6,borderTop:"1px dashed rgba(255,255,255,.1)"}}>
            <span style={{fontWeight:700}}>Net Pay: </span><strong style={{color:"var(--ol)",fontSize:".9rem"}}>{GHS(net)}</strong>
          </div>
        </div>;})()}
      <div style={{display:"flex",gap:8}}><button className="btn bg2x" onClick={()=>setShow(false)} style={{flex:1}}>Cancel</button><button className="btn bo" onClick={addRecord} style={{flex:1}}>Save</button></div>
    </div></div>}

    {showAdd&&<div className="mo"><div className="md">
      <div className="mt">Add Designer<button className="mx" onClick={()=>setShowAdd(false)}>✕</button></div>
      {[["name","Full Name","text"],["role","Role","text"],["phone","Phone","text"],["email","Email","email"],["bio","Short Bio","text"],["weeklyTarget","Weekly Target (pcs)","number"]].map(([k,lbl,t])=><div className="ig" key={k}><label className="lbl">{lbl}</label><input className="inp" type={t} value={nd[k]||""} onChange={e=>setNd(p=>({...p,[k]:e.target.value}))}/></div>)}
      <div className="ig"><label className="lbl">Gender</label><select className="sel" value={nd.gender} onChange={e=>setNd(p=>({...p,gender:e.target.value}))}><option>Male</option><option>Female</option></select></div>
      <div className="ig"><label className="lbl">Piece-Rate Tier</label>
        <div style={{display:"flex",gap:8}}>{[40,34,25].map(pct=><button key={pct} className={`${getPR(pct).cls} ${nd.piecePct===pct?"sel":""}`} onClick={()=>setNd(p=>({...p,piecePct:pct}))} style={{flex:1,textAlign:"center"}}>{pct}%</button>)}</div>
        <div style={{fontSize:".68rem",color:"var(--tm)",marginTop:5}}>On a GHS 50 item → earns {"% of price"}</div>
      </div>
      <div style={{display:"flex",gap:8}}><button className="btn bg2x" onClick={()=>setShowAdd(false)} style={{flex:1}}>Cancel</button><button className="btn bo" onClick={addDes} style={{flex:1}}>Add Designer</button></div>
    </div></div>}
  </div>;
}

// ─── SAVINGS ─────────────────────────────────────────────────────────────────
function Savings({designers,workRecs}){
  const weeksPerYear=52;
  const annualTotal=designers.length*weeksPerYear*WEEKLY_SAVINGS;

  const designerSavings=designers.map(d=>{
    const recs=workRecs.filter(r=>r.designerId===d.id);
    const weeksWorked=[...new Set(recs.map(r=>r.week))].length;
    const saved=weeksWorked*WEEKLY_SAVINGS;
    const projected=weeksPerYear*WEEKLY_SAVINGS;
    const pct=Math.min(100,(saved/projected)*100).toFixed(0);
    return{...d,weeksWorked,saved,projected,pct};
  });

  const totalSaved=designerSavings.reduce((s,d)=>s+d.saved,0);
  const monthlyBar=MONTHS.map((m,i)=>({month:m,savings:designers.length*4.33*WEEKLY_SAVINGS*(i+1)}));

  return<div>
    {/* Header stats */}
    <div className="sg">
      {[["🏦","Total Saved (All Staff)",GHS(totalSaved)],["👥","Active Designers",designers.length],["💸","Deduction/Week/Person",GHS(WEEKLY_SAVINGS)],["🎯","Annual Target (All)",GHS(annualTotal)]].map(([icon,label,val],i)=><div key={i} className="sc savings-glow">
        <div className="sic">{icon}</div><div className="sl">{label}</div>
        <div style={{fontFamily:"var(--mono)",fontSize:".95rem",fontWeight:700,color:"var(--ok)",marginTop:4}}>{val}</div>
      </div>)}
    </div>

    {/* Info box */}
    <div style={{background:"rgba(34,197,94,.07)",border:"1px solid rgba(34,197,94,.2)",borderRadius:14,padding:"1rem 1.2rem",marginBottom:"1rem"}}>
      <div style={{fontWeight:700,fontSize:".85rem",color:"var(--ok)",marginBottom:6}}>🏦 Staff Savings Programme — How It Works</div>
      <div style={{fontSize:".76rem",color:"var(--ts)",lineHeight:1.8}}>
        Every week, <strong style={{color:"var(--ok)"}}>{GHS(WEEKLY_SAVINGS)}</strong> is automatically deducted from each designer's gross pay and held in a savings pool.
        After <strong style={{color:"var(--ok)"}}>1 year (52 weeks)</strong> of work, each designer receives their full accumulated savings of <strong style={{color:"var(--ok)"}}>{GHS(weeksPerYear*WEEKLY_SAVINGS)}</strong> as a lump sum bonus.
        This rewards loyalty and long-term commitment.
      </div>
    </div>

    {/* Individual savings cards */}
    <div className="g2" style={{marginBottom:"1rem"}}>
      {designerSavings.map(d=><div key={d.id} className="gc">
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:"1rem"}}>
<div style={{flexShrink:0}}>
  <DesignerAvatar designer={d} size={44}/>
</div>
          <div><div style={{fontWeight:700}}>{d.name}</div><div style={{fontSize:".68rem",color:"var(--tm)"}}>{d.role}</div></div>
          <div style={{marginLeft:"auto"}}><span className={`b ${RATINGS[d.rating||"Silver"].badge}`}>{d.piecePct}%</span></div>
        </div>
        {[["Weeks Worked",`${d.weeksWorked} wks`],["Saved So Far",GHS(d.saved)],["Annual Target",GHS(d.projected)],["Payout Date","After 52 weeks"]].map(([lbl,val])=><div key={lbl} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,.04)",fontSize:".76rem"}}>
          <span style={{color:"var(--tm)"}}>{lbl}</span>
          <span style={{fontFamily:"var(--mono)",color:lbl==="Saved So Far"?"var(--ok)":"var(--tp)",fontWeight:600}}>{val}</span>
        </div>)}
        {/* Progress bar */}
        <div style={{marginTop:"1rem"}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:".68rem",marginBottom:4}}>
            <span style={{color:"var(--tm)"}}>Progress to annual payout</span>
            <span style={{color:"var(--ok)",fontFamily:"var(--mono)",fontWeight:700}}>{d.pct}%</span>
          </div>
          <div style={{height:8,background:"rgba(255,255,255,.08)",borderRadius:6,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${d.pct}%`,background:"linear-gradient(90deg,#22c55e,#4ade80)",borderRadius:6,transition:"width .6s"}}/>
          </div>
        </div>
      </div>)}
    </div>

    {/* Savings growth chart */}
    <div className="gc"><div className="st" style={{marginBottom:"1rem"}}>Projected Savings Growth — All Staff (Annual)</div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={monthlyBar}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)"/>
          <XAxis dataKey="month" tick={{fill:"rgba(255,255,255,.5)",fontSize:11}}/>
          <YAxis tick={{fill:"rgba(255,255,255,.5)",fontSize:10}} tickFormatter={v=>GHS(v).replace("GHS ","")}/>
          <Tooltip content={<TT/>}/>
          <Bar dataKey="savings" fill="#22c55e" radius={[4,4,0,0]} name="Savings Pool"/>
        </BarChart>
      </ResponsiveContainer>
    </div>

    {/* Full table */}
    <div className="gc" style={{marginTop:"1rem"}}><div className="st" style={{marginBottom:"1rem"}}>Savings Ledger</div>
      <div className="tw"><table>
        <thead><tr><th>Designer</th><th>Rate Tier</th><th>Weeks Worked</th><th>Deduction/Wk</th><th>Total Saved</th><th>Annual Target</th><th>Progress</th></tr></thead>
        <tbody>{designerSavings.map(d=><tr key={d.id}>
          <td style={{fontWeight:600}}>{d.name}</td>
          <td><span className={`b ${RATINGS[d.rating||"Silver"].badge}`}>{d.piecePct}%</span></td>
          <td style={{fontFamily:"var(--mono)"}}>{d.weeksWorked} wks</td>
          <td style={{fontFamily:"var(--mono)",color:"var(--ok)"}}>{GHS(WEEKLY_SAVINGS)}</td>
          <td style={{fontFamily:"var(--mono)",color:"var(--ok)",fontWeight:700}}>{GHS(d.saved)}</td>
          <td style={{fontFamily:"var(--mono)"}}>{GHS(d.projected)}</td>
          <td><div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:80,height:6,background:"rgba(255,255,255,.08)",borderRadius:4,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${d.pct}%`,background:"#22c55e",borderRadius:4}}/>
            </div>
            <span style={{fontSize:".68rem",color:"var(--ok)",fontFamily:"var(--mono)"}}>{d.pct}%</span>
          </div></td>
        </tr>)}
        </tbody>
      </table></div>
    </div>
  </div>;
}

// ─── PROFIT ALLOCATION ────────────────────────────────────────────────────────
function ProfitAlloc({netProfit,expenses,workRecs}){
  const [customProfit,setCustomProfit]=useState("");
  const base=customProfit?+customProfit:netProfit;
  const totalAllocPct=PROFIT_ALLOC.reduce((s,a)=>s+a.pct,0); // 35%
  const salaryOpsPct=100-totalAllocPct; // 65%
  const allocated=PROFIT_ALLOC.map(a=>({...a,amount:Math.max(0,base*a.pct/100)}));
  const salaryOps=Math.max(0,base*salaryOpsPct/100);
  const totalAlloc=allocated.reduce((s,a)=>s+a.amount,0);
  const pieData=[...allocated.map(a=>({name:a.label,value:Math.round(a.amount)})),{name:"Salary & Ops",value:Math.round(salaryOps)}];
  const pieColors=[...PROFIT_ALLOC.map(a=>a.color),"#FF6B00"];

  const monthlyData=MONTHS.map((m,i)=>({
    month:m,
    revenue:MREV[i],
    aob:Math.round(MREV[i]*0.38*0.20),
    project:Math.round(MREV[i]*0.38*0.05),
    machines:Math.round(MREV[i]*0.38*0.10),
    salaryOps:Math.round(MREV[i]*0.38*0.65),
  }));

  return<div>
    <div style={{marginBottom:"1.2rem",display:"flex",gap:"1rem",alignItems:"flex-end",flexWrap:"wrap"}}>
      <div style={{flex:1,minWidth:220}}>
        <label className="lbl">Base Profit to Allocate (GHS) — leave blank to use system profit</label>
        <input className="inp" type="number" placeholder={`Current profit: ${GHS(netProfit)}`} value={customProfit} onChange={e=>setCustomProfit(e.target.value)}/>
      </div>
      {customProfit&&<button className="btn bg2x" onClick={()=>setCustomProfit("")}>Use System Profit</button>}
    </div>

    {/* Allocation summary */}
    <div style={{background:"rgba(168,85,247,.07)",border:"1px solid rgba(168,85,247,.25)",borderRadius:16,padding:"1.2rem",marginBottom:"1.2rem"}}>
      <div style={{fontWeight:700,fontSize:".9rem",color:"#c084fc",marginBottom:"1rem"}}>📐 Profit Allocation — {GHS(base)} Base</div>
      <div className="g3">
        {allocated.map(a=><div key={a.key} style={{background:"rgba(255,255,255,.05)",borderRadius:12,padding:"1rem",border:`1px solid ${a.color}44`}}>
          <div style={{fontSize:"1.4rem",marginBottom:6}}>{a.icon}</div>
          <div style={{fontSize:".72rem",color:"var(--tm)",marginBottom:4}}>{a.label}</div>
          <div style={{fontFamily:"var(--mono)",fontWeight:700,color:a.color,fontSize:"1rem"}}>{GHS(a.amount)}</div>
          <div style={{fontSize:".65rem",color:"var(--tm)",marginBottom:8}}>{a.pct}% of profit</div>
          <div style={{fontSize:".65rem",color:"var(--ts)",fontStyle:"italic"}}>{a.desc}</div>
          <div style={{marginTop:8,height:6,background:"rgba(255,255,255,.08)",borderRadius:4,overflow:"hidden"}}>
            <div className="fund-bar" style={{width:`${a.pct/(totalAllocPct+salaryOpsPct)*100}%`,background:a.color}}/>
          </div>
        </div>)}
        {/* Salary & Ops */}
        <div style={{background:"rgba(255,255,255,.05)",borderRadius:12,padding:"1rem",border:"1px solid rgba(255,107,0,.35)"}}>
          <div style={{fontSize:"1.4rem",marginBottom:6}}>💼</div>
          <div style={{fontSize:".72rem",color:"var(--tm)",marginBottom:4}}>Salary & Operations</div>
          <div style={{fontFamily:"var(--mono)",fontWeight:700,color:"var(--ol)",fontSize:"1rem"}}>{GHS(salaryOps)}</div>
          <div style={{fontSize:".65rem",color:"var(--tm)",marginBottom:8}}>{salaryOpsPct}% of profit</div>
          <div style={{fontSize:".65rem",color:"var(--ts)",fontStyle:"italic"}}>Covers all staff salaries, running costs, utilities, and day-to-day operations</div>
          <div style={{marginTop:8,height:6,background:"rgba(255,255,255,.08)",borderRadius:4,overflow:"hidden"}}>
            <div className="fund-bar" style={{width:`${salaryOpsPct}%`,background:"var(--o)"}}/>
          </div>
        </div>
      </div>
    </div>

    {/* Summary table */}
    <div className="gc" style={{marginBottom:"1rem"}}>
      <div className="st" style={{marginBottom:"1rem"}}>Allocation Breakdown Table</div>
      <div className="tw"><table>
        <thead><tr><th>Fund</th><th>%</th><th>Amount</th><th>Purpose</th><th>Visual</th></tr></thead>
        <tbody>
          {[...allocated,{key:"salops",label:"Salary & Ops",icon:"💼",pct:salaryOpsPct,amount:salaryOps,color:"#FF6B00",desc:"Staff salaries, utilities, operations"}].map(a=><tr key={a.key}>
            <td><span style={{marginRight:6}}>{a.icon}</span><strong>{a.label}</strong></td>
            <td style={{fontFamily:"var(--mono)",color:"var(--ol)",fontWeight:700}}>{a.pct}%</td>
            <td style={{fontFamily:"var(--mono)",color:a.color,fontWeight:700}}>{GHS(a.amount)}</td>
            <td style={{fontSize:".72rem",color:"var(--tm)"}}>{a.desc}</td>
            <td><div style={{width:80,height:6,background:"rgba(255,255,255,.08)",borderRadius:4,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${a.pct}%`,background:a.color,borderRadius:4}}/>
            </div></td>
          </tr>)}
          <tr style={{borderTop:"2px solid rgba(255,107,0,.3)"}}>
            <td colSpan={2} style={{fontWeight:700}}>TOTAL</td>
            <td style={{fontFamily:"var(--mono)",fontWeight:700,color:"var(--ol)"}}>{GHS(totalAlloc+salaryOps)}</td>
            <td colSpan={2} style={{fontSize:".72rem",color:"var(--ok)"}}>100% of profit allocated</td>
          </tr>
        </tbody>
      </table></div>
    </div>

    {/* Pie + bar charts */}
    <div className="g2" style={{marginBottom:"1rem"}}>
      <div className="gc"><div className="st" style={{marginBottom:"1rem"}}>Allocation Pie Chart</div>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart><Pie data={pieData} cx="50%" cy="50%" outerRadius={95} paddingAngle={3} dataKey="value">
            {pieData.map((_,i)=><Cell key={i} fill={pieColors[i%pieColors.length]}/>)}
          </Pie>
          <Tooltip formatter={v=>GHS(v)} contentStyle={{background:"rgba(18,6,0,.9)",border:"1px solid rgba(255,107,0,.3)",borderRadius:8,fontSize:".74rem"}}/>
          <Legend iconType="circle" wrapperStyle={{fontSize:".68rem",color:"rgba(255,255,255,.7)"}}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="gc"><div className="st" style={{marginBottom:"1rem"}}>12-Month Allocation Trend</div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={monthlyData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)"/>
            <XAxis dataKey="month" tick={{fill:"rgba(255,255,255,.5)",fontSize:10}}/>
            <YAxis tick={{fill:"rgba(255,255,255,.5)",fontSize:10}} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
            <Tooltip content={<TT/>}/><Legend wrapperStyle={{fontSize:".68rem",color:"rgba(255,255,255,.65)"}}/>
            <Bar dataKey="aob"       stackId="a" fill="#a855f7" name="AOB"/>
            <Bar dataKey="project"   stackId="a" fill="#14b8a6" name="Project"/>
            <Bar dataKey="machines"  stackId="a" fill="#ec4899" name="Machines"/>
            <Bar dataKey="salaryOps" stackId="a" fill="#FF6B00" name="Salary & Ops" radius={[3,3,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>;
}

// ─── RANKINGS ─────────────────────────────────────────────────────────────────
function Rankings({designers,workRecs}){
  const [period,setPeriod]=useState("weekly");
  const [selWeek,setSelWeek]=useState("2025-W18");
  const [selMonth,setSelMonth]=useState("May");
  const weeks=[...new Set(workRecs.map(r=>r.week))].sort().reverse();
  const months=[...new Set(workRecs.map(r=>r.month))];

  const getStats=d=>{
    let recs=workRecs.filter(r=>r.designerId===d.id);
    if(period==="weekly")  recs=recs.filter(r=>r.week===selWeek);
    if(period==="monthly") recs=recs.filter(r=>r.month===selMonth);
    const items=recs.reduce((s,r)=>s+r.items,0);
    const earned=recs.reduce((s,r)=>s+(r.net||r.total),0);
    const gross=recs.reduce((s,r)=>s+(r.gross||r.total),0);
    const th=period==="weekly"?(recs[0]?.items||0)>=d.weeklyTarget?1:0:recs.filter(r=>r.items>=d.weeklyTarget).length;
    const score=Math.round(items*2+(earned/50)+(th*20));
    return{items,earned,gross,score,targetHit:th,weeks:recs.length};
  };

  const ranked=designers.map(d=>({...d,...getStats(d)})).sort((a,b)=>b.score-a.score);
  const top3=ranked.slice(0,3);
  const rest=ranked.slice(3);
  const maxItems=Math.max(...ranked.map(d=>d.items),1);
  const maxEarned=Math.max(...ranked.map(d=>d.earned),1);

  const medalColors=["#FFD700","#C0C0C0","#CD7F32"];
  const medalBg=["rgba(255,215,0,.12)","rgba(192,192,192,.10)","rgba(205,127,50,.10)"];
  const medalBorder=["rgba(255,215,0,.4)","rgba(192,192,192,.35)","rgba(205,127,50,.35)"];
  const medalLabels=["Top Performer","Runner-Up","3rd Place"];
  const medalIcons=[ICONS.medal1,ICONS.medal2,ICONS.medal3];

  const cd=ranked.map(d=>({name:d.name.split(" ")[0],items:d.items,earned:Math.round(d.earned)}));
  const radarData=ranked.map(d=>({name:d.name.split(" ")[0],Items:d.items,Earnings:Math.round(d.earned/10),Score:d.score}));

  return<div>
    {/* Period tabs */}
    <div className="tabs">
      <button className={`tab ${period==="weekly"?"act":""}`}  onClick={()=>setPeriod("weekly")}>Weekly</button>
      <button className={`tab ${period==="monthly"?"act":""}`} onClick={()=>setPeriod("monthly")}>Monthly</button>
      <button className={`tab ${period==="annual"?"act":""}`}  onClick={()=>setPeriod("annual")}>Annual</button>
    </div>
    {period==="weekly"&&<div className="ig" style={{maxWidth:240,marginBottom:"1.2rem"}}><label className="lbl">Select Week</label><select className="sel" value={selWeek} onChange={e=>setSelWeek(e.target.value)}>{weeks.map(w=><option key={w}>{w}</option>)}</select></div>}
    {period==="monthly"&&<div className="ig" style={{maxWidth:240,marginBottom:"1.2rem"}}><label className="lbl">Select Month</label><select className="sel" value={selMonth} onChange={e=>setSelMonth(e.target.value)}>{months.map(m=><option key={m}>{m}</option>)}</select></div>}

    {/* ── Top 3 Podium Cards ── */}
    {ranked.length>=3&&<div style={{marginBottom:"1.5rem"}}>
      <div style={{textAlign:"center",marginBottom:"1.2rem"}}>
        <div style={{fontSize:"1rem",fontWeight:800,color:"var(--tp)"}}>Performance Leaderboard</div>
        <div style={{fontSize:".72rem",color:"var(--tm)",marginTop:3}}>Top performers · {period} period</div>
      </div>

      {/* Podium — order: 2nd, 1st, 3rd */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"1rem",alignItems:"flex-end",marginBottom:"1.5rem"}}>
        {[1,0,2].map(i=>{
          const d=top3[i];
          if(!d) return <div key={i}/>;
          const isFirst=i===0;
          const podiumH=isFirst?160:i===1?130:110;
          return(
            <div key={d.id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:0}}>
              {/* Crown for #1 */}
              {isFirst&&<div style={{fontSize:"1.4rem",marginBottom:4,filter:"drop-shadow(0 0 8px #FFD700)"}}>👑</div>}
              {/* Avatar */}
              <div style={{width:isFirst?80:64,height:isFirst?80:64,borderRadius:"50%",border:`3px solid ${medalColors[i]}`,overflow:"hidden",marginBottom:8,boxShadow:`0 0 ${isFirst?20:12}px ${medalColors[i]}66`}}>
                <DesignerAvatar designer={d} size={isFirst?80:64} fontSize={isFirst?26:20}/>
              </div>
              <div style={{fontWeight:800,fontSize:isFirst?".88rem":".78rem",color:medalColors[i],textAlign:"center",lineHeight:1.2,marginBottom:3}}>{d.name.split(" ")[0]}</div>
              <div style={{fontSize:".6rem",color:"var(--tm)",marginBottom:6}}>{d.items} pcs · {GHS(d.earned)}</div>
              {/* Podium bar */}
              <div style={{width:"100%",height:podiumH,background:medalBg[i],border:`2px solid ${medalBorder[i]}`,borderRadius:"10px 10px 0 0",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-start",padding:"12px 8px",boxShadow:isFirst?`0 0 24px ${medalColors[i]}33`:"none"}}>
                <div style={{width:32,height:32}}>{medalIcons[i]}</div>
                <div style={{fontSize:".65rem",color:medalColors[i],fontWeight:700,marginTop:6}}>{["#1","#2","#3"][i]}</div>
                <div style={{fontSize:".6rem",color:"var(--tm)",marginTop:3}}>{medalLabels[i]}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>}

    {/* ── Full ranked grid ── */}
    <div style={{marginBottom:"1.5rem"}}>
      <div style={{fontSize:".8rem",fontWeight:700,marginBottom:"1rem",color:"var(--tp)"}}>Full Rankings</div>
      <div style={{display:"flex",flexDirection:"column",gap:".75rem"}}>
        {ranked.map((d,i)=>{
          const isTop=i<3;
          const pct=d.piecePct||40;
          return(
            <div key={d.id} className={`rank-card ${isTop?`rank-${i+1}`:""}`}
              style={{display:"grid",gridTemplateColumns:"auto auto 1fr auto auto",alignItems:"center",gap:"1rem"}}>
              {/* Rank number */}
              <div style={{width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center"}}>
                {i<3?<div style={{width:32,height:32}}>{medalIcons[i]}</div>
                     :<div style={{width:28,height:28,borderRadius:"50%",background:"rgba(255,255,255,.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:".7rem",fontWeight:700,color:"var(--tm)"}}>#{i+1}</div>}
              </div>
              {/* Avatar */}
              <div style={{width:44,height:44,borderRadius:"50%",border:`2px solid ${i<3?medalColors[i]:"rgba(255,255,255,.15)"}`,overflow:"hidden",flexShrink:0}}>
                <DesignerAvatar designer={d} size={44} fontSize={14}/>
              </div>
              {/* Name & info */}
              <div>
                <div style={{fontWeight:700,fontSize:".82rem",color:"var(--tp)"}}>{d.name}</div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginTop:3}}>
                  <span className={`b ${RATINGS[d.rating||"Silver"].badge}`} style={{fontSize:".58rem",padding:"1px 7px"}}>{pct}% cut</span>
                  <span style={{fontSize:".65rem",color:"var(--tm)"}}>{d.items} pcs sewn</span>
                </div>
                {/* Progress bar — items vs best */}
                <div style={{marginTop:6,width:"100%",maxWidth:200}}>
                  <div style={{height:4,background:"rgba(255,255,255,.07)",borderRadius:4,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${(d.items/maxItems)*100}%`,background:i<3?medalColors[i]:"rgba(255,107,0,.6)",borderRadius:4,transition:"width .8s"}}/>
                  </div>
                </div>
              </div>
              {/* Earnings */}
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"var(--mono)",fontWeight:700,color:"var(--ok)",fontSize:".82rem"}}>{GHS(d.earned)}</div>
                <div style={{fontSize:".62rem",color:"var(--tm)"}}>net earned</div>
              </div>
              {/* Score badge */}
              <div style={{textAlign:"center",background:"rgba(255,255,255,.06)",borderRadius:10,padding:"6px 10px",minWidth:52}}>
                <div style={{fontFamily:"var(--mono)",fontWeight:800,fontSize:".88rem",color:i<3?medalColors[i]:"var(--ol)"}}>{d.score}</div>
                <div style={{fontSize:".55rem",color:"var(--tm)"}}>score</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>

    {/* ── Charts ── */}
    <div className="g2" style={{marginBottom:"1rem"}}>
      <div className="gc"><div className="st" style={{marginBottom:"1rem"}}>Items Sewn Comparison</div>
        <ResponsiveContainer width="100%" height={220}><BarChart data={cd}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)"/><XAxis dataKey="name" tick={{fill:"rgba(255,255,255,.55)",fontSize:10}}/><YAxis tick={{fill:"rgba(255,255,255,.55)",fontSize:10}}/><Tooltip content={<TT/>}/><Bar dataKey="items" name="Items" radius={[4,4,0,0]}>{cd.map((_,i)=><Cell key={i} fill={i===0?"#FFD700":i===1?"#C0C0C0":i===2?"#CD7F32":"#FF6B00"}/>)}</Bar></BarChart></ResponsiveContainer>
      </div>
      <div className="gc"><div className="st" style={{marginBottom:"1rem"}}>Net Earnings Comparison</div>
        <ResponsiveContainer width="100%" height={220}><BarChart data={cd}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)"/><XAxis dataKey="name" tick={{fill:"rgba(255,255,255,.55)",fontSize:10}}/><YAxis tick={{fill:"rgba(255,255,255,.55)",fontSize:10}} tickFormatter={v=>`₵${(v/100).toFixed(0)}k`}/><Tooltip content={<TT/>}/><Bar dataKey="earned" name="Earned" radius={[4,4,0,0]}>{cd.map((_,i)=><Cell key={i} fill={i===0?"#FFD700":i===1?"#C0C0C0":i===2?"#CD7F32":"#22c55e"}/>)}</Bar></BarChart></ResponsiveContainer>
      </div>
    </div>

    <div className="gc"><div className="st" style={{marginBottom:"1rem"}}>Multi-Dimension Radar</div>
      <ResponsiveContainer width="100%" height={280}><RadarChart data={radarData}><PolarGrid stroke="rgba(255,255,255,.08)"/><PolarAngleAxis dataKey="name" tick={{fill:"rgba(255,255,255,.6)",fontSize:10}}/>{["Items","Earnings","Score"].map((k,i)=><Radar key={k} name={k} dataKey={k} stroke={PCOLS[i]} fill={PCOLS[i]} fillOpacity={0.12}/>)}<Legend wrapperStyle={{fontSize:".7rem",color:"rgba(255,255,255,.65)"}}/><Tooltip contentStyle={{background:"rgba(18,6,0,.9)",border:"1px solid rgba(255,107,0,.3)",borderRadius:8,fontSize:".74rem"}}/></RadarChart></ResponsiveContainer>
    </div>

    {/* Reward tip */}
    <div style={{marginTop:"1rem",padding:"1rem 1.2rem",background:"rgba(255,215,0,.06)",borderRadius:14,border:"1px solid rgba(255,215,0,.18)"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <span style={{width:32,height:32}}>{ICONS.trophy}</span>
        <div>
          <div style={{fontWeight:700,color:"var(--gold)",fontSize:".82rem"}}>Reward Suggestion</div>
          <div style={{fontSize:".74rem",color:"var(--ts)",marginTop:3,lineHeight:1.6}}>
            Consider a weekly bonus for <strong style={{color:"#FFD700"}}>{ranked[0]?.name}</strong> (Top Performer) and <strong style={{color:"#C0C0C0"}}>{ranked[1]?.name}</strong> (Runner-Up). Consistent recognition builds loyalty and drives production.
          </div>
        </div>
      </div>
    </div>
  </div>;
}

// ─── FINANCE ─────────────────────────────────────────────────────────────────
function Finance({sales,products}){
  const enriched=sales.map(s=>{const p=products.find(x=>x.id===s.productId)||{};const cost=(p.cost||0)*s.qty;return{...s,product:p,cost,profit:s.total-cost};});
  const tRev=enriched.reduce((s,r)=>s+r.total,0);const tCost=enriched.reduce((s,r)=>s+r.cost,0);const tP=enriched.reduce((s,r)=>s+r.profit,0);
  const margin=tRev?(tP/tRev*100).toFixed(1):0;
  const lineData=MONTHS.map((m,i)=>({month:m,revenue:MREV[i],profit:Math.round(MREV[i]*0.38)}));
  return<div>
    <div className="sg" style={{marginBottom:"1.4rem"}}>
      {[["💵","Total Revenue",GHS(tRev),"var(--ol)"],["📦","COGS",GHS(tCost),"var(--bad)"],["📈","Gross Profit",GHS(tP),"var(--ok)"],["📊","Margin",margin+"%","var(--warn)"]].map(([icon,label,val,color])=><div key={label} className="sc"><div className="sic">{icon}</div><div className="sl">{label}</div><div style={{fontFamily:"var(--mono)",fontSize:"1rem",fontWeight:700,color,marginTop:4}}>{val}</div></div>)}
    </div>
    <div className="gc" style={{marginBottom:"1rem"}}><div className="st" style={{marginBottom:"1rem"}}>Revenue vs Profit — 12 Months</div>
      <ResponsiveContainer width="100%" height={240}><LineChart data={lineData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)"/><XAxis dataKey="month" tick={{fill:"rgba(255,255,255,.5)",fontSize:11}}/><YAxis tick={{fill:"rgba(255,255,255,.5)",fontSize:10}} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/><Tooltip content={<TT/>}/><Legend wrapperStyle={{fontSize:".72rem",color:"rgba(255,255,255,.65)"}}/><Line type="monotone" dataKey="revenue" stroke="#FF6B00" strokeWidth={2} dot={{fill:"#FF6B00",r:3}} name="revenue"/><Line type="monotone" dataKey="profit" stroke="#22c55e" strokeWidth={2} dot={{fill:"#22c55e",r:3}} name="profit"/></LineChart></ResponsiveContainer>
    </div>
    <div className="gc"><div className="st" style={{marginBottom:"1rem"}}>Sales & Profit Analysis</div>
      <div className="tw"><table>
        <thead><tr><th>Date</th><th>Product</th><th>Qty</th><th>Revenue</th><th>COGS</th><th>Profit</th><th>Margin</th><th>Method</th></tr></thead>
        <tbody>{enriched.sort((a,b)=>b.date.localeCompare(a.date)).map(s=>{const m=s.total?(s.profit/s.total*100).toFixed(0):0;return<tr key={s.id}>
          <td style={{fontFamily:"var(--mono)",fontSize:".7rem"}}>{s.date}</td><td>{s.product.emoji} {s.product.name||"—"}</td><td>{s.qty}</td>
          <td style={{fontFamily:"var(--mono)",color:"var(--ol)"}}>{GHS(s.total)}</td>
          <td style={{fontFamily:"var(--mono)",color:"var(--bad)"}}>{GHS(s.cost)}</td>
          <td style={{fontFamily:"var(--mono)",color:s.profit>=0?"var(--ok)":"var(--bad)"}}>{GHS(s.profit)}</td>
          <td><span className={`b ${m>40?"bok":m>20?"bwarn":"bbad"}`}>{m}%</span></td>
          <td><span className="b bblue">{s.payment}</span></td>
        </tr>;})}
        </tbody>
      </table></div>
    </div>
  </div>;
}

// ─── EXPENSES ─────────────────────────────────────────────────────────────────
function Expenses({expenses,setExpenses,t$}){
  const [show,setShow]=useState(false);const [f,setF]=useState({category:"",amount:"",date:"",note:""});
  const CATS=["Raw Materials","Utilities","Salaries","Equipment","Marketing","Rent","Transport","Miscellaneous"];
  const total=expenses.reduce((s,e)=>s+e.amount,0);
  const byCat=CATS.map(c=>({name:c,value:expenses.filter(e=>e.category===c).reduce((s,e)=>s+e.amount,0)})).filter(x=>x.value>0);
  const save=()=>{if(!f.category||!f.amount||!f.date){t$("Fill required fields","⚠️");return;}setExpenses(p=>[...p,{id:Date.now(),...f,amount:+f.amount}]);setShow(false);t$("Expense recorded");};
  return<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.4rem"}}>
      <div style={{background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.2)",borderRadius:12,padding:".75rem 1.2rem"}}>
        <div style={{fontSize:".65rem",color:"var(--tm)",marginBottom:4}}>TOTAL EXPENDITURE</div>
        <div style={{fontFamily:"var(--mono)",fontSize:"1.3rem",fontWeight:700,color:"#f87171"}}>{GHS(total)}</div>
      </div>
      <button className="btn bo" onClick={()=>{setF({category:"",amount:"",date:new Date().toISOString().split("T")[0],note:""});setShow(true);}}>+ Add Expense</button>
    </div>
    <div className="g2" style={{marginBottom:"1rem"}}>
      <div className="gc"><div className="st" style={{marginBottom:"1rem"}}>Expense Breakdown</div>
        <ResponsiveContainer width="100%" height={220}><PieChart><Pie data={byCat} cx="50%" cy="50%" outerRadius={90} paddingAngle={3} dataKey="value">{byCat.map((_,i)=><Cell key={i} fill={PCOLS[i%PCOLS.length]}/>)}</Pie><Tooltip formatter={v=>GHS(v)} contentStyle={{background:"rgba(18,6,0,.9)",border:"1px solid rgba(255,107,0,.3)",borderRadius:8,fontSize:".74rem"}}/><Legend iconType="circle" wrapperStyle={{fontSize:".68rem",color:"rgba(255,255,255,.7)"}}/></PieChart></ResponsiveContainer>
      </div>
      <div className="gc"><div className="st" style={{marginBottom:"1rem"}}>Category Bars</div>
        {byCat.sort((a,b)=>b.value-a.value).map(({name,value},i)=><div key={name} style={{marginBottom:".65rem"}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:".74rem",marginBottom:3}}><span style={{color:"var(--ts)"}}>{name}</span><div style={{display:"flex",gap:8}}><span style={{fontFamily:"var(--mono)",color:"#f87171"}}>{GHS(value)}</span><span style={{fontSize:".65rem",color:"var(--tm)"}}>{(value/total*100).toFixed(0)}%</span></div></div>
          <div style={{height:6,background:"rgba(255,255,255,.08)",borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:`${value/total*100}%`,background:PCOLS[i%PCOLS.length],borderRadius:4,transition:"width .6s"}}/></div>
        </div>)}
      </div>
    </div>
    <div className="tw"><table>
      <thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Note</th><th></th></tr></thead>
      <tbody>{expenses.sort((a,b)=>b.date.localeCompare(a.date)).map(e=><tr key={e.id}>
        <td style={{fontFamily:"var(--mono)",fontSize:".7rem"}}>{e.date}</td>
        <td><span className="b bwarn">{e.category}</span></td>
        <td style={{fontFamily:"var(--mono)",color:"#f87171",fontWeight:700}}>{GHS(e.amount)}</td>
        <td style={{color:"var(--tm)",fontSize:".72rem"}}>{e.note}</td>
        <td><button className="btn btn-sm bd" onClick={()=>{setExpenses(p=>p.filter(x=>x.id!==e.id));t$("Deleted","🗑️");}}>🗑️</button></td>
      </tr>)}
      </tbody>
    </table></div>
    {show&&<div className="mo"><div className="md">
      <div className="mt">Add Expense<button className="mx" onClick={()=>setShow(false)}>✕</button></div>
      <div className="ig"><label className="lbl">Category</label><select className="sel" value={f.category} onChange={e=>setF(p=>({...p,category:e.target.value}))}><option value="">Select...</option>{CATS.map(c=><option key={c}>{c}</option>)}</select></div>
      <div className="ig"><label className="lbl">Amount (GHS)</label><input className="inp" type="number" value={f.amount} onChange={e=>setF(p=>({...p,amount:e.target.value}))}/></div>
      <div className="ig"><label className="lbl">Date</label><input className="inp" type="date" value={f.date} onChange={e=>setF(p=>({...p,date:e.target.value}))}/></div>
      <div className="ig"><label className="lbl">Note</label><input className="inp" value={f.note} onChange={e=>setF(p=>({...p,note:e.target.value}))} placeholder="Short description..."/></div>
      <div style={{display:"flex",gap:8}}><button className="btn bg2x" onClick={()=>setShow(false)} style={{flex:1}}>Cancel</button><button className="btn bo" onClick={save} style={{flex:1}}>Record</button></div>
    </div></div>}
  </div>;
}

// ─── REPORTS ─────────────────────────────────────────────────────────────────
function Reports({sales,expenses,workRecs,designers,netProfit}){
  const [month,setMonth]=useState(4);
  const tRev=sales.reduce((s,r)=>s+r.total,0);
  const tExp=expenses.reduce((s,e)=>s+e.amount,0);
  const net=tRev-tExp;
  const margin=tRev?(net/tRev*100).toFixed(1):0;
  const dGross=workRecs.reduce((s,r)=>s+(r.gross||r.total),0);
  const dSavings=workRecs.reduce((s,r)=>s+(r.savings||WEEKLY_SAVINGS),0);
  const dNet=workRecs.reduce((s,r)=>s+(r.net||r.total),0);
  const tItems=workRecs.reduce((s,r)=>s+r.items,0);
  const mData=MONTHS.map((m,i)=>({month:m,revenue:MREV[i],expenses:Math.round(MREV[i]*.62),profit:Math.round(MREV[i]*.38)}));
  const expPie=[...new Set(expenses.map(e=>e.category))].map(c=>({name:c,value:expenses.filter(e=>e.category===c).reduce((s,e)=>s+e.amount,0)}));
  const allocPie=[...PROFIT_ALLOC.map(a=>({name:a.label,value:Math.round((net>0?net:0)*a.pct/100)})),{name:"Salary & Ops",value:Math.round((net>0?net:0)*0.65)}];
  return<div>
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:"1.4rem"}}>
      <div className="st">Monthly Report</div>
      <select className="sel" value={month} onChange={e=>setMonth(+e.target.value)} style={{width:"auto"}}>{MONTHS.map((m,i)=><option key={i} value={i}>{m} 2025</option>)}</select>
    </div>
    <div className="sg">
      {[["Revenue",GHS(tRev),"var(--ol)"],["Expenses",GHS(tExp),"#f87171"],["Net Profit",GHS(net),net>=0?"var(--ok)":"var(--bad)"],["Margin",margin+"%","var(--warn)"],["Designer Gross",GHS(dGross),"var(--ts)"],["Staff Savings",GHS(dSavings),"var(--ok)"],["Net Pay Out",GHS(dNet),"var(--ol)"],["Items Produced",fmt(tItems)+" pcs","var(--tp)"]].map(([label,val,color])=><div key={label} className="sc"><div className="sl">{label}</div><div style={{fontFamily:"var(--mono)",fontSize:".88rem",fontWeight:700,color,marginTop:4}}>{val}</div></div>)}
    </div>
    <div className="gc" style={{margin:"1rem 0"}}><div className="st" style={{marginBottom:"1rem"}}>Revenue vs Expenses vs Profit — 12 Months</div>
      <ResponsiveContainer width="100%" height={260}><BarChart data={mData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)"/><XAxis dataKey="month" tick={{fill:"rgba(255,255,255,.5)",fontSize:11}}/><YAxis tick={{fill:"rgba(255,255,255,.5)",fontSize:10}} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/><Tooltip content={<TT/>}/><Legend wrapperStyle={{fontSize:".72rem",color:"rgba(255,255,255,.65)"}}/><Bar dataKey="revenue" fill="#FF6B00" name="revenue" radius={[3,3,0,0]}/><Bar dataKey="expenses" fill="#ef4444" name="expenses" radius={[3,3,0,0]}/><Bar dataKey="profit" fill="#22c55e" name="profit" radius={[3,3,0,0]}/></BarChart></ResponsiveContainer>
    </div>
    <div className="g2" style={{marginBottom:"1rem"}}>
      <div className="gc"><div className="st" style={{marginBottom:".75rem"}}>P&L + Allocation Statement</div>
        {[["(+) Sales Revenue",GHS(tRev),"var(--ok)"],["(-) Cost of Goods",GHS(expenses.filter(e=>e.category==="Raw Materials").reduce((s,e)=>s+e.amount,0)),"#f87171"],["(-) Net Designer Pay",GHS(dNet),"#f87171"],["(-) Operating Costs",GHS(tExp-expenses.filter(e=>e.category==="Raw Materials").reduce((s,e)=>s+e.amount,0)),"#f87171"],["= NET PROFIT",GHS(net),net>=0?"var(--ok)":"var(--bad)"],["  → AOB (20%)",GHS((net>0?net:0)*0.20),"#a855f7"],["  → Project (5%)",GHS((net>0?net:0)*0.05),"#14b8a6"],["  → Machines (10%)",GHS((net>0?net:0)*0.10),"#ec4899"],["  → Salary & Ops (65%)",GHS((net>0?net:0)*0.65),"var(--ol)"]].map(([label,val,color],i)=><div key={label} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i===4?"2px solid var(--o)":i<4?"1px solid rgba(255,255,255,.05)":"1px dashed rgba(255,255,255,.08)",fontWeight:i===4?700:400}}>
          <span style={{fontSize:".74rem",color:i===4?"var(--tp)":"var(--ts)"}}>{label}</span>
          <span style={{fontFamily:"var(--mono)",fontSize:".74rem",color}}>{val}</span>
        </div>)}
      </div>
      <div className="gc"><div className="st" style={{marginBottom:"1rem"}}>Profit Allocation Pie</div>
        <ResponsiveContainer width="100%" height={200}><PieChart><Pie data={allocPie} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={3} dataKey="value">{allocPie.map((_,i)=><Cell key={i} fill={[...PROFIT_ALLOC.map(a=>a.color),"#FF6B00"][i]}/>)}</Pie><Tooltip formatter={v=>GHS(v)} contentStyle={{background:"rgba(18,6,0,.9)",border:"1px solid rgba(255,107,0,.3)",borderRadius:8,fontSize:".74rem"}}/><Legend iconType="circle" wrapperStyle={{fontSize:".65rem",color:"rgba(255,255,255,.65)"}}/></PieChart></ResponsiveContainer>
      </div>
    </div>
    <div className="gc"><div className="st" style={{marginBottom:"1rem"}}>Designer Pay — {MONTHS[month]} 2025</div>
      <div className="tw"><table>
        <thead><tr><th>Rank</th><th>Designer</th><th>Tier</th><th>Items</th><th>Gross Pay</th><th>Savings</th><th>Net Pay</th></tr></thead>
        <tbody>{designers.map(d=>{const recs=workRecs.filter(r=>r.designerId===d.id);return{...d,items:recs.reduce((s,r)=>s+r.items,0),gross:recs.reduce((s,r)=>s+(r.gross||r.total),0),savings:recs.reduce((s,r)=>s+(r.savings||WEEKLY_SAVINGS),0),net:recs.reduce((s,r)=>s+(r.net||r.total),0)};}).sort((a,b)=>b.items-a.items).map((d,i)=><tr key={d.id}>
          <td style={{color:i===0?"#FFD700":i===1?"#C0C0C0":i===2?"#CD7F32":"var(--ts)",fontWeight:700}}>{["🥇","🥈","🥉"][i]||`#${i+1}`}</td>
          <td style={{fontWeight:600}}>{d.name}</td>
          <td><span className={`b ${RATINGS[d.rating||"Silver"].badge}`}>{d.piecePct||40}%</span></td>
          <td style={{fontFamily:"var(--mono)",color:"var(--ol)",fontWeight:700}}>{d.items} pcs</td>
          <td style={{fontFamily:"var(--mono)",color:"var(--ts)"}}>{GHS(d.gross)}</td>
          <td style={{fontFamily:"var(--mono)",color:"var(--ok)"}}>{GHS(d.savings)}</td>
          <td style={{fontFamily:"var(--mono)",color:"var(--ol)",fontWeight:700}}>{GHS(d.net)}</td>
        </tr>)}
        </tbody>
      </table></div>
    </div>
    <div style={{textAlign:"center",padding:"1rem",fontSize:".66rem",color:"var(--tm)",borderTop:"1px solid var(--gb)"}}>
      Generated by Demak Fashion Industry Management System · CEO Report · {new Date().toLocaleDateString()}
    </div>
  </div>;
}

// ─── CUSTOMERS CRM ───────────────────────────────────────────────────────────
function Customers({customers,setCustomers,sales,t$}){
  const [tab,setTab]=useState("list");
  const [show,setShow]=useState(false);
  const [edit,setEdit]=useState(null);
  const [search,setSearch]=useState("");
  const [selCust,setSelCust]=useState(null);
  const [showMsg,setShowMsg]=useState(false);
  const [msgText,setMsgText]=useState("");
  const [selTmpl,setSelTmpl]=useState(0);
  const [f,setF]=useState({name:"",phone:"",email:"",birthday:"",location:"",gender:"Female",notes:""});

  const totalCustomers=customers.length;
  const totalSpent=customers.reduce((s,c)=>s+(c.totalSpent||0),0);
  const returning=customers.filter(c=>(c.visits||0)>1).length;
  const todayBirthdays=customers.filter(c=>{if(!c.birthday)return false;const b=new Date(c.birthday);const t=new Date();return b.getMonth()===t.getMonth()&&b.getDate()===t.getDate();});
  const monthBirthdays=customers.filter(c=>{if(!c.birthday)return false;return new Date(c.birthday).getMonth()===new Date().getMonth();});

  const openAdd=()=>{setEdit(null);setF({name:"",phone:"",email:"",birthday:"",location:"",gender:"Female",notes:""});setShow(true);};
  const openEdit=c=>{setEdit(c.id);setF({name:c.name,phone:c.phone,email:c.email||"",birthday:c.birthday||"",location:c.location||"",gender:c.gender||"Female",notes:c.notes||""});setShow(true);};
  const save=()=>{
    if(!f.name||!f.phone){t$("Name and phone required","⚠️");return;}
    if(edit)setCustomers(p=>p.map(c=>c.id===edit?{...c,...f}:c));
    else setCustomers(p=>[...p,{id:Date.now(),...f,joinDate:new Date().toISOString().split("T")[0],totalSpent:0,visits:0}]);
    t$(edit?"Customer updated":"Customer added","👤");setShow(false);
  };

  const buildMsg=(cust,tmplIdx,extraItems="recent purchase")=>{
    const t=THANK_YOU_TEMPLATES[tmplIdx];
    return t.body.replace(/{name}/g,cust.name).replace(/{items}/g,extraItems).replace(/{total}/g,GHS(cust.totalSpent||0));
  };

  const openMsg=(c)=>{
    setSelCust(c);
    const today=new Date();
    const bMonth=c.birthday?new Date(c.birthday).getMonth():null;
    const idx=c.visits<=1?3:bMonth===today.getMonth()?2:0;
    setSelTmpl(idx);
    setMsgText(buildMsg(c,idx));
    setShowMsg(true);
  };

  const filtered=customers.filter(c=>c.name.toLowerCase().includes(search.toLowerCase())||c.phone.includes(search)||c.location?.toLowerCase().includes(search.toLowerCase()));

  const spendTiers=customers.map(c=>({...c})).sort((a,b)=>(b.totalSpent||0)-(a.totalSpent||0));
  const tierLabel=spent=>spent>=1000?"👑 VIP":spent>=500?"🌟 Regular":spent>0?"🌱 New":"⬜ Inactive";
  const tierBadge=spent=>spent>=1000?"bgold":spent>=500?"bpurple":spent>0?"bok":"bsilver";

  const custSaleHistory=selCust?sales.filter(s=>s.customerId===selCust.id):[];

  return <div>
    {/* Stats */}
    <div className="sg">
      {[["👥","Total Customers",totalCustomers,"var(--ol)"],["💰","Total Customer Spend",GHS(totalSpent),"var(--ok)"],["🔄","Returning Customers",returning,"var(--ok)"],["🎂","Birthdays This Month",monthBirthdays.length,"#f472b6"]].map(([icon,label,val,color],i)=><div key={i} className="sc">
        <div className="sic">{icon}</div><div className="sl">{label}</div>
        <div style={{fontFamily:"var(--mono)",fontSize:"1rem",fontWeight:700,color,marginTop:4}}>{val}</div>
      </div>)}
    </div>

    {/* Birthday alert */}
    {todayBirthdays.length>0&&<div style={{background:"rgba(244,114,182,.08)",border:"1px solid rgba(244,114,182,.3)",borderRadius:14,padding:"1rem 1.2rem",marginBottom:"1rem",display:"flex",alignItems:"center",gap:12}}>
      <div style={{fontSize:"1.8rem"}}>🎂</div>
      <div>
        <div style={{fontWeight:700,color:"#f472b6",fontSize:".85rem"}}>Happy Birthday Today!</div>
        <div style={{fontSize:".76rem",color:"var(--ts)",marginTop:3}}>{todayBirthdays.map(c=>c.name).join(", ")} {todayBirthdays.length===1?"has":"have"} a birthday today. Send them a special message!</div>
      </div>
      {todayBirthdays.length===1&&<button className="btn bo" style={{marginLeft:"auto",background:"linear-gradient(135deg,#ec4899,#be185d)"}} onClick={()=>openMsg(todayBirthdays[0])}>🎉 Send Birthday Wish</button>}
    </div>}

    <div className="tabs">
      <button className={`tab ${tab==="list"?"act":""}`}      onClick={()=>setTab("list")}>👥 All Customers</button>
      <button className={`tab ${tab==="vip"?"act":""}`}       onClick={()=>setTab("vip")}>👑 VIP & Tiers</button>
      <button className={`tab ${tab==="birthdays"?"act":""}`} onClick={()=>setTab("birthdays")}>🎂 Birthdays</button>
      <button className={`tab ${tab==="messages"?"act":""}`}  onClick={()=>setTab("messages")}>💌 Send Messages</button>
    </div>

    {/* ALL CUSTOMERS TAB */}
    {tab==="list"&&<>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem",gap:8,flexWrap:"wrap"}}>
        <input className="inp" placeholder="🔍 Search by name, phone, or city..." value={search} onChange={e=>setSearch(e.target.value)} style={{flex:1,minWidth:200}}/>
        <button className="btn bo" onClick={openAdd}>+ Add Customer</button>
      </div>
      <div className="tw"><table>
        <thead><tr><th>Customer</th><th>Phone</th><th>Location</th><th>Birthday</th><th>Visits</th><th>Total Spent</th><th>Tier</th><th>Actions</th></tr></thead>
        <tbody>{filtered.map(c=><tr key={c.id}>
          <td>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:30,height:30,borderRadius:8,background:"linear-gradient(135deg,#3b82f6,#1d4ed8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:".62rem",fontWeight:700,color:"#fff",flexShrink:0}}>{c.name.split(" ").map(n=>n[0]).join("")}</div>
              <div><div style={{fontWeight:600,fontSize:".8rem"}}>{c.name}</div><div style={{fontSize:".62rem",color:"var(--tm)"}}>{c.email||"No email"}</div></div>
            </div>
          </td>
          <td style={{fontFamily:"var(--mono)",fontSize:".74rem"}}>{c.phone}</td>
          <td style={{fontSize:".76rem"}}>{c.location||"—"}</td>
          <td style={{fontFamily:"var(--mono)",fontSize:".72rem",color:c.birthday&&new Date(c.birthday).getMonth()===new Date().getMonth()?"#f472b6":"var(--ts)"}}>
            {c.birthday?new Date(c.birthday).toLocaleDateString("en-GH",{day:"numeric",month:"short"}):"—"}
            {c.birthday&&new Date(c.birthday).getMonth()===new Date().getMonth()&&" 🎂"}
          </td>
          <td style={{fontFamily:"var(--mono)",textAlign:"center"}}>{c.visits||0}</td>
          <td style={{fontFamily:"var(--mono)",color:"var(--ol)",fontWeight:700}}>{GHS(c.totalSpent||0)}</td>
          <td><span className={`b ${tierBadge(c.totalSpent||0)}`}>{tierLabel(c.totalSpent||0)}</span></td>
          <td><div style={{display:"flex",gap:4}}>
            <button className="btn btn-sm bg2x" title="Send message" onClick={()=>openMsg(c)}>💌</button>
            <button className="btn btn-sm bg2x" onClick={()=>openEdit(c)}>✏️</button>
            <button className="btn btn-sm bd" onClick={()=>{setCustomers(p=>p.filter(x=>x.id!==c.id));t$("Removed","🗑️");}}>🗑️</button>
          </div></td>
        </tr>)}
        </tbody>
      </table></div>
    </>}

    {/* VIP TIERS TAB */}
    {tab==="vip"&&<div>
      {[{label:"👑 VIP Customers",min:1000,color:"#FFD700",bg:"rgba(255,215,0,.08)",border:"rgba(255,215,0,.25)"},
        {label:"🌟 Regular Customers",min:500,max:999,color:"#c084fc",bg:"rgba(168,85,247,.08)",border:"rgba(168,85,247,.25)"},
        {label:"🌱 New Customers",min:1,max:499,color:"var(--ok)",bg:"rgba(34,197,94,.07)",border:"rgba(34,197,94,.22)"},
        {label:"⬜ Inactive (No Purchases)",min:0,max:0,color:"var(--tm)",bg:"rgba(255,255,255,.04)",border:"var(--gb)"}
      ].map(tier=>{
        const list=spendTiers.filter(c=>tier.max===0?(c.totalSpent||0)===0:tier.max?(c.totalSpent||0)>=tier.min&&(c.totalSpent||0)<=tier.max:(c.totalSpent||0)>=tier.min);
        if(!list.length)return null;
        return <div key={tier.label} style={{background:tier.bg,border:`1px solid ${tier.border}`,borderRadius:14,padding:"1.2rem",marginBottom:"1rem"}}>
          <div style={{fontWeight:700,color:tier.color,marginBottom:"1rem"}}>{tier.label} ({list.length})</div>
          <div className="g3">
            {list.map(c=><div key={c.id} style={{background:"rgba(255,255,255,.05)",borderRadius:10,padding:".9rem"}}>
              <div style={{fontWeight:700,fontSize:".82rem",marginBottom:3}}>{c.name}</div>
              <div style={{fontSize:".68rem",color:"var(--tm)",marginBottom:8}}>{c.phone}</div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:".74rem"}}>
                <span style={{color:"var(--tm)"}}>Spent</span>
                <span style={{fontFamily:"var(--mono)",color:tier.color,fontWeight:700}}>{GHS(c.totalSpent||0)}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:".74rem",marginTop:4}}>
                <span style={{color:"var(--tm)"}}>Visits</span>
                <span style={{fontFamily:"var(--mono)"}}>{c.visits||0}×</span>
              </div>
              <button className="btn bo btn-sm" style={{width:"100%",marginTop:8}} onClick={()=>openMsg(c)}>💌 Message</button>
            </div>)}
          </div>
        </div>;
      })}
    </div>}

    {/* BIRTHDAYS TAB */}
    {tab==="birthdays"&&<div>
      <div style={{marginBottom:"1rem",display:"flex",gap:"1rem",flexWrap:"wrap"}}>
        <div className="sc" style={{flex:1,padding:".9rem 1.2rem"}}><div className="sl">Today's Birthdays</div><div style={{fontFamily:"var(--mono)",color:"#f472b6",fontWeight:700,fontSize:"1.1rem"}}>{todayBirthdays.length}</div></div>
        <div className="sc" style={{flex:1,padding:".9rem 1.2rem"}}><div className="sl">This Month</div><div style={{fontFamily:"var(--mono)",color:"#f472b6",fontWeight:700,fontSize:"1.1rem"}}>{monthBirthdays.length}</div></div>
      </div>
      <div className="gc" style={{marginBottom:"1rem"}}>
        <div className="st" style={{marginBottom:"1rem"}}>All Customer Birthdays</div>
        <div className="tw"><table>
          <thead><tr><th>Customer</th><th>Birthday</th><th>Age (approx)</th><th>Month</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>{customers.filter(c=>c.birthday).sort((a,b)=>{const am=new Date(a.birthday).getMonth(),bm=new Date(b.birthday).getMonth(),ad=new Date(a.birthday).getDate(),bd=new Date(b.birthday).getDate();return am-bm||ad-bd;}).map(c=>{
            const bd=new Date(c.birthday);const today=new Date();
            const isToday=bd.getMonth()===today.getMonth()&&bd.getDate()===today.getDate();
            const isMonth=bd.getMonth()===today.getMonth();
            const age=today.getFullYear()-bd.getFullYear();
            return<tr key={c.id}>
              <td style={{fontWeight:600}}>{c.name}</td>
              <td style={{fontFamily:"var(--mono)",color:isToday?"#f472b6":"var(--ts)"}}>{bd.toLocaleDateString("en-GH",{day:"numeric",month:"long"})}</td>
              <td style={{fontFamily:"var(--mono)"}}>{age} yrs</td>
              <td>{MONTHS[bd.getMonth()]}</td>
              <td>{isToday?<span className="b bpink">🎂 Today!</span>:isMonth?<span className="b bpurple">🎉 This Month</span>:<span className="b bsilver">Upcoming</span>}</td>
              <td><button className="btn btn-sm bo" style={{background:"linear-gradient(135deg,#ec4899,#be185d)"}} onClick={()=>openMsg(c)}>🎂 Send Wish</button></td>
            </tr>;
          })}
          </tbody>
        </table></div>
      </div>
    </div>}

    {/* MESSAGES TAB */}
    {tab==="messages"&&<div>
      <div className="gc" style={{marginBottom:"1rem"}}>
        <div className="st" style={{marginBottom:".5rem"}}>💌 Bulk Message Templates</div>
        <div className="ss2" style={{marginBottom:"1.2rem"}}>Select a customer below and send a personalised message via WhatsApp or copy it</div>
        {customers.map(c=><div key={c.id} style={{display:"flex",alignItems:"center",gap:12,padding:".75rem",background:"rgba(255,255,255,.05)",borderRadius:10,marginBottom:8}}>
          <div style={{width:36,height:36,borderRadius:9,background:"linear-gradient(135deg,#3b82f6,#1d4ed8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:".68rem",fontWeight:700,color:"#fff",flexShrink:0}}>{c.name.split(" ").map(n=>n[0]).join("")}</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:600,fontSize:".8rem"}}>{c.name}</div>
            <div style={{fontSize:".65rem",color:"var(--tm)"}}>{c.phone} · {tierLabel(c.totalSpent||0)}</div>
          </div>
          <button className="btn btn-sm bo" onClick={()=>openMsg(c)}>💌 Message</button>
        </div>)}
      </div>
    </div>}

    {/* Add/Edit modal */}
    {show&&<div className="mo"><div className="md">
      <div className="mt">{edit?"Edit":"Add"} Customer<button className="mx" onClick={()=>setShow(false)}>✕</button></div>
      {[["name","Full Name *","text"],["phone","Phone Number *","text"],["email","Email Address","email"],["birthday","Birthday","date"],["location","City / Location","text"]].map(([k,lbl,t])=><div className="ig" key={k}><label className="lbl">{lbl}</label><input className="inp" type={t} value={f[k]} onChange={e=>setF(p=>({...p,[k]:e.target.value}))}/></div>)}
      <div className="ig"><label className="lbl">Gender</label><select className="sel" value={f.gender} onChange={e=>setF(p=>({...p,gender:e.target.value}))}><option>Female</option><option>Male</option><option>Other</option></select></div>
      <div className="ig"><label className="lbl">Notes</label><input className="inp" placeholder="e.g. Loves Ankara, VIP referral..." value={f.notes} onChange={e=>setF(p=>({...p,notes:e.target.value}))}/></div>
      <div style={{display:"flex",gap:8}}><button className="btn bg2x" onClick={()=>setShow(false)} style={{flex:1}}>Cancel</button><button className="btn bo" onClick={save} style={{flex:1}}>Save</button></div>
    </div></div>}

    {/* Message sender modal */}
    {showMsg&&selCust&&<div className="mo"><div className="md">
      <div className="mt">💌 Message — {selCust.name}<button className="mx" onClick={()=>setShowMsg(false)}>✕</button></div>
      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:"1rem",padding:".75rem",background:"rgba(255,255,255,.05)",borderRadius:10}}>
        <div style={{width:36,height:36,borderRadius:9,background:"linear-gradient(135deg,#3b82f6,#1d4ed8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:".7rem",fontWeight:700,color:"#fff"}}>{selCust.name.split(" ").map(n=>n[0]).join("")}</div>
        <div><div style={{fontWeight:600,fontSize:".82rem"}}>{selCust.name}</div><div style={{fontSize:".68rem",color:"var(--tm)"}}>{selCust.phone} · {tierLabel(selCust.totalSpent||0)}</div></div>
      </div>
      <div className="ig"><label className="lbl">Template</label>
        <select className="sel" value={selTmpl} onChange={e=>{const i=+e.target.value;setSelTmpl(i);setMsgText(buildMsg(selCust,i));}}>
          {THANK_YOU_TEMPLATES.map((t,i)=><option key={i} value={i}>{t.name}</option>)}
        </select>
      </div>
      <div className="ig"><label className="lbl">Edit Message</label>
        <textarea className="inp" rows={6} style={{resize:"vertical",lineHeight:1.6}} value={msgText} onChange={e=>setMsgText(e.target.value)}/>
      </div>
      {selCust.phone&&<div style={{background:"rgba(34,197,94,.07)",border:"1px solid rgba(34,197,94,.2)",borderRadius:10,padding:".75rem",marginBottom:"1rem",fontSize:".76rem"}}>
        📱 Sending to: <strong style={{color:"var(--ok)"}}>{selCust.phone}</strong>
      </div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
        <button className="btn bg2x" onClick={()=>{navigator.clipboard.writeText(msgText);t$("Copied!","📋");}}>📋 Copy</button>
        {selCust.phone&&<button className="btn bo" style={{background:"linear-gradient(135deg,#25D366,#128C7E)"}} onClick={()=>window.open(`https://wa.me/${selCust.phone.replace(/\D/g,"")}?text=${encodeURIComponent(msgText)}`,"_blank")}>💬 WhatsApp</button>}
      </div>
      {selCust.phone&&<button className="btn bg2x" style={{width:"100%",marginBottom:8}} onClick={()=>window.open(`sms:${selCust.phone}?body=${encodeURIComponent(msgText)}`)}>📲 SMS</button>}
      <button className="btn bg2x" style={{width:"100%"}} onClick={()=>setShowMsg(false)}>Close</button>
    </div></div>}
  </div>;
}


function Settings({t$}){
  const [co,setCo]=useState("DEMAK FASHION INDUSTRY");
  const [tax,setTax]=useState(12.5);
  const [notif,setNotif]=useState(true);

  return(
    <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>

      {/* Row 1 */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"1rem"}}>

        {/* Company */}
        <div className="gc">
          <div className="st" style={{marginBottom:"1.2rem"}}>Company Settings</div>
          <div className="ig">
            <label className="lbl">Company Name</label>
            <input className="inp" value={co} onChange={e=>setCo(e.target.value)}/>
          </div>
          <div className="ig">
            <label className="lbl">Tax Rate (%)</label>
            <input className="inp" type="number" value={tax} onChange={e=>setTax(e.target.value)}/>
          </div>
          <div className="ig">
            <label className="lbl">Company Logo</label>
            <div style={{fontSize:".72rem",color:"var(--tm)"}}>Click the logo icon in the top-left sidebar to upload your company logo image.</div>
          </div>
          <button className="btn bo" onClick={()=>t$("Settings saved!")}>Save Settings</button>
        </div>

        {/* Piece-Rate */}
        <div className="gc">
          <div className="st" style={{marginBottom:"1rem"}}>Piece-Rate System</div>
          <div style={{fontSize:".74rem",color:"var(--ts)",marginBottom:"1rem",padding:".75rem",background:"rgba(255,107,0,.08)",borderRadius:10,border:"1px solid rgba(255,107,0,.2)",lineHeight:1.8}}>
            Workers earn a percentage cut of each item's sewing price.<br/>
            <strong style={{color:"var(--ol)"}}>Example:</strong> Item = GHS 50, Worker on 40% = GHS 20 earned
          </div>
          {[
            {pct:40, label:"Standard Cut", example: (50*40/100)},
            {pct:34, label:"Mid Cut",      example: (50*34/100)},
            {pct:25, label:"Junior Cut",   example: (50*25/100)},
          ].map(row=>(
            <div key={row.pct} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span className={`b ${getPR(row.pct).badge}`}>{row.pct}%</span>
                <span style={{fontSize:".76rem",color:"var(--ts)"}}>{row.label}</span>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"var(--mono)",fontSize:".82rem",color:"var(--ol)",fontWeight:700}}>GHS 50 item = {GHS(row.example)}</div>
                <div style={{fontSize:".62rem",color:"var(--tm)"}}>worker earns {row.pct}% of sewing price</div>
              </div>
            </div>
          ))}
          <div style={{marginTop:"1rem",padding:".75rem",background:"rgba(34,197,94,.07)",borderRadius:10,border:"1px solid rgba(34,197,94,.2)",fontSize:".74rem",color:"var(--ts)"}}>
            Weekly savings deduction: <strong style={{color:"var(--ok)"}}>{GHS(WEEKLY_SAVINGS)} per designer per week</strong> — returned after 1 year
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"1rem"}}>

        {/* Profit Allocation */}
        <div className="gc">
          <div className="st" style={{marginBottom:"1rem"}}>Profit Allocation</div>
          {PROFIT_ALLOC.map(a=>(
            <div key={a.key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
              <div>
                <div style={{fontSize:".78rem",fontWeight:600,color:"var(--tp)"}}>{a.label}</div>
                <div style={{fontSize:".65rem",color:"var(--tm)",marginTop:2}}>{a.desc}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:40,height:4,background:"rgba(255,255,255,.08)",borderRadius:4,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${a.pct*2}%`,background:a.color,borderRadius:4}}/>
                </div>
                <span style={{fontFamily:"var(--mono)",color:a.color,fontWeight:700,minWidth:36}}>{a.pct}%</span>
              </div>
            </div>
          ))}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderTop:"2px solid rgba(255,107,0,.3)",marginTop:4}}>
            <div>
              <div style={{fontSize:".78rem",fontWeight:600}}>Salary & Operations</div>
              <div style={{fontSize:".65rem",color:"var(--tm)"}}>Staff salaries, utilities, running costs</div>
            </div>
            <span style={{fontFamily:"var(--mono)",color:"var(--ol)",fontWeight:700}}>65%</span>
          </div>
        </div>

        {/* Security */}
        <div className="gc">
          <div className="st" style={{marginBottom:"1.2rem"}}>Security</div>
          <div style={{padding:".75rem",background:"rgba(34,197,94,.08)",borderRadius:10,border:"1px solid rgba(34,197,94,.2)",marginBottom:"1rem"}}>
            <div style={{fontSize:".76rem",color:"var(--ok)",fontWeight:600}}>2-Factor Authentication Active</div>
            <div style={{fontSize:".68rem",color:"var(--tm)",marginTop:4}}>Username + Password + PIN required at login</div>
          </div>
          {[["Change Password","key"],["Change PIN","settings"],["Active Sessions","customers"]].map(([lbl,ic])=>(
            <button key={lbl} className="btn bg2x" style={{width:"100%",marginBottom:8,justifyContent:"flex-start",gap:10}}
              onClick={()=>t$(`${lbl} — contact IT admin`)}>
              <Icon name={ic} size={14}/> {lbl}
            </button>
          ))}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:".75rem 0",borderTop:"1px solid var(--gb)",marginTop:4}}>
            <div>
              <div style={{fontSize:".8rem",fontWeight:500}}>Push Notifications</div>
              <div style={{fontSize:".65rem",color:"var(--tm)"}}>Sales and expense alerts</div>
            </div>
            <div style={{width:44,height:24,borderRadius:12,background:notif?"var(--o)":"rgba(255,255,255,.1)",cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0}}
              onClick={()=>setNotif(v=>!v)}>
              <div style={{position:"absolute",top:3,left:notif?22:3,width:18,height:18,borderRadius:"50%",background:"white",transition:"left .2s"}}/>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone - full width */}
      <div className="gc" style={{borderColor:"rgba(239,68,68,.4)",background:"rgba(239,68,68,.05)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:"1rem"}}>
          <div style={{width:40,height:40,borderRadius:10,background:"rgba(239,68,68,.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <Icon name="trash" size={18} color="#f87171"/>
          </div>
          <div>
            <div style={{fontWeight:700,color:"#f87171",fontSize:".88rem"}}>Danger Zone</div>
            <div style={{fontSize:".68rem",color:"var(--tm)"}}>Irreversible — cannot be undone</div>
          </div>
        </div>
        <div style={{fontSize:".76rem",color:"var(--ts)",lineHeight:1.9,marginBottom:"1.2rem",padding:"1rem",background:"rgba(239,68,68,.07)",borderRadius:10,border:"1px solid rgba(239,68,68,.18)"}}>
          <strong style={{color:"#f87171"}}>Reset Entire System</strong> will permanently delete all records:
          <div style={{marginTop:6,paddingLeft:12}}>
            — All sales records and transactions<br/>
            — All expense records<br/>
            — All designer work records and savings<br/>
            — All customer data and contacts<br/>
            — All product changes<br/>
          </div>
          <div style={{marginTop:8,color:"var(--bad)",fontWeight:700}}>Use only when launching the system fresh for real use.</div>
        </div>
        <button className="btn bd"
          style={{width:"100%",padding:".85rem",fontSize:".84rem",fontWeight:700,letterSpacing:".5px"}}
          onClick={()=>{
            if(window.confirm("FINAL WARNING: This will DELETE ALL DATA permanently.\n\nAre you absolutely sure you want to reset?")){
              localStorage.clear();
              window.location.reload();
            }
          }}>
          Reset Entire System — Start Fresh
        </button>
        <div style={{textAlign:"center",fontSize:".65rem",color:"var(--tm)",marginTop:8}}>
          A confirmation dialog will appear before anything is deleted
        </div>
      </div>

    </div>
  );
}
