"use client";

import { useMemo, useState } from "react";
import DonationSupport from "./components/DonationSupport";

const TABS = [
  { id: "stock", label: "VN STOCK" },
  { id: "forex", label: "🌎 FX" },
  { id: "funds", label: "📈 CHỨNG CHỈ QUỸ" },
  { id: "dca", label: "🧮 DCA" },
  { id: "compound", label: "📈 LÃI KÉP" },
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
  ["E1VFVN30", "Quỹ ETF DCVFMVN30 — ETF chỉ số VN30"],
  ["FUEVFVND", "Quỹ ETF DCVFMVN Diamond — ETF VN Diamond"],
  ["FUESSV50", "Quỹ ETF SSIAM VNX50 — ETF VNX50"],
  ["FUESSVFL", "Quỹ ETF SSIAM VNFIN Lead — ETF ngành tài chính"],
  ["FUEMAV30", "Quỹ ETF MAFM VN30 — ETF chỉ số VN30"],
  ["FUEKIV30", "Quỹ ETF KIM Growth VN30 — ETF chỉ số VN30"],
  ["BVFED", "Quỹ Đầu tư Cổ phiếu Năng động Bảo Việt — Quỹ mở"],
  ["BMFF", "BMFF — Tên quỹ cần xác minh từ đơn vị quản lý"],
  ["DCDS", "Quỹ Đầu tư Chứng khoán Năng động DC — Quỹ mở"],
  ["DCDE", "DCDE — Tên quỹ cần xác minh từ đơn vị quản lý"],
  ["DFVN-CAF", "DFVN-CAF — Tên quỹ cần xác minh từ đơn vị quản lý"],
  ["EVESG", "Quỹ Đầu tư Cổ phiếu ESG Eastspring Investments Việt Nam — Quỹ mở"],
  ["MAGEF", "MAGEF — Tên quỹ cần xác minh từ đơn vị quản lý"],
  ["MBVF", "MBVF — Tên quỹ cần xác minh từ đơn vị quản lý"],
  ["PHVSF", "PHVSF — Tên quỹ cần xác minh từ đơn vị quản lý"],
  ["SSISCA", "Quỹ Đầu tư Lợi thế Cạnh tranh Bền vững SSI — Quỹ mở"],
  ["TBLF", "TBLF — Tên quỹ cần xác minh từ đơn vị quản lý"],
  ["VDEF", "VDEF — Tên quỹ cần xác minh từ đơn vị quản lý"],
  ["VESAF", "Quỹ Đầu tư Cổ phiếu Tiếp cận Thị trường VinaCapital — Quỹ mở"],
  ["VEOF", "Quỹ Đầu tư Cổ phiếu Hưng Thịnh VinaCapital — Quỹ mở"],
  ["VFF", "Quỹ Đầu tư Trái phiếu Bảo Thịnh VinaCapital — Quỹ mở"],
  ["VIBF", "Quỹ Đầu tư Cân bằng Tuệ Sáng VinaCapital — Quỹ mở"],
  ["VLGF", "Quỹ Đầu tư Tăng trưởng Dài hạn Việt Nam — Quỹ mở"],
  ["VNDAF", "VNDAF — Tên quỹ cần xác minh từ đơn vị quản lý"],
  ["VNDBF", "VNDBF — Tên quỹ cần xác minh từ đơn vị quản lý"],
  ["UVEEF", "Quỹ Đầu tư Cổ phiếu United ESG — Quỹ mở"],
  ["VCBF-AIF", "Quỹ Đầu tư Thu nhập Chủ động VCBF — Quỹ mở"],
  ["VCBF-BCF", "Quỹ Đầu tư Cổ phiếu Hàng đầu VCBF — Quỹ mở"],
  ["VCBF-FIF", "Quỹ Đầu tư Trái phiếu VCBF — Quỹ mở"],
  ["VCBF-MGF", "Quỹ Đầu tư Cổ phiếu Tăng trưởng VCBF — Quỹ mở"],
  ["VCBF-TBF", "Quỹ Đầu tư Cân bằng Chiến lược VCBF — Quỹ mở"],
  ["VCAMDF", "VCAMDF — Tên quỹ cần xác minh từ đơn vị quản lý"],
  ["MAGEQI", "MAGEQI — Tên quỹ cần xác minh từ đơn vị quản lý"],
  ["KDEF", "KDEF — Tên quỹ cần xác minh từ đơn vị quản lý"],
  ["GDEGF", "GDEGF — Tên quỹ cần xác minh từ đơn vị quản lý"],
  ["NTPPF", "NTPPF — Tên quỹ cần xác minh từ đơn vị quản lý"],
  ["RVPIF", "RVPIF — Tên quỹ cần xác minh từ đơn vị quản lý"],
  ["TCGF", "TCGF — Tên quỹ cần xác minh từ đơn vị quản lý"],
  ["SSI-PDF", "SSI-PDF — Tên quỹ cần xác minh từ đơn vị quản lý"],
  ["AEIF", "AEIF — Tên quỹ cần xác minh từ đơn vị quản lý"],
  ["LPLF", "LPLF — Tên quỹ cần xác minh từ đơn vị quản lý"],
  ["ABEF", "ABEF — Tên quỹ cần xác minh từ đơn vị quản lý"],
  ["DCAF", "DCAF — Tên quỹ cần xác minh từ đơn vị quản lý"],
];

const formatMoneyInput = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits ? Number(digits).toLocaleString("vi-VN") : "";
};
const parseMoneyInput = (value) => String(value ?? "").replace(/\D/g, "");

const fmt = (n, digits = 2) =>
  n == null || !Number.isFinite(Number(n))
    ? "—"
    : Number(n).toLocaleString("vi-VN", { maximumFractionDigits: digits, minimumFractionDigits: 0 });

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

function ShareApp() {
  const [copied, setCopied] = useState(false);
  const appUrl = "https://tradetool-delta.vercel.app";
  const shareText = "Trading Tools — công cụ theo dõi thị trường, phân tích kỹ thuật, DCA và tính lãi kép.";
  const zaloUrl = `https://zalo.me/share?url=${encodeURIComponent(appUrl)}&title=${encodeURIComponent(shareText)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}`;
  async function copyLink() {
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(appUrl);
      else {
        const field = document.createElement("textarea");
        field.value = appUrl; field.style.position = "fixed"; field.style.opacity = "0";
        document.body.appendChild(field); field.select();
        const ok = document.execCommand("copy"); document.body.removeChild(field);
        if (!ok) throw new Error("copy failed");
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt("Sao chép liên kết ứng dụng:", appUrl);
    }
  }
  return (
    <section className="share-app" aria-label="Chia sẻ ứng dụng">
      <div className="share-app-copy">
        <span className="share-app-icon" aria-hidden="true">↗</span>
        <div><h3>Chia sẻ Trading Tools</h3><p>Gửi ứng dụng cho bạn bè qua Zalo hoặc Facebook.</p></div>
      </div>
      <div className="share-app-actions">
        <button type="button" className="share-btn share-copy" onClick={copyLink}>{copied ? "✓ Đã sao chép link" : "🔗 Sao chép link"}</button>
        <a className="share-btn share-zalo" href={zaloUrl} target="_blank" rel="noopener noreferrer">Zalo ↗</a>
        <a className="share-btn share-facebook" href={facebookUrl} target="_blank" rel="noopener noreferrer">f Facebook ↗</a>
        <button type="button" className="share-btn share-native" onClick={async () => {
          if (navigator.share) { try { await navigator.share({ title: "Trading Tools", text: shareText, url: appUrl }); } catch {} }
          else await copyLink();
        }}>↗ Chia sẻ</button>
      </div>
    </section>
  );
}

