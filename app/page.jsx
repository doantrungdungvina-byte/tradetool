"use client";

import { useMemo, useState } from "react";

const TABS = [
  { id: "stock", label: "🇻🇳 VN STOCK" },
  { id: "forex", label: "🌎 FOREX / XAUUSD" },
  { id: "foreign", label: "🌍 KHỐI NGOẠI" },
  { id: "funds", label: "📈 CHỨNG CHỈ QUỸ" },
];

const FX_SYMBOLS = [
  ["XAUUSD", "Vàng thế giới (GC=F)"],
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
      const res = await fetch(`/api/market?symbol=${encodeURIComponent(currentSymbol)}&kind=${kind}`, { cache: "no-store" });
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
      if (!res.ok) throw new Error(json.error || "Nguồn miễn phí hiện chưa trả dữ liệu khối ngoại.");
      setForeignData(json);
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
          {fxData && (
            <>
              <div className="metrics">
                <Metric label="Giá gần nhất" value={fmt(fxData.price)} sub={`${fxChange >= 0 ? "+" : ""}${fmt(fxChange)}% so với phiên trước`} positive={fxChange >= 0} />
                <Metric label="RSI (14)" value={fmt(fxData.indicators.rsi14)} />
                <Metric label="MA20" value={fmt(fxData.indicators.ma20)} />
                <Metric label="MA50" value={fmt(fxData.indicators.ma50)} />
              </div>
              {fxSymbol === "XAUUSD" && <div className="alert info">XAUUSD được đại diện bằng hợp đồng vàng tương lai GC=F của Yahoo Finance, không phải báo giá spot của broker.</div>}
              <PriceChart data={fxData.history} />
              <p className="muted">Nguồn: Yahoo Finance; không phải dữ liệu giao dịch realtime.</p>
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
              <div className="metrics">
                <Metric label="Khối lượng mua" value={fmt(foreignData.buyVolume, 0)} />
                <Metric label="Khối lượng bán" value={fmt(foreignData.sellVolume, 0)} />
                <Metric label="Mua/bán ròng" value={fmt(foreignData.netVolume, 0)} positive={foreignData.netVolume >= 0} />
              </div>
              <p className="muted">{foreignData.source} · {foreignData.note}</p>
            </>
          )}
          <div className="alert info">Nếu nguồn miễn phí không cung cấp lịch sử khối ngoại hoặc chặn truy cập, ứng dụng sẽ báo rõ thay vì hiển thị số liệu giả.</div>
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
