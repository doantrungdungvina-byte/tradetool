"use client";

import { useMemo, useState } from "react";

const TABS = [
  { id: "stock", label: "VN STOCK" },
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

const firstDefined = (...values) => values.find((value) =>
  value !== undefined && value !== null && value !== "" && Number.isFinite(Number(value))
);

function getStockFundamentals(data) {
  const f = data?.fundamentals || data?.valuation || data?.financials || {};
  const dividend = data?.dividend || data?.dividends || f?.dividend || {};
  return {
    pe: firstDefined(data?.pe, data?.trailingPE, data?.trailingPe, data?.priceEarningsRatio, f?.pe, f?.trailingPE, f?.trailingPe),
    pb: firstDefined(data?.pb, data?.priceToBook, data?.priceToBookRatio, f?.pb, f?.priceToBook, f?.priceToBookRatio),
    dividendYield: firstDefined(
      data?.dividendYield, data?.dividend_yield, data?.dividendYieldPct,
      dividend?.yield, dividend?.yieldPct, dividend?.dividendYield,
      f?.dividendYield, f?.dividend_yield
    ),
    dividendPerShare: firstDefined(
      data?.dividendPerShare, data?.dividend_per_share,
      dividend?.perShare, dividend?.amount, f?.dividendPerShare
    ),
    dividendRate: firstDefined(data?.dividendRate, dividend?.rate, f?.dividendRate),
    dividendDate: data?.dividendDate || data?.exDividendDate || data?.ex_dividend_date ||
      dividend?.date || dividend?.exDate || f?.dividendDate || null,
    source: f?.source || data?.fundamentalSource || data?.source || "API thị trường",
  };
}

function getPeAssessment(pe) {
  if (pe == null || !Number.isFinite(Number(pe)) || Number(pe) <= 0) {
    return {
      label: "Chưa đủ dữ liệu",
      detail: "P/E không hợp lệ hoặc doanh nghiệp đang lỗ; không thể kết luận cổ phiếu rẻ chỉ từ chỉ số này.",
      tone: "neutral",
    };
  }
  if (Number(pe) < 10) {
    return {
      label: "P/E thấp",
      detail: "Có thể đưa vào danh sách nghiên cứu thêm. Kiểm tra lợi nhuận có bền vững không, nợ vay, dòng tiền, ngành và các khoản lợi nhuận bất thường trước khi mua.",
      tone: "good",
    };
  }
  if (Number(pe) < 15) {
    return {
      label: "P/E tương đối thấp",
      detail: "Có thể hấp dẫn nếu doanh nghiệp có chất lượng tốt và triển vọng ổn định. So sánh với trung bình ngành và lịch sử P/E của chính cổ phiếu.",
      tone: "neutral",
    };
  }
  if (Number(pe) <= 25) {
    return {
      label: "P/E trung bình đến cao",
      detail: "Đánh giá thêm tốc độ tăng trưởng lợi nhuận, ROE, dòng tiền và mức định giá của ngành.",
      tone: "neutral",
    };
  }
  return {
    label: "P/E cao",
    detail: "Cần tăng trưởng lợi nhuận tương xứng để biện minh cho định giá. Tránh kết luận đắt/rẻ nếu chưa so sánh cùng ngành.",
    tone: "warning",
  };
}

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
  const [fundSearch, setFundSearch] = useState("");
  const [fundDropdownOpen, setFundDropdownOpen] = useState(false);
  const filteredFunds = FUNDS.filter(([code, name]) =>
    `${code} ${name}`.toLowerCase().includes(fundSearch.toLowerCase())
  );
  const [marketData, setMarketData] = useState(null);
  const [fxData, setFxData] = useState(null);
  const [xauMultiData, setXauMultiData] = useState({});
  const [fundData, setFundData] = useState(null);
  const [stockVolumeData, setStockVolumeData] = useState(null);
  const [stockVolumeRange, setStockVolumeRange] = useState("3mo");
  const [volumeLoading, setVolumeLoading] = useState(false);
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

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
      if (kind === "forex") {
        setFxData(json);
        if (currentSymbol === "XAUUSD") {
          const intervals = [
            ["5min", "M5"],
            ["15min", "M15"],
            ["1h", "H1"],
            ["4h", "H4"],
            ["1day", "D1"],
          ];
          const results = await Promise.all(intervals.map(async ([interval, label]) => {
            if (interval === xauInterval) return [label, json];
            try {
              const response = await fetch(`/api/xauusd?interval=${encodeURIComponent(interval)}`, { cache: "no-store" });
              const data = await response.json();
              return [label, response.ok ? data : { error: data.error || "Không tải được dữ liệu" }];
            } catch {
              return [label, { error: "Không thể kết nối dữ liệu." }];
            }
          }));
          setXauMultiData(Object.fromEntries(results));
        } else {
          setXauMultiData({});
        }
      } else setMarketData(json);
    } catch (e) {
      setError(e.message || "Lỗi tải dữ liệu.");
    } finally {
      setLoading("");
    }
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
  const stockFundamentals = getStockFundamentals(marketData);
  const peAssessment = getPeAssessment(stockFundamentals.pe);
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

  return (
    <main className="shell">
      <header className="hero">
        <div className="brand-mark">↗</div>
        <div>
          <h1>Trading Tools</h1>
          <p>VN Stock • Forex / XAUUSD • Technical Analysis • DCA</p>
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
            <button className="primary action" disabled={loading === "stock"} onClick={() => loadMarket("stock")}>
              {loading === "stock" ? "Đang tải..." : "🔎 PHÂN TÍCH VN STOCK"}
            </button>
          </div>

          {marketData && (
            <>
              <div className="metrics">
                <Metric label="Giá gần nhất" value={`${fmt(marketData.price)} ${marketData.currency || "VND"}`} sub={`${change >= 0 ? "+" : ""}${fmt(change)}% so với phiên trước`} positive={change >= 0} />
                <Metric label="RSI (14)" value={fmt(marketData.indicators.rsi14)} sub={marketData.indicators.rsi14 < 30 ? "Quá bán" : marketData.indicators.rsi14 > 70 ? "Quá mua" : "Vùng trung tính"} />
                <Metric label="MA20" value={fmt(marketData.indicators.ma20)} />
                <Metric label="MA50" value={fmt(marketData.indicators.ma50)} />
              </div>
              <section className="panel fundamentals-panel" style={{ marginTop: 20 }}>
                <h3>📘 Định giá cơ bản &amp; cổ tức</h3>
                <p className="muted">
                  Chỉ số phụ thuộc dữ liệu API và kỳ báo cáo. “—” nghĩa là nguồn hiện tại chưa trả dữ liệu; không tự suy đoán số liệu.
                </p>
                <div className="metrics">
                  <Metric
                    label="P/E"
                    value={stockFundamentals.pe == null ? "—" : `${fmt(stockFundamentals.pe)} lần`}
                    sub="Giá / lợi nhuận trên mỗi cổ phiếu"
                  />
                  <Metric
                    label="P/B"
                    value={stockFundamentals.pb == null ? "—" : `${fmt(stockFundamentals.pb)} lần`}
                    sub="Giá / giá trị sổ sách mỗi cổ phiếu"
                  />
                  <Metric
                    label="Tỷ suất cổ tức"
                    value={stockFundamentals.dividendYield == null ? "—" : `${fmt(stockFundamentals.dividendYield)}%`}
                    sub="Tỷ lệ cổ tức so với giá cổ phiếu"
                  />
                  <Metric
                    label="Cổ tức / cổ phiếu"
                    value={stockFundamentals.dividendPerShare == null
                      ? (stockFundamentals.dividendRate == null ? "—" : `${fmt(stockFundamentals.dividendRate)} đ`)
                      : `${fmt(stockFundamentals.dividendPerShare)} đ`}
                    sub={stockFundamentals.dividendDate ? `Ngày GDKHQ / cập nhật: ${stockFundamentals.dividendDate}` : "Theo dữ liệu API nếu có"}
                  />
                </div>
                <div className={`alert ${peAssessment.tone === "good" ? "info" : peAssessment.tone === "warning" ? "error" : "info"}`}>
                  <strong>Đánh giá P/E: {peAssessment.label}.</strong> {peAssessment.detail}
                </div>
                <p className="muted">
                  Nguồn chỉ số cơ bản: {stockFundamentals.source}. P/E thấp không đồng nghĩa cổ phiếu chắc chắn bị định giá thấp; cần đối chiếu P/B, chất lượng lợi nhuận, nợ, dòng tiền, triển vọng và mặt bằng ngành.
                </p>
              </section>

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
                  <button className="primary action" disabled={volumeLoading} onClick={loadStockVolume}>
                    {volumeLoading ? "Đang tải..." : "📊 THỐNG KÊ KHỐI LƯỢNG"}
                  </button>
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
                <p className="muted">Dữ liệu lấy từ Yahoo Finance, có thể bị trễ hoặc không có với một số mã. Khối lượng là số cổ phiếu, không phải số lệnh.</p>
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
              <select value={fxSymbol} onChange={(e) => { setFxSymbol(e.target.value); setFxData(null); setXauMultiData({}); }}>
                {FX_SYMBOLS.map(([value, label]) => <option key={value} value={value}>{value} — {label}</option>)}
              </select>
            </label>
            {fxSymbol === "XAUUSD" && <label>Khung thời gian
              <select value={xauInterval} onChange={(e) => { setXauInterval(e.target.value); setFxData(null); setXauMultiData({}); }}>
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
              </div>
              {fxSymbol === "XAUUSD" && fxData.analysis && (
                <div className="metrics" style={{ marginTop: 12 }}>
                  <Metric label="Phân tích Reversal" value={fxData.analysis.reversal} sub={fxData.analysis.reversalDetail} />
                  <Metric label="Xu hướng MA20/MA50" value={fxData.analysis.maTrend} sub="So sánh giá với MA20 và MA20 với MA50" />
                </div>
              )}
              {fxSymbol === "XAUUSD" && (
                <>
                  <h3>📊 Reversal đa khung thời gian</h3>
                  <div className="metrics">
                    {["M5", "M15", "H1", "H4", "D1"].map((tf) => {
                      const item = xauMultiData[tf];
                      return (
                        <Metric
                          key={tf}
                          label={`Reversal ${tf}`}
                          value={item?.analysis?.reversal || (item?.error ? "Không có dữ liệu" : "Đang tải")}
                          sub={item?.analysis?.maTrend ? `Xu hướng: ${item.analysis.maTrend} · RSI ${fmt(item.indicators?.rsi14)}` : item?.error || ""}
                          positive={item?.analysis?.reversal?.includes("tăng") ? true : item?.analysis?.reversal?.includes("giảm") ? false : undefined}
                        />
                      );
                    })}
                  </div>
                  <h3>📏 ATR (14) &amp; các mức giá DCA</h3>
                  <div className="metrics">
                    <Metric label="ATR (14)" value={fxData.indicators?.atr14 == null ? "Không có dữ liệu" : `$${fmt(fxData.indicators.atr14, 2)}`} sub="Độ biến động trung bình theo khung đang chọn" />
                    <Metric label="Giá hiện tại" value={`$${fmt(fxData.price, 2)}`} sub={`Khung ${({"5min":"M5","15min":"M15","30min":"M30","1h":"H1","4h":"H4","1day":"D1"})[xauInterval]}`} />
                  </div>
                  {fxData.dca?.length > 0 ? (
                    <div className="table-scroll">
                      <table>
                        <thead><tr><th>Mức DCA</th><th>Giá tham khảo</th><th>Khoảng cách</th></tr></thead>
                        <tbody>{fxData.dca.map((level) => (
                          <tr key={level.label}><td>{level.label}</td><td>${fmt(level.price, 2)}</td><td>{level.distanceAtr} × ATR</td></tr>
                        ))}</tbody>
                      </table>
                    </div>
                  ) : <p className="muted">Chưa đủ dữ liệu để tính ATR và các mức DCA.</p>}
                  <h3>📚 Volume Profile</h3>
                  {fxData.volumeProfile ? (
                    <div className="metrics">
                      <Metric label="POC" value={`$${fmt(fxData.volumeProfile.poc, 2)}`} sub="Mức giá có khối lượng lớn nhất" />
                      <Metric label="VAH" value={`$${fmt(fxData.volumeProfile.vah, 2)}`} sub="Biên trên vùng giá trị" />
                      <Metric label="VAL" value={`$${fmt(fxData.volumeProfile.val, 2)}`} sub="Biên dưới vùng giá trị" />
                    </div>
                  ) : (
                    <p className="muted">Nguồn Twelve Data hiện không cung cấp volume đủ dùng cho Volume Profile ở khung này. Không hiển thị POC/VAH/VAL giả.</p>
                  )}
                </>
              )}
              <PriceChart data={fxData.history} />
              <p className="muted">Nguồn: {fxData.source || "Yahoo Finance"}{fxSymbol === "XAUUSD" ? ` · Twelve Data XAU/USD · Khung ${({"5min":"M5","15min":"M15","30min":"M30","1h":"H1","4h":"H4","1day":"D1"})[xauInterval]}` : " · Dữ liệu có thể trễ tùy nhà cung cấp"}. Không tự đặt lệnh giao dịch.</p>
            </>
          )}
        </section>
      )}

      {tab === "funds" && (
        <section className="panel">
          <h2>📈 Chứng chỉ quỹ</h2>
          <p className="muted">Tra cứu theo mã quỹ. Hệ thống ưu tiên Fmarket và chỉ chấp nhận mã khớp chính xác; CafeF là nguồn dự phòng. NAV quỹ mở không phải giá realtime, còn giá ETF trên sàn có thể khác NAV/CCQ.</p>
          <div className="form-grid">
            <label className="fund-select-label">Mã chứng chỉ quỹ
              <div className="fund-select">
                <input
                  value={fundDropdownOpen ? fundSearch : fundSymbol}
                  onFocus={() => {
                    setFundDropdownOpen(true);
                    setFundSearch("");
                  }}
                  onChange={(e) => {
                    setFundSearch(e.target.value.toUpperCase());
                    setFundDropdownOpen(true);
                    setFundData(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setFundDropdownOpen(false);
                    if (e.key === "Enter" && filteredFunds.length > 0) {
                      e.preventDefault();
                      setFundSymbol(filteredFunds[0][0]);
                      setFundSearch("");
                      setFundDropdownOpen(false);
                      setFundData(null);
                    }
                  }}
                  placeholder="Nhập mã hoặc tên chứng chỉ quỹ..."
                  maxLength={30}
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="fund-select-toggle"
                  aria-label="Mở danh sách chứng chỉ quỹ"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setFundDropdownOpen((open) => !open);
                    setFundSearch("");
                  }}
                >▾</button>
                {fundDropdownOpen && (
                  <>
                    <button
                      type="button"
                      className="fund-dropdown-backdrop"
                      aria-label="Đóng danh sách mã quỹ"
                      onClick={() => setFundDropdownOpen(false)}
                    />
                    <div className="fund-options">
                      {filteredFunds.length > 0 ? filteredFunds.map(([code, name]) => (
                        <button
                          type="button"
                          key={code}
                          className={`fund-option ${fundSymbol === code ? "selected" : ""}`}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setFundSymbol(code);
                            setFundSearch("");
                            setFundDropdownOpen(false);
                            setFundData(null);
                          }}
                        >
                          <strong>{code}</strong>
                          <span>{name}</span>
                        </button>
                      )) : <div className="fund-empty">Không tìm thấy mã quỹ phù hợp.</div>}
                    </div>
                  </>
                )}
              </div>
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

      <footer className="footer">
        <span>Trading Tools</span>
        <span>Dữ liệu tham khảo, không phải khuyến nghị đầu tư.</span>
      </footer>
    </main>
  );
}
