"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const TABS = [
  { id: "stock", label: "🇻🇳 VN STOCK" },
  { id: "forex", label: "🌎 FOREX / XAUUSD" },
  { id: "foreign", label: "🌍 KHỐI NGOẠI" },
  { id: "funds", label: "📈 CHỨNG CHỈ QUỸ" },
];

const FX_SYMBOLS = [
  ["XAUUSD", "Vàng giao ngay từ MT5 (XAUUSDm)"],
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

function TradingViewAdvancedChart() {
  const containerRef = useRef(null);
  const [widgetError, setWidgetError] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    setWidgetError(false);
    container.innerHTML = "";

    const widgetContainer = document.createElement("div");
    widgetContainer.className = "tradingview-widget-container__widget";
    widgetContainer.style.width = "100%";
    widgetContainer.style.height = "100%";
    container.appendChild(widgetContainer);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.textContent = JSON.stringify({
      autosize: true,
      symbol: "FX_IDC:XAUUSD",
      interval: "15",
      timezone: "Asia/Ho_Chi_Minh",
      theme: "light",
      style: "1",
      locale: "vi_VN",
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com",
      withdateranges: true,
      details: true,
      hotlist: false,
      hide_side_toolbar: false,
      save_image: false,
      studies: ["RSI@tv-basicstudies", "MASimple@tv-basicstudies"],
      height: 520,
    });
    script.onerror = () => setWidgetError(true);
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, []);

  return (
    <section className="tv-chart-panel" aria-label="TradingView Advanced Chart XAUUSD">
      <div className="tv-chart-heading">
        <div>
          <h3>TradingView Advanced Chart — XAU/USD</h3>
          <p className="muted">Nguồn biểu đồ: FX_IDC:XAUUSD · Khung mặc định M15 · Múi giờ Việt Nam</p>
        </div>
        <a href="https://www.tradingview.com/chart/?symbol=FX_IDC%3AXAUUSD" target="_blank" rel="noreferrer">Mở trên TradingView ↗</a>
      </div>
      {widgetError && <div className="alert info">Không tải được biểu đồ nhúng. Hãy kiểm tra kết nối mạng hoặc mở trực tiếp trên TradingView.</div>}
      <div ref={containerRef} className="tv-chart-container" />
      <p className="muted">Biểu đồ do TradingView cung cấp. Nguồn giá, độ trễ và tính năng phụ thuộc vào nhà cung cấp dữ liệu của TradingView. Widget không cung cấp dữ liệu OHLC thô cho API của website.</p>
    </section>
  );
}