export default function Home() {
  const [tab, setTab] = useState("stock");
  const [symbol, setSymbol] = useState("FPT");
  const [fxSymbol, setFxSymbol] = useState("XAUUSD");
  const [xauInterval, setXauInterval] = useState("5min");
  const [capital, setCapital] = useState("50000000");
  const [fundSymbol, setFundSymbol] = useState("EVESG");
  const [fundMenuOpen, setFundMenuOpen] = useState(false);
  const [marketData, setMarketData] = useState(null);
  const [fxData, setFxData] = useState(null);
  const [fundData, setFundData] = useState(null);
  const [stockVolumeData, setStockVolumeData] = useState(null);
  const [technicalData, setTechnicalData] = useState(null);
  const [technicalExchange, setTechnicalExchange] = useState("HNX");
  const [technicalLoading, setTechnicalLoading] = useState(false);
  const [stockVolumeRange, setStockVolumeRange] = useState("3mo");
  const [volumeLoading, setVolumeLoading] = useState(false);
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");
  const [dcaAsset, setDcaAsset] = useState("FPT");
  const [dcaCurrency, setDcaCurrency] = useState("VND");
  const [dcaCurrentPrice, setDcaCurrentPrice] = useState("");
  const [dcaTargetPrice, setDcaTargetPrice] = useState("");
  const [dcaPriceLoading, setDcaPriceLoading] = useState(false);
  const [dcaPriceUpdatedAt, setDcaPriceUpdatedAt] = useState("");
  const [dcaPriceSource, setDcaPriceSource] = useState("");
  const [dcaRowsInput, setDcaRowsInput] = useState([{ id: 1, date: new Date().toISOString().slice(0, 10), quantity: "", price: "" }]);
  const [nextDcaId, setNextDcaId] = useState(2);
  const [compoundInitial, setCompoundInitial] = useState("50000000");
  const [compoundContribution, setCompoundContribution] = useState("5000000");
  const [compoundFrequency, setCompoundFrequency] = useState("monthly");
  const [compoundReturn, setCompoundReturn] = useState("10");
  const [compoundYears, setCompoundYears] = useState("20");
  const [compoundMonthlyGoal, setCompoundMonthlyGoal] = useState("20000000");

  async function loadMarket(kind) {
    const currentSymbol = kind === "forex" ? fxSymbol : symbol.trim().toUpperCase();
    setLoading(kind);
    setError("");
    try {
      const endpoint = kind === "forex" && currentSymbol === "XAUUSD"
        ? `/api/xauusd?interval=${encodeURIComponent(xauInterval)}`
        : `/api/market?symbol=${encodeURIComponent(currentSymbol)}&kind=${kind}`;
      const res = await fetch(endpoint, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Không tải được dữ liệu thị trường.");
      if (kind === "forex") setFxData(json);
      else setMarketData(json);
    } catch (e) {
      setError(e.message || "Lỗi tải dữ liệu.");
    } finally {
      setLoading("");
    }
  }

  async function loadStockTechnical() {
    const stockCode = symbol.trim().toUpperCase();
    if (!/^[A-Z0-9.]{2,12}$/.test(stockCode)) {
      setError("Vui lòng nhập mã cổ phiếu hợp lệ.");
      return;
    }
    setTechnicalLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/stock-technical?symbol=${encodeURIComponent(stockCode)}&exchange=${encodeURIComponent(technicalExchange)}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json.item) throw new Error(json.error || "Không tải được thống kê kỹ thuật.");
      setTechnicalData(json.item);
      setTechnicalExchange(json.item.exchange || technicalExchange);
    } catch (e) {
      setError(e.message || "Không tải được thống kê kỹ thuật từ TradingView.");
    } finally {
      setTechnicalLoading(false);
    }
  }

  async function loadAllStockData() {
    const stockCode = symbol.trim().toUpperCase();
    if (!/^[A-Z0-9.]{2,12}$/.test(stockCode)) {
      setError("Vui lòng nhập mã cổ phiếu hợp lệ.");
      return;
    }
    setLoading("stock");
    setTechnicalLoading(true);
    setVolumeLoading(true);
    setError("");
    setMarketData(null);
    setTechnicalData(null);
    setStockVolumeData(null);
    const requests = await Promise.allSettled([
      fetch(`/api/market?symbol=${encodeURIComponent(stockCode)}&kind=stock`, { cache: "no-store" }).then(async r => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || "Không tải được dữ liệu thị trường.");
        return j;
      }),
      fetch(`/api/stock-technical?symbol=${encodeURIComponent(stockCode)}&exchange=${encodeURIComponent(technicalExchange)}`, { cache: "no-store" }).then(async r => {
        const j = await r.json();
        if (!r.ok || !j.item) throw new Error(j.error || "Không tải được thống kê kỹ thuật.");
        return j.item;
      }),
      fetch(`/api/stock-volume?symbol=${encodeURIComponent(stockCode)}&range=${encodeURIComponent(stockVolumeRange)}`, { cache: "no-store" }).then(async r => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || "Không tải được thống kê khối lượng.");
        return j;
      })
    ]);
    if (requests[0].status === "fulfilled") setMarketData(requests[0].value);
    if (requests[1].status === "fulfilled") {
      setTechnicalData(requests[1].value);
      setTechnicalExchange(requests[1].value.exchange || technicalExchange);
    }
    if (requests[2].status === "fulfilled") setStockVolumeData(requests[2].value);
    const errors = requests.filter(r => r.status === "rejected").map(r => r.reason?.message || "Lỗi tải dữ liệu.");
    if (errors.length === 3) setError(errors.join(" · "));
    else if (errors.length) setError(`Đã tải được một phần dữ liệu. ${errors.join(" · ")}`);
    setLoading("");
    setTechnicalLoading(false);
    setVolumeLoading(false);
  }

  async function loadStockVolume() {
    const stockCode = symbol.trim().toUpperCase();
    if (!/^[A-Z0-9]{2,12}$/.test(stockCode)) {
      setError("Vui lòng nhập mã cổ phiếu hợp lệ.");
      return;
    }
    setVolumeLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/stock-volume?symbol=${encodeURIComponent(stockCode)}&range=${encodeURIComponent(stockVolumeRange)}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Không tải được thống kê khối lượng.");
      setStockVolumeData(json);
    } catch (e) {
      setError(e.message || "Không tải được thống kê khối lượng.");
    } finally {
      setVolumeLoading(false);
    }
  }

  async function loadDcaLatestPrice() {
    const asset = dcaAsset.trim().toUpperCase();
    if (!asset) {
      setError("Vui lòng nhập mã tài sản trước khi cập nhật giá.");
      return;
    }
    setDcaPriceLoading(true);
    setError("");
    try {
      const isGold = asset === "XAUUSD";
      const isForexOrCrypto = ["BTCUSD", "EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "USDCHF", "NZDUSD"].includes(asset);
      const endpoint = isGold
        ? `/api/xauusd?interval=${encodeURIComponent(xauInterval)}`
        : `/api/market?symbol=${encodeURIComponent(asset)}&kind=${isForexOrCrypto ? "forex" : "stock"}`;
      const res = await fetch(endpoint, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Không lấy được giá mới nhất cho tài sản này.");
      const price = Number(json.price);
      if (!Number.isFinite(price) || price <= 0) throw new Error("Nguồn dữ liệu không trả về giá hợp lệ.");
      setDcaCurrentPrice(String(price));
      setDcaPriceUpdatedAt(json.updatedAt || new Date().toLocaleString("vi-VN"));
      setDcaPriceSource(json.source || (isGold ? "Twelve Data" : "Yahoo Finance"));
      setDcaCurrency(isForexOrCrypto || isGold ? "USD" : "VND");
    } catch (e) {
      setError(e.message || "Không thể cập nhật giá DCA.");
    } finally {
      setDcaPriceLoading(false);
    }
  }

  async function loadFund() {
    setLoading("fund");
    setError("");
    setFundData(null);
    try {
      const res = await fetch(`/api/funds/${encodeURIComponent(fundSymbol)}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Nguồn hiện không trả NAV cho mã này.");
      setFundData(json);
    } catch (e) {
      setError(e.message || "Không tải được NAV.");
    } finally {
      setLoading("");
    }
  }

  const change = marketData?.changePct;
  const fxChange = fxData?.changePct;
  const capitalNumber = Math.max(Number(capital) || 0, 0);
  const dcaRows = useMemo(() => {
    if (!marketData?.levels || !capitalNumber) return [];
    return marketData.levels.map((level, i) => ({
      ...level,
      allocation: capitalNumber / marketData.levels.length,
      shares: Math.floor((capitalNumber / marketData.levels.length) / level.price),
      order: i + 1,
    }));
  }, [marketData, capitalNumber]);

  const dcaValidRows = useMemo(() => dcaRowsInput.map((row) => ({
    ...row, quantity: Math.max(Number(row.quantity) || 0, 0), price: Math.max(Number(row.price) || 0, 0),
  })).filter((row) => row.quantity > 0 && row.price > 0), [dcaRowsInput]);
  const dcaTotalQuantity = dcaValidRows.reduce((sum, row) => sum + row.quantity, 0);
  const dcaTotalCost = dcaValidRows.reduce((sum, row) => sum + row.quantity * row.price, 0);
  const dcaAveragePrice = dcaTotalQuantity > 0 ? dcaTotalCost / dcaTotalQuantity : null;
  const dcaNowPrice = Number(dcaCurrentPrice) > 0 ? Number(dcaCurrentPrice) : null;
  const dcaMarketValue = dcaNowPrice != null ? dcaNowPrice * dcaTotalQuantity : null;
  const dcaProfit = dcaMarketValue != null ? dcaMarketValue - dcaTotalCost : null;
  // If the user does not enter a target, estimate a practical recovery target
  // halfway between current price and the average cost. They can override it.
  const dcaTargetInput = Number(dcaTargetPrice) > 0 ? Number(dcaTargetPrice) : null;
  const dcaTarget = dcaTargetInput ?? (dcaNowPrice != null && dcaAveragePrice != null && dcaNowPrice < dcaAveragePrice
    ? (dcaNowPrice + dcaAveragePrice) / 2
    : null);
  const dcaEstimatedBuyQty = dcaProfit != null && dcaProfit < 0 && dcaTotalQuantity > 0 && dcaNowPrice != null && dcaTarget != null && dcaTarget > dcaNowPrice && dcaTarget < dcaAveragePrice
    ? Math.ceil((dcaTotalCost - dcaTarget * dcaTotalQuantity) / (dcaTarget - dcaNowPrice))
    : null;
  const dcaEstimatedBuyCost = dcaEstimatedBuyQty != null && dcaNowPrice != null ? dcaEstimatedBuyQty * dcaNowPrice : null;

  const compoundPlan = useMemo(() => {
    const initial = Math.max(Number(compoundInitial) || 0, 0);
    const contribution = Math.max(Number(compoundContribution) || 0, 0);
    const annualReturn = Math.max(Number(compoundReturn) || 0, 0) / 100;
    const years = Math.min(Math.max(Math.floor(Number(compoundYears) || 0), 0), 100);
    const periodsPerYear = compoundFrequency === "yearly" ? 1 : compoundFrequency === "semiannual" ? 2 : compoundFrequency === "quarterly" ? 4 : 12;
    const rate = Math.pow(1 + annualReturn, 1 / periodsPerYear) - 1;
    let balance = initial;
    let totalContributed = initial;
    const timeline = [];
    for (let year = 1; year <= years; year++) {
      for (let period = 0; period < periodsPerYear; period++) {
        balance *= 1 + rate;
        balance += contribution;
        totalContributed += contribution;
      }
      timeline.push({ year, balance, contributed: totalContributed, profit: balance - totalContributed });
    }
    const targetCapital = Math.max(Number(compoundMonthlyGoal) || 0, 0) * 12 / 0.04;
    const reached = timeline.find((row) => row.balance >= targetCapital);
    return { initial, contribution, annualReturn, years, periodsPerYear, balance, totalContributed, profit: balance - totalContributed, timeline, targetCapital, reachedYear: reached?.year ?? null };
  }, [compoundInitial, compoundContribution, compoundFrequency, compoundReturn, compoundYears, compoundMonthlyGoal]);

  return (
    <main className="shell">
      <header className="hero">
        <div className="brand-mark">↗</div>
        <div>
          <h1>Trading Tools</h1>
          <p>VN Stock • Forex / XAUUSD • Technical Analysis • DCA • Lãi kép</p>
        </div>
      </header>

      <nav className="tabs" aria-label="Danh mục công cụ">
        {TABS.map((item) => (
          <button key={item.id} className={`tab ${tab === item.id ? "active" : ""}`} onClick={() => { setTab(item.id); setError(""); }}>
            {item.label}
          </button>
        ))}
      </nav>

      {error && <div className="alert error"><strong>Không thể hoàn tất:</strong> {error}</div>}

      {tab === "stock" && (
        <section className="panel">
          <h2>🇻🇳 Phân tích cổ phiếu Việt Nam — REVERSAL → Điểm mua &amp; DCA</h2>
          <div className="form-grid stock-grid">
            <label>Mã cổ phiếu
              <input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} placeholder="FPT" maxLength={12} />
            </label>
            <label>Vốn DCA (VND)
              <input type="number" min="0" step="1000000" value={capital} onChange={(e) => setCapital(e.target.value)} />
            </label>
            <label>Sàn giao dịch
              <select value={technicalExchange} onChange={(e) => setTechnicalExchange(e.target.value)}>
                <option value="HNX">HNX</option>
                <option value="HOSE">HOSE</option>
                <option value="UPCOM">UPCoM</option>
              </select>
            </label>
            <button className="primary action" disabled={loading === "stock"} onClick={loadAllStockData}>
              {loading === "stock" ? "Đang phân tích..." : "🔎 PHÂN TÍCH"}
            </button>
          </div>

          <section className="panel" style={{ marginTop: 18 }}>
            <h3>📈 Thống kê kỹ thuật cổ phiếu — TradingView</h3>
            <p className="muted">Chọn mã cổ phiếu và sàn ở phía trên, sau đó bấm PHÂN TÍCH một lần để tải dữ liệu thị trường, thống kê kỹ thuật và khối lượng.</p>
            {technicalData && technicalData.symbol === symbol.trim().toUpperCase() && <>
              <p className="muted">Mã: <strong>{technicalData.ticker}</strong> · Nguồn: {technicalData.source} · Cập nhật: {new Date(technicalData.updatedAt).toLocaleString("vi-VN")}</p>
              <div className="metrics" style={{ gridTemplateColumns: "repeat(3,minmax(0,1fr))" }}>
                <Metric label={technicalData.name || technicalData.symbol} value={`${fmt(technicalData.price)} đ`} sub={`${technicalData.changePct > 0 ? "+" : ""}${fmt(technicalData.changePct)}% hôm nay`} positive={technicalData.changePct == null ? undefined : technicalData.changePct >= 0} />
                <Metric label="Technical Score" value={`${technicalData.technicalScore}/100`} sub={`Trend: ${technicalData.dailyScenario.primary}`} />
                <Metric label="Action" value={technicalData.action} sub={`RSI: ${fmt(technicalData.rsi)} · ${technicalData.rsi >= 70 ? "QUÁ MUA" : technicalData.rsi <= 30 ? "QUÁ BÁN" : "NEUTRAL"}`} positive={technicalData.action === "BUY" ? true : technicalData.action === "SELL" ? false : undefined} />
              </div>
              <div className="metrics" style={{ gridTemplateColumns: "repeat(2,minmax(0,1fr))" }}>
                {[{label:"Kịch bản D1 · Daily",data:technicalData.dailyScenario},{label:"Kịch bản W1 · Weekly",data:technicalData.weeklyScenario}].map((sc) => <div className="metric" key={sc.label}>
                  <div className="metric-label">{sc.label}</div><div className="metric-value">{sc.data.primary}</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:8,marginTop:10}}>
                    <div><strong style={{color:"#21c77a"}}>{fmt(sc.data.up,1)}%</strong><div className="metric-sub">UP</div></div>
                    <div><strong style={{color:"#ff5964"}}>{fmt(sc.data.down,1)}%</strong><div className="metric-sub">DOWN</div></div>
                    <div><strong style={{color:"#e7b44c"}}>{fmt(sc.data.sideways,1)}%</strong><div className="metric-sub">SIDEWAY</div></div>
                  </div>
                  <div className="metric-sub" style={{marginTop:8}}>{sc.data.note}</div>
                </div>)}
              </div>
              <div className="metrics">
                <Metric label="EMA 9 · Ngắn hạn" value={fmt(technicalData.ema9)} />
                <Metric label="EMA 21 · Trung hạn" value={fmt(technicalData.ema21)} />
                <Metric label="EMA 50 · Xu hướng" value={fmt(technicalData.ema50)} />
                <Metric label="EMA 200 · Dài hạn" value={fmt(technicalData.ema200)} />
                <Metric label="RSI 14" value={fmt(technicalData.rsi)} sub={technicalData.rsi >= 70 ? "Quá mua" : technicalData.rsi <= 30 ? "Quá bán" : "Trung tính"} />
                <Metric label="MACD" value={fmt(technicalData.macd)} sub={technicalData.macd > technicalData.macdSignal ? "BUY" : technicalData.macd < technicalData.macdSignal ? "SELL" : "NEUTRAL"} />
                <Metric label="Khối lượng gần nhất" value={technicalData.volume == null ? "—" : `${fmt(technicalData.volume,0)} cp`} />
                <Metric label="KLGD / TB10" value={technicalData.volumeRatio == null ? "—" : `${fmt(technicalData.volumeRatio,2)}x`} sub={technicalData.volumeRatio >= 1.5 ? "Thanh khoản tăng mạnh" : "So với trung bình 10 phiên"} />
                <Metric label="ATR" value={fmt(technicalData.atr)} />
                <Metric label="Đỉnh 52 tuần" value={fmt(technicalData.high52)} />
                <Metric label="Đáy 52 tuần" value={fmt(technicalData.low52)} />
                <Metric label="Hỗ trợ gần · BB Lower" value={fmt(technicalData.support)} />
                <Metric label="Kháng cự gần · BB Upper" value={fmt(technicalData.resistance)} />
                <Metric label="Hiệu suất tuần" value={technicalData.perfWeek == null ? "—" : `${fmt(technicalData.perfWeek)}%`} positive={technicalData.perfWeek == null ? undefined : technicalData.perfWeek >= 0} />
                <Metric label="Hiệu suất tháng" value={technicalData.perfMonth == null ? "—" : `${fmt(technicalData.perfMonth)}%`} positive={technicalData.perfMonth == null ? undefined : technicalData.perfMonth >= 0} />
              </div>
              <div className="table-scroll"><table>
                <thead><tr><th>Nhóm</th><th>Chỉ báo</th><th>Tín hiệu</th><th>Giải thích</th></tr></thead>
                <tbody>
                  <tr><td>Trend</td><td>EMA 9/21/50/200</td><td>{technicalData.dailyScenario.primary}</td><td>So sánh thứ tự các EMA</td></tr>
                  <tr><td>Momentum</td><td>RSI 14</td><td>{technicalData.rsi >= 70 ? "OVERBOUGHT" : technicalData.rsi <= 30 ? "OVERSOLD" : "NEUTRAL"}</td><td>70+ quá mua, 30− quá bán</td></tr>
                  <tr><td>Momentum</td><td>MACD</td><td>{technicalData.macd > technicalData.macdSignal ? "BUY" : technicalData.macd < technicalData.macdSignal ? "SELL" : "NEUTRAL"}</td><td>MACD so với Signal</td></tr>
                  <tr><td>Volume</td><td>Volume / TB10</td><td>{technicalData.volumeRatio == null ? "—" : `${fmt(technicalData.volumeRatio,2)}x`}</td><td>≥1.5x: thanh khoản tăng mạnh</td></tr>
                </tbody>
              </table></div>
              <p className="muted">⚠️ {technicalData.note} Các tỷ lệ UP/DOWN/SIDEWAY là điểm quy đổi từ chỉ báo kỹ thuật, không phải xác suất dự báo thống kê.</p>
            </>}
          </section>

          {marketData && (
            <>
              <div className="metrics">
                <Metric label="Giá gần nhất" value={`${fmt(marketData.price)} ${marketData.currency || "VND"}`} sub={`${change >= 0 ? "+" : ""}${fmt(change)}% so với phiên trước`} positive={change >= 0} />
                <Metric label="RSI (14)" value={fmt(marketData.indicators.rsi14)} sub={marketData.indicators.rsi14 < 30 ? "Quá bán" : marketData.indicators.rsi14 > 70 ? "Quá mua" : "Vùng trung tính"} />
                <Metric label="MA20" value={fmt(marketData.indicators.ma20)} />
                <Metric label="MA50" value={fmt(marketData.indicators.ma50)} />
              </div>
              <PriceChart data={marketData.history} />
              <section className="panel" style={{ marginTop: 20 }}>
                <h3>📊 Thống kê khối lượng giao dịch</h3>
                <div className="form-grid stock-grid">
                  <label>Khoảng thời gian
                    <select value={stockVolumeRange} onChange={(e) => setStockVolumeRange(e.target.value)}>
                      <option value="1mo">1 tháng</option>
                      <option value="3mo">3 tháng</option>
                      <option value="6mo">6 tháng</option>
                      <option value="1y">1 năm</option>
                    </select>
                  </label>
                  <span className="muted">{volumeLoading ? "Đang tải khối lượng..." : "Khối lượng được cập nhật cùng lần phân tích."}</span>
                </div>
                {stockVolumeData && stockVolumeData.symbol === symbol.trim().toUpperCase() && <>
                  <p className="muted">Phiên dữ liệu gần nhất: {stockVolumeData.updatedAt} · Nguồn: {stockVolumeData.source}</p>
                  <div className="metrics">
                    <Metric label="Khối lượng gần nhất" value={`${Number(stockVolumeData.latest.volume).toLocaleString("vi-VN")} cp`} />
                    <Metric label="Giá đóng cửa" value={fmt(stockVolumeData.latest.close)} />
                    <Metric label="Trung bình KLGD 20 phiên" value={`${Number(stockVolumeData.avgVolume20).toLocaleString("vi-VN")} cp`} />
                    <Metric label="KLGD so với TB20" value={stockVolumeData.volumeVsAvgPct == null ? "—" : `${stockVolumeData.volumeVsAvgPct > 0 ? "+" : ""}${fmt(stockVolumeData.volumeVsAvgPct)}%`} positive={stockVolumeData.volumeVsAvgPct == null ? undefined : stockVolumeData.volumeVsAvgPct >= 0} />
                  </div>
                  <p>Thay đổi KLGD so với phiên trước: <strong>{stockVolumeData.volumeChangePct == null ? "Không xác định" : `${stockVolumeData.volumeChangePct > 0 ? "+" : ""}${fmt(stockVolumeData.volumeChangePct)}%`}</strong></p>
                  <div className="table-scroll"><table>
                    <thead><tr><th>Ngày</th><th>Giá đóng cửa</th><th>Khối lượng</th></tr></thead>
                    <tbody>{[...stockVolumeData.history].reverse().slice(0, 30).map((r) => <tr key={r.date}><td>{r.date}</td><td>{fmt(r.close)}</td><td>{Number(r.volume).toLocaleString("vi-VN")}</td></tr>)}</tbody>
                  </table></div>
                  <button className="secondary" onClick={() => {
                    const rows = [["Ngày", "Open", "High", "Low", "Close", "Volume"], ...stockVolumeData.history.map(r => [r.date, r.open, r.high, r.low, r.close, r.volume])];
                    const csv = "\uFEFF" + rows.map(row => row.map(v => `"${String(v ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
                    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
                    const a = document.createElement("a"); a.href = url; a.download = `${stockVolumeData.symbol}_khoi_luong.csv`; a.click(); URL.revokeObjectURL(url);
                  }}>📥 Tải CSV</button>
                </>}
                <p className="muted">Nguồn khối lượng phụ thuộc dữ liệu trả về từ API; có thể trễ hoặc không có với một số mã. Khối lượng là số cổ phiếu, không phải số lệnh.</p>
              </section>

              <h3>Kế hoạch mua thăm dò &amp; DCA (tham khảo)</h3>
              <div className="table-scroll"><table>
                <thead><tr><th>Mức</th><th>Giá tham khảo</th><th>Thấp hơn giá hiện tại</th><th>Cơ sở</th></tr></thead>
                <tbody>{marketData.levels.map((r) => <tr key={r.label}><td>{r.label}</td><td>{fmt(r.price)}</td><td>{fmt(r.dropPct)}%</td><td>{r.basis}</td></tr>)}</tbody>
              </table></div>
              <h3>Phân bổ vốn DCA minh họa</h3>
              <p className="muted">Chia đều vốn nhập ở trên cho các mức giá. Số lượng tính theo cổ phiếu nguyên, chưa gồm phí và thuế.</p>
              <div className="table-scroll"><table>
                <thead><tr><th>Lệnh</th><th>Mức</th><th>Vốn phân bổ</th><th>Khối lượng ước tính</th></tr></thead>
                <tbody>{dcaRows.map((r) => <tr key={r.order}><td>{r.order}</td><td>{r.label}</td><td>{fmt(r.allocation, 0)} đ</td><td>{r.shares.toLocaleString("vi-VN")}</td></tr>)}</tbody>
              </table></div>
              <p className="muted">Nguồn giá: Yahoo Finance. Dữ liệu có thể trễ, thiếu hoặc không hỗ trợ một số mã Việt Nam.</p>
            </>
          )}
        </section>
      )}

      {tab === "forex" && (
        <section className="panel">
          <h2>🌎 Forex / XAUUSD / BTCUSD</h2>
          <div className="form-grid">
            <label>Tài sản
              <select value={fxSymbol} onChange={(e) => { setFxSymbol(e.target.value); setFxData(null); }}>
                {FX_SYMBOLS.map(([value, label]) => <option key={value} value={value}>{value} — {label}</option>)}
              </select>
            </label>
            {fxSymbol === "XAUUSD" && <label>Khung thời gian
              <select value={xauInterval} onChange={(e) => { setXauInterval(e.target.value); setFxData(null); }}>
                <option value="5min">M5</option>
                <option value="15min">M15</option>
                <option value="30min">M30</option>
                <option value="1h">H1</option>
                <option value="4h">H4</option>
                <option value="1day">D1</option>
              </select>
            </label>}
            <button className="primary action" disabled={loading === "forex"} onClick={() => loadMarket("forex")}>
              {loading === "forex" ? "Đang tải..." : "🔎 TẢI DỮ LIỆU"}
            </button>
          </div>
          {fxData && (
            <>
              <div className="metrics">
                <Metric label="Giá gần nhất" value={fmt(fxData.price)} sub={`${fxChange >= 0 ? "+" : ""}${fmt(fxChange)}% so với ${fxSymbol === "XAUUSD" ? "nến trước" : "phiên trước"}`} positive={fxChange >= 0} />
                <Metric label="RSI (14)" value={fmt(fxData.indicators.rsi14)} sub={fxData.analysis?.rsiState || (fxData.indicators.rsi14 <= 30 ? "Quá bán" : fxData.indicators.rsi14 >= 70 ? "Quá mua" : "Trung tính")} />
                <Metric label="MA20" value={fmt(fxData.indicators.ma20)} />
                <Metric label="MA50" value={fmt(fxData.indicators.ma50)} />
                <Metric label="MA200" value={fmt(fxData.indicators.ma200)} />
                <Metric label="ATR (14)" value={fxData.indicators.atr14 == null ? "—" : fmt(fxData.indicators.atr14, 4)} sub={fxData.indicators.atrPct == null ? "Biên độ biến động" : `${fmt(fxData.indicators.atrPct, 2)}% giá hiện tại`} />
                <Metric label="MACD (12,26)" value={fmt(fxData.indicators.macd, 4)} sub={fxData.indicators.macd == null ? "Chưa đủ dữ liệu" : fxData.indicators.macd > 0 ? "Động lượng dương" : fxData.indicators.macd < 0 ? "Động lượng âm" : "Trung tính"} />
                <Metric label="Hỗ trợ 20 nến" value={fmt(fxData.indicators.support20, 4)} />
                <Metric label="Kháng cự 20 nến" value={fmt(fxData.indicators.resistance20, 4)} />
                <Metric label="Bollinger trên" value={fmt(fxData.indicators.bollingerUpper, 4)} />
                <Metric label="Bollinger dưới" value={fmt(fxData.indicators.bollingerLower, 4)} />
              </div>
              {fxSymbol === "XAUUSD" && fxData.analysis && (
                <div className="metrics" style={{ marginTop: 12 }}>
                  <Metric label="Phân tích Reversal" value={fxData.analysis.reversal} sub={fxData.analysis.reversalDetail} />
                  <Metric label="Xu hướng MA20/MA50" value={fxData.analysis.maTrend} sub="So sánh giá với MA20 và MA20 với MA50" />
                </div>
              )}
              <section className="technical-panel">
                <h3>Phân tích kỹ thuật tổng hợp</h3>
                <div className="technical-grid">
                  <div className="technical-card"><strong>Xu hướng</strong><span>{fxData.analysis?.trend || fxData.analysis?.maTrend || "Chưa đủ dữ liệu"}</span><p>Đánh giá từ vị trí giá so với MA20/MA50.</p></div>
                  <div className="technical-card"><strong>RSI (14)</strong><span>{fxData.analysis?.rsiState || (fxData.indicators.rsi14 >= 70 ? "Quá mua" : fxData.indicators.rsi14 <= 30 ? "Quá bán" : "Trung tính")}</span><p>RSI &gt; 70 thường được xem là quá mua; RSI &lt; 30 là quá bán.</p></div>
                  <div className="technical-card"><strong>ATR &amp; quản trị rủi ro</strong><span>{fxData.indicators.atr14 == null ? "Chưa đủ dữ liệu" : `${fmt(fxData.indicators.atr14, 4)} (${fmt(fxData.indicators.atrPct, 2)}%)`}</span><p>ATR đo biên độ dao động trung bình, không cho biết hướng giá.</p></div>
                </div>
                <ul className="technical-list">{(fxData.analysis?.technicalSummary || []).map((item, i) => <li key={i}>{item}</li>)}</ul>
                <p className="muted">Các chỉ báo là tín hiệu tham khảo dựa trên dữ liệu lịch sử, không phải khuyến nghị mua/bán.</p>
              </section>
              {((Array.isArray(fxData.dca) && fxData.dca.length > 0) || (Array.isArray(fxData.levels) && fxData.levels.length > 0)) && <>
                <h3>Mức giá DCA / vùng hỗ trợ tham khảo</h3>
                <p className="muted">Ước tính từ ATR, MA và vùng đáy gần đây tùy nguồn dữ liệu. Không đảm bảo giá sẽ chạm các mức này.</p>
                <div className="table-scroll"><table><thead><tr><th>Mức</th><th>Giá tham khảo</th><th>Thấp hơn giá hiện tại</th><th>Cơ sở</th></tr></thead><tbody>{(fxData.dca || fxData.levels || []).map((item) => <tr key={item.label}><td>{item.label}</td><td>{fmt(item.price, 4)}</td><td>{item.dropPct == null ? (item.distanceAtr != null ? `${fmt(item.distanceAtr, 1)} × ATR` : "—") : `${fmt(item.dropPct, 2)}%`}</td><td>{item.basis || `Giá hiện tại − ${item.distanceAtr} ATR`}</td></tr>)}</tbody></table></div>
              </>}
              <PriceChart data={fxData.history} />
              <p className="muted">Nguồn: {fxData.source || "Yahoo Finance"}{fxSymbol === "XAUUSD" ? ` · Twelve Data XAU/USD · Khung ${({"5min":"M5","15min":"M15","30min":"M30","1h":"H1","4h":"H4","1day":"D1"})[xauInterval]}` : " · Dữ liệu có thể trễ tùy nhà cung cấp"}. Không tự đặt lệnh giao dịch.</p>
            </>
          )}
        </section>
      )}

      {tab === "dca" && (
        <section className="panel">
          <h2>🧮 Tính giá vốn trung bình — DCA (Dollar-Cost Averaging)</h2>
          <p className="muted">Ghi lại từng lần mua cổ phiếu, vàng hoặc tài sản. Giá vốn được tính từ tổng tiền mua chia cho tổng số lượng, chưa bao gồm phí giao dịch và thuế.</p>
          <div className="form-grid">
            <label>Mã tài sản / tên danh mục
              <input value={dcaAsset} onChange={(e) => { setDcaAsset(e.target.value.toUpperCase()); setDcaCurrentPrice(""); setDcaPriceUpdatedAt(""); setDcaPriceSource(""); }} placeholder="FPT, XAUUSD, BTC..." maxLength={20} />
            </label>
            <label>Đơn vị tiền tệ
              <select value={dcaCurrency} onChange={(e) => setDcaCurrency(e.target.value)}>
                <option value="VND">VND</option><option value="USD">USD</option>
              </select>
            </label>
            <label>Giá thị trường hiện tại
              <input type="number" min="0" step="any" value={dcaCurrentPrice} onChange={(e) => setDcaCurrentPrice(e.target.value)} placeholder="Bấm cập nhật để lấy giá mới nhất" />
            </label>
            <label>Giá mục tiêu hồi phục (tùy chọn)
              <input type="number" min="0" step="any" value={dcaTargetPrice} onChange={(e) => setDcaTargetPrice(e.target.value)} placeholder="Để trống để tự ước tính" />
            </label>
            <button className="primary action" disabled={dcaPriceLoading || !dcaAsset.trim()} onClick={loadDcaLatestPrice}>
              {dcaPriceLoading ? "Đang cập nhật giá..." : "↻ CẬP NHẬT GIÁ MỚI NHẤT"}
            </button>
          </div>
          {dcaPriceUpdatedAt && <p className="muted">Giá {dcaAsset.toUpperCase()}: {fmt(dcaCurrentPrice, 4)} {dcaCurrency} · Nguồn: {dcaPriceSource || "API thị trường"} · Cập nhật: {dcaPriceUpdatedAt}. Giá có thể trễ theo nguồn cung cấp.</p>}
          <h3>Lịch sử mua</h3>
          <div className="table-scroll"><table>
            <thead><tr><th>Ngày mua</th><th>Khối lượng</th><th>Giá mua / đơn vị</th><th>Thành tiền</th><th></th></tr></thead>
            <tbody>{dcaRowsInput.map((row) => {
              const qty = Math.max(Number(row.quantity) || 0, 0);
              const price = Math.max(Number(row.price) || 0, 0);
              return <tr key={row.id}>
                <td><input aria-label="Ngày mua" type="date" value={row.date} onChange={(e) => setDcaRowsInput(rows => rows.map(r => r.id === row.id ? { ...r, date: e.target.value } : r))} /></td>
                <td><input aria-label="Khối lượng mua" type="number" min="0" step="any" value={row.quantity} onChange={(e) => setDcaRowsInput(rows => rows.map(r => r.id === row.id ? { ...r, quantity: e.target.value } : r))} placeholder="0" /></td>
                <td><input aria-label="Giá mua" type="number" min="0" step="any" value={row.price} onChange={(e) => setDcaRowsInput(rows => rows.map(r => r.id === row.id ? { ...r, price: e.target.value } : r))} placeholder="0" /></td>
                <td>{qty > 0 && price > 0 ? fmt(qty * price, 2) : "—"} {qty > 0 && price > 0 ? dcaCurrency : ""}</td>
                <td><button className="secondary" disabled={dcaRowsInput.length === 1} onClick={() => setDcaRowsInput(rows => rows.filter(r => r.id !== row.id))}>Xóa</button></td>
              </tr>;
            })}</tbody>
          </table></div>
          <div className="button-row" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
            <button className="primary" onClick={() => { setDcaRowsInput(rows => [...rows, { id: nextDcaId, date: new Date().toISOString().slice(0, 10), quantity: "", price: "" }]); setNextDcaId(id => id + 1); }}>＋ Thêm lần mua</button>
            <button className="secondary" onClick={() => { setDcaRowsInput([{ id: nextDcaId, date: new Date().toISOString().slice(0, 10), quantity: "", price: "" }]); setNextDcaId(id => id + 1); setDcaCurrentPrice(""); setDcaPriceUpdatedAt(""); setDcaPriceSource(""); }}>Làm mới bảng</button>
            <button className="secondary" disabled={!dcaValidRows.length} onClick={() => { const rows = [["Ma tai san", dcaAsset], ["Ngay mua", "Khoi luong", "Gia mua", "Thanh tien"], ...dcaValidRows.map(r => [r.date, r.quantity, r.price, r.quantity * r.price])]; const csv = "\uFEFF" + rows.map(row => row.map(v => `"${String(v ?? "").replaceAll('"', '""')}"`).join(",")).join("\n"); const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" })); const a = document.createElement("a"); a.href = url; a.download = `${dcaAsset || "dca"}_lich_su_mua.csv`; a.click(); URL.revokeObjectURL(url); }}>📥 Xuất CSV</button>
          </div>
          <h3>Tổng hợp danh mục {dcaAsset && `— ${dcaAsset}`}</h3>
          <div className="metrics">
            <Metric label="Tổng vốn đầu tư" value={`${fmt(dcaTotalCost, 2)} ${dcaCurrency}`} />
            <Metric label="Tổng khối lượng" value={fmt(dcaTotalQuantity, 6)} />
            <Metric label="Giá vốn trung bình" value={dcaAveragePrice == null ? "—" : `${fmt(dcaAveragePrice, 4)} ${dcaCurrency}`} />
            <Metric label="Giá trị hiện tại" value={dcaMarketValue == null ? "Nhập giá hiện tại" : `${fmt(dcaMarketValue, 2)} ${dcaCurrency}`} />
            <Metric label="Lãi / lỗ tạm tính" value={dcaProfit == null ? "—" : `${dcaProfit > 0 ? "+" : ""}${fmt(dcaProfit, 2)} ${dcaCurrency}`} positive={dcaProfit == null ? undefined : dcaProfit >= 0} />
            <Metric label="Biến động so với vốn" value={dcaProfit == null || dcaTotalCost <= 0 ? "—" : `${fmt(dcaProfit / dcaTotalCost * 100)}%`} positive={dcaProfit == null ? undefined : dcaProfit >= 0} />
          </div>
          {dcaProfit != null && dcaProfit < 0 && (
            <>
              <div className="metrics" style={{ marginTop: 12 }}>
                <Metric label="Giá mục tiêu dùng để tính" value={dcaTarget == null ? "—" : `${fmt(dcaTarget, 4)} ${dcaCurrency}`} sub={dcaTargetInput == null ? "Tự ước tính: trung điểm giữa giá hiện tại và giá vốn TB" : "Theo giá mục tiêu bạn nhập"} />
                <Metric label="Số lượng mua thêm ước tính" value={dcaEstimatedBuyQty == null ? "Giá mục tiêu phải cao hơn giá hiện tại và thấp hơn giá vốn TB" : fmt(dcaEstimatedBuyQty, 6)} />
                <Metric label="Vốn mua bổ sung ước tính" value={dcaEstimatedBuyCost == null ? "—" : `${fmt(dcaEstimatedBuyCost)} ${dcaCurrency}`} />
              </div>
              <p className="muted">Cách tính: mua thêm tại giá hiện tại để giá vốn bình quân mới bằng giá mục tiêu. Nếu để trống giá mục tiêu, hệ thống tự chọn trung điểm giữa giá hiện tại và giá vốn bình quân. Mua thêm tại đúng giá hiện tại không thể xóa khoản lỗ ngay lập tức; cần giá thị trường hồi phục đến giá mục tiêu. Chưa tính phí và thuế.</p>
            </>
          )}
          <div className="alert info" style={{ marginTop: 16 }}>Công thức: Tổng vốn = Σ (khối lượng × giá mua); giá vốn trung bình = tổng vốn ÷ tổng khối lượng. Chỉ tính các dòng có cả khối lượng và giá mua lớn hơn 0. Lãi/lỗ chưa tính phí, thuế và cổ tức.</div>
        </section>
      )}

      {tab === "compound" && (
        <section className="panel">
          <h2>📈 Lãi kép &amp; Hoạch định mục tiêu tự do tài chính</h2>
          <p className="muted">Mô phỏng tích lũy dài hạn với lợi nhuận được tái đầu tư. Đây là kịch bản giả định, không phải cam kết lợi nhuận.</p>
          <div className="form-grid compound-grid">
            <label>Vốn ban đầu (VND)<input type="text" inputMode="numeric" value={formatMoneyInput(compoundInitial)} onChange={(e) => setCompoundInitial(parseMoneyInput(e.target.value))} /></label>
            <label>Đầu tư thêm mỗi kỳ (VND)<input type="text" inputMode="numeric" value={formatMoneyInput(compoundContribution)} onChange={(e) => setCompoundContribution(parseMoneyInput(e.target.value))} /></label>
            <label>Tần suất đầu tư<select value={compoundFrequency} onChange={(e) => setCompoundFrequency(e.target.value)}><option value="monthly">Hàng tháng</option><option value="quarterly">Hàng quý (3 tháng)</option><option value="semiannual">6 tháng một lần</option><option value="yearly">1 năm một lần</option></select></label>
            <label>Lợi nhuận kỳ vọng năm (%)<input type="number" min="0" max="100" step="0.1" value={compoundReturn} onChange={(e) => setCompoundReturn(e.target.value)} /></label>
            <label>Thời gian đầu tư (năm)<input type="number" min="0" max="100" step="1" value={compoundYears} onChange={(e) => setCompoundYears(e.target.value)} /></label>
            <label>Mục tiêu thu nhập thụ động/tháng (VND)<input type="text" inputMode="numeric" value={formatMoneyInput(compoundMonthlyGoal)} onChange={(e) => setCompoundMonthlyGoal(parseMoneyInput(e.target.value))} /></label>
          </div>
          <div className="metrics">
            <Metric label="Tổng tài sản dự kiến" value={`${fmt(compoundPlan.balance, 0)} VND`} />
            <Metric label="Tổng tiền tự góp" value={`${fmt(compoundPlan.totalContributed, 0)} VND`} />
            <Metric label="Lợi nhuận từ tăng trưởng" value={`${fmt(compoundPlan.profit, 0)} VND`} positive={compoundPlan.profit >= 0} />
            <Metric label="Vốn mục tiêu tự do tài chính" value={`${fmt(compoundPlan.targetCapital, 0)} VND`} sub="Quy tắc tham khảo: chi tiêu năm ÷ 4%" />
          </div>
          <div className="alert info" style={{ marginTop: 12 }}>
            {compoundPlan.targetCapital <= 0 ? "Nhập mục tiêu thu nhập thụ động để ước tính vốn cần có." : compoundPlan.reachedYear != null ? `Theo giả định hiện tại, tài sản có thể đạt vốn mục tiêu vào khoảng năm thứ ${compoundPlan.reachedYear}.` : `Trong ${compoundPlan.years} năm mô phỏng, tài sản chưa đạt vốn mục tiêu. Hãy thử điều chỉnh mức góp, thời gian hoặc giả định lợi nhuận.`}
            <br />Tần suất: {compoundPlan.periodsPerYear === 12 ? "hàng tháng" : compoundPlan.periodsPerYear === 4 ? "hàng quý" : compoundPlan.periodsPerYear === 2 ? "6 tháng một lần" : "1 năm một lần"}. Lãi suất mỗi kỳ được quy đổi từ lợi nhuận năm; tiền góp được thêm vào cuối mỗi kỳ. Chưa tính lạm phát, phí, thuế và biến động lợi nhuận thực tế.
          </div>
          <h3>Lộ trình tài sản theo năm</h3>
          {compoundPlan.timeline.length ? <div className="table-scroll"><table><thead><tr><th>Năm</th><th>Tổng tiền tự góp</th><th>Lợi nhuận tích lũy</th><th>Tổng tài sản dự kiến</th></tr></thead><tbody>{compoundPlan.timeline.map((row) => <tr key={row.year}><td>{row.year}</td><td>{fmt(row.contributed, 0)} VND</td><td>{fmt(row.profit, 0)} VND</td><td><strong>{fmt(row.balance, 0)} VND</strong></td></tr>)}</tbody></table></div> : <p className="muted">Nhập thời gian đầu tư lớn hơn 0 để xem bảng dự phóng.</p>}
        </section>
      )}

      {tab === "funds" && (
        <section className="panel">
          <h2>📈 Chứng chỉ quỹ</h2>
          <p className="muted">Tra cứu theo mã quỹ. Hệ thống ưu tiên Fmarket và chỉ chấp nhận mã khớp chính xác; CafeF là nguồn dự phòng. NAV quỹ mở không phải giá realtime, còn giá ETF trên sàn có thể khác NAV/CCQ.</p>
          <div className="form-grid">
            <label className="fund-code-label">Mã chứng chỉ quỹ
              <input
                value={fundSymbol}
                onFocus={() => setFundMenuOpen(true)}
                onChange={(e) => { setFundSymbol(e.target.value.toUpperCase().trim()); setFundData(null); setFundMenuOpen(true); }}
                onKeyDown={(e) => { if (e.key === "Escape") setFundMenuOpen(false); if (e.key === "Enter") { const match = FUNDS.find(([code]) => code === fundSymbol); if (match) { setFundSymbol(match[0]); setFundMenuOpen(false); } } }}
                placeholder="Tìm hoặc nhập mã quỹ..."
                maxLength={15}
                aria-expanded={fundMenuOpen}
                aria-controls="fund-codes-menu"
              />
              <button type="button" className="fund-dropdown-toggle" aria-label="Mở danh sách mã quỹ" onClick={() => setFundMenuOpen((open) => !open)}>▾</button>
              {fundMenuOpen && (
                <div id="fund-codes-menu" className="fund-code-menu">
                  <div className="fund-code-menu-title">Danh sách mã quỹ ({FUNDS.length})</div>
                  <div className="fund-code-menu-list">
                    {FUNDS.filter(([code, name]) => !fundSymbol || code.toLowerCase().includes(fundSymbol.toLowerCase()) || name.toLowerCase().includes(fundSymbol.toLowerCase())).map(([code, name]) => (
                      <button type="button" key={code} className={`fund-code-option${fundSymbol === code ? " selected" : ""}`} onMouseDown={(e) => e.preventDefault()} onClick={() => { setFundSymbol(code); setFundData(null); setFundMenuOpen(false); }}>
                        <strong>{code}</strong><span>{name.replace(`${code} — `, "")}</span>
                      </button>
                    ))}
                    {FUNDS.filter(([code, name]) => !fundSymbol || code.toLowerCase().includes(fundSymbol.toLowerCase()) || name.toLowerCase().includes(fundSymbol.toLowerCase())).length === 0 && <div className="fund-code-empty">Không có mã khớp. Bạn vẫn có thể nhập mã mới để tra cứu.</div>}
                  </div>
                  <button type="button" className="fund-code-close" onClick={() => setFundMenuOpen(false)}>Đóng danh sách</button>
                </div>
              )}
            </label>
            <button className="primary action" disabled={loading === "fund" || !/^[A-Z0-9-]{2,15}$/.test(fundSymbol)} onClick={loadFund}>
              {loading === "fund" ? "Đang tải..." : "🔎 TRA CỨU NAV"}
            </button>
          </div>
          {fundData && (
            <>
              <div className="metrics">
                <Metric label="NAV gần nhất / CCQ" value={`${fmt(fundData.nav)} đ`} />
                <Metric label="Tăng/giảm NAV" value={fundData.changeAbs == null ? "—" : `${fundData.changeAbs >= 0 ? "+" : ""}${fmt(fundData.changeAbs)} đ`} positive={fundData.changeAbs == null ? undefined : fundData.changeAbs >= 0} />
                <Metric label="Biến động" value={fundData.changePct == null ? "—" : `${fundData.changePct >= 0 ? "+" : ""}${fmt(fundData.changePct)}%`} positive={fundData.changePct == null ? undefined : fundData.changePct >= 0} />
                <Metric label="Ngày NAV" value={fundData.date || "Chưa xác định"} />
              </div>
              <p className="muted"><strong>Nguồn:</strong> {fundData.source} · {fundData.name || fundData.symbol}</p>
              {fundData.history?.length > 1 && <><h3>Lịch sử NAV</h3><PriceChart data={fundData.history} /></>}
              {Object.values(fundData.performance || {}).some((v) => v != null) && <>
                <h3>Hiệu suất quỹ (nếu nguồn cung cấp)</h3>
                <div className="metrics">
                  {[["1 tháng", "oneMonth"], ["3 tháng", "threeMonths"], ["6 tháng", "sixMonths"], ["1 năm", "oneYear"], ["3 năm", "threeYears"]].filter(([, key]) => fundData.performance[key] != null).map(([label, key]) => <Metric key={key} label={label} value={`${fmt(fundData.performance[key])}%`} positive={fundData.performance[key] >= 0} />)}
                </div>
              </>}
              <div className="alert info">{fundData.note || "Đối chiếu ngày NAV với công ty quản lý quỹ trước khi sử dụng."}</div>
            </>
          )}
          <div className="link-row">
            <a href="https://fmarket.vn/" target="_blank" rel="noreferrer">Đối chiếu NAV trên Fmarket ↗</a>
            <a href={`https://cafef.vn/du-lieu/chung-chi-quy/${fundSymbol.toLowerCase()}.chn`} target="_blank" rel="noreferrer">Mở trang {fundSymbol || "quỹ"} trên CafeF ↗</a>
          </div>
        </section>
      )}

      <DonationSupport />
      <ShareApp />

      <footer className="footer">
        <span>Trading Tools</span>
        <span>Dữ liệu tham khảo, không phải khuyến nghị đầu tư.</span>
      </footer>
    </main>
  );
}
