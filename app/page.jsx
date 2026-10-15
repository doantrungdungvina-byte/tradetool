"use client";

import { useMemo, useState } from "react";

const TABS = [
  { id: "stock", label: "VN STOCK" },
  { id: "forex", label: "🌎 FX" },
  { id: "funds", label: "📈 CHỨNG CHỈ QUỸ" },
  { id: "dca", label: "🧮 DCA" },
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
  const [dcaAsset, setDcaAsset] = useState("FPT");
  const [dcaCurrency, setDcaCurrency] = useState("VND");
  const [dcaCurrentPrice, setDcaCurrentPrice] = useState("");
  const [dcaTargetPrice, setDcaTargetPrice] = useState("");
  const [dcaPriceLoading, setDcaPriceLoading] = useState(false);
  const [dcaPriceUpdatedAt, setDcaPriceUpdatedAt] = useState("");
  const [dcaPriceSource, setDcaPriceSource] = useState("");
  const [dcaRowsInput, setDcaRowsInput] = useState([{ id: 1, date: new Date().toISOString().slice(0, 10), quantity: "", price: "" }]);
  const [nextDcaId, setNextDcaId] = useState(2);

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
              </div>
              {fxSymbol === "XAUUSD" && fxData.analysis && (
                <div className="metrics" style={{ marginTop: 12 }}>
                  <Metric label="Phân tích Reversal" value={fxData.analysis.reversal} sub={fxData.analysis.reversalDetail} />
                  <Metric label="Xu hướng MA20/MA50" value={fxData.analysis.maTrend} sub="So sánh giá với MA20 và MA20 với MA50" />
                </div>
              )}
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

      {tab === "funds" && (
        <section className="panel">
          <h2>📈 Chứng chỉ quỹ</h2>
          <p className="muted">Tra cứu theo mã quỹ. Hệ thống ưu tiên Fmarket và chỉ chấp nhận mã khớp chính xác; CafeF là nguồn dự phòng. NAV quỹ mở không phải giá realtime, còn giá ETF trên sàn có thể khác NAV/CCQ.</p>
          <div className="form-grid">
            <label>Mã chứng chỉ quỹ
              <input list="fund-codes" value={fundSymbol} onChange={(e) => { setFundSymbol(e.target.value.toUpperCase().trim()); setFundData(null); }} placeholder="VESAF, E1VFVN30..." maxLength={15} />
              <datalist id="fund-codes">{FUNDS.map(([code, name]) => <option key={code} value={code}>{name}</option>)}</datalist>
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