function TechnicalAnalysis({ data }) {
  if (!data) return null;
  const indicators = data.indicators || {};
  const reversal = data.reversal || {};
  const parts = reversal.parts || {};
  const rsi = indicators.rsi14 == null ? Number.NaN : Number(indicators.rsi14);
  const rsiTone = Number.isFinite(rsi) && (rsi < 30 || rsi > 70) ? "alert info" : "alert info";
  const volumeText = indicators.volumeState || "Chưa có dữ liệu";
  const divergence = indicators.divergence || {};
  const partLabels = [
    ["Nến / râu nến", parts.candle],
    ["RSI", parts.rsi],
    ["Khối lượng", parts.volume],
    ["Vị trí giá", parts.location],
    ["Nến xác nhận", parts.confirmation],
  ];
  return (
    <section className="analysis-section">
      <h3>🧭 Phân tích Reversal — điểm đảo chiều</h3>
      <div className="metrics">
        <Metric label="Điểm Reversal" value={`${reversal.score ?? "—"}/100`} sub="Điểm kỹ thuật tham khảo, không phải xác suất thắng" />
        <Metric label="Trạng thái" value={reversal.signal || "Chưa đủ dữ liệu"} />
        <Metric label="Râu nến dưới" value={data.history?.at(-1)?.low != null ? `${fmt(reversal.candle?.lowerWickPct)}%` : "—"} />
        <Metric label="Râu nến trên" value={data.history?.at(-1)?.high != null ? `${fmt(reversal.candle?.upperWickPct)}%` : "—"} />
      </div>
      <div className="table-scroll"><table>
        <thead><tr><th>Thành phần</th><th>Điểm</th><th>Diễn giải</th></tr></thead>
        <tbody>{partLabels.map(([label, score]) => <tr key={label}><td>{label}</td><td>{score ?? 0}/20</td><td>{score >= 14 ? "Ủng hộ tín hiệu" : score >= 8 ? "Có dấu hiệu nhẹ" : "Chưa xác nhận"}</td></tr>)}</tbody>
      </table></div>
      {reversal.notes?.length > 0 && <ul className="analysis-notes">{reversal.notes.map((note, i) => <li key={i}>{note}</li>)}</ul>}
      <p className="muted">Điểm được tính từ nến, RSI, khối lượng, vị trí giá và nến xác nhận. Tín hiệu chỉ là bộ lọc kỹ thuật; cần xem xu hướng lớn, thanh khoản và quản trị rủi ro.</p>

      <h3>📉 RSI (14) — Động lượng &amp; phân kỳ</h3>
      <div className="metrics">
        <Metric label="RSI hiện tại" value={fmt(indicators.rsi14)} sub={indicators.rsiState || ""} />
        <Metric label="Thay đổi RSI" value={indicators.rsiChange == null ? "—" : `${indicators.rsiChange > 0 ? "+" : ""}${fmt(indicators.rsiChange)}`} positive={indicators.rsiChange == null ? undefined : indicators.rsiChange >= 0} />
        <Metric label="Phân kỳ" value={divergence.label || "Chưa xác định"} />
      </div>
      <div className={rsiTone}><strong>Diễn giải RSI:</strong> {rsi < 30 ? "RSI dưới 30: vùng quá bán, chưa đồng nghĩa giá chắc chắn đảo chiều tăng." : rsi > 70 ? "RSI trên 70: vùng quá mua, chưa đồng nghĩa giá chắc chắn giảm." : rsi >= 50 ? "RSI trên hoặc bằng 50: động lượng tương đối nghiêng tăng; cần kiểm tra cấu trúc giá." : Number.isFinite(rsi) ? "RSI dưới 50: động lượng tương đối yếu; theo dõi hỗ trợ và khả năng phục hồi." : "Chưa đủ dữ liệu RSI để diễn giải."} <strong>{divergence.label || ""}</strong> {divergence.detail || ""}</div>

      <h3>📊 Khối lượng giao dịch</h3>
      <div className="metrics">
        <Metric label="Volume phiên gần nhất" value={fmt(indicators.volume, 0)} />
        <Metric label="Volume MA20" value={fmt(indicators.volumeMA20, 0)} />
        <Metric label="RVOL" value={indicators.rvol == null ? "—" : `${fmt(indicators.rvol)}x`} sub={volumeText} positive={indicators.rvol >= 1.5 ? true : indicators.rvol < 0.8 ? false : undefined} />
      </div>
      <p className="muted">RVOL = khối lượng phiên gần nhất / khối lượng trung bình 20 phiên. RVOL cao cho biết giao dịch sôi động hơn bình thường, không tự động xác nhận mua hay bán.</p>
    </section>
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
  const [capital, setCapital] = useState("50000000");
  const [fundSymbol, setFundSymbol] = useState("EVESG");
  const [marketData, setMarketData] = useState(null);
  const [fxData, setFxData] = useState(null);
  const [foreignData, setForeignData] = useState(null);
  const [fundData, setFundData] = useState(null);
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  async function loadMarket(kind) {
    const currentSymbol = kind === "forex" ? fxSymbol : symbol.trim().toUpperCase();
    setLoading(kind);
    setError("");
    try {
      const endpoint = kind === "forex" && currentSymbol === "XAUUSD"
        ? "/api/mt5?symbol=XAUUSDm"
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

  async function loadForeign() {
    setLoading("foreign");
    setError("");
    setForeignData(null);
    try {
      const res = await fetch(`/api/foreign?symbol=${encodeURIComponent(symbol.trim().toUpperCase())}`, { cache: "no-store" });
      const json = await res.json();
      // Keep provider status and source links visible even when no verified data is available.
      setForeignData({ ...json, httpStatus: res.status, available: res.ok && json.available !== false });
    } catch (e) {
      setError(e.message || "Không tải được dữ liệu khối ngoại.");
    } finally {
      setLoading("");
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
              <PriceChart data={marketData.history} />
              <TechnicalAnalysis data={marketData} />
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
              <select value={fxSymbol} onChange={(e) => setFxSymbol(e.target.value)}>
                {FX_SYMBOLS.map(([value, label]) => <option key={value} value={value}>{value} — {label}</option>)}
              </select>
            </label>
            <button className="primary action" disabled={loading === "forex"} onClick={() => loadMarket("forex")}>
              {loading === "forex" ? "Đang tải..." : "🔎 TẢI DỮ LIỆU"}
            </button>
          </div>
          {fxSymbol === "XAUUSD" && <TradingViewAdvancedChart />}
          {fxData && (
            <>
              <div className="metrics">
                <Metric label="Giá gần nhất" value={fmt(fxData.price)} sub={`${fxChange >= 0 ? "+" : ""}${fmt(fxChange)}% so với phiên trước`} positive={fxChange >= 0} />
                <Metric label="RSI (14)" value={fmt(fxData.indicators.rsi14)} sub={fxData.indicators.rsiState} />
                <Metric label="MA20" value={fmt(fxData.indicators.ma20)} />
                <Metric label="MA50" value={fmt(fxData.indicators.ma50)} />
              </div>
              {fxSymbol === "XAUUSD" && <div className="alert info">Biểu đồ phía trên dùng TradingView FX_IDC:XAUUSD. Các chỉ số bên dưới vẫn lấy từ API dữ liệu hiện có của website; biểu đồ nhúng không tự cấp dữ liệu thô cho RSI/Reversal/DCA.</div>}
              <div className="metrics">
                <Metric label="Bid MT5" value={fmt(fxData.bid, fxData.digits ?? 2)} />
                <Metric label="Ask MT5" value={fmt(fxData.ask, fxData.digits ?? 2)} />
                <Metric label="Spread (points)" value={fmt(fxData.spreadPoints, 0)} />
                <Metric label="Broker symbol" value={fxData.brokerSymbol || "XAUUSDm"} />
              </div>
              <PriceChart data={fxData.history} />
              <TechnicalAnalysis data={fxData} />
              <p className="muted">Nguồn: {fxData.source || "Yahoo Finance"}. {fxData.sourceNote || "Dữ liệu MT5 từ broker được gửi qua VPS."} {fxData.quoteTimestamp ? `Cập nhật nguồn: ${new Date(fxData.quoteTimestamp).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}.` : ""}</p>
            </>
          )}
        </section>
      )}

      {tab === "foreign" && (
        <section className="panel">
          <h2>🌍 Thống kê mua/bán khối ngoại</h2>
          <p className="muted">Tra cứu theo mã. Ứng dụng không tự tạo số liệu khi nguồn miễn phí không cung cấp dữ liệu đáng tin cậy.</p>
          <div className="form-grid">
            <label>Mã cổ phiếu
              <input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} placeholder="FPT" maxLength={12} />
            </label>
            <button className="primary action" disabled={loading === "foreign"} onClick={loadForeign}>
              {loading === "foreign" ? "Đang kiểm tra..." : "🔎 TRA CỨU KHỐI NGOẠI"}
            </button>
          </div>
          {foreignData && (
            <>
              {foreignData.available ? (
                <>
                  <div className="metrics">
                    <Metric label="Khối lượng mua" value={fmt(foreignData.buyVolume, 0)} />
                    <Metric label="Khối lượng bán" value={fmt(foreignData.sellVolume, 0)} />
                    <Metric label="Mua/bán ròng" value={fmt(foreignData.netVolume, 0)} positive={foreignData.netVolume >= 0} />
                    <Metric label="Giá trị ròng" value={foreignData.netValue == null ? "Chưa có" : `${fmt(foreignData.netValue, 0)} đ`} positive={foreignData.netValue == null ? undefined : foreignData.netValue >= 0} />
                  </div>
                  <p className="muted">{foreignData.source} · {foreignData.note}</p>
                </>
              ) : (
                <div className="alert info">
                  <strong>Chưa có dữ liệu khối ngoại được xác minh.</strong>
                  <p>{foreignData.error || "Nguồn hiện tại chưa cung cấp được dữ liệu mua/bán ròng."}</p>
                  {foreignData.sourceLinks?.length > 0 && <div className="link-row">{foreignData.sourceLinks.map((link) => <a key={link.url} href={link.url} target="_blank" rel="noreferrer">Mở {link.label} ↗</a>)}</div>}
                </div>
              )}
            </>
          )}
          <div className="alert info">Không dùng tổng khối lượng thị trường để suy ra khối lượng mua/bán của nhà đầu tư nước ngoài. Khi tích hợp được nguồn dữ liệu xác minh, phần này sẽ hiển thị mua, bán, ròng, giá trị ròng và lịch sử 5/20 phiên.</div>
        </section>
      )}

      {tab === "funds" && (
        <section className="panel">
          <h2>📈 Chứng chỉ quỹ</h2>
          <p className="muted">Danh sách mã quỹ tích hợp sẵn; NAV cần được xác nhận từ nguồn dữ liệu. NAV quỹ mở không phải giá realtime.</p>
          <div className="form-grid">
            <label>Chọn chứng chỉ quỹ
              <select value={fundSymbol} onChange={(e) => setFundSymbol(e.target.value)}>
                {FUNDS.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
              </select>
            </label>
            <button className="primary action" disabled={loading === "fund"} onClick={loadFund}>
              {loading === "fund" ? "Đang tải..." : "🔎 XEM NAV"}
            </button>
          </div>
          {fundData && (
            <div className="metrics">
              <Metric label="NAV gần nhất" value={`${fmt(fundData.nav)} đ`} />
              <Metric label="Tăng/giảm so với NAV trước" value={`${fundData.changeAbs >= 0 ? "+" : ""}${fmt(fundData.changeAbs)} đ`} positive={fundData.changeAbs >= 0} />
              <Metric label="Biến động" value={`${fundData.changePct >= 0 ? "+" : ""}${fmt(fundData.changePct)}%`} positive={fundData.changePct >= 0} />
              <Metric label="Ngày cập nhật" value={fundData.date || "—"} />
            </div>
          )}
          <div className="link-row">
            <a href="https://fmarket.vn/danh-sach-quy" target="_blank" rel="noreferrer">Mở danh sách quỹ trên Fmarket ↗</a>
            <a href={`https://cafef.vn/du-lieu/chung-chi-quy/${fundSymbol.toLowerCase()}.chn`} target="_blank" rel="noreferrer">Mở trang {fundSymbol} trên CafeF ↗</a>
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
