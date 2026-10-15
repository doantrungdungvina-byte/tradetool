"use client";

import { useMemo, useState } from "react";

const TABS = [
  { id: "stock", label: "🇻🇳 VN STOCK" },
  { id: "forex", label: "🌎 FX" },
  { id: "funds", label: "📈 CHỨNG CHỈ QUỸ" },
];

const FX_SYMBOLS = [
  ["XAUUSD", "Vàng thế giới (Twelve Data XAU/USD)"],
  ["BTCUSD", "Bitcoin"],
  ["EURUSD", "EUR/USD"],
  ["GBPUSD", "GBP/USD"],
  ["USDJPY", "USD/JPY"],
  ["AUDUSD", "AUD/USD"],
  ["USDCAD", "USD/CAD"],
  ["USDCHF", "USD/CHF"],
  ["NZDUSD", "NZD/USD"],
];

const FUNDS = [
  ["E1VFVN30", "E1VFVN30 — ETF VN30"],
  ["FUEVFVND", "FUEVFVND — ETF Diamond"],
  ["FUESSV50", "FUESSV50 — ETF VNX50"],
  ["FUESSVFL", "FUESSVFL — ETF VNFinLead"],
  ["FUEMAV30", "FUEMAV30 — ETF VN30"],
  ["FUEKIV30", "FUEKIV30 — ETF VN30"],
  ["BVFED", "BVFED — Bảo Việt"],
  ["BMFF", "BMFF"],
  ["DCDS", "DCDS — DC Dynamic Securities"],
  ["DCDE", "DCDE"],
  ["DFVN-CAF", "DFVN-CAF"],
  ["EVESG", "EVESG"],
  ["MAGEF", "MAGEF"],
  ["MBVF", "MBVF"],
  ["PHVSF", "PHVSF"],
  ["SSISCA", "SSISCA — SSI Sustainable Competitive Advantage"],
  ["TBLF", "TBLF"],
  ["VDEF", "VDEF"],
  ["VESAF", "VESAF"],
  ["VEOF", "VEOF"],
  ["VFF", "VFF"],
  ["VIBF", "VIBF"],
  ["VLGF", "VLGF"],
  ["VNDAF", "VNDAF"],
  ["VNDBF", "VNDBF"],
  ["UVEEF", "UVEEF"],
  ["VCBF-AIF", "VCBF-AIF"],
  ["VCBF-BCF", "VCBF-BCF"],
  ["VCBF-FIF", "VCBF-FIF"],
  ["VCBF-MGF", "VCBF-MGF"],
  ["VCBF-TBF", "VCBF-TBF"],
  ["VCAMDF", "VCAMDF"],
  ["MAGEQI", "MAGEQI"],
  ["KDEF", "KDEF"],
  ["GDEGF", "GDEGF"],
  ["NTPPF", "NTPPF"],
  ["RVPIF", "RVPIF"],
  ["TCGF", "TCGF"],
  ["SSI-PDF", "SSI-PDF"],
  ["AEIF", "AEIF"],
  ["LPLF", "LPLF"],
  ["ABEF", "ABEF"],
  ["DCAF", "DCAF"],
  ["VFF", "VFF"],
];

const fmt = (n, digits = 2) =>
  n == null || !Number.isFinite(Number(n))
    ? "—"
    : Number(n).toLocaleString("vi-VN", { maximumFractionDigits: digits, minimumFractionDigits: digits });

function Metric({ label, value, sub, positive }) {
  return (
    <div className="metric">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value ?? "—"}</div>
      {sub && <div className={`metric-sub ${positive === true ? "up" : positive === false ? "down" : ""}`}>{sub}</div>}
    </div>
  );
}

function PriceChart({ data }) {
  if (!data?.length) return null;
  const values = data.map((d) => d.close).filter(Number.isFinite);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values.map((v, i) => {
    const x = 8 + (i / Math.max(values.length - 1, 1)) * 584;
    const y = 188 - ((v - min) / range) * 168;
    return `${x},${y}`;
  }).join(" ");
  return (
    <div className="chart-wrap">
      <svg viewBox="0 0 600 205" role="img" aria-label="Biểu đồ giá lịch sử">
        <line x1="8" y1="20" x2="592" y2="20" className="gridline" />
        <line x1="8" y1="103" x2="592" y2="103" className="gridline" />
        <line x1="8" y1="188" x2="592" y2="188" className="gridline" />
        <polyline points={points} className="price-line" />
        <text x="8" y="13" className="axis-label">{fmt(max)}</text>
        <text x="8" y="201" className="axis-label">{fmt(min)}</text>
      </svg>
      <div className="chart-foot"><span>{data[0]?.date}</span><span>{data[data.length - 1]?.date}</span></div>
    </div>
  );
}

export default function Home() {
  const [tab, setTab] = useState("stock");
  const [symbol, setSymbol] = useState("FPT");
  const [fxSymbol, setFxSymbol] = useState("XAUUSD");
  const [xauInterval, setXauInterval] = useState("5min");
  const [capital, setCapital] = useState("50000000");
  const [fundSymbol, setFundSymbol] = useState("EVESG");
  const [marketData, setMarketData] = useState(null);
  const [fxData, setFxData] = useState(null);
  const [fundData, setFundData] = useState(null);
  const [stockVolumeData, setStockVolumeData] = useState(null);
  const [stockVolumeRange, setStockVolumeRange] = useState("3mo");
  const [volumeLoading, setVolumeLoading] = useState(false);
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  async function loadMarket(kind) {
    const currentSymbol = kind === "forex" ? fxSymbol : symbol.trim().toUpperCase();
